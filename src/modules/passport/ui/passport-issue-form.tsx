"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import {
  issuePassportAction,
  type PassportIssueActionState,
} from "../application/passport-actions";
import type { BuilderPassportWorkspace } from "../infrastructure/passport-dal";

const initialState: PassportIssueActionState = { error: null };

export function PassportIssueForm({
  workspace,
}: {
  workspace: BuilderPassportWorkspace;
}) {
  const [state, action, pending] = useActionState(issuePassportAction, initialState);
  const [publicSummary, setPublicSummary] = useState("");
  const [selectedPathName, setSelectedPathName] = useState("");
  const [claimIds, setClaimIds] = useState<string[]>([]);
  const [evidenceIds, setEvidenceIds] = useState<string[]>([]);
  const [institutionIds, setInstitutionIds] = useState<string[]>([]);
  const [portfolioIds, setPortfolioIds] = useState<string[]>([]);
  const [consented, setConsented] = useState(false);

  const currentPassport = workspace.passports.find(
    (passport) => passport.status === "issued",
  );

  const selectedCapabilities = useMemo(
    () =>
      workspace.eligibleCapabilities.filter((item) =>
        claimIds.includes(item.claimId),
      ),
    [claimIds, workspace.eligibleCapabilities],
  );
  const selectedEvidence = useMemo(
    () =>
      workspace.eligibleEvidence.filter((item) =>
        evidenceIds.includes(item.evidenceId),
      ),
    [evidenceIds, workspace.eligibleEvidence],
  );
  const selectedInstitutions = useMemo(
    () =>
      workspace.eligibleInstitutionVerifications.filter((item) =>
        institutionIds.includes(item.verificationId),
      ),
    [institutionIds, workspace.eligibleInstitutionVerifications],
  );
  const selectedPortfolios = useMemo(
    () =>
      workspace.eligiblePortfolioProofs.filter((item) =>
        portfolioIds.includes(item.portfolioId),
      ),
    [portfolioIds, workspace.eligiblePortfolioProofs],
  );

  const hasSupportingProof =
    evidenceIds.length > 0 || institutionIds.length > 0 || portfolioIds.length > 0;
  const ready =
    workspace.adultEligible &&
    claimIds.length > 0 &&
    hasSupportingProof &&
    consented;

  function toggleClaim(claimId: string, checked: boolean) {
    setClaimIds((current) =>
      checked ? [...current, claimId] : current.filter((id) => id !== claimId),
    );
    if (!checked) {
      setEvidenceIds((current) =>
        current.filter((evidenceId) => {
          const evidence = workspace.eligibleEvidence.find(
            (item) => item.evidenceId === evidenceId,
          );
          return evidence?.claimId !== claimId;
        }),
      );
      setInstitutionIds((current) =>
        current.filter((verificationId) => {
          const verification = workspace.eligibleInstitutionVerifications.find(
            (item) => item.verificationId === verificationId,
          );
          return verification?.claimId !== claimId;
        }),
      );
    }
  }

  return (
    <form action={action} className="space-y-10">
      <input
        name="consentPolicyVersion"
        type="hidden"
        value={consented ? "builder-passport-v1" : ""}
      />

      {!workspace.adultEligible ? (
        <div className="rounded-2xl border p-5">
          <h2 className="font-semibold">External Passport sharing is not available.</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Stage 21 external Passport issuance is limited to eligible adults with no
            safeguarding review hold. Your private PipuPath development data remains unchanged.
          </p>
        </div>
      ) : null}

      {currentPassport ? (
        <div className="rounded-2xl border p-5">
          <p className="text-sm font-medium">You already have Passport v{currentPassport.version}.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Issuing a new version will supersede it and revoke every active share created from
            that older version.
          </p>
        </div>
      ) : null}

      <section className="space-y-5">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">
            01 · Builder-facing context
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Choose what you want to say</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            These two fields are self-described. They are not generated from private Discovery or
            Human Potential Profile prose.
          </p>
        </div>
        <label className="block space-y-2">
          <span className="text-sm font-medium">Public-safe Builder summary</span>
          <textarea
            className="min-h-28 w-full rounded-xl border bg-background px-4 py-3"
            maxLength={800}
            name="publicSummary"
            onChange={(event) => setPublicSummary(event.target.value)}
            placeholder="What should a recipient understand about how you build and contribute?"
            value={publicSummary}
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium">Selected pathway label</span>
          <input
            className="w-full rounded-xl border bg-background px-4 py-3"
            maxLength={180}
            name="selectedPathName"
            onChange={(event) => setSelectedPathName(event.target.value)}
            placeholder="Example: Systems builder"
            value={selectedPathName}
          />
        </label>
      </section>

      <section className="space-y-5 border-t pt-8">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">
            02 · Capability claims
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Select the capabilities to carry</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {workspace.eligibleCapabilities.map((capability) => (
            <label className="flex gap-3 rounded-2xl border p-4" key={capability.claimId}>
              <input
                checked={claimIds.includes(capability.claimId)}
                name="claimIds"
                onChange={(event) => toggleClaim(capability.claimId, event.target.checked)}
                type="checkbox"
                value={capability.claimId}
              />
              <span>
                <span className="block font-medium">{capability.capabilityLabel}</span>
                <span className="mt-1 block text-sm text-muted-foreground">
                  {capability.capabilityLevel.replaceAll("_", " ")}
                </span>
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-5 border-t pt-8">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">
            03 · Supporting proof
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Select exact evidence</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Evidence can be selected only after its capability claim is selected. Private PipuPath
            route links are never included in the Passport.
          </p>
        </div>
        <div className="space-y-3">
          {workspace.eligibleEvidence.map((item) => {
            const enabled = claimIds.includes(item.claimId);
            return (
              <label
                className={`flex gap-3 rounded-2xl border p-4 ${enabled ? "" : "opacity-50"}`}
                key={item.evidenceId}
              >
                <input
                  checked={evidenceIds.includes(item.evidenceId)}
                  disabled={!enabled}
                  name="evidenceIds"
                  onChange={(event) =>
                    setEvidenceIds((current) =>
                      event.target.checked
                        ? [...current, item.evidenceId]
                        : current.filter((id) => id !== item.evidenceId),
                    )
                  }
                  type="checkbox"
                  value={item.evidenceId}
                />
                <span>
                  <span className="block font-medium">{item.sourceTitle}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {item.evidenceSummary}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </section>

      {workspace.eligibleInstitutionVerifications.length > 0 ? (
        <section className="space-y-5 border-t pt-8">
          <h2 className="text-2xl font-semibold">Institution confirmations</h2>
          <div className="space-y-3">
            {workspace.eligibleInstitutionVerifications.map((item) => {
              const enabled = claimIds.includes(item.claimId);
              return (
                <label
                  className={`flex gap-3 rounded-2xl border p-4 ${enabled ? "" : "opacity-50"}`}
                  key={item.verificationId}
                >
                  <input
                    checked={institutionIds.includes(item.verificationId)}
                    disabled={!enabled}
                    name="institutionVerificationIds"
                    onChange={(event) =>
                      setInstitutionIds((current) =>
                        event.target.checked
                          ? [...current, item.verificationId]
                          : current.filter((id) => id !== item.verificationId),
                      )
                    }
                    type="checkbox"
                    value={item.verificationId}
                  />
                  <span>
                    <span className="block font-medium">{item.capabilityLabel}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      Confirmed by {item.institutionName}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </section>
      ) : null}

      {workspace.eligiblePortfolioProofs.length > 0 ? (
        <section className="space-y-5 border-t pt-8">
          <h2 className="text-2xl font-semibold">Published Portfolio proofs</h2>
          <div className="space-y-3">
            {workspace.eligiblePortfolioProofs.map((proof) => (
              <label className="flex gap-3 rounded-2xl border p-4" key={proof.portfolioId}>
                <input
                  checked={portfolioIds.includes(proof.portfolioId)}
                  name="portfolioIds"
                  onChange={(event) =>
                    setPortfolioIds((current) =>
                      event.target.checked
                        ? [...current, proof.portfolioId]
                        : current.filter((id) => id !== proof.portfolioId),
                    )
                  }
                  type="checkbox"
                  value={proof.portfolioId}
                />
                <span>
                  <span className="block font-medium">{proof.publicTitle}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {proof.publicSummary}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-5 border-t pt-8">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">
            04 · Exact Passport preview
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            {workspace.profile.displayName ?? "Builder"}
          </h2>
          {selectedPathName.trim() ? (
            <p className="mt-1 text-muted-foreground">{selectedPathName.trim()}</p>
          ) : null}
          {publicSummary.trim() ? <p className="mt-4 max-w-3xl">{publicSummary.trim()}</p> : null}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {selectedCapabilities.map((capability) => (
            <div className="rounded-2xl border p-4" key={capability.claimId}>
              <p className="font-medium">{capability.capabilityLabel}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {capability.capabilityLevel.replaceAll("_", " ")}
              </p>
            </div>
          ))}
        </div>

        {selectedEvidence.length > 0 ? (
          <div>
            <h3 className="font-medium">Evidence shared</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {selectedEvidence.map((item) => (
                <li key={item.evidenceId}>{item.sourceTitle}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {selectedInstitutions.length > 0 ? (
          <div>
            <h3 className="font-medium">Institution confirmations shared</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {selectedInstitutions.map((item) => (
                <li key={item.verificationId}>
                  {item.capabilityLabel} · {item.institutionName}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {selectedPortfolios.length > 0 ? (
          <div>
            <h3 className="font-medium">Portfolio proofs shared</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {selectedPortfolios.map((proof) => (
                <li key={proof.portfolioId}>{proof.publicTitle}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <section className="space-y-4 rounded-2xl border p-5">
        <label className="flex gap-3">
          <input
            checked={consented}
            onChange={(event) => setConsented(event.target.checked)}
            type="checkbox"
          />
          <span className="text-sm leading-6">
            I reviewed this exact Passport and consent to issue only the selected proof under
            Builder Passport policy v1. I understand that a newer Passport will supersede the
            current one and close its active shares.
          </span>
        </label>
        {!hasSupportingProof ? (
          <p className="text-sm text-muted-foreground">
            Add at least one supporting evidence item, institution confirmation, or Portfolio proof.
          </p>
        ) : null}
        {state.error ? <p className="text-sm font-medium">{state.error}</p> : null}
        <div className="flex flex-wrap gap-3">
          <button
            className="rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background disabled:opacity-40"
            disabled={!ready || pending}
            type="submit"
          >
            {pending ? "Issuing…" : currentPassport ? "Issue new Passport version" : "Issue Passport"}
          </button>
          <Link className="rounded-full border px-5 py-3 text-sm font-medium" href="/passport">
            Cancel
          </Link>
        </div>
      </section>
    </form>
  );
}
