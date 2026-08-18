import type { Metadata } from "next";
import Link from "next/link";
import { Button, ButtonLink } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import {
  closeCapabilityVerificationAction,
  requestCapabilityVerificationAction,
  respondCapabilityVerificationAction,
} from "@/modules/capability-verification/application/capability-verification-actions";
import {
  capabilityVerificationStatusLabel,
  capabilityVerificationTrustCopy,
} from "@/modules/capability-verification/domain/capability-verification-contract";
import { getCapabilityVerificationWorkspace } from "@/modules/capability-verification/infrastructure/capability-verification-dal";

export const metadata: Metadata = {
  title: "Capability Verification",
  robots: { index: false, follow: false },
};

function personLabel(displayName: string | null, username: string | null) {
  if (displayName) return displayName;
  if (username) return `@${username}`;
  return "Your collaborator";
}

export default async function CapabilityVerificationPage() {
  const workspace = await getCapabilityVerificationWorkspace();

  return (
    <main id="main-content" className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-16">
      <section className="border-gold/20 bg-panel rounded-[2rem] border px-6 py-10 sm:px-10 sm:py-14">
        <p className="text-gold font-mono text-xs tracking-[0.2em] uppercase">Capability Verification</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl">
          Turn shared work into credible human confirmation.
        </h1>
        <p className="text-muted mt-5 max-w-3xl text-lg leading-8">
          PipuPath can prove that evidence exists. A collaborator can confirm only what they personally observed in the exact completed collaboration you shared.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <ButtonLink href="/profile" variant="secondary">Back to Living Profile</ButtonLink>
          <ButtonLink href="/connect/collaborations" variant="ghost">View collaborations</ButtonLink>
        </div>
      </section>

      <Surface className="border-gold/30 bg-gold/5 mt-8 p-6 sm:p-8">
        <p className="text-gold text-xs font-semibold tracking-wide uppercase">Trust model</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <h2 className="text-lg font-semibold">{capabilityVerificationTrustCopy.systemEvidence}</h2>
            <p className="text-muted mt-2 leading-7">Your Living Builder Profile already records completed action evidence and its source.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold">{capabilityVerificationTrustCopy.humanConfirmation}</h2>
            <p className="text-muted mt-2 leading-7">{capabilityVerificationTrustCopy.boundary}</p>
          </div>
        </div>
        <p className="text-muted mt-4 text-sm leading-6">No stars, endorsements, popularity counts or paid verification. Nothing here becomes public automatically.</p>
      </Surface>

      <section className="mt-10" aria-labelledby="verified-heading">
        <p className="text-gold text-xs font-semibold tracking-wide uppercase">Confirmed capabilities</p>
        <h2 id="verified-heading" className="mt-3 text-3xl font-semibold tracking-tight">Human confirmation you have actually earned.</h2>
        {workspace.verifiedCapabilities.length === 0 ? (
          <Surface className="mt-5 p-6"><p className="text-muted leading-7">No collaborator-confirmed capability yet. Complete collaborative work first, then request confirmation from the person who built with you.</p></Surface>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {workspace.verifiedCapabilities.map((item) => (
              <Surface key={item.capabilityKey} className="p-5">
                <p className="text-gold text-xs font-semibold uppercase">Collaborator confirmed</p>
                <h3 className="mt-2 text-xl font-semibold">{item.capabilityLabel}</h3>
                <p className="text-muted mt-2 text-sm">{item.confirmedCount} evidence-bound confirmation{item.confirmedCount === 1 ? "" : "s"}</p>
              </Surface>
            ))}
          </div>
        )}
      </section>

      <section className="mt-12" aria-labelledby="request-heading">
        <p className="text-gold text-xs font-semibold tracking-wide uppercase">Request verification</p>
        <h2 id="request-heading" className="mt-3 text-3xl font-semibold tracking-tight">Only completed collaboration evidence is eligible.</h2>
        {workspace.eligibleEvidence.length === 0 ? (
          <Surface className="mt-5 p-6">
            <p className="text-muted leading-7">There is no eligible unverified collaboration evidence right now. Finish a structured collaboration, refresh your Living Builder Profile, and return here.</p>
            <ButtonLink href="/connect/collaborations" className="mt-4">Open collaborations</ButtonLink>
          </Surface>
        ) : (
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            {workspace.eligibleEvidence.map((item) => (
              <Surface key={item.evidenceId} className="p-6">
                <p className="text-gold text-xs font-semibold uppercase">{item.capabilityLabel}</p>
                <h3 className="mt-2 text-xl font-semibold">{item.sourceTitle}</h3>
                <p className="text-muted mt-2 text-sm leading-6">{item.sourceSummary}</p>
                <p className="mt-4 text-sm">Ask <strong>{personLabel(item.verifierDisplayName, item.verifierUsername)}</strong> to confirm this capability from the work you completed together.</p>
                <form action={requestCapabilityVerificationAction} className="mt-5">
                  <input type="hidden" name="claimId" value={item.claimId} />
                  <input type="hidden" name="evidenceId" value={item.evidenceId} />
                  <label htmlFor={`request-${item.evidenceId}`} className="text-sm font-semibold">Optional context</label>
                  <textarea id={`request-${item.evidenceId}`} name="requestNote" rows={2} maxLength={400} placeholder="What should your collaborator confirm from this work?" className="border-border bg-background text-foreground mt-2 w-full rounded-xl border px-3 py-2 text-sm" />
                  <Button type="submit" className="mt-3">Request confirmation</Button>
                </form>
              </Surface>
            ))}
          </div>
        )}
      </section>

      <section className="mt-12" aria-labelledby="incoming-heading">
        <p className="text-gold text-xs font-semibold tracking-wide uppercase">Requests for you</p>
        <h2 id="incoming-heading" className="mt-3 text-3xl font-semibold tracking-tight">Confirm only what you personally observed.</h2>
        {workspace.incoming.length === 0 ? (
          <Surface className="mt-5 p-6"><p className="text-muted">No verification requests are waiting for you.</p></Surface>
        ) : (
          <div className="mt-5 space-y-4">
            {workspace.incoming.map((item) => (
              <Surface key={item.id} className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-gold text-xs font-semibold uppercase">{capabilityVerificationStatusLabel(item.status)}</p>
                    <h3 className="mt-2 text-xl font-semibold">{item.capabilityLabel}</h3>
                    <p className="text-muted mt-1 text-sm">Requested by {personLabel(item.builderDisplayName, item.builderUsername)} · {item.sourceTitle}</p>
                  </div>
                  <Link href="/connect/collaborations" className="text-gold text-sm font-semibold">Review shared work</Link>
                </div>
                <p className="text-muted mt-4 leading-7">{item.sourceSummary}</p>
                {item.requestNote ? <p className="border-border mt-4 rounded-xl border p-3 text-sm">Builder context: {item.requestNote}</p> : null}
                {item.actionable ? (
                  <form action={respondCapabilityVerificationAction} className="mt-5">
                    <input type="hidden" name="verificationId" value={item.id} />
                    <label htmlFor={`response-${item.id}`} className="text-sm font-semibold">Optional response context</label>
                    <textarea id={`response-${item.id}`} name="responseNote" rows={2} maxLength={600} placeholder="Add only what you directly observed." className="border-border bg-background text-foreground mt-2 w-full rounded-xl border px-3 py-2 text-sm" />
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button type="submit" name="action" value="confirm">Confirm capability</Button>
                      <Button type="submit" name="action" value="decline" variant="secondary">Decline</Button>
                    </div>
                  </form>
                ) : item.status === "confirmed" ? (
                  <form action={closeCapabilityVerificationAction} className="mt-4">
                    <input type="hidden" name="verificationId" value={item.id} />
                    <Button type="submit" name="action" value="revoke" variant="ghost">Revoke my confirmation</Button>
                  </form>
                ) : null}
              </Surface>
            ))}
          </div>
        )}
      </section>

      <section className="mt-12" aria-labelledby="history-heading">
        <p className="text-gold text-xs font-semibold tracking-wide uppercase">Your requests</p>
        <h2 id="history-heading" className="mt-3 text-3xl font-semibold tracking-tight">Verification history stays traceable.</h2>
        {workspace.outgoing.length === 0 ? (
          <Surface className="mt-5 p-6"><p className="text-muted">You have not requested any capability verification yet.</p></Surface>
        ) : (
          <div className="mt-5 space-y-4">
            {workspace.outgoing.map((item) => (
              <Surface key={item.id} className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-gold text-xs font-semibold uppercase">{capabilityVerificationStatusLabel(item.status)}</p>
                    <h3 className="mt-1 text-lg font-semibold">{item.capabilityLabel}</h3>
                    <p className="text-muted mt-1 text-sm">{item.sourceTitle} · {personLabel(item.verifierDisplayName, item.verifierUsername)}</p>
                  </div>
                  {item.status === "pending" ? (
                    <form action={closeCapabilityVerificationAction}>
                      <input type="hidden" name="verificationId" value={item.id} />
                      <Button type="submit" name="action" value="withdraw" variant="ghost">Withdraw request</Button>
                    </form>
                  ) : item.status === "confirmed" ? (
                    <form action={closeCapabilityVerificationAction}>
                      <input type="hidden" name="verificationId" value={item.id} />
                      <Button type="submit" name="action" value="revoke" variant="ghost">Remove from my verification record</Button>
                    </form>
                  ) : null}
                </div>
                {item.responseNote ? <p className="text-muted mt-3 text-sm">Verifier context: {item.responseNote}</p> : null}
              </Surface>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
