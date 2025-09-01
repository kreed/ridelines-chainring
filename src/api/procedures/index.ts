import { trpc } from "../../types/trpc";
import { clerkMiddleware } from "../middleware/clerk";
import { monitoringMiddleware } from "../middleware/monitoring";

// Public procedure with monitoring only
export const publicProcedure = trpc.procedure.use(monitoringMiddleware);

// Protected procedure with monitoring and auth
export const procedure = trpc.procedure.use(monitoringMiddleware).use(clerkMiddleware);
