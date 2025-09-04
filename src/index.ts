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
  const authHeader = event.headers["x-authorization"];
  logger.appendKeys({ path });
  metrics.addDimensions({ path });
  return {
    path,
    authHeader,
  };
};

const trpcHandler: Handler = awsLambdaRequestHandler({ router, createContext });

const customHandler: Handler = async (event, context) => {
  // Strip /trpc prefix from the path before passing to tRPC handler
  const modifiedEvent = {
    ...event,
    rawPath: event.rawPath.replace(/^\/trpc/, "") || "/",
  };

  const response = await trpcHandler(modifiedEvent, context);

  // Clerk expects a flat object containing all the user info
  if (modifiedEvent.rawPath === "/intervals.oauth.userInfo" && response.body) {
    const parsed = JSON.parse(response.body);
    if (parsed.result?.data) {
      response.body = JSON.stringify(parsed.result.data);
    }
  }

  return response;
};

export const handler: Handler = middy(customHandler)
  .use(captureLambdaHandler(tracer))
  .use(injectLambdaContext(logger, { resetKeys: true }))
  .use(logMetrics(metrics, { captureColdStartMetric: true }));
