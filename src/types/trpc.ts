import { initTRPC } from "@trpc/server";
import type { Context } from "./context";

export const trpc = initTRPC.context<Context>().create();
export const createRouter = trpc.router;
export const createMiddleware = trpc.middleware;
