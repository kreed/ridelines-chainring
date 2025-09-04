import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { config } from "../../config";
import { procedure } from ".";

const sqs = new SQSClient({});

export const syncStatus = procedure.query(async ({ ctx: { userId } }) => {
  // just return mock data for now
  return {
    userId,
    status: "idle",
    activitiesCount: 0,
  };
});

export const syncTrigger = procedure.mutation(async ({ ctx: { userId } }) => {
  const message = {
    userId,
    timestamp: new Date().toISOString(),
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
  };
});
