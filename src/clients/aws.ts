import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { tracer } from "./monitoring";

export const dynamodb = tracer.captureAWSv3Client(DynamoDBDocumentClient.from(new DynamoDBClient()));
