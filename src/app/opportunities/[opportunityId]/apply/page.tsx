import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import {
  saveMarketplaceApplicationDraftAction,
  submitMarketplaceApplicationAction,
  withdrawMarketplaceApplicationAction,
} from "@/modules/opportunities/application/marketplace-actions";
import { getBuilderApplicationWorkspace } from "@/modules/opportunities/infrastructure/marketplace-dal";

export const metadata: Metadata = {
  title: "Prepare Opportunity Application",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function readable(value: string) {
  return value.replaceAll("_", " ");
}

function formatTimestamp(value: string | null) {
  if (!value) return "Not recorded";
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(new Date(value));
}

export default async function OpportunityApplyPage({
  params,
  searchParams,
}: {
  params: Promise<{ opportunityId: string }>;
  searchParams: Promise<{
    saved?: string;
    submitted?: string;
    withdrawn?: string;
    error?: string;
  }>;
}) {
  const { opportunityId } = await params;
  const query = await searchParams;

  let workspace;
  try {
    workspace = await getBuilderApplicationWorkspace(opportunityId);
  } catch {
    notFound();
  }

  const application = workspace.application;
  const editable = application === null || application.status === "draft";
  const selectedClaimIds = new Set(application?.selectedClaimIds ?? []);
  const selectedEvidenceIds = new Set(application?.selectedEvidenceIds ?? []);
  const selectedVerificationIds = new Set(
    application?.selectedInstitutionVerificationIds ?? [],
  );
  const selectedPortfolioIds = new Set(application?.selectedPortfolioIds ?? []);

  const selectedCapabilities = workspace.eligibleCapabilities.filter((item) =>
    selectedClaimIds.has(item.claimId),
  );
  const selectedEvidence = workspace.eligibleEvidence.filter((item) =>
    selectedEvidenceIds.has(item.evidenceId),
  );
  const selectedVerifications =
    workspace.eligibleInstitutionVerifications.filter((item) =>
      selectedVerificationIds.has(item.verificationId),
    );
  const selectedProofs = workspace.eligiblePortfolioProofs.filter((item) =>
    selectedPortfolioIds.has(item.portfolioId),
  );

  const hasSavedDraft = application?.status === "draft";
  const canWithdraw = Boolean(
    application &&
    ["draft", "submitted", "viewed", "shortlisted"].includes(
      application.status,
    ),
  );

  return (
    <main
      id="main-content"
      className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-gold text-xs font-semibold tracking-wide uppercase">
            Builder-controlled application
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            {workspace.opportunity.title}
          </h1>
          <p className="text-muted mt-2 text-lg">
            {workspace.provider.organisationName}
          </p>
        </div>
        <ButtonLink href={`/opportunities/${opportunityId}`} variant="ghost">
          Back to opportunity
        </ButtonLink>
      </div>

      {query.saved === "1" ? (
        <Surface className="mt-6 border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-900">
            Draft saved. Review the exact packet below before submitting.
          </p>
        </Surface>
      ) : null}
      {query.submitted === "1" ? (
        <Surface className="mt-6 border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-900">
            Application submitted to this provider.
          </p>
        </Surface>
      ) : null}
      {query.withdrawn === "1" ? (
        <Surface className="mt-6 border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-900">
            Application withdrawn. Provider workflow changes are now closed.
          </p>
        </Surface>
      ) : null}
      {query.error ? (
        <Surface className="mt-6 border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-900">
            The application action was rejected. Check the current opportunity,
            provider and evidence state before trying again.
          </p>
        </Surface>
      ) : null}

      <Surface className="border-gold/25 bg-gold/5 mt-8 p-6 sm:p-8">
        <h2 className="text-xl font-semibold">What the provider can receive</h2>
        <p className="text-muted mt-3 max-w-4xl leading-7">
          Only the fields selected into this application packet are shared.
          Discovery answers, Human Potential Profile prose, private reflections,
          private Project fields, contacts, network state, safeguarding fields
          and unrelated capabilities remain outside the provider boundary.
        </p>
      </Surface>

      {application && application.status !== "draft" ? (
        <Surface className="mt-8 p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-gold text-xs font-semibold uppercase">
                Submitted application
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                Status: {readable(application.status)}
              </h2>
            </div>
            <span className="border-border rounded-full border px-3 py-1.5 text-xs font-semibold">
              {readable(application.status)}
            </span>
          </div>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="border-border rounded-2xl border p-4">
              <dt className="text-muted text-xs font-semibold uppercase">
                Submitted
              </dt>
              <dd className="mt-2 text-sm">
                {formatTimestamp(application.submittedAt)}
              </dd>
            </div>
            <div className="border-border rounded-2xl border p-4">
              <dt className="text-muted text-xs font-semibold uppercase">
                Provider viewed
              </dt>
              <dd className="mt-2 text-sm">
                {formatTimestamp(application.viewedAt)}
              </dd>
            </div>
            <div className="border-border rounded-2xl border p-4">
              <dt className="text-muted text-xs font-semibold uppercase">
                Decision time
              </dt>
              <dd className="mt-2 text-sm">
                {formatTimestamp(application.decidedAt)}
              </dd>
            </div>
            <div className="border-border rounded-2xl border p-4">
              <dt className="text-muted text-xs font-semibold uppercase">
                Consent policy
              </dt>
              <dd className="mt-2 text-sm">
                {application.consentPolicyVersion ?? "Not recorded"}
              </dd>
            </div>
          </dl>
          <p className="text-muted mt-5 text-sm leading-6">
            The submitted packet is immutable. Provider decisions do not alter
            your Living Builder Profile, capability evidence or Human Potential
            Profile.
          </p>
          {canWithdraw ? (
            <form
              action={withdrawMarketplaceApplicationAction}
              className="border-border mt-5 border-t pt-5"
            >
              <input type="hidden" name="opportunityId" value={opportunityId} />
              <input
                type="hidden"
                name="applicationId"
                value={application.id}
              />
              <Button type="submit" variant="ghost">
                Withdraw application
              </Button>
            </form>
          ) : null}
        </Surface>
      ) : null}

      {editable ? (
        <form
          action={saveMarketplaceApplicationDraftAction}
          className="mt-8 space-y-6"
        >
          <input type="hidden" name="opportunityId" value={opportunityId} />

          <Surface className="p-6 sm:p-8">
            <h2 className="text-2xl font-semibold">
              1. Your application context
            </h2>
            <p className="text-muted mt-2 leading-7">
              Write only what you want this provider to receive. Saving a draft
              does not submit anything.
            </p>
            <div className="mt-5 grid gap-4">
              <label className="text-sm font-semibold">
                Public-safe Builder summary
                <textarea
                  name="builderSummary"
                  rows={4}
                  minLength={20}
                  maxLength={800}
                  defaultValue={application?.builderSummary ?? ""}
                  placeholder="What do you build, and what kind of problems have you practiced solving?"
                  className="border-border bg-background mt-2 w-full rounded-xl border px-3 py-2"
                />
              </label>
              <label className="text-sm font-semibold">
                Selected pathway
                <input
                  name="selectedPathName"
                  minLength={2}
                  maxLength={180}
                  defaultValue={application?.selectedPathName ?? ""}
                  placeholder="Your current pathway, if you want to share it"
                  className="border-border bg-background mt-2 min-h-11 w-full rounded-xl border px-3 py-2"
                />
              </label>
              <label className="text-sm font-semibold">
                Application note
                <textarea
                  name="applicationNote"
                  rows={5}
                  maxLength={2000}
                  defaultValue={application?.applicationNote ?? ""}
                  placeholder="Why do you want this opportunity, and what do you hope to contribute or learn?"
                  className="border-border bg-background mt-2 w-full rounded-xl border px-3 py-2"
                />
              </label>
            </div>
          </Surface>

          <Surface className="p-6 sm:p-8">
            <h2 className="text-2xl font-semibold">
              2. Select capability claims
            </h2>
            <p className="text-muted mt-2 leading-7">
              Select only capabilities relevant to this application. Evidence
              can be shared only when its capability claim is also selected.
            </p>
            {workspace.eligibleCapabilities.length ? (
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {workspace.eligibleCapabilities.map((capability) => (
                  <label
                    key={capability.claimId}
                    className="border-border flex items-start gap-3 rounded-2xl border p-4"
                  >
                    <input
                      type="checkbox"
                      name="claimIds"
                      value={capability.claimId}
                      defaultChecked={selectedClaimIds.has(capability.claimId)}
                      className="mt-1 size-4"
                    />
                    <span>
                      <span className="block font-semibold">
                        {capability.capabilityLabel}
                      </span>
                      <span className="text-muted mt-1 block text-sm">
                        {readable(capability.capabilityLevel)}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-muted mt-4 text-sm">
                No active Living Builder Profile capability claim is currently
                available to share.
              </p>
            )}
          </Surface>

          <Surface className="p-6 sm:p-8">
            <h2 className="text-2xl font-semibold">
              3. Select supporting evidence
            </h2>
            <p className="text-muted mt-2 leading-7">
              Each selected evidence item must belong to a capability you
              selected above. PipuPath enforces that relationship again in the
              database.
            </p>
            {workspace.eligibleEvidence.length ? (
              <div className="mt-5 space-y-3">
                {workspace.eligibleEvidence.map((evidence) => (
                  <label
                    key={evidence.evidenceId}
                    className="border-border flex items-start gap-3 rounded-2xl border p-4"
                  >
                    <input
                      type="checkbox"
                      name="evidenceIds"
                      value={evidence.evidenceId}
                      defaultChecked={selectedEvidenceIds.has(
                        evidence.evidenceId,
                      )}
                      className="mt-1 size-4"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">
                        {evidence.sourceTitle}
                      </span>
                      <span className="text-muted mt-1 block text-sm leading-6">
                        {evidence.evidenceSummary}
                      </span>
                      <Link
                        href={evidence.sourceHref}
                        className="text-gold mt-2 inline-block text-sm font-semibold"
                      >
                        Review evidence
                      </Link>
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-muted mt-4 text-sm">
                No eligible capability evidence is currently available.
              </p>
            )}
          </Surface>

          <div className="grid gap-6 lg:grid-cols-2">
            <Surface className="p-6">
              <h2 className="text-xl font-semibold">
                4. Institution confirmations
              </h2>
              <p className="text-muted mt-2 text-sm leading-6">
                Optional. Only confirmed, non-revoked institution verification
                records can be selected.
              </p>
              {workspace.eligibleInstitutionVerifications.length ? (
                <div className="mt-4 space-y-3">
                  {workspace.eligibleInstitutionVerifications.map(
                    (verification) => (
                      <label
                        key={verification.verificationId}
                        className="border-border flex items-start gap-3 rounded-xl border p-3"
                      >
                        <input
                          type="checkbox"
                          name="institutionVerificationIds"
                          value={verification.verificationId}
                          defaultChecked={selectedVerificationIds.has(
                            verification.verificationId,
                          )}
                          className="mt-1 size-4"
                        />
                        <span className="text-sm">
                          <span className="block font-semibold">
                            {verification.capabilityLabel}
                          </span>
                          <span className="text-muted mt-1 block">
                            {verification.institutionName}
                          </span>
                        </span>
                      </label>
                    ),
                  )}
                </div>
              ) : (
                <p className="text-muted mt-4 text-sm">None available.</p>
              )}
            </Surface>

            <Surface className="p-6">
              <h2 className="text-xl font-semibold">
                5. Published Portfolio proof
              </h2>
              <p className="text-muted mt-2 text-sm leading-6">
                Optional. Only proof you already chose to publish can enter this
                packet.
              </p>
              {workspace.eligiblePortfolioProofs.length ? (
                <div className="mt-4 space-y-3">
                  {workspace.eligiblePortfolioProofs.map((proof) => (
                    <label
                      key={proof.portfolioId}
                      className="border-border flex items-start gap-3 rounded-xl border p-3"
                    >
                      <input
                        type="checkbox"
                        name="portfolioIds"
                        value={proof.portfolioId}
                        defaultChecked={selectedPortfolioIds.has(
                          proof.portfolioId,
                        )}
                        className="mt-1 size-4"
                      />
                      <span className="text-sm">
                        <span className="block font-semibold">
                          {proof.publicTitle}
                        </span>
                        <span className="text-muted mt-1 block leading-6">
                          {proof.publicSummary}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-muted mt-4 text-sm">None available.</p>
              )}
            </Surface>
          </div>

          <Surface className="border-primary/20 bg-primary-soft p-6">
            <h2 className="text-xl font-semibold">Save before submission</h2>
            <p className="text-muted mt-2 text-sm leading-6">
              Saving only updates your private draft. It does not give the
              provider access. After saving, the exact selected packet appears
              below for your final review.
            </p>
            <Button type="submit" className="mt-4">
              Save private application draft
            </Button>
          </Surface>
        </form>
      ) : null}

      {hasSavedDraft ? (
        <Surface className="border-gold/30 mt-8 p-6 sm:p-8">
          <p className="text-gold text-xs font-semibold tracking-wide uppercase">
            Exact packet preview
          </p>
          <h2 className="mt-3 text-3xl font-semibold">
            Review exactly what will be shared
          </h2>
          <p className="text-muted mt-3 max-w-4xl leading-7">
            Nothing outside this preview is submitted to the provider. If the
            packet is wrong, edit the draft above and save again before
            consenting.
          </p>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <div className="border-border rounded-2xl border p-5">
              <p className="text-muted text-xs font-semibold uppercase">
                Identity
              </p>
              <p className="mt-2 font-semibold">{application.displayName}</p>
              {application.builderSummary ? (
                <p className="text-muted mt-2 text-sm leading-6">
                  {application.builderSummary}
                </p>
              ) : null}
              {application.selectedPathName ? (
                <p className="text-muted mt-2 text-sm">
                  Path: {application.selectedPathName}
                </p>
              ) : null}
            </div>
            <div className="border-border rounded-2xl border p-5">
              <p className="text-muted text-xs font-semibold uppercase">
                Application note
              </p>
              <p className="mt-2 text-sm leading-6 whitespace-pre-wrap">
                {application.applicationNote || "No application note selected."}
              </p>
            </div>
            <div className="border-border rounded-2xl border p-5">
              <p className="font-semibold">
                Capabilities ({selectedCapabilities.length})
              </p>
              <ul className="text-muted mt-3 space-y-2 text-sm">
                {selectedCapabilities.map((item) => (
                  <li key={item.claimId}>
                    • {item.capabilityLabel} · {readable(item.capabilityLevel)}
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-border rounded-2xl border p-5">
              <p className="font-semibold">
                Evidence ({selectedEvidence.length})
              </p>
              <ul className="text-muted mt-3 space-y-3 text-sm">
                {selectedEvidence.map((item) => (
                  <li key={item.evidenceId}>
                    <span className="text-foreground font-semibold">
                      {item.sourceTitle}
                    </span>
                    <span className="mt-1 block leading-6">
                      {item.evidenceSummary}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-border rounded-2xl border p-5">
              <p className="font-semibold">
                Institution confirmations ({selectedVerifications.length})
              </p>
              <ul className="text-muted mt-3 space-y-2 text-sm">
                {selectedVerifications.map((item) => (
                  <li key={item.verificationId}>
                    • {item.capabilityLabel} · {item.institutionName}
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-border rounded-2xl border p-5">
              <p className="font-semibold">
                Published proof ({selectedProofs.length})
              </p>
              <ul className="text-muted mt-3 space-y-2 text-sm">
                {selectedProofs.map((item) => (
                  <li key={item.portfolioId}>• {item.publicTitle}</li>
                ))}
              </ul>
            </div>
          </div>

          <form
            action={submitMarketplaceApplicationAction}
            className="border-border mt-6 border-t pt-6"
          >
            <input type="hidden" name="opportunityId" value={opportunityId} />
            <input type="hidden" name="applicationId" value={application.id} />
            <label className="flex max-w-3xl items-start gap-3 text-sm leading-6">
              <input
                type="checkbox"
                name="consent"
                value="yes"
                required
                className="mt-1 size-4"
              />
              <span>
                I reviewed this exact packet and consent to share only these
                selected fields with {workspace.provider.organisationName} for
                this opportunity.
              </span>
            </label>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button type="submit">Submit exact packet</Button>
            </div>
          </form>
        </Surface>
      ) : null}

      {application?.status === "draft" && canWithdraw ? (
        <form
          action={withdrawMarketplaceApplicationAction}
          className="mt-5 text-center"
        >
          <input type="hidden" name="opportunityId" value={opportunityId} />
          <input type="hidden" name="applicationId" value={application.id} />
          <Button type="submit" variant="ghost">
            Delete this application path by withdrawing
          </Button>
        </form>
      ) : null}
    </main>
  );
}
