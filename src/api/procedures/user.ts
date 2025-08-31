import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { dynamodb } from "../../clients/aws";
import { env } from "../../env";
import { procedure } from "..";

export const UserSchema = z.object({
  id: z.string(),
  athlete_id: z.string(),
  name: z.string().nullable(),
  email: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  last_login: z.string(),
});
export type User = z.infer<typeof UserSchema>;

export const user = procedure.output(UserSchema).query(async ({ ctx: { userId } }) => {
  const result = await dynamodb.send(
    new GetCommand({
      TableName: env.USERS_TABLE_NAME,
      Key: { id: userId },
    }),
  );

  if (!result.Item) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "User not found",
    });
  }

  return result.Item as User;
});
