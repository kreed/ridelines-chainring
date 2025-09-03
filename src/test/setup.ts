// Common test setup to provide environment variables for env.ts parsing
import { vi } from "vitest";

// This causes logger to use the standard console instance, which is needed
// for vitest silent mode to work.
process.env.POWERTOOLS_DEV = "true";

process.env.USERS_TABLE_NAME = process.env.USERS_TABLE_NAME || "users-test";
process.env.CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY || "sk_test_dummy";
process.env.CLERK_PUBLISHABLE_KEY = process.env.CLERK_PUBLISHABLE_KEY || "pk_test_dummy";
process.env.CLERK_JWT_KEY =
  process.env.CLERK_JWT_KEY ||
  "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnDummyKeyPublicOnly\n-----END PUBLIC KEY-----\n";
process.env.DOMAIN = process.env.DOMAIN || "example.com";
process.env.AWS_REGION = process.env.AWS_REGION || "us-west-2";

// Minimal RSA private key for testing signature generation (do NOT use in prod)
const TEST_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCioLiXgji25eHL
slM+R1zbLPw91pDsM2gvuHi/YXPbWlzTHXXDW17MwBds+fMARrVvzT3ITGP9R6HE
ShYr9lhQeIkw/0jQC5Hw1NP4kRIMPI7Ih+/3NbK/D9EbzIJRVTsNHvHECPnT+d9B
XRjxgDBzoa6Zv/XgznNpBUJ5Dbh2SKUWw/38XfDx/CuyqQNOs23jDqGsbm84HVDf
hRuZy3zcnzM8dZHJdr1UXo6dFzR5gjNijJRlnjIMarsF/SZbnRsIrloS3CZnZOax
FMpM4bLCiYQIBkLIiX5bScf3PatHei8lQRl61v6OBDbYceqHzD2MFvKZ8Swu3h+b
TsI5gz03AgMBAAECggEACotOJ0X3rxAc7DaYhBoKELc2zDxHCDGAaKZWxIh+g7M0
/9vR9gPMvozD2A/QAW1pjSFVsftrTjw15lgBXldUvDRHJ4idwXNxQm1M0w8g3Zno
OLiWRpp83OYbIj4dGEXk6WxfXjJQyb19NqvhFqNqQM0JA4n5LgVkto3zPzhfBI2F
wjdTTUMkdFggpM12xm9T2P1BLQom0kOoMR+j6/fenxr266VlnfAfcXpWM+EZeXFE
8ZX8mwf/A4vXPiVxgpUV4aeeeUnZ3GD8yTl2H1S0YyA8kAYxcp9XTjO8//FkMv4Z
QNkOk1cuKmVJaw1b34PcT8MzFJE8F9BE5iUwfoEgkQKBgQDSMVVv5shGWGtwlo7z
jaKJGzc3apHMb+bCfS742Grjyv9AF45cW2jgNIx7nzQi9UYtwM4OlhFb9DxF0GTG
JDea9JvlBgIUd1HlFO7NlKB8j0mRjtX5d5fnP3Kgnq+sODXVoFji7V/kVODr4LjL
PTREXAeFGCLZCtxHwWp73aP88QKBgQDGEb0Q4rMDhoCTSme+2TBTXX03FvnvM1gE
HDLolx3UJIRimswzwL+6/P2upa/ltuCncbYd4iZ72g4tmK4yKnzg3GdblM9bb3nU
AAsTdJj9GJz1FBQczf/SrjVJpU5WMakB/k5v3SL8r/+MInY46f5QRHu9z3cwEFrY
cE2mD0z8pwKBgQCdOaXM5HYemHkVaKlZaTKRGDh/TUnuAC4+gOEn5spdxjSUPoqQ
bxfNzcDfn8Ch/ZIXG0eHBZ3KiLClEDKxO9oUILCT6aCYqoApuTS/tlMtmQjQxmUs
C9cmdQFLQCfrzMgIGb8jT6gQ5aSxDBFuhUOZdrVxSxKWA1eunPEH4kyOIQKBgQCG
y6Go8S81Ef9EvhlWt8Z8pZ5GtJtJn96hhXNb+SPysRtrY7/e5KlXHz+h8N6BbfD7
45Y2Ric8mIyXmVXLjEDKYxTwLZjkuDvn/FONXQeVD4AaBh0d8U/N2IMpaJekb01+
rsxAsvVRlJFMlFNyrkRF6iVwatXJXwgEToF5puYU9wKBgFCIhHNmLpKJcwfkjcBd
RHWtfKRxcZulUEC++913rf/vsi8HgsDc21lSFHbkg4ocKCB8KpEujR1QW67nd0LO
GOc8vXP7epFxHWsBcz2N/7ABQYWmq25qovP3K2qpusFpiCoMq0uhhww9uH7O1wbr
ljh0L3xGWttGnT2rRjeZjTV0
-----END PRIVATE KEY-----`;

process.env.CLOUDFRONT_KEY_PAIR_ID = process.env.CLOUDFRONT_KEY_PAIR_ID || "KIDTEST123";
process.env.CLOUDFRONT_PRIVATE_KEY = process.env.CLOUDFRONT_PRIVATE_KEY || TEST_PRIVATE_KEY;

// Mock Clerk backend to avoid real key parsing/verification during tests
vi.mock("@clerk/backend", () => {
  return {
    createClerkClient: () => ({
      authenticateRequest: async () => ({
        isAuthenticated: true,
        toAuth: () => ({ userId: "user-123" }),
        message: undefined,
        reason: undefined,
      }),
    }),
  } as const;
});
