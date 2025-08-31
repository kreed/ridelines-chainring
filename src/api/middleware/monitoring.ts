import { logger, metrics, tracer } from "../../clients/monitoring";
import { createMiddleware } from "..";

export const monitoringMiddleware = createMiddleware(async ({ ctx, next }) => {
  // biome-ignore lint: middy middleware will have set the segment
  const parentSegment = tracer.getSegment()!;
  const subsegment = parentSegment.addNewSubsegment(ctx.path);
  tracer.setSegment(subsegment);

  logger.info("Executing procedure");

  const before = performance.now();
  let response = null;
  let error: unknown;
  try {
    response = await next();
  } catch (e) {
    error = e;
  }
  const after = performance.now();
  const latency = after - before;

  const wasSuccess = !error && Boolean(response?.ok);
  if (!wasSuccess) {
    subsegment.addErrorFlag();
  }

  metrics.addMetric("Count", "Count", 1);
  metrics.addMetric("Latency", "Milliseconds", latency);
  metrics.addMetric("Success", "Count", wasSuccess ? 1 : 0);
  metrics.addMetric("Failure", "Count", wasSuccess ? 0 : 1);

  subsegment.close();
  tracer.setSegment(parentSegment);

  if (!response) {
    logger.error("Procedure threw an error", { error, latency });
    throw error;
  }
  if (!response.ok) {
    logger.error("Procedure responded with error", {
      response: response.error,
      latency,
    });
  } else {
    logger.info("Procedure successful", {
      response: response.data,
      latency,
    });
  }

  return response;
});
