import { z } from "zod";

export const opportunityCategories = [
  "competition",
  "scholarship",
  "internship",
  "challenge",
  "grant",
  "apprenticeship",
  "volunteer_project",
  "entrepreneurship",
] as const;

export const opportunityCategorySchema = z.enum(opportunityCategories);
export const opportunityGeographyScopeSchema = z.enum([
  "global",
  "country",
  "region",
]);
export const opportunityDeliveryModeSchema = z.enum([
  "in_person",
  "remote",
  "hybrid",
  "unspecified",
]);
export const opportunityOutcomeSchema = z.enum([
  "accepted",
  "not_selected",
  "withdrawn",
  "other",
]);
export const opportunityReviewStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected",
]);
export const opportunityPublicationStatusSchema = z.enum([
  "draft",
  "published",
  "withdrawn",
]);

const countryCodeSchema = z.string().regex(/^[A-Z]{2}$/);
const tagSchema = z
  .string()
  .trim()
  .min(2)
  .max(60)
  .regex(/^[a-z0-9][a-z0-9 +&/._-]*$/i);
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const opportunityBuilderStateSchema = z.object({
  savedAt: z.string().datetime({ offset: true }).nullable(),
  appliedAt: z.string().datetime({ offset: true }).nullable(),
  outcome: opportunityOutcomeSchema.nullable(),
  outcomeAt: z.string().datetime({ offset: true }).nullable(),
});

export const opportunityCatalogItemSchema = z.object({
  id: z.uuid(),
  title: z.string().trim().min(3).max(180),
  providerName: z.string().trim().min(2).max(160),
  category: opportunityCategorySchema,
  summary: z.string().trim().min(20).max(1200),
  eligibilitySummary: z.string().trim().min(10).max(1200),
  benefitSummary: z.string().trim().min(5).max(600),
  minAge: z.number().int().min(0).max(120).nullable(),
  maxAge: z.number().int().min(0).max(120).nullable(),
  geographyScope: opportunityGeographyScopeSchema,
  countryCodes: z.array(countryCodeSchema).max(20),
  geographyLabel: z.string().trim().min(2).max(180),
  deliveryMode: opportunityDeliveryModeSchema,
  pathwayTags: z.array(tagSchema).max(12),
  capabilityTags: z.array(tagSchema).max(12),
  officialUrl: z
    .string()
    .url()
    .refine((value) => value.startsWith("https://")),
  deadlineDate: dateSchema.nullable(),
  state: opportunityBuilderStateSchema,
});

export const opportunityCatalogSchema = z.array(opportunityCatalogItemSchema);

export const opportunityAdminItemSchema = opportunityCatalogItemSchema
  .omit({ state: true })
  .extend({
    reviewStatus: opportunityReviewStatusSchema,
    publicationStatus: opportunityPublicationStatusSchema,
    reviewNotes: z.string().max(1000).nullable(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  });

export const opportunityAdminStateSchema = z.object({
  role: z.enum(["owner", "operator", "moderator", "analyst"]),
  items: z.array(opportunityAdminItemSchema),
});

const optionalAgeSchema = z.number().int().min(0).max(120).nullable();

export const opportunityAdminInputSchema = z
  .object({
    id: z.uuid().nullable(),
    title: z.string().trim().min(3).max(180),
    providerName: z.string().trim().min(2).max(160),
    category: opportunityCategorySchema,
    summary: z.string().trim().min(20).max(1200),
    eligibilitySummary: z.string().trim().min(10).max(1200),
    benefitSummary: z.string().trim().min(5).max(600),
    minAge: optionalAgeSchema,
    maxAge: optionalAgeSchema,
    geographyScope: opportunityGeographyScopeSchema,
    countryCodes: z.array(countryCodeSchema).max(20),
    geographyLabel: z.string().trim().min(2).max(180),
    deliveryMode: opportunityDeliveryModeSchema,
    pathwayTags: z.array(tagSchema).max(12),
    capabilityTags: z.array(tagSchema).max(12),
    officialUrl: z
      .string()
      .url()
      .refine((value) => value.startsWith("https://")),
    deadlineDate: dateSchema.nullable(),
  })
  .superRefine((value, context) => {
    if (
      value.minAge !== null &&
      value.maxAge !== null &&
      value.minAge > value.maxAge
    ) {
      context.addIssue({
        code: "custom",
        path: ["maxAge"],
        message: "Maximum age must be greater than or equal to minimum age.",
      });
    }
    if (value.geographyScope === "global" && value.countryCodes.length > 0) {
      context.addIssue({
        code: "custom",
        path: ["countryCodes"],
        message: "Global opportunities cannot restrict country codes.",
      });
    }
    if (value.geographyScope !== "global" && value.countryCodes.length === 0) {
      context.addIssue({
        code: "custom",
        path: ["countryCodes"],
        message:
          "Country or region opportunities need at least one country code.",
      });
    }
  });

export type OpportunityCatalogItem = z.infer<
  typeof opportunityCatalogItemSchema
>;
export type OpportunityAdminInput = z.infer<typeof opportunityAdminInputSchema>;
export type OpportunityAdminState = z.infer<typeof opportunityAdminStateSchema>;
export type OpportunityOutcome = z.infer<typeof opportunityOutcomeSchema>;

export type OpportunityMatchTier =
  "strong_match" | "possible_match" | "eligibility_check";

export type OpportunityMatchContext = {
  ageBand: "under_13" | "13_15" | "16_17" | "18_24" | "25_plus" | "unknown";
  isMinor: boolean;
  countryCode: string | null;
  selectedPathName: string | null;
  selectedPathSkills: string[];
  capabilities: Array<{ label: string; level: string }>;
};

export type OpportunityMatch = {
  opportunity: OpportunityCatalogItem;
  tier: OpportunityMatchTier;
  reasons: string[];
  readinessGaps: string[];
  matchedPathwayTags: string[];
  matchedCapabilityTags: string[];
};

type EligibilityResult =
  | { status: "eligible"; reason?: string }
  | { status: "check"; gap: string }
  | { status: "ineligible" };

const ageRanges: Record<
  OpportunityMatchContext["ageBand"],
  { min: number; max: number | null } | null
> = {
  under_13: { min: 0, max: 12 },
  "13_15": { min: 13, max: 15 },
  "16_17": { min: 16, max: 17 },
  "18_24": { min: 18, max: 24 },
  "25_plus": { min: 25, max: null },
  unknown: null,
};

const unsafeOpportunityCopy =
  /\b(get rich|quick money|guaranteed income|guaranteed earnings|double your money|gambling|betting|casino|binary options|forex trading|crypto trading|borrow money|take out a loan)\b/i;

export function validateOpportunitySafety(input: OpportunityAdminInput) {
  return !unsafeOpportunityCopy.test(
    [
      input.title,
      input.summary,
      input.eligibilitySummary,
      input.benefitSummary,
    ].join(" "),
  );
}

function normalise(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tagMatchesText(tag: string, values: string[]) {
  const needle = normalise(tag);
  return values.some((value) => normalise(value).includes(needle));
}

function ageEligibility(
  context: OpportunityMatchContext,
  opportunity: OpportunityCatalogItem,
): EligibilityResult {
  if (opportunity.minAge === null && opportunity.maxAge === null) {
    return { status: "eligible" };
  }

  const range = ageRanges[context.ageBand];
  if (!range) {
    return {
      status: "check",
      gap: "Confirm the exact age requirement before applying.",
    };
  }

  const rangeMax = range.max ?? Number.POSITIVE_INFINITY;
  const minimum = opportunity.minAge ?? 0;
  const maximum = opportunity.maxAge ?? Number.POSITIVE_INFINITY;

  if (rangeMax < minimum || range.min > maximum) {
    return { status: "ineligible" };
  }

  if (range.min >= minimum && rangeMax <= maximum) {
    return {
      status: "eligible",
      reason: "The age requirement fits your declared age band.",
    };
  }

  return {
    status: "check",
    gap: "Your age band overlaps this requirement; confirm your exact age eligibility.",
  };
}

function geographyEligibility(
  context: OpportunityMatchContext,
  opportunity: OpportunityCatalogItem,
): EligibilityResult {
  if (opportunity.geographyScope === "global") {
    return { status: "eligible", reason: "This opportunity is global." };
  }

  if (!context.countryCode) {
    return {
      status: "check",
      gap: `Confirm location eligibility for ${opportunity.geographyLabel}.`,
    };
  }

  if (opportunity.countryCodes.includes(context.countryCode)) {
    return {
      status: "eligible",
      reason: `Your profile country is included in ${opportunity.geographyLabel}.`,
    };
  }

  return { status: "ineligible" };
}

export function matchOpportunity(
  context: OpportunityMatchContext,
  opportunity: OpportunityCatalogItem,
): OpportunityMatch | null {
  const age = ageEligibility(context, opportunity);
  const geography = geographyEligibility(context, opportunity);

  if (age.status === "ineligible" || geography.status === "ineligible") {
    return null;
  }

  const pathValues = [
    context.selectedPathName ?? "",
    ...context.selectedPathSkills,
  ];
  const capabilityValues = context.capabilities.map((item) => item.label);
  const matchedPathwayTags = opportunity.pathwayTags.filter((tag) =>
    tagMatchesText(tag, pathValues),
  );
  const matchedCapabilityTags = opportunity.capabilityTags.filter((tag) =>
    tagMatchesText(tag, capabilityValues),
  );

  const reasons = [
    ...(age.status === "eligible" && age.reason ? [age.reason] : []),
    ...(geography.status === "eligible" && geography.reason
      ? [geography.reason]
      : []),
  ];
  const readinessGaps = [
    ...(age.status === "check" ? [age.gap] : []),
    ...(geography.status === "check" ? [geography.gap] : []),
  ];

  if (matchedPathwayTags.length > 0) {
    reasons.unshift(
      `Your selected path relates to ${matchedPathwayTags.join(", ")}.`,
    );
  }
  if (matchedCapabilityTags.length > 0) {
    reasons.unshift(
      `Your Living Builder Profile already shows evidence related to ${matchedCapabilityTags.join(", ")}.`,
    );
  }

  const missingCapabilities = opportunity.capabilityTags.filter(
    (tag) => !matchedCapabilityTags.includes(tag),
  );
  if (missingCapabilities.length > 0) {
    readinessGaps.push(
      `Evidence that could strengthen readiness: ${missingCapabilities.join(", ")}.`,
    );
  }

  const hasEligibilityCheck =
    age.status === "check" || geography.status === "check";
  const hasDevelopmentMatch =
    matchedPathwayTags.length > 0 || matchedCapabilityTags.length > 0;

  return {
    opportunity,
    tier: hasEligibilityCheck
      ? "eligibility_check"
      : hasDevelopmentMatch
        ? "strong_match"
        : "possible_match",
    reasons:
      reasons.length > 0
        ? reasons
        : ["This is an active vetted opportunity you can evaluate."],
    readinessGaps,
    matchedPathwayTags,
    matchedCapabilityTags,
  };
}

const tierOrder: Record<OpportunityMatchTier, number> = {
  strong_match: 0,
  possible_match: 1,
  eligibility_check: 2,
};

export function rankOpportunityMatches(matches: OpportunityMatch[]) {
  return [...matches].sort((left, right) => {
    const tierDifference = tierOrder[left.tier] - tierOrder[right.tier];
    if (tierDifference !== 0) return tierDifference;

    const leftDeadline = left.opportunity.deadlineDate ?? "9999-12-31";
    const rightDeadline = right.opportunity.deadlineDate ?? "9999-12-31";
    return leftDeadline.localeCompare(rightDeadline);
  });
}
