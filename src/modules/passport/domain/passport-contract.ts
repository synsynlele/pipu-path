import { z } from "zod";

const optionalPublicText = (maximum: number) =>
  z
    .string()
    .trim()
    .max(maximum)
    .refine((value) => value.length === 0 || value.length >= 3, {
      message: "Add a little more context or leave this blank.",
    });

const uniqueUuidList = (maximum: number) =>
  z
    .array(z.uuid())
    .max(maximum)
    .refine((values) => new Set(values).size === values.length, {
      message: "Choose each item only once.",
    });

export const builderPassportStatusSchema = z.enum([
  "issued",
  "superseded",
  "revoked",
]);

export const builderPassportIntegrityStateSchema = z.enum([
  "current",
  "changed",
]);

export const builderPassportIssueSchema = z
  .object({
    publicSummary: optionalPublicText(800),
    selectedPathName: optionalPublicText(180),
    claimIds: uniqueUuidList(12).min(1),
    evidenceIds: uniqueUuidList(20),
    institutionVerificationIds: uniqueUuidList(12),
    portfolioIds: uniqueUuidList(8),
    consentPolicyVersion: z.literal("builder-passport-v1"),
  })
  .superRefine((value, context) => {
    if (
      value.evidenceIds.length === 0 &&
      value.institutionVerificationIds.length === 0 &&
      value.portfolioIds.length === 0
    ) {
      context.addIssue({
        code: "custom",
        path: ["evidenceIds"],
        message:
          "Include supporting evidence, an institution confirmation, or a public Portfolio proof.",
      });
    }
  });

export const builderPassportRevokeSchema = z.object({
  passportId: z.uuid(),
});

export const builderPassportShareCreateSchema = z.object({
  passportId: z.uuid(),
  label: optionalPublicText(80),
  expiresInDays: z.union([
    z.literal(1),
    z.literal(7),
    z.literal(30),
    z.literal(90),
  ]),
});

export const builderPassportShareRevokeSchema = z.object({
  shareId: z.uuid(),
});

export const builderPassportShareSecretSchema = z
  .string()
  .regex(/^ppsp_[A-Za-z0-9_-]{43}$/);

export const builderPassportCapabilitySchema = z.object({
  capabilityKey: z.string().trim().min(2).max(120),
  capabilityLabel: z.string().trim().min(2).max(120),
  capabilityLevel: z.string().trim().min(2).max(40),
});

export const builderPassportEvidenceSchema = z.object({
  capabilityKey: z.string().trim().min(2).max(120),
  sourceType: z.string().trim().min(2).max(60),
  sourceTitle: z.string().trim().min(2).max(160),
  evidenceSummary: z.string().trim().min(10).max(400),
  verification: z.string().trim().min(2).max(60),
  occurredAt: z.iso.datetime(),
});

export const builderPassportInstitutionVerificationSchema = z.object({
  capabilityKey: z.string().trim().min(2).max(120),
  capabilityLabel: z.string().trim().min(2).max(120),
  institutionName: z.string().trim().min(2).max(180),
  confirmedAt: z.iso.datetime(),
  current: z.boolean(),
});

export const builderPassportPortfolioProofSchema = z.object({
  slug: z.string().trim().min(3).max(120),
  publicTitle: z.string().trim().min(3).max(180),
  publicSummary: z.string().trim().min(20).max(600),
  proofHref: z.string().regex(/^\/proof\//),
  current: z.boolean(),
});

export const publicBuilderPassportSchema = z.object({
  schemaVersion: z.literal("builder-passport.v1"),
  passportId: z.uuid(),
  version: z.number().int().positive(),
  issuedAt: z.iso.datetime(),
  builder: z.object({
    displayName: z.string().trim().min(2).max(120),
    publicSummary: z.string().trim().max(800).nullable(),
    selectedPathName: z.string().trim().max(180).nullable(),
  }),
  capabilities: z.array(builderPassportCapabilitySchema).max(12),
  evidence: z.array(builderPassportEvidenceSchema).max(20),
  institutionVerifications: z
    .array(builderPassportInstitutionVerificationSchema)
    .max(12),
  portfolioProofs: z.array(builderPassportPortfolioProofSchema).max(8),
  integrity: z.object({
    state: builderPassportIntegrityStateSchema,
    checkedAt: z.iso.datetime(),
    notices: z.array(z.string().trim().min(3).max(240)).max(20),
  }),
  share: z.object({
    expiresAt: z.iso.datetime(),
  }),
});

export type BuilderPassportIssueInput = z.infer<
  typeof builderPassportIssueSchema
>;
export type BuilderPassportStatus = z.infer<typeof builderPassportStatusSchema>;
export type BuilderPassportIntegrityState = z.infer<
  typeof builderPassportIntegrityStateSchema
>;
export type PublicBuilderPassport = z.infer<typeof publicBuilderPassportSchema>;

export const builderPassportTrustCopy = {
  portability: "Builder-controlled proof portability",
  snapshot:
    "This Passport is an issued snapshot of evidence the Builder deliberately selected.",
  integrity:
    "PipuPath checks revocable institution confirmations and Portfolio proofs again when a share is opened.",
  boundary:
    "A Builder Passport is not government identity, an academic credential, employment verification or a public Builder directory.",
} as const;
