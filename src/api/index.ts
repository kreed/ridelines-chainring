import { initTRPC } from "@trpc/server";
import { clerkMiddleware } from "../api/middleware/clerk";
import type { Context } from "../types/context";
import { monitoringMiddleware } from "./middleware/monitoring";
import { intervalsOAuthCallback } from "./procedures/auth";
import { syncStatus } from "./procedures/sync";
import { user } from "./procedures/user";

const trpc = initTRPC.context<Context>().create();

export const createRouter = trpc.router;
export const createMiddleware = trpc.middleware;

// Public procedure with monitoring only
export const publicProcedure = trpc.procedure.use(monitoringMiddleware);

// Protected procedure with monitoring and auth
export const procedure = trpc.procedure.use(monitoringMiddleware).use(clerkMiddleware);

export const router = createRouter({
  user,
  syncStatus,
  intervalsOAuthCallback,
});
