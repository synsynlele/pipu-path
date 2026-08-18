import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { requireAuthenticatedIdentity } from "@/modules/identity/infrastructure/identity-dal";
import { getProviderWorkspace } from "@/modules/opportunities/infrastructure/marketplace-dal";
import { listProviderWorkspaceChoices } from "@/modules/opportunities/infrastructure/provider-workspace-dal";

export const metadata: Metadata = {
  title: "Opportunity Provider Workspace",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function readable(value: string) {
  return value.replaceAll("_", " ");
}

export default async function ProviderPage({
  searchParams,
}: {
  searchParams: Promise<{ provider?: string }>;
}) {
  await requireAuthenticatedIdentity();
  const query = await searchParams;
  const choices = await listProviderWorkspaceChoices();
  if (choices.length === 0) notFound();

  const selected =
    choices.find((choice) => choice.providerId === query.provider) ?? choices[0];

  let workspace;
  try {
    workspace = await getProviderWorkspace(selected.providerId);
  } catch {
    redirect("/provider?error=workspace_unavailable");
  }

  return (
    <main
      id="main-content"
      className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14"
    >
      <section className="rounded-[2rem] bg-slate-950 px-6 py-10 text-white sm:px-10 sm:py-14">
        <p className="text-gold font-mono text-xs tracking-[0.2em] uppercase">
          Trusted Opportunity Provider
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
          {workspace.provider.organisationName}
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
          Publish real-world opportunities through PipuPath without receiving a
          Builder directory. You see only application packets that eligible
          Builders deliberately submit to this provider.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <span className="rounded-full border border-white/20 px-3 py-1.5">
            Provider: {readable(workspace.provider.status)}
          </span>
          <span className="rounded-full border border-white/20 px-3 py-1.5">
            Your role: {readable(workspace.membership.role)}
          </span>
        </div>
      </section>

      {choices.length > 1 ? (
        <Surface className="mt-6 p-5">
          <p className="text-sm font-semibold">Your provider workspaces</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {choices.map((choice) => (
              <ButtonLink
                key={choice.providerId}
                href={`/provider?provider=${choice.providerId}`}
                variant={
                  choice.providerId === selected.providerId
                    ? "secondary"
                    : "ghost"
                }
              >
                {choice.organisationName}
              </ButtonLink>
            ))}
          </div>
        </Surface>
      ) : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Surface className="p-6 sm:p-8">
          <p className="text-gold text-xs font-semibold tracking-wide uppercase">
            Opportunity supply
          </p>
          <h2 className="mt-3 text-2xl font-semibold">
            {workspace.opportunities.length} provider listings
          </h2>
          <p className="text-muted mt-3 leading-7">
            Provider drafts always return to independent PipuPath review before
            publication. Provider ownership never grants self-approval.
          </p>
          <ButtonLink
            href={`/provider/opportunities?provider=${selected.providerId}`}
            className="mt-5"
          >
            Manage opportunities
          </ButtonLink>
        </Surface>

        <Surface className="p-6 sm:p-8">
          <p className="text-gold text-xs font-semibold tracking-wide uppercase">
            Submitted applications
          </p>
          <h2 className="mt-3 text-2xl font-semibold">
            Exact Builder packets only
          </h2>
          <p className="text-muted mt-3 leading-7">
            The application queue contains only the display name and development
            evidence each Builder chose to submit. Discovery answers, private
            HPP/reflections, contacts and unrelated evidence remain inaccessible.
          </p>
          <ButtonLink
            href={`/provider/applications?provider=${selected.providerId}`}
            variant="secondary"
            className="mt-5"
          >
            Open application queue
          </ButtonLink>
        </Surface>
      </div>

      {workspace.provider.status !== "approved" ? (
        <Surface className="mt-8 border-amber-300 bg-amber-50 p-6">
          <h2 className="font-semibold text-amber-950">
            Provider actions are currently restricted.
          </h2>
          <p className="mt-2 text-sm leading-6 text-amber-900">
            This provider is {readable(workspace.provider.status)}. Opportunity
            creation and application access require an approved provider. Existing
            Builder withdrawal rights remain independent of provider status.
          </p>
        </Surface>
      ) : null}
    </main>
  );
}
