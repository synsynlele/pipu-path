import "server-only";
import { z } from "zod";

export function privacyOperationsConfig() {
  const contact = z
    .email()
    .safeParse(process.env.PRIVACY_CONTACT_EMAIL ?? "copyartint@gmail.com");
  const email = contact.success ? contact.data : null;
  return {
    email,
    enabled: process.env.PRIVACY_REQUESTS_ENABLED === "true" && email !== null,
  };
}

// A handover deployment may operate on one explicitly provisioned fixture only.
export function privacyDrillScope() {
  if (process.env.PRIVACY_DRILL_MODE !== "true") return null;
  if (process.env.VERCEL_ENV !== "preview")
    throw new Error("PRIVACY_DRILL_REQUIRES_PREVIEW");
  return {
    requestId: z.uuid().parse(process.env.PRIVACY_DRILL_REQUEST_ID),
    userId: z.uuid().parse(process.env.PRIVACY_DRILL_USER_ID),
  };
}

export function assertPrivacyDrillRequest(requestId: string) {
  const scope = privacyDrillScope();
  if (scope && scope.requestId !== requestId)
    throw new Error("PRIVACY_DRILL_REQUEST_DENIED");
}
