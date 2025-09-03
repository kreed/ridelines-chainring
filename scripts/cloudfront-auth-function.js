// biome-ignore-all lint/complexity/useOptionalChain: cloudfront functions are ES5.1
/**
 * CloudFront Function for auth and routing
 *
 * Behaviors:
 * - /trpc/intervals.oauth.userInfo: rewrites Authorization header to x-authorization (cloudfront
 *   strips Authorization from the origin request).
 * - /trpc/* (others): Pass the __session cookie as x-authorization header
 * - For both: removes /trpc prefix from path
 */
export function handler(event) {
  var request = event.request;
  var uri = request.uri || "/";

  var needsAuthHeader = /^\/trpc\/intervals\.oauth\.userInfo/.test(uri);
  var ok = needsAuthHeader ? rewriteAuthHeader(request) : rewriteSessionCookie(request);
  if (!ok) return unauthorized();

  // Strip /trpc prefix
  request.uri = uri.replace(/^\/trpc/, "");
  if (!request.uri.startsWith("/")) request.uri = `/${request.uri}`;
  return request;
}

// Parse __session from Cookie header
function readSessionCookie(headers) {
  var cookieHeader = headers.cookie && headers.cookie.value;
  if (!cookieHeader) return null;
  var parts = String(cookieHeader).split(/;\s*/);
  var i, k, kv;
  for (i = 0; i < parts.length; i++) {
    kv = parts[i].split("=");
    k = kv[0];
    if (k === "__session") {
      return kv.slice(1).join("=");
    }
  }
  return null;
}

function unauthorized() {
  return {
    statusCode: 401,
    statusDescription: "Unauthorized",
    headers: { "www-authenticate": { value: "Bearer" } },
  };
}

// Rewrite Authorization: Bearer ... to x-authorization for Clerk callback route
function rewriteAuthHeader(request) {
  var headers = request.headers;
  var authHeader = headers.authorization;
  if (!authHeader || !authHeader.value || !/^Bearer\s+/.test(authHeader.value)) {
    return false;
  }
  headers["x-authorization"] = { value: authHeader.value };
  delete headers.authorization;
  return true;
}

// Rewrite __session cookie to x-authorization: Bearer <token>
function rewriteSessionCookie(request) {
  var token = readSessionCookie(request.headers);
  if (!token) return false;
  request.headers["x-authorization"] = { value: `Bearer ${token}` };
  return true;
}
