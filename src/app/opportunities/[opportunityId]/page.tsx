import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { openOpportunityAction } from "@/modules/opportunities/application/opportunity-actions";
import { getOpportunityWorkspace } from "@/modules/opportunities/infrastructure/opportunity-dal";

export const metadata: Metadata = {
  title: "Opportunity Detail",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function readable(value: string) {
  return value.replaceAll("_", " ");
}

function formatDeadline(value: string | null) {
  if (!value) return "No published deadline";
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00Z`));
}

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ opportunityId: string }>;
}) {
  const { opportunityId } = await params;
  const workspace = await getOpportunityWorkspace();
  const item = workspace.marketplaceItems.get(opportunityId);
  if (!item) notFound();

  const native = item.nativeApplicationEnabled && item.providerId !== null;
  const canApplyNatively = native && !workspace.context.isMinor && item.isActive;

  return (
    <main
      id="main-content"
      className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14"
    >
      <ButtonLink href="/opportunities" variant="ghost">
        Back to opportunities
      </ButtonLink>

      <Surface className="border-gold/20 mt-6 overflow-hidden p-0">
        <section className="bg-slate-950 px-6 py-10 text-white sm:px-10 sm:py-12">
          <p className="text-gold text-xs font-semibold tracking-[0.16em] uppercase">
            {readable(item.category)}
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            {item.title}
          </h1>
          <p className="mt-3 text-lg text-slate-300">{item.providerName}</p>
          {native ? (
            <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1.5 text-emerald-100">
                Approved PipuPath provider
              </span>
              <span className="rounded-full border border-white/20 px-3 py-1.5 text-slate-200">
                PipuPath application available
              </span>
            </div>
          ) : null}
        </section>

        <div className="p-6 sm:p-10">
          <p className="text-muted text-lg leading-8">{item.summary}</p>

          <dl className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="border-border rounded-2xl border p-5">
              <dt className="text-muted text-xs font-semibold uppercase">
                Eligibility
              </dt>
              <dd className="mt-2 leading-7">{item.eligibilitySummary}</dd>
            </div>
            <div className="border-border rounded-2xl border p-5">
              <dt className="text-muted text-xs font-semibold uppercase">
                What it offers
              </dt>
              <dd className="mt-2 leading-7">{item.benefitSummary}</dd>
            </div>
            <div className="border-border rounded-2xl border p-5">
              <dt className="text-muted text-xs font-semibold uppercase">
                Geography
              </dt>
              <dd className="mt-2 leading-7">
                {item.geographyLabel} · {readable(item.deliveryMode)}
              </dd>
            </div>
            <div className="border-border rounded-2xl border p-5">
              <dt className="text-muted text-xs font-semibold uppercase">
                Deadline
              </dt>
              <dd className="mt-2 leading-7">
                {formatDeadline(item.deadlineDate)}
              </dd>
            </div>
          </dl>

          {native ? (
            <Surface className="border-gold/25 bg-gold/5 mt-8 p-6">
              <h2 className="text-xl font-semibold">Builder-controlled application</h2>
              <p className="text-muted mt-3 leading-7">
                This provider can receive a PipuPath application packet, but only
                after you choose exactly what to share and review the packet before
                submission. Your Discovery answers, private Human Potential Profile,
                reflections, contacts and unrelated evidence are never added
                automatically.
              </p>
              {workspace.context.isMinor ? (
                <p className="mt-4 text-sm font-semibold text-amber-800">
                  Provider application submission is limited to eligible adults in
                  Stage 20. You can still evaluate the opportunity and use the
                  official provider information.
                </p>
              ) : item.applicationStatus ? (
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <span className="border-border rounded-full border px-3 py-1.5 text-xs font-semibold">
                    Application: {readable(item.applicationStatus)}
                  </span>
                  <ButtonLink href={`/opportunities/${item.id}/apply`}>
                    Open application
                  </ButtonLink>
                </div>
              ) : canApplyNatively ? (
                <ButtonLink href={`/opportunities/${item.id}/apply`} className="mt-5">
                  Prepare PipuPath application
                </ButtonLink>
              ) : (
                <p className="mt-4 text-sm font-semibold text-amber-800">
                  Native application is not currently available for this listing.
                </p>
              )}
            </Surface>
          ) : (
            <Surface className="mt-8 p-6">
              <h2 className="text-xl font-semibold">External application</h2>
              <p className="text-muted mt-3 leading-7">
                This curated listing uses the provider&apos;s official application
                page. PipuPath does not send your private profile or evidence when
                you open that external link.
              </p>
            </Surface>
          )}

          <div className="border-border mt-8 flex flex-wrap gap-3 border-t pt-6">
            <form action={openOpportunityAction}>
              <input type="hidden" name="opportunityId" value={item.id} />
              <Button type="submit" variant="secondary">
                Open official opportunity
              </Button>
            </form>
            <ButtonLink href="/opportunities" variant="ghost">
              Compare other opportunities
            </ButtonLink>
          </div>
        </div>
      </Surface>
    </main>
  );
}
