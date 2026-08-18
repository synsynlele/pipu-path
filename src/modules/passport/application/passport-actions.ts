"use server";

import { redirect } from "next/navigation";
import {
  builderPassportIssueSchema,
  builderPassportRevokeSchema,
  builderPassportShareCreateSchema,
  builderPassportShareRevokeSchema,
} from "../domain/passport-contract";
import {
  createBuilderPassportShare,
  issueBuilderPassport,
  revokeBuilderPassport,
  revokeBuilderPassportShare,
} from "../infrastructure/passport-dal";

export type PassportIssueActionState = {
  error: string | null;
};

export type PassportShareActionState = {
  error: string | null;
  relativeUrl: string | null;
};

function stringValues(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .filter((value): value is string => typeof value === "string");
}

export async function issuePassportAction(
  _previous: PassportIssueActionState,
  formData: FormData,
): Promise<PassportIssueActionState> {
  const parsed = builderPassportIssueSchema.safeParse({
    publicSummary: String(formData.get("publicSummary") ?? ""),
    selectedPathName: String(formData.get("selectedPathName") ?? ""),
    claimIds: stringValues(formData, "claimIds"),
    evidenceIds: stringValues(formData, "evidenceIds"),
    institutionVerificationIds: stringValues(
      formData,
      "institutionVerificationIds",
    ),
    portfolioIds: stringValues(formData, "portfolioIds"),
    consentPolicyVersion: formData.get("consentPolicyVersion"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Review your Passport." };
  }

  try {
    await issueBuilderPassport(parsed.data);
  } catch {
    return { error: "PipuPath could not issue this Passport. Review the selected proof and try again." };
  }

  redirect("/passport?issued=1");
}

export async function revokePassportAction(formData: FormData) {
  const parsed = builderPassportRevokeSchema.safeParse({
    passportId: formData.get("passportId"),
  });
  if (!parsed.success) redirect("/passport?error=passport_revoke_invalid");

  try {
    await revokeBuilderPassport(parsed.data.passportId);
  } catch {
    redirect("/passport?error=passport_revoke_failed");
  }
  redirect("/passport?revoked=1");
}

export async function createPassportShareAction(
  _previous: PassportShareActionState,
  formData: FormData,
): Promise<PassportShareActionState> {
  const parsed = builderPassportShareCreateSchema.safeParse({
    passportId: formData.get("passportId"),
    label: String(formData.get("label") ?? ""),
    expiresInDays: Number(formData.get("expiresInDays")),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Review this share.", relativeUrl: null };
  }

  try {
    const share = await createBuilderPassportShare(parsed.data);
    return { error: null, relativeUrl: share.relativeUrl };
  } catch {
    return {
      error: "PipuPath could not create this share. Confirm the Passport is current and try again.",
      relativeUrl: null,
    };
  }
}

export async function revokePassportShareAction(formData: FormData) {
  const parsed = builderPassportShareRevokeSchema.safeParse({
    shareId: formData.get("shareId"),
  });
  if (!parsed.success) redirect("/passport?error=share_revoke_invalid");

  try {
    await revokeBuilderPassportShare(parsed.data.shareId);
  } catch {
    redirect("/passport?error=share_revoke_failed");
  }
  redirect("/passport?share_revoked=1");
}
