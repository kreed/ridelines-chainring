export const config = {
  usersTable: "ridelines-users",
  syncStatusTable: "ridelines-sync-status",
  syncRequestsQueue: "ridelines-sync-requests",
  environment: process.env.NODE_ENV || "development",
} as const;
