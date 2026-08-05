import { createHash } from "node:crypto";

export function authRateLimitFingerprint(
  action: string,
  requestIdentity: string,
) {
  return createHash("sha256")
    .update(`pipupath-auth-v1:${action}:${requestIdentity}`)
    .digest("hex");
}
