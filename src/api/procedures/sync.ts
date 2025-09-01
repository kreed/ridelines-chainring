import { procedure } from ".";

export const syncStatus = procedure.query(async ({ ctx: { userId } }) => {
  // just return mock data for now
  return {
    userId,
    status: "idle",
    activitiesCount: 0,
  };
});
