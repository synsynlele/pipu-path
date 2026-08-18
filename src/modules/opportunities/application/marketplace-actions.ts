"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  marketplaceApplicationDraftInputSchema,
  opportunityApplicationStatusSchema,
  opportunityProviderInputSchema,
  opportunityProviderRoleSchema,
  opportunityProviderStatusSchema,
} from "../domain/marketplace-contract";
import {
  opportunityAdminInputSchema,
  validateOpportunitySafety,
} from "../domain/opportunity-contract";
import {
  saveMarketplaceApplicationDraft,
  saveOpportunityProvider,
  saveProviderOpportunity,
  setOpportunityProviderMember,
  setOpportunityProviderStatus,
  submitMarketplaceApplication,
  transitionProviderApplication,
  withdrawMarketplaceApplication,
} from "../infrastructure/marketplace-dal";

const uuidSchema = z.uuid();

function nullableText(value: FormDataEntryValue | null) {
  const text = typeof value === "string" ? value.trim() : "";
  return text || null;
}

function nullableInteger(value: FormDataEntryValue | null) {
  const text = nullableText(value);
  if (!text) return null;
  const number = Number(text);
  return Number.isInteger(number) ? number : Number.NaN;
}

function commaList(value: FormDataEntryValue | null, upper = false) {
  const text = typeof value === "string" ? value : "";
  return [
    ...new Set(
      text
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => (upper ? item.toUpperCase() : item.toLowerCase())),
    ),
  ];
}

function uuidList(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .filter((value): value is string => typeof value === "string")
    .filter((value) => uuidSchema.safeParse(value).success);
}

export async function saveMarketplaceApplicationDraftAction(
  formData: FormData,
) {
  const parsed = marketplaceApplicationDraftInputSchema.safeParse({
    opportunityId: formData.get("opportunityId"),
    builderSummary: nullableText(formData.get("builderSummary")),
    selectedPathName: nullableText(formData.get("selectedPathName")),
    applicationNote: nullableText(formData.get("applicationNote")),
    claimIds: uuidList(formData, "claimIds"),
    evidenceIds: uuidList(formData, "evidenceIds"),
    institutionVerificationIds: uuidList(
      formData,
      "institutionVerificationIds",
    ),
    portfolioIds: uuidList(formData, "portfolioIds"),
  });

  if (!parsed.success) {
    const opportunityId = String(formData.get("opportunityId") ?? "");
    redirect(`/opportunities/${opportunityId}/apply?error=invalid_packet`);
  }

  try {
    await saveMarketplaceApplicationDraft(parsed.data);
  } catch {
    redirect(
      `/opportunities/${parsed.data.opportunityId}/apply?error=save_failed`,
    );
  }

  revalidatePath(`/opportunities/${parsed.data.opportunityId}/apply`);
  revalidatePath("/opportunities");
  redirect(`/opportunities/${parsed.data.opportunityId}/apply?saved=1`);
}

export async function submitMarketplaceApplicationAction(formData: FormData) {
  const opportunityId = uuidSchema.safeParse(formData.get("opportunityId"));
  const applicationId = uuidSchema.safeParse(formData.get("applicationId"));
  const consent = formData.get("consent") === "yes";
  if (!opportunityId.success || !applicationId.success || !consent) {
    redirect("/opportunities?error=application_invalid");
  }

  try {
    await submitMarketplaceApplication(applicationId.data);
  } catch {
    redirect(`/opportunities/${opportunityId.data}/apply?error=submit_failed`);
  }

  revalidatePath(`/opportunities/${opportunityId.data}/apply`);
  revalidatePath("/opportunities");
  redirect(`/opportunities/${opportunityId.data}/apply?submitted=1`);
}

export async function withdrawMarketplaceApplicationAction(formData: FormData) {
  const opportunityId = uuidSchema.safeParse(formData.get("opportunityId"));
  const applicationId = uuidSchema.safeParse(formData.get("applicationId"));
  if (!opportunityId.success || !applicationId.success) {
    redirect("/opportunities?error=application_invalid");
  }

  try {
    await withdrawMarketplaceApplication(applicationId.data);
  } catch {
    redirect(`/opportunities/${opportunityId.data}/apply?error=withdraw_failed`);
  }

  revalidatePath(`/opportunities/${opportunityId.data}/apply`);
  revalidatePath("/opportunities");
  redirect(`/opportunities/${opportunityId.data}/apply?withdrawn=1`);
}

export async function saveOpportunityProviderAdminAction(formData: FormData) {
  const parsed = opportunityProviderInputSchema.safeParse({
    id: nullableText(formData.get("providerId")),
    organisationName: formData.get("organisationName"),
    organisationType: formData.get("organisationType"),
    officialWebsite: formData.get("officialWebsite"),
    officialDomain: formData.get("officialDomain"),
    countryCode: String(formData.get("countryCode") ?? "").toUpperCase(),
    publicDescription: formData.get("publicDescription"),
  });
  if (!parsed.success) redirect("/admin/providers?error=invalid_provider");

  try {
    await saveOpportunityProvider(parsed.data);
  } catch {
    redirect("/admin/providers?error=save_failed");
  }

  revalidatePath("/admin/providers");
  redirect("/admin/providers?saved=1");
}

export async function setOpportunityProviderStatusAdminAction(
  formData: FormData,
) {
  const providerId = uuidSchema.safeParse(formData.get("providerId"));
  const status = opportunityProviderStatusSchema.safeParse(
    formData.get("status"),
  );
  const notes = String(formData.get("reviewNotes") ?? "")
    .trim()
    .slice(0, 1200);
  if (!providerId.success || !status.success || status.data === "pending") {
    redirect("/admin/providers?error=status_invalid");
  }

  try {
    await setOpportunityProviderStatus(providerId.data, status.data, notes);
  } catch {
    redirect("/admin/providers?error=status_failed");
  }

  revalidatePath("/admin/providers");
  revalidatePath("/opportunities");
  redirect("/admin/providers?status=updated");
}

export async function setOpportunityProviderMemberAdminAction(
  formData: FormData,
) {
  const providerId = uuidSchema.safeParse(formData.get("providerId"));
  const role = opportunityProviderRoleSchema.safeParse(formData.get("role"));
  const username = String(formData.get("username") ?? "").trim();
  const active = formData.get("action") !== "revoke";
  if (!providerId.success || !role.success || username.length < 2) {
    redirect("/admin/providers?error=member_invalid");
  }

  try {
    await setOpportunityProviderMember({
      providerId: providerId.data,
      username,
      role: role.data,
      active,
    });
  } catch {
    redirect("/admin/providers?error=member_failed");
  }

  revalidatePath("/admin/providers");
  revalidatePath("/provider");
  redirect("/admin/providers?member=updated");
}

export async function saveProviderOpportunityAction(formData: FormData) {
  const providerId = uuidSchema.safeParse(formData.get("providerId"));
  const parsed = opportunityAdminInputSchema.safeParse({
    id: nullableText(formData.get("opportunityId")),
    title: formData.get("title"),
    providerName: formData.get("providerName"),
    category: formData.get("category"),
    summary: formData.get("summary"),
    eligibilitySummary: formData.get("eligibilitySummary"),
    benefitSummary: formData.get("benefitSummary"),
    minAge: nullableInteger(formData.get("minAge")),
    maxAge: nullableInteger(formData.get("maxAge")),
    geographyScope: formData.get("geographyScope"),
    countryCodes: commaList(formData.get("countryCodes"), true),
    geographyLabel: formData.get("geographyLabel"),
    deliveryMode: formData.get("deliveryMode"),
    pathwayTags: commaList(formData.get("pathwayTags")),
    capabilityTags: commaList(formData.get("capabilityTags")),
    officialUrl: formData.get("officialUrl"),
    deadlineDate: nullableText(formData.get("deadlineDate")),
  });

  if (
    !providerId.success ||
    !parsed.success ||
    !validateOpportunitySafety(parsed.data)
  ) {
    redirect("/provider?error=invalid_opportunity");
  }

  try {
    await saveProviderOpportunity(providerId.data, parsed.data);
  } catch {
    redirect(`/provider?provider=${providerId.data}&error=save_failed`);
  }

  revalidatePath("/provider");
  revalidatePath("/admin/opportunities");
  redirect(`/provider?provider=${providerId.data}&saved=1`);
}

export async function transitionProviderApplicationAction(formData: FormData) {
  const providerId = uuidSchema.safeParse(formData.get("providerId"));
  const applicationId = uuidSchema.safeParse(formData.get("applicationId"));
  const status = opportunityApplicationStatusSchema.safeParse(
    formData.get("status"),
  );
  if (
    !providerId.success ||
    !applicationId.success ||
    !status.success ||
    !["viewed", "shortlisted", "accepted", "not_selected"].includes(
      status.data,
    )
  ) {
    redirect("/provider/applications?error=transition_invalid");
  }

  try {
    await transitionProviderApplication(applicationId.data, status.data);
  } catch {
    redirect(
      `/provider/applications?provider=${providerId.data}&error=transition_failed`,
    );
  }

  revalidatePath("/provider/applications");
  revalidatePath("/opportunities");
  redirect(`/provider/applications?provider=${providerId.data}&updated=1`);
}
