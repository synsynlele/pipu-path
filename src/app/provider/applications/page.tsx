import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { requireAuthenticatedIdentity } from "@/modules/identity/infrastructure/identity-dal";
import { transitionProviderApplicationAction } from "@/modules/opportunities/application/marketplace-actions";
import type {
  MarketplaceApplication,
  MarketplaceApplicationStatus,
} from "@/modules/opportunities/domain/marketplace-contract";
import { getProviderApplications } from "@/modules/opportunities/infrastructure/marketplace-dal";
import { listProviderWorkspaceChoices } from "@/modules/opportunities/infrastructure/provider-workspace-dal";

export const metadata: Metadata = {
  title: "Provider Applications",
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

function transitionOptions(status: MarketplaceApplicationStatus) {
  if (status === "submitted") {
    return ["viewed", "shortlisted", "accepted", "not_selected"] as const;
  }
  if (status === "viewed") {
    return ["shortlisted", "accepted", "not_selected"] as const;
  }
  if (status === "shortlisted") {
    return ["accepted", "not_selected"] as const;
  }
  return [] as const;
}

function ApplicationCard({
  providerId,
  application,
}: {
  providerId: string;
  application: MarketplaceApplication;
}) {
  const options = transitionOptions(application.status);
  const packet = application.packet;

  return (
    <Surface className="p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-gold text-xs font-semibold tracking-wide uppercase">
            Builder-submitted packet
          </p>
          <h2 className="mt-2 text-2xl font-semibold">{packet.displayName}</h2>
          <p className="text-muted mt-1 text-sm">
            Status: {readable(application.status)} · Submitted:{" "}
            {formatTimestamp(application.submittedAt)}
          </p>
        </div>
        <span className="border-border rounded-full border px-3 py-1.5 text-xs font-semibold">
          {readable(application.status)}
        </span>
      </div>

      {packet.builderSummary ? (
        <div className="mt-6">
          <p className="text-xs font-semibold tracking-wide uppercase">
            Builder summary
          </p>
          <p className="text-muted mt-2 leading-7">{packet.builderSummary}</p>
        </div>
      ) : null}

      {packet.selectedPathName ? (
        <div className="border-border mt-5 rounded-2xl border p-4">
          <p className="text-muted text-xs font-semibold uppercase">
            Selected pathway
          </p>
          <p className="mt-2 font-semibold">{packet.selectedPathName}</p>
        </div>
      ) : null}

      {packet.applicationNote ? (
        <div className="border-border mt-5 rounded-2xl border p-4">
          <p className="text-muted text-xs font-semibold uppercase">
            Application note
          </p>
          <p className="mt-2 text-sm leading-6 whitespace-pre-wrap">
            {packet.applicationNote}
          </p>
        </div>
      ) : null}

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <div className="border-border rounded-2xl border p-4">
          <h3 className="font-semibold">Selected capabilities</h3>
          {packet.capabilities.length ? (
            <ul className="text-muted mt-3 space-y-3 text-sm">
              {packet.capabilities.map((capability) => (
                <li key={capability.claimId}>
                  <span className="text-foreground font-semibold">
                    {capability.capabilityLabel}
                  </span>
                  <span> · {readable(capability.capabilityLevel)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted mt-3 text-sm">
              No capability claim shared.
            </p>
          )}
        </div>

        <div className="border-border rounded-2xl border p-4">
          <h3 className="font-semibold">Selected evidence</h3>
          {packet.evidence.length ? (
            <ul className="text-muted mt-3 space-y-4 text-sm">
              {packet.evidence.map((evidence) => (
                <li key={evidence.evidenceId}>
                  <p className="text-foreground font-semibold">
                    {evidence.sourceTitle}
                  </p>
                  <p className="mt-1 leading-6">{evidence.evidenceSummary}</p>
                  <Link
                    href={evidence.sourceHref}
                    className="text-gold mt-2 inline-block font-semibold"
                  >
                    Open PipuPath evidence
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted mt-3 text-sm">No evidence item shared.</p>
          )}
        </div>

        <div className="border-border rounded-2xl border p-4">
          <h3 className="font-semibold">Institution confirmations</h3>
          {packet.institutionVerifications.length ? (
            <ul className="text-muted mt-3 space-y-3 text-sm">
              {packet.institutionVerifications.map((verification) => (
                <li key={verification.verificationId}>
                  <p className="text-foreground font-semibold">
                    {verification.capabilityLabel}
                  </p>
                  <p className="mt-1">
                    Confirmed by {verification.institutionName} ·{" "}
                    {formatTimestamp(verification.confirmedAt)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted mt-3 text-sm">
              No institution confirmation shared.
            </p>
          )}
        </div>

        <div className="border-border rounded-2xl border p-4">
          <h3 className="font-semibold">Published proof</h3>
          {packet.portfolioProofs.length ? (
            <ul className="text-muted mt-3 space-y-4 text-sm">
              {packet.portfolioProofs.map((proof) => (
                <li key={proof.portfolioId}>
                  <p className="text-foreground font-semibold">
                    {proof.publicTitle}
                  </p>
                  <p className="mt-1 leading-6">{proof.publicSummary}</p>
                  <Link
                    href={proof.proofHref}
                    className="text-gold mt-2 inline-block font-semibold"
                  >
                    Open public proof
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted mt-3 text-sm">No public proof shared.</p>
          )}
        </div>
      </div>

      {options.length ? (
        <form
          action={transitionProviderApplicationAction}
          className="border-border mt-6 flex flex-wrap items-end gap-3 border-t pt-5"
        >
          <input type="hidden" name="providerId" value={providerId} />
          <input type="hidden" name="applicationId" value={application.id} />
          <label className="text-sm font-semibold">
            Provider decision
            <select
              name="status"
              required
              className="border-border bg-background mt-2 block min-h-11 rounded-xl border px-3 py-2"
              defaultValue=""
            >
              <option value="" disabled>
                Choose next state
              </option>
              {options.map((option) => (
                <option key={option} value={option}>
                  {readable(option)}
                </option>
              ))}
            </select>
          </label>
          <Button type="submit">Update application</Button>
        </form>
      ) : (
        <p className="text-muted border-border mt-6 border-t pt-5 text-sm">
          This application has reached a terminal provider state. PipuPath will
          not reopen or reverse it through the Stage 20 provider workflow.
        </p>
      )}
    </Surface>
  );
}

export default async function ProviderApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{
    provider?: string;
    updated?: string;
    error?: string;
  }>;
}) {
  await requireAuthenticatedIdentity();
  const query = await searchParams;
  const choices = await listProviderWorkspaceChoices();
  if (choices.length === 0) notFound();
  const selected =
    choices.find((choice) => choice.providerId === query.provider) ??
    choices[0];

  let queue;
  try {
    queue = await getProviderApplications(selected.providerId);
  } catch {
    redirect(
      `/provider?provider=${selected.providerId}&error=queue_unavailable`,
    );
  }

  return (
    <main
      id="main-content"
      className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-gold text-xs font-semibold tracking-wide uppercase">
            Provider Applications
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Submitted Builder packets
          </h1>
          <p className="text-muted mt-3 max-w-3xl leading-7">
            This is not a Builder directory. Only packets deliberately submitted
            to this provider appear here, and each packet contains only the
            fields and evidence the Builder selected before consent.
          </p>
        </div>
        <ButtonLink
          href={`/provider?provider=${selected.providerId}`}
          variant="ghost"
        >
          Back to provider workspace
        </ButtonLink>
      </div>

      {query.updated === "1" ? (
        <Surface className="mt-6 border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-900">
            Application state updated.
          </p>
        </Surface>
      ) : null}
      {query.error ? (
        <Surface className="mt-6 border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-900">
            The requested provider application transition was rejected.
          </p>
        </Surface>
      ) : null}

      <Surface className="border-gold/25 bg-gold/5 mt-8 p-6">
        <p className="text-sm font-semibold">
          Provider role: {readable(queue.role)}
        </p>
        <p className="text-muted mt-2 text-sm leading-6">
          Provider operators cannot see Discovery answers, Human Potential
          Profile prose, private reflections/projects, Builder contacts, network
          state or any capability/evidence not selected into an application
          packet.
        </p>
      </Surface>

      {queue.applications.length === 0 ? (
        <Surface className="mt-8 p-8">
          <h2 className="text-2xl font-semibold">
            No submitted applications yet.
          </h2>
          <p className="text-muted mt-3 max-w-3xl leading-7">
            Nothing appears until an eligible adult Builder chooses this
            provider opportunity, prepares an exact packet, previews it and
            submits it.
          </p>
        </Surface>
      ) : (
        <div className="mt-8 space-y-6">
          {queue.applications.map((application) => (
            <ApplicationCard
              key={application.id}
              providerId={selected.providerId}
              application={application}
            />
          ))}
        </div>
      )}
    </main>
  );
}
