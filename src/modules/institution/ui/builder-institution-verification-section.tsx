import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import {
  closeInstitutionVerificationAction,
  requestInstitutionVerificationAction,
} from "../application/institution-actions";
import {
  institutionTrustCopy,
  institutionVerificationStatusLabel,
} from "../domain/institution-contract";
import { getBuilderInstitutionVerificationWorkspace } from "../infrastructure/institution-dal";

export async function BuilderInstitutionVerificationSection() {
  const workspace = await getBuilderInstitutionVerificationWorkspace();

  return (
    <section className="mt-12" aria-labelledby="institution-verification-heading">
      <p className="text-gold text-xs font-semibold tracking-wide uppercase">
        Institution verification
      </p>
      <h2
        id="institution-verification-heading"
        className="mt-3 text-3xl font-semibold tracking-tight"
      >
        Share one exact capability when institutional confirmation matters.
      </h2>
      <p className="text-muted mt-3 max-w-3xl leading-7">
        {institutionTrustCopy.aggregate} {institutionTrustCopy.share}
      </p>

      {!workspace.connected ? (
        <Surface className="mt-5 p-6">
          <h3 className="text-lg font-semibold">No active Institution Workspace.</h3>
          <p className="text-muted mt-2 leading-7">
            Institution verification appears only after you voluntarily join an
            active school-development cohort and that institution has a verified
            PipuPath workspace. Your existing verification history remains below.
          </p>
        </Surface>
      ) : (
        <>
          <Surface className="border-gold/25 bg-gold/5 mt-5 p-6">
            <p className="text-gold text-xs font-semibold uppercase">
              Connected institution
            </p>
            <h3 className="mt-2 text-xl font-semibold">
              {workspace.organisationName}
            </h3>
            <p className="text-muted mt-2 text-sm leading-6">
              Sending a request shares only the capability and evidence summary
              shown on that card. It does not open your profile, reflections,
              contacts or other capabilities to the institution.
            </p>
          </Surface>

          {workspace.eligibleEvidence.length === 0 ? (
            <Surface className="mt-5 p-6">
              <p className="text-muted leading-7">
                There is no new evidence available for institutional verification
                right now. Refresh your Living Builder Profile after completing
                more evidence-backed work.
              </p>
            </Surface>
          ) : (
            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              {workspace.eligibleEvidence.map((item) => (
                <Surface key={item.evidenceId} className="p-6">
                  <p className="text-gold text-xs font-semibold uppercase">
                    {item.capabilityLabel} · {item.capabilityLevel.replaceAll("_", " ")}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold">{item.sourceTitle}</h3>
                  <p className="text-muted mt-2 text-sm leading-6">
                    {item.sourceSummary}
                  </p>
                  <p className="text-muted mt-3 text-xs uppercase">
                    Evidence source: {item.sourceType}
                  </p>
                  <form action={requestInstitutionVerificationAction} className="mt-5">
                    <input type="hidden" name="claimId" value={item.claimId} />
                    <input type="hidden" name="evidenceId" value={item.evidenceId} />
                    <label
                      htmlFor={`institution-request-${item.evidenceId}`}
                      className="text-sm font-semibold"
                    >
                      Optional context for the institution
                    </label>
                    <textarea
                      id={`institution-request-${item.evidenceId}`}
                      name="requestNote"
                      rows={2}
                      maxLength={400}
                      placeholder="What should the institution verify from this evidence?"
                      className="border-border bg-background text-foreground mt-2 w-full rounded-xl border px-3 py-2 text-sm"
                    />
                    <Button type="submit" className="mt-3">
                      Share this evidence for verification
                    </Button>
                  </form>
                </Surface>
              ))}
            </div>
          )}
        </>
      )}

      <div className="mt-8">
        <h3 className="text-xl font-semibold">Institution verification history</h3>
        {workspace.history.length === 0 ? (
          <Surface className="mt-4 p-6">
            <p className="text-muted">No institution verification request yet.</p>
          </Surface>
        ) : (
          <div className="mt-4 space-y-4">
            {workspace.history.map((item) => (
              <Surface key={item.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-gold text-xs font-semibold uppercase">
                      {institutionVerificationStatusLabel(item.status)}
                    </p>
                    <h4 className="mt-1 text-lg font-semibold">
                      {item.capabilityLabel}
                    </h4>
                    <p className="text-muted mt-1 text-sm">
                      {item.organisationName} · {item.sourceTitle}
                    </p>
                  </div>
                  {item.status === "pending" ? (
                    <form action={closeInstitutionVerificationAction}>
                      <input type="hidden" name="verificationId" value={item.id} />
                      <Button
                        type="submit"
                        name="action"
                        value="withdraw"
                        variant="ghost"
                      >
                        Withdraw request
                      </Button>
                    </form>
                  ) : item.status === "confirmed" ? (
                    <form action={closeInstitutionVerificationAction}>
                      <input type="hidden" name="verificationId" value={item.id} />
                      <Button
                        type="submit"
                        name="action"
                        value="revoke"
                        variant="ghost"
                      >
                        Revoke this verification
                      </Button>
                    </form>
                  ) : null}
                </div>
                <p className="text-muted mt-3 text-sm leading-6">
                  {item.sourceSummary}
                </p>
                {item.responseNote ? (
                  <p className="border-border mt-3 rounded-xl border p-3 text-sm">
                    Institution context: {item.responseNote}
                  </p>
                ) : null}
              </Surface>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
