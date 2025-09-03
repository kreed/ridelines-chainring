import { createClerkClient } from "@clerk/backend";
import { TRPCError } from "@trpc/server";
import { logger } from "../../clients/monitoring";
import { env } from "../../types/env";
import { createMiddleware } from "../../types/trpc";

// Validates Clerk JWT token and adds userId to context
export const clerkMiddleware = createMiddleware(async ({ ctx, next }) => {
  if (!ctx.authHeader) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Missing Authorization header",
    });
  }

  // Verify Clerk JWT
  const clerkClient = createClerkClient({
    secretKey: env.CLERK_SECRET_KEY,
    publishableKey: env.CLERK_PUBLISHABLE_KEY,
  });

  const origin = `https://${env.DOMAIN}`;
  const req = new Request(origin, {
    headers: { authorization: ctx.authHeader },
  });

  const result = await clerkClient.authenticateRequest(req, {
    jwtKey: env.CLERK_JWT_KEY,
    authorizedParties: [origin, "http://localhost:5173"],
  });

  if (!result.isAuthenticated) {
    logger.error(`Invalid JWT token. ${result.message} ${result.reason}`);
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: `Invalid JWT token`,
    });
  }

  const userId = result.toAuth().userId;

  return next({
    ctx: {
      ...ctx,
      userId,
    },
  });
});
