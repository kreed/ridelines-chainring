import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
import { env } from "../../types/env";
import { procedure } from ".";

export const pmtiles = procedure.query(async ({ ctx: { userId } }) => {
  if (!userId) throw new Error("Missing user id");
  const resourcePath = `/activities/${userId}.pmtiles`;
  const resourceUrl = `https://${env.DOMAIN}${resourcePath}`;
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
