import { createClerkClient } from "@clerk/backend";
import { TRPCError } from "@trpc/server";
import { env } from "../../env";
import { createMiddleware } from "..";

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

  const req = new Request(`https://${env.DOMAIN}`, {
    headers: { authorization: ctx.authHeader },
  });

  const result = await clerkClient.authenticateRequest(req, {
    jwtKey: env.CLERK_JWT_KEY,
    authorizedParties: [env.DOMAIN],
  });

  if (!result.isAuthenticated) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid JWT token",
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
