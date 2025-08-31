// Context that will be available in all tRPC procedures
export interface Context {
  path: string;
  authHeader?: string;
  userId?: string;
}
