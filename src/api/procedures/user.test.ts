import { describe, expect, it, vi } from "vitest";
import type { Context } from "../../types/context";
import { createRouter } from "../../types/trpc";
import { pmtiles } from "./user";

const mockSend = vi.fn();

vi.mock("../../clients/aws", () => ({
  dynamodb: { send: (...args: unknown[]) => mockSend(...args) },
}));

describe("user.pmtiles", () => {
  it("returns a signed CloudFront URL when pmtilesKey exists", async () => {
    const fixedNow = 1_700_000_000_000;
    vi.setSystemTime(new Date(fixedNow));

    mockSend.mockResolvedValueOnce({
      Item: { pmtilesKey: "activities/user-123/abc123def456.pmtiles" },
    });

    const router = createRouter({ user: { pmtiles } });
    const ctx: Context = {
      path: "/trpc/user.pmtiles",
      authHeader: "Bearer test",
      userId: "user-123",
    };

    const caller = router.createCaller(ctx);
    const url = await caller.user.pmtiles();

    expect(url).not.toBeNull();
    const u = new URL(url as string);
    expect(u.hostname).toBe(process.env.DOMAIN);
    expect(u.pathname).toBe("/activities/user-123/abc123def456.pmtiles");

    const params = u.searchParams;
    expect(params.get("Signature")).toBeTruthy();
    expect(params.get("Key-Pair-Id")).toBe(process.env.CLOUDFRONT_KEY_PAIR_ID);
    const expiresParam = params.get("Expires");
    expect(expiresParam).toBeTruthy();
    expect(Number(expiresParam)).toBe(Math.floor(fixedNow / 1000) + 600);
  });

  it("returns null when no user record exists", async () => {
    mockSend.mockResolvedValueOnce({ Item: undefined });

    const router = createRouter({ user: { pmtiles } });
    const ctx: Context = {
      path: "/trpc/user.pmtiles",
      authHeader: "Bearer test",
      userId: "user-123",
    };

    const caller = router.createCaller(ctx);
    const result = await caller.user.pmtiles();

    expect(result).toBeNull();
  });

  it("returns null when user record has no pmtilesKey", async () => {
    mockSend.mockResolvedValueOnce({ Item: { id: "user-123" } });

    const router = createRouter({ user: { pmtiles } });
    const ctx: Context = {
      path: "/trpc/user.pmtiles",
      authHeader: "Bearer test",
      userId: "user-123",
    };

    const caller = router.createCaller(ctx);
    const result = await caller.user.pmtiles();

    expect(result).toBeNull();
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
