import { Logger } from "@aws-lambda-powertools/logger";
import { Metrics } from "@aws-lambda-powertools/metrics";
import { Tracer } from "@aws-lambda-powertools/tracer";

export const SERVICE_NAME = "ridelines-chainring";

export const logger = new Logger({ serviceName: SERVICE_NAME });
export const metrics = new Metrics({ namespace: SERVICE_NAME, serviceName: SERVICE_NAME });
export const tracer = new Tracer({ serviceName: SERVICE_NAME });
