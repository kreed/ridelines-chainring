import { injectLambdaContext } from "@aws-lambda-powertools/logger/middleware";
import { logMetrics } from "@aws-lambda-powertools/metrics/middleware";
import { captureLambdaHandler } from "@aws-lambda-powertools/tracer/middleware";
import middy from "@middy/core";
import { awsLambdaRequestHandler, type CreateAWSLambdaContextOptions } from "@trpc/server/adapters/aws-lambda";
import type { LambdaFunctionURLEventWithIAMAuthorizer } from "aws-lambda";
import { router } from "./api";
import { logger, metrics, tracer } from "./clients/monitoring";
import type { Context } from "./types/context";
import type { Handler } from "./types/lambda";

export const createContext = async ({
  event,
}: CreateAWSLambdaContextOptions<LambdaFunctionURLEventWithIAMAuthorizer>): Promise<Context> => {
  logger.debug("Event:", JSON.stringify(event));
  const path = event.rawPath;
  const authHeader = event.headers["auth-token"];
  logger.appendKeys({ path });
  metrics.addDimensions({ path });
  return {
    path,
    authHeader,
  };
};

export const handler: Handler = middy(awsLambdaRequestHandler({ router, createContext }))
  .use(captureLambdaHandler(tracer))
  .use(injectLambdaContext(logger, { resetKeys: true }))
  .use(logMetrics(metrics, { captureColdStartMetric: true }));
