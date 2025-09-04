export const config = {
  usersTable: "ridelines-users",
  syncRequestsQueue: "ridelines-sync-requests",
  environment: process.env.NODE_ENV || "development",
} as const;
