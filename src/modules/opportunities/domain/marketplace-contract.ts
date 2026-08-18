import { z } from "zod";
import {
  opportunityAdminInputSchema,
  opportunityCatalogItemSchema,
} from "./opportunity-contract";

export const opportunityProviderStatuses = [
  "pending",
  "approved",
  "suspended",
  "revoked",
] as const;

export const opportunityProviderStatusSchema = z.enum(
  opportunityProviderStatuses,
);

export const opportunityProviderRoles = ["owner", "operator"] as const;
export const opportunityProviderRoleSchema = z.enum(opportunityProviderRoles);

export const opportunityProviderOrganisationTypes = [
  "company",
  "nonprofit",
  "school",
  "university",
  "government",
  "foundation",
  "community",
  "other",
] as const;

export const opportunityProviderOrganisationTypeSchema = z.enum(
  opportunityProviderOrganisationTypes,
);

export const opportunityApplicationStatuses = [
  "draft",
  "submitted",
  "viewed",
  "shortlisted",
  "accepted",
  "not_selected",
  "withdrawn",
] as const;

export const opportunityApplicationStatusSchema = z.enum(
  opportunityApplicationStatuses,
);

const countryCodeSchema = z.string().regex(/^[A-Z]{2}$/);
const httpsUrlSchema = z
  .string()
  .url()
  .refine((value) => value.startsWith("https://"));
const timestampSchema = z.string().datetime({ offset: true });

export const opportunityProviderSchema = z.object({
  id: z.uuid(),
  organisationName: z.string().trim().min(2).max(180),
  organisationType: opportunityProviderOrganisationTypeSchema,
  officialWebsite: httpsUrlSchema,
  officialDomain: z
    .string()
    .trim()
    .toLowerCase()
    .min(3)
    .max(253)
    .regex(/^[a-z0-9.-]+$/),
  countryCode: countryCodeSchema,
  publicDescription: z.string().trim().min(20).max(1200),
  status: opportunityProviderStatusSchema,
  reviewedAt: timestampSchema.nullable(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export const opportunityProviderPublicSchema = opportunityProviderSchema.pick({
  id: true,
  organisationName: true,
  organisationType: true,
  officialWebsite: true,
  officialDomain: true,
  countryCode: true,
  publicDescription: true,
  status: true,
});

export const opportunityProviderInputSchema = z.object({
  id: z.uuid().nullable(),
  organisationName: z.string().trim().min(2).max(180),
  organisationType: opportunityProviderOrganisationTypeSchema,
  officialWebsite: httpsUrlSchema,
  officialDomain: z
    .string()
    .trim()
    .toLowerCase()
    .min(3)
    .max(253)
    .regex(/^[a-z0-9.-]+$/),
  countryCode: countryCodeSchema,
  publicDescription: z.string().trim().min(20).max(1200),
});

export const opportunityProviderMembershipSchema = z.object({
  providerId: z.uuid(),
  role: opportunityProviderRoleSchema,
  status: z.enum(["active", "revoked"]),
  joinedAt: timestampSchema.nullable().optional(),
  revokedAt: timestampSchema.nullable().optional(),
});

export const opportunityProviderWorkspaceSchema = z.object({
  provider: opportunityProviderSchema,
  membership: opportunityProviderMembershipSchema,
  opportunities: z.array(
    opportunityAdminInputSchema.omit({ id: true, providerName: true }).extend({
      id: z.uuid(),
      reviewStatus: z.enum(["pending", "approved", "rejected"]),
      publicationStatus: z.enum(["draft", "published", "withdrawn"]),
      reviewNotes: z.string().max(1000).nullable(),
      createdAt: timestampSchema,
      updatedAt: timestampSchema,
    }),
  ),
});

export const marketplaceCatalogItemSchema = opportunityCatalogItemSchema.extend(
  {
    providerId: z.uuid().nullable(),
    providerStatus: opportunityProviderStatusSchema.nullable(),
    providerWebsite: httpsUrlSchema.nullable(),
    providerCountryCode: countryCodeSchema.nullable(),
    nativeApplicationEnabled: z.boolean(),
    applicationStatus: opportunityApplicationStatusSchema.nullable(),
  },
);

export const marketplaceCatalogSchema = z.array(marketplaceCatalogItemSchema);

export const marketplaceCapabilitySelectionSchema = z.object({
  claimId: z.uuid(),
  capabilityKey: z.string().min(2).max(120),
  capabilityLabel: z.string().min(2).max(120),
  capabilityLevel: z.enum([
    "practicing",
    "demonstrated",
    "repeatedly_demonstrated",
  ]),
});

export const marketplaceEvidenceSelectionSchema = z.object({
  evidenceId: z.uuid(),
  claimId: z.uuid(),
  sourceType: z.enum(["quest", "project", "collaboration"]),
  sourceTitle: z.string().min(2).max(160),
  evidenceSummary: z.string().min(10).max(400),
  sourceHref: z.string().startsWith("/"),
});

export const marketplaceInstitutionVerificationSelectionSchema = z.object({
  verificationId: z.uuid(),
  capabilityKey: z.string().min(2).max(120),
  capabilityLabel: z.string().min(2).max(120),
  institutionName: z.string().min(2).max(180),
  confirmedAt: timestampSchema,
});

export const marketplacePortfolioProofSelectionSchema = z.object({
  portfolioId: z.uuid(),
  slug: z.string().min(3).max(120),
  publicTitle: z.string().min(3).max(180),
  publicSummary: z.string().min(20).max(600),
  proofHref: z.string().startsWith("/proof/"),
});

export const marketplaceApplicationPacketSchema = z.object({
  displayName: z.string().trim().min(2).max(120),
  builderSummary: z.string().trim().min(20).max(800).nullable(),
  selectedPathName: z.string().trim().min(2).max(180).nullable(),
  applicationNote: z.string().trim().max(2000).nullable(),
  capabilities: z.array(marketplaceCapabilitySelectionSchema).max(12),
  evidence: z.array(marketplaceEvidenceSelectionSchema).max(20),
  institutionVerifications: z
    .array(marketplaceInstitutionVerificationSelectionSchema)
    .max(12),
  portfolioProofs: z.array(marketplacePortfolioProofSelectionSchema).max(8),
});

export const marketplaceApplicationSchema = z.object({
  id: z.uuid(),
  opportunityId: z.uuid(),
  providerId: z.uuid(),
  status: opportunityApplicationStatusSchema,
  packet: marketplaceApplicationPacketSchema,
  submittedAt: timestampSchema.nullable(),
  viewedAt: timestampSchema.nullable(),
  decidedAt: timestampSchema.nullable(),
  withdrawnAt: timestampSchema.nullable(),
});

export const marketplaceApplicationDraftInputSchema = z.object({
  opportunityId: z.uuid(),
  builderSummary: z.string().trim().min(20).max(800).nullable(),
  selectedPathName: z.string().trim().min(2).max(180).nullable(),
  applicationNote: z.string().trim().max(2000).nullable(),
  claimIds: z.array(z.uuid()).max(12),
  evidenceIds: z.array(z.uuid()).max(20),
  institutionVerificationIds: z.array(z.uuid()).max(12),
  portfolioIds: z.array(z.uuid()).max(8),
});

export const marketplaceApplicationEligibilitySchema = z.object({
  eligible: z.boolean(),
  reasons: z.array(z.string().min(3).max(240)).max(8),
});

export type OpportunityProviderStatus = z.infer<
  typeof opportunityProviderStatusSchema
>;
export type OpportunityProviderRole = z.infer<
  typeof opportunityProviderRoleSchema
>;
export type OpportunityProvider = z.infer<typeof opportunityProviderSchema>;
export type OpportunityProviderInput = z.infer<
  typeof opportunityProviderInputSchema
>;
export type OpportunityProviderWorkspace = z.infer<
  typeof opportunityProviderWorkspaceSchema
>;
export type MarketplaceCatalogItem = z.infer<
  typeof marketplaceCatalogItemSchema
>;
export type MarketplaceApplication = z.infer<
  typeof marketplaceApplicationSchema
>;
export type MarketplaceApplicationPacket = z.infer<
  typeof marketplaceApplicationPacketSchema
>;
export type MarketplaceApplicationDraftInput = z.infer<
  typeof marketplaceApplicationDraftInputSchema
>;
export type MarketplaceApplicationStatus = z.infer<
  typeof opportunityApplicationStatusSchema
>;

const providerTransitions: Record<
  OpportunityProviderStatus,
  readonly OpportunityProviderStatus[]
> = {
  pending: ["approved", "revoked"],
  approved: ["suspended", "revoked"],
  suspended: ["approved", "revoked"],
  revoked: [],
};

export function canTransitionOpportunityProvider(
  from: OpportunityProviderStatus,
  to: OpportunityProviderStatus,
) {
  return providerTransitions[from].includes(to);
}

const applicationTransitions: Record<
  MarketplaceApplicationStatus,
  readonly MarketplaceApplicationStatus[]
> = {
  draft: ["submitted", "withdrawn"],
  submitted: ["viewed", "shortlisted", "accepted", "not_selected", "withdrawn"],
  viewed: ["shortlisted", "accepted", "not_selected", "withdrawn"],
  shortlisted: ["accepted", "not_selected", "withdrawn"],
  accepted: [],
  not_selected: [],
  withdrawn: [],
};

export function canTransitionOpportunityApplication(
  from: MarketplaceApplicationStatus,
  to: MarketplaceApplicationStatus,
) {
  return applicationTransitions[from].includes(to);
}

export function canBuilderTransitionApplication(
  from: MarketplaceApplicationStatus,
  to: MarketplaceApplicationStatus,
) {
  return (
    (from === "draft" && to === "submitted") ||
    ((["draft", "submitted", "viewed", "shortlisted"] as const).includes(
      from as "draft" | "submitted" | "viewed" | "shortlisted",
    ) &&
      to === "withdrawn")
  );
}

export function canProviderTransitionApplication(
  from: MarketplaceApplicationStatus,
  to: MarketplaceApplicationStatus,
) {
  if (!["submitted", "viewed", "shortlisted"].includes(from)) return false;
  return ["viewed", "shortlisted", "accepted", "not_selected"].includes(to);
}

export function evaluateMarketplaceApplicationEligibility(input: {
  isMinor: boolean;
  safeguardingReviewRequired: boolean;
  providerStatus: OpportunityProviderStatus;
  opportunityActive: boolean;
}) {
  const reasons: string[] = [];

  if (input.isMinor) {
    reasons.push(
      "Provider application submission is limited to eligible adults in Stage 20.",
    );
  }
  if (input.safeguardingReviewRequired) {
    reasons.push(
      "Resolve the safeguarding review before sharing an application packet.",
    );
  }
  if (input.providerStatus !== "approved") {
    reasons.push(
      "The opportunity provider is not currently approved to receive applications.",
    );
  }
  if (!input.opportunityActive) {
    reasons.push(
      "This opportunity is not currently open for marketplace applications.",
    );
  }

  return marketplaceApplicationEligibilitySchema.parse({
    eligible: reasons.length === 0,
    reasons,
  });
}

export function validateMarketplacePacketSelections(
  packet: MarketplaceApplicationPacket,
) {
  const capabilityIds = new Set(
    packet.capabilities.map((item) => item.claimId),
  );
  const evidenceIds = new Set(packet.evidence.map((item) => item.evidenceId));
  const institutionIds = new Set(
    packet.institutionVerifications.map((item) => item.verificationId),
  );
  const portfolioIds = new Set(
    packet.portfolioProofs.map((item) => item.portfolioId),
  );

  return (
    capabilityIds.size === packet.capabilities.length &&
    evidenceIds.size === packet.evidence.length &&
    institutionIds.size === packet.institutionVerifications.length &&
    portfolioIds.size === packet.portfolioProofs.length &&
    packet.evidence.every((item) => capabilityIds.has(item.claimId))
  );
}
