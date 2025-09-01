import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { router } from "../src/api";
import type { Context } from "../src/types/context";

// Development server for local testing
const server = createHTTPServer({
  router,
  createContext: async ({ info }): Promise<Context> => {
    return {
      userId: "dev_user_123",
      path: info.url?.pathname ?? "/",
    };
  },
});

server.listen(3001);
