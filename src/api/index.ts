import { createRouter } from "../types/trpc";
import { intervalsOAuth } from "./procedures/intervals-oauth";
import { syncHistory, syncStatus, syncTrigger } from "./procedures/sync";
import { user } from "./procedures/user";

export const router = createRouter({
  user,
  sync: {
    status: syncStatus,
    trigger: syncTrigger,
    history: syncHistory,
  },
  intervals: {
    oauth: intervalsOAuth,
  },
});
