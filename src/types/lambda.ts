import type { APIGatewayProxyStructuredResultV2, Context, LambdaFunctionURLEventWithIAMAuthorizer } from "aws-lambda";

export type Handler = (
  event: LambdaFunctionURLEventWithIAMAuthorizer,
  context: Context,
) => Promise<APIGatewayProxyStructuredResultV2>;
