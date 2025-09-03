import { describe, expect, it, vi } from "vitest";
import type { Context } from "../../types/context";
import { createRouter } from "../../types/trpc";
import { pmtiles } from "./user";

describe("user.pmtiles", () => {
  it("returns a signed CloudFront URL for the user", async () => {
    // Fix time for deterministic expiry
    const fixedNow = 1_700_000_000_000; // ms
    vi.setSystemTime(new Date(fixedNow));

    const router = createRouter({ user: { pmtiles } });
    const ctx: Context = {
      path: "/trpc/user.pmtiles",
      authHeader: "Bearer test",
      userId: "user-123",
    };

    const caller = router.createCaller(ctx);
    const url = await caller.user.pmtiles();

    const u = new URL(url);
    expect(u.hostname).toBe(process.env.DOMAIN);
    expect(u.pathname).toBe(`/activities/${ctx.userId}.pmtiles`);

    const params = u.searchParams;
    expect(params.get("Signature")).toBeTruthy();
    expect(params.get("Key-Pair-Id")).toBe(process.env.CLOUDFRONT_KEY_PAIR_ID);
    const expiresParam = params.get("Expires");
    expect(expiresParam).toBeTruthy();
    expect(Number(expiresParam)).toBe(Math.floor(fixedNow / 1000) + 600);
  });

  it("throws UNAUTHORIZED when no auth header is provided", async () => {
    const router = createRouter({ user: { pmtiles } });
    const ctx = {
      path: "/trpc/user.pmtiles",
      authHeader: undefined,
      userId: undefined,
    } as unknown as Context;

    const caller = router.createCaller(ctx);
    await expect(caller.user.pmtiles()).rejects.toHaveProperty("code", "UNAUTHORIZED");
  });
});
