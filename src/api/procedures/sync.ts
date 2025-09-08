import { QueryCommand } from "@aws-sdk/client-dynamodb";
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { z } from "zod";
import { dynamodb } from "../../clients/aws";
import { config } from "../../config";
import { procedure } from ".";

const sqs = new SQSClient({});

// Types for sync status
const phaseStatusSchema = z.enum(["pending", "in_progress", "completed", "failed"]);
const syncStatusSchema = z.enum(["queued", "in_progress", "completed", "failed"]);

const baseStatusSchema = z.object({
  userId: z.string(),
  syncId: z.string(),
  requestedAt: z.string(),
});

const queuedStatusSchema = baseStatusSchema.extend({
  status: z.literal("queued"),
});

const activeStatusSchema = baseStatusSchema.extend({
  status: z.union([z.literal("in_progress"), z.literal("completed"), z.literal("failed")]),
  startedAt: z.string(),
  completedAt: z.string().optional(),
  error: z.string().optional(),
  phases: z.object({
    analyzing: z.object({
      status: phaseStatusSchema,
      message: z.string().optional(),
      totalActivities: z.number().optional(),
      unchangedActivities: z.number().optional(),
      changedActivities: z.number().optional(),
      error: z.string().optional(),
    }),
    downloading: z.object({
      status: phaseStatusSchema,
      totalToProcess: z.number().optional(),
      processed: z.number().optional(),
      failed: z.number().optional(),
      failedActivities: z
        .array(
          z.object({
            id: z.string(),
            name: z.string(),
            error: z.string(),
          }),
        )
        .optional(),
    }),
    generating: z.object({
      status: phaseStatusSchema,
      message: z.string().optional(),
      error: z.string().optional(),
    }),
  }),
});

const syncStatusRecordSchema = z.discriminatedUnion("status", [queuedStatusSchema, activeStatusSchema]);

export const syncStatus = procedure.query(async ({ ctx: { userId } }) => {
  // Query for the latest sync status for this user
  const command = new QueryCommand({
    TableName: config.syncStatusTable,
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": { S: userId },
    },
    Limit: 1,
    ScanIndexForward: false, // Get latest first (by syncId which includes timestamp)
  });

  const result = await dynamodb.send(command);

  if (!result.Items || result.Items.length === 0) {
    return null;
  }

  const item = unmarshall(result.Items[0]);
  return syncStatusRecordSchema.parse(item);
});

export const syncHistory = procedure
  .input(z.object({ limit: z.number().min(1).max(50).default(10) }))
  .query(async ({ ctx: { userId }, input: { limit } }) => {
    const command = new QueryCommand({
      TableName: config.syncStatusTable,
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": { S: userId },
      },
      Limit: limit,
      ScanIndexForward: false, // Get latest first
    });

    const result = await dynamodb.send(command);

    if (!result.Items) {
      return [];
    }

    return result.Items.map((item) => syncStatusRecordSchema.parse(unmarshall(item)));
  });

export const syncTrigger = procedure.mutation(async ({ ctx: { userId } }) => {
  const syncId = `${Date.now()}-${crypto.randomUUID()}`;
  const now = new Date().toISOString();

  // Create initial sync status record
  const syncStatusRecord = {
    userId,
    syncId,
    status: "queued",
    requestedAt: now,
  };

  // Write to DynamoDB
  await dynamodb.send(
    new PutCommand({
      TableName: config.syncStatusTable,
      Item: syncStatusRecord,
    }),
  );

  // Send message to SQS
  const message = {
    userId,
    syncId,
    timestamp: now,
  };

  const command = new SendMessageCommand({
    QueueUrl: config.syncRequestsQueue,
    MessageBody: JSON.stringify(message),
    MessageAttributes: {
      userId: {
        DataType: "String",
        StringValue: userId,
      },
    },
  });

  await sqs.send(command);

  return {
    success: true,
    message: "Sync request queued",
    syncId,
  };
});
