"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { recordProductEventForUser } from "@/modules/analytics/infrastructure/product-events";
import { requireAuthenticatedIdentity } from "@/modules/identity/infrastructure/identity-dal";
import {
  opportunityAdminInputSchema,
  opportunityOutcomeSchema,
  validateOpportunitySafety,
} from "../domain/opportunity-contract";
import {
  getOpportunityOfficialUrl,
  markOpportunityApplied,
  recordOpportunityOutcome,
  reviewOpportunityAdmin,
  saveOpportunityAdmin,
  setOpportunityPublicationAdmin,
  setOpportunitySaved,
} from "../infrastructure/opportunity-dal";

const opportunityIdSchema = z.uuid();

function nullableInteger(value: FormDataEntryValue | null) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return null;
  const number = Number(text);
  return Number.isInteger(number) ? number : Number.NaN;
}

function nullableText(value: FormDataEntryValue | null) {
  const text = typeof value === "string" ? value.trim() : "";
  return text || null;
}

function commaList(value: FormDataEntryValue | null, upper = false) {
  const text = typeof value === "string" ? value : "";
  return [...new Set(
    text
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => (upper ? item.toUpperCase() : item.toLowerCase())),
  )];
}

export async function saveOpportunityAdminAction(formData: FormData) {
  const parsed = opportunityAdminInputSchema.safeParse({
    id: nullableText(formData.get("id")),
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

  if (!parsed.success || !validateOpportunitySafety(parsed.data)) {
    redirect("/admin/opportunities?error=invalid_opportunity");
  }

  try {
    await saveOpportunityAdmin(parsed.data);
  } catch {
    redirect("/admin/opportunities?error=save_failed");
  }
  revalidatePath("/admin/opportunities");
  revalidatePath("/opportunities");
  redirect("/admin/opportunities?saved=1");
}

export async function reviewOpportunityAdminAction(formData: FormData) {
  const id = opportunityIdSchema.safeParse(formData.get("opportunityId"));
  const decision = formData.get("decision");
  const notes = typeof formData.get("reviewNotes") === "string"
    ? String(formData.get("reviewNotes")).trim().slice(0, 1000)
    : "";
  if (!id.success || (decision !== "approve" && decision !== "reject")) {
    redirect("/admin/opportunities?error=review_invalid");
  }
  try {
    await reviewOpportunityAdmin(id.data, decision === "approve", notes);
  } catch {
    redirect("/admin/opportunities?error=review_failed");
  }
  revalidatePath("/admin/opportunities");
  revalidatePath("/opportunities");
  redirect("/admin/opportunities?reviewed=1");
}

export async function setOpportunityPublicationAdminAction(formData: FormData) {
  const id = opportunityIdSchema.safeParse(formData.get("opportunityId"));
  const action = formData.get("publicationAction");
  if (!id.success || (action !== "publish" && action !== "withdraw")) {
    redirect("/admin/opportunities?error=publication_invalid");
  }
  try {
    await setOpportunityPublicationAdmin(id.data, action === "publish");
  } catch {
    redirect("/admin/opportunities?error=publication_failed");
  }
  revalidatePath("/admin/opportunities");
  revalidatePath("/opportunities");
  redirect("/admin/opportunities?publication=updated");
}

export async function setOpportunitySavedAction(formData: FormData) {
  const id = opportunityIdSchema.safeParse(formData.get("opportunityId"));
  const saved = formData.get("saved") === "true";
  if (!id.success) redirect("/opportunities?error=state_invalid");
  const { user } = await requireAuthenticatedIdentity();
  try {
    await setOpportunitySaved(id.data, saved);
    await recordProductEventForUser(
      user.id,
      saved ? "opportunity_saved" : "opportunity_unsaved",
      { opportunityId: id.data },
    );
  } catch {
    redirect("/opportunities?error=state_failed");
  }
  revalidatePath("/opportunities");
  redirect("/opportunities?state=updated");
}

export async function markOpportunityAppliedAction(formData: FormData) {
  const id = opportunityIdSchema.safeParse(formData.get("opportunityId"));
  if (!id.success) redirect("/opportunities?error=application_invalid");
  const { user } = await requireAuthenticatedIdentity();
  try {
    await markOpportunityApplied(id.data);
    await recordProductEventForUser(user.id, "opportunity_applied", {
      opportunityId: id.data,
      reporting: "self_reported",
    });
  } catch {
    redirect("/opportunities?error=application_failed");
  }
  revalidatePath("/opportunities");
  redirect("/opportunities?application=recorded");
}

export async function recordOpportunityOutcomeAction(formData: FormData) {
  const id = opportunityIdSchema.safeParse(formData.get("opportunityId"));
  const outcome = opportunityOutcomeSchema.safeParse(formData.get("outcome"));
  if (!id.success || !outcome.success) {
    redirect("/opportunities?error=outcome_invalid");
  }
  const { user } = await requireAuthenticatedIdentity();
  try {
    await recordOpportunityOutcome(id.data, outcome.data);
    await recordProductEventForUser(user.id, "opportunity_outcome_recorded", {
      opportunityId: id.data,
      outcome: outcome.data,
      reporting: "self_reported",
    });
  } catch {
    redirect("/opportunities?error=outcome_failed");
  }
  revalidatePath("/opportunities");
  redirect("/opportunities?outcome=recorded");
}

export async function openOpportunityAction(formData: FormData) {
  const id = opportunityIdSchema.safeParse(formData.get("opportunityId"));
  if (!id.success) redirect("/opportunities?error=link_invalid");
  const { user } = await requireAuthenticatedIdentity();

  let officialUrl: string;
  try {
    officialUrl = await getOpportunityOfficialUrl(id.data);
    await recordProductEventForUser(user.id, "opportunity_external_clicked", {
      opportunityId: id.data,
    });
  } catch {
    redirect("/opportunities?error=link_unavailable");
  }
  redirect(officialUrl);
}
