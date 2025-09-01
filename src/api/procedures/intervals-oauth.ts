import { TRPCError } from "@trpc/server";
import { createIntervalsClient } from "../../clients/intervals";
import { publicProcedure } from ".";

const userInfo = publicProcedure.query(async ({ ctx }) => {
  if (!ctx.authHeader) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Missing Authorization header",
    });
  }

  // Extract Bearer token
  const accessToken = ctx.authHeader.replace(/^Bearer\s+/i, "");
  if (!accessToken || accessToken === ctx.authHeader) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authorization header must start with 'Bearer '",
    });
  }

  const intervalsClient = createIntervalsClient(accessToken);

  // Fetch user profile from intervals.icu
  const { data: profileResponse, error } = await intervalsClient.GET("/api/v1/athlete/{id}/profile", {
    params: { path: { id: "0" } },
  });

  if (error || !profileResponse?.athlete) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Failed to fetch user profile: ${error}`,
    });
  }

  const profile = profileResponse.athlete;

  return {
    sub: profile.id,
    email: profile.email,
    name: profile.name,
    picture: profile.profile_medium,
    city: profile.city,
    state: profile.state,
    country: profile.country,
    timezone: profile.timezone,
    sex: profile.sex,
    bio: profile.bio,
    website: profile.website,
  };
});

export const intervalsOAuth = {
  userInfo,
};
