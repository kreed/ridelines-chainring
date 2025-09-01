import { createRouter } from "../types/trpc";
import { intervalsOAuthCallback } from "./procedures/intervals-oauth";
import { syncStatus } from "./procedures/sync";
import { user } from "./procedures/user";

export const router = createRouter({
  user,
  syncStatus,
  intervalsOAuthCallback,
});
