import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb } from "../../clients/aws";
import { config } from "../../config";
import { env } from "../../types/env";
import { procedure } from ".";

export const pmtiles = procedure.query(async ({ ctx: { userId } }) => {
  if (!userId) throw new Error("Missing user id");

  // Read the user's current pmtilesKey from DynamoDB
  const result = await dynamodb.send(
    new GetCommand({
      TableName: config.usersTable,
      Key: { id: userId },
      ProjectionExpression: "pmtilesKey",
    }),
  );

  const pmtilesKey = result.Item?.pmtilesKey as string | undefined;
  if (!pmtilesKey) return null;

  const resourceUrl = `https://${env.DOMAIN}/${pmtilesKey}`;
  const dateLessThan = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const signedUrl = getSignedUrl({
    url: resourceUrl,
    keyPairId: env.CLOUDFRONT_KEY_PAIR_ID,
    dateLessThan,
    privateKey: env.CLOUDFRONT_PRIVATE_KEY,
  });

  return signedUrl;
});

export const user = {
  pmtiles,
};
