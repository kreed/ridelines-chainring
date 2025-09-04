import { createRouter } from "../types/trpc";
import { intervalsOAuth } from "./procedures/intervals-oauth";
import { syncStatus, syncTrigger } from "./procedures/sync";
import { user } from "./procedures/user";

export const router = createRouter({
  user,
  sync: {
    status: syncStatus,
    trigger: syncTrigger,
  },
  intervals: {
    oauth: intervalsOAuth,
  },
});
