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
