import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { env } from "../types/env";
import { tracer } from "./monitoring";

export const dynamodb = tracer.captureAWSv3Client(
  DynamoDBDocumentClient.from(
    new DynamoDBClient({
      region: env.AWS_REGION,
    }),
  ),
);
