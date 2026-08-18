import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { builderPassportShareSecretSchema } from "../domain/passport-contract";

export function generatePassportShareSecret() {
  const secret = `ppsp_${randomBytes(32).toString("base64url")}`;
  return builderPassportShareSecretSchema.parse(secret);
}

export function hashPassportShareSecret(secret: string) {
  return createHash("sha256").update(secret, "utf8").digest("hex");
}

export function passportShareRateLimitFingerprint(
  shareId: string,
  requestIdentity: string,
) {
  return createHash("sha256")
    .update(`passport-share:v1:${shareId}:${requestIdentity}`, "utf8")
    .digest("hex");
}
