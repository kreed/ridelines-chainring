import z from "zod";

const envSchema = z.object({
  CLERK_SECRET_KEY: z.string(),
  CLERK_PUBLISHABLE_KEY: z.string(),
  CLERK_JWT_KEY: z.string(),
  DOMAIN: z.string(),
  CLOUDFRONT_KEY_PAIR_ID: z.string(),
  CLOUDFRONT_PRIVATE_KEY: z.string(),
});

type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse(process.env);
