import type { Metadata } from "next";
import { Button, ButtonLink } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { recordCurrentUserFeatureView } from "@/modules/analytics/infrastructure/product-events";
import {
  markOpportunityAppliedAction,
  openOpportunityAction,
  recordOpportunityOutcomeAction,
  setOpportunitySavedAction,
} from "@/modules/opportunities/application/opportunity-actions";
import type { MarketplaceCatalogItem } from "@/modules/opportunities/domain/marketplace-contract";
import type {
  OpportunityCatalogItem,
  OpportunityMatch,
  OpportunityMatchTier,
} from "@/modules/opportunities/domain/opportunity-contract";
import { getOpportunityWorkspace } from "@/modules/opportunities/infrastructure/opportunity-dal";

export const metadata: Metadata = {
  title: "Opportunities",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const tierLabels: Record<OpportunityMatchTier, string> = {
  strong_match: "Strong match",
  possible_match: "Possible match",
  eligibility_check: "Check eligibility",
};

const errorMessages: Record<string, string> = {
  state_invalid: "That save request could not be understood.",
  state_failed: "Your saved state could not be updated.",
  application_invalid: "That application update could not be understood.",
  application_failed: "Your application state could not be recorded.",
  outcome_invalid: "Choose a valid self-reported outcome.",
  outcome_failed: "Your outcome could not be recorded.",
  link_invalid: "That opportunity link is invalid.",
  link_unavailable: "That official opportunity link is no longer available.",
};

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

function OutcomeForm({ item }: { item: OpportunityCatalogItem }) {
  return (
    <form
      action={recordOpportunityOutcomeAction}
      className="mt-4 flex flex-wrap items-end gap-2"
    >
      <input type="hidden" name="opportunityId" value={item.id} />
      <label className="min-w-48 text-sm font-semibold">
        Outcome
        <select
          name="outcome"
          defaultValue={item.state.outcome ?? ""}
          required
          className="border-border bg-background text-foreground mt-2 block min-h-11 w-full rounded-xl border px-3 py-2"
        >
          <option value="" disabled>
            Choose outcome
          </option>
          <option value="accepted">Accepted</option>
          <option value="not_selected">Not selected</option>
          <option value="withdrawn">I withdrew</option>
          <option value="other">Other</option>
        </select>
      </label>
      <Button type="submit" variant="ghost">
        Save outcome
      </Button>
    </form>
  );
}

function MatchCard({
  match,
  marketplaceItem,
  isMinor,
}: {
  match: OpportunityMatch;
  marketplaceItem: MarketplaceCatalogItem | undefined;
  isMinor: boolean;
}) {
  const item = match.opportunity;
  const saved = Boolean(item.state.savedAt);
  const applied = Boolean(item.state.appliedAt);
  const native = Boolean(marketplaceItem?.nativeApplicationEnabled);
  const applicationStatus = marketplaceItem?.applicationStatus ?? null;

  return (
    <Surface className="flex h-full flex-col overflow-hidden p-0">
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-gold text-xs font-semibold tracking-[0.14em] uppercase">
              {readable(item.category)} · Deployment door
            </p>
            <h2 className="text-navy mt-2 text-2xl font-semibold tracking-tight">
              {item.title}
            </h2>
            <p className="text-muted mt-1 text-sm">{item.providerName}</p>
          </div>
          <span className="border-primary/20 bg-primary-soft text-primary rounded-full border px-3 py-1.5 text-xs font-semibold">
            {tierLabels[match.tier]}
          </span>
        </div>

        <p className="text-muted mt-4 line-clamp-3 text-sm leading-6">
          {item.summary}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2 text-xs">
          <div className="border-border rounded-xl border p-3">
            <p className="text-muted font-semibold tracking-wide uppercase">
              Deadline
            </p>
            <p className="text-navy mt-1 font-semibold">
              {formatDeadline(item.deadlineDate)}
            </p>
          </div>
          <div className="border-border rounded-xl border p-3">
            <p className="text-muted font-semibold tracking-wide uppercase">
              Where
            </p>
            <p className="text-navy mt-1 line-clamp-2 font-semibold">
              {item.geographyLabel} · {readable(item.deliveryMode)}
            </p>
          </div>
        </div>

        {match.reasons.length > 0 ? (
          <div className="border-success/25 bg-success/5 mt-4 rounded-xl border p-3">
            <p className="text-success text-xs font-semibold tracking-wide uppercase">
              Why this door appeared
            </p>
            <p className="text-muted mt-1.5 line-clamp-2 text-xs leading-5">
              {match.reasons.join(" · ")}
            </p>
          </div>
        ) : null}

        {native ? (
          <p className="text-success mt-4 text-xs font-semibold">
            ✓ Approved PipuPath provider · controlled application supported
          </p>
        ) : null}

        <details className="border-border mt-4 rounded-xl border p-3">
          <summary className="text-navy cursor-pointer text-sm font-semibold">
            Check eligibility, benefit and readiness
          </summary>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-muted text-xs font-semibold uppercase">
                Eligibility
              </p>
              <p className="text-navy mt-1.5 leading-6">
                {item.eligibilitySummary}
              </p>
            </div>
            <div>
              <p className="text-muted text-xs font-semibold uppercase">
                What it offers
              </p>
              <p className="text-navy mt-1.5 leading-6">
                {item.benefitSummary}
              </p>
            </div>
          </div>
          <div className="border-border mt-4 border-t pt-4">
            <p className="text-muted text-xs font-semibold uppercase">
              Readiness checks
            </p>
            {match.readinessGaps.length > 0 ? (
              <ul className="text-muted mt-2 grid gap-1 text-sm leading-6">
                {match.readinessGaps.map((gap) => (
                  <li key={gap}>• {gap}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted mt-2 text-sm leading-6">
                No unresolved age, location or capability check was identified by current PipuPath rules. Always read the official eligibility before applying.
              </p>
            )}
          </div>
        </details>
      </div>

      <div className="border-border bg-background/35 mt-auto border-t p-4 sm:p-5">
        <div className="flex flex-wrap gap-2">
          <ButtonLink href={`/opportunities/${item.id}`} variant="secondary">
            Inspect Door
          </ButtonLink>
          {native ? (
            isMinor ? null : (
              <ButtonLink href={`/opportunities/${item.id}/apply`}>
                {applicationStatus
                  ? `Application: ${readable(applicationStatus)}`
                  : "Enter Application →"}
              </ButtonLink>
            )
          ) : (
            <form action={openOpportunityAction}>
              <input type="hidden" name="opportunityId" value={item.id} />
              <Button type="submit">Open Official Door →</Button>
            </form>
          )}
          <form action={setOpportunitySavedAction}>
            <input type="hidden" name="opportunityId" value={item.id} />
            <input type="hidden" name="saved" value={saved ? "false" : "true"} />
            <Button type="submit" variant="ghost">
              {saved ? "Unsave" : "Save"}
            </Button>
          </form>
        </div>

        {!native && !applied ? (
          <form action={markOpportunityAppliedAction} className="mt-3">
            <input type="hidden" name="opportunityId" value={item.id} />
            <Button type="submit" variant="ghost" className="text-xs">
              I applied externally
            </Button>
          </form>
        ) : null}

        {native && isMinor ? (
          <p className="mt-3 text-xs font-semibold text-amber-800">
            Provider application submission is adult-only in the current safeguarding boundary. You can still evaluate the opportunity.
          </p>
        ) : null}

        {native && applicationStatus ? (
          <div className="border-primary/20 bg-primary-soft mt-4 rounded-xl border p-3">
            <p className="text-primary text-xs font-semibold tracking-wide uppercase">
              Application in motion
            </p>
            <p className="text-muted mt-1.5 text-xs leading-5">
              Current controlled provider state: {readable(applicationStatus)}.
            </p>
          </div>
        ) : null}

        {!native && applied ? (
          <details className="border-primary/20 bg-primary-soft mt-4 rounded-xl border p-3">
            <summary className="text-primary cursor-pointer text-xs font-semibold">
              External application tracked
            </summary>
            <p className="text-muted mt-2 text-xs leading-5">
              This application and its outcome are self-reported; PipuPath has not independently verified them.
            </p>
            <OutcomeForm item={item} />
          </details>
        ) : null}
      </div>
    </Surface>
  );
}

function TrackedApplicationCard({ item }: { item: MarketplaceCatalogItem }) {
  const native =
    item.nativeApplicationEnabled || item.applicationStatus !== null;

  return (
    <Surface className="w-[19rem] shrink-0 p-5 sm:w-[22rem]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-gold text-xs font-semibold tracking-[0.14em] uppercase">
            Application trail · {readable(item.category)}
          </p>
          <h3 className="text-navy mt-2 text-xl font-semibold">{item.title}</h3>
          <p className="text-muted mt-1 text-xs">{item.providerName}</p>
        </div>
        <span className="border-border text-muted rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold">
          {native && item.applicationStatus
            ? readable(item.applicationStatus)
            : "listing closed"}
        </span>
      </div>

      {native && item.applicationStatus ? (
        <>
          <p className="text-muted mt-4 text-xs leading-5">
            Your controlled application record remains available even if new applications close.
          </p>
          <ButtonLink href={`/opportunities/${item.id}/apply`} className="mt-4">
            Open Application Trail
          </ButtonLink>
        </>
      ) : (
        <>
          <p className="text-muted mt-4 text-xs leading-5">
            This external opportunity is no longer an active match, but your self-reported application trail remains yours.
          </p>
          <details className="border-primary/20 bg-primary-soft mt-4 rounded-xl border p-3">
            <summary className="text-primary cursor-pointer text-xs font-semibold">
              Record outcome
            </summary>
            <OutcomeForm item={item} />
          </details>
        </>
      )}
    </Surface>
  );
}

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const workspace = await getOpportunityWorkspace();
  await recordCurrentUserFeatureView("opportunities");
  const errorKey = typeof params.error === "string" ? params.error : null;
  const errorMessage = errorKey ? errorMessages[errorKey] : null;
  const strongMatches = workspace.matches.filter(
    (match) => match.tier === "strong_match",
  ).length;

  return (
    <main
      id="main-content"
      className="mx-auto max-w-7xl px-4 py-7 sm:px-8 sm:py-12 lg:px-10"
    >
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#07142f] p-6 text-white sm:p-9">
        <div
          aria-hidden="true"
          className="absolute -top-28 -right-20 size-72 rounded-full border border-white/10"
        />
        <div
          aria-hidden="true"
          className="absolute right-12 -bottom-36 size-72 rounded-full bg-[#4f7cff]/18 blur-3xl"
        />
        <div className="relative max-w-4xl">
          <p className="text-xs font-semibold tracking-[0.18em] text-[#f3c86b] uppercase">
            Opportunities · Deployment Doors
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Build capability here. Deploy it into a bigger real-world test.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-blue-50/75 sm:text-base">
            These doors are curated from real opportunities. PipuPath explains why one may fit, but never pretends to know who will select you.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-blue-50">
              {workspace.matches.length} open {workspace.matches.length === 1 ? "door" : "doors"}
            </span>
            {strongMatches > 0 ? (
              <span className="rounded-full border border-[#f3c86b]/25 bg-[#f3c86b]/8 px-3 py-1.5 font-semibold text-[#f3c86b]">
                {strongMatches} strong {strongMatches === 1 ? "match" : "matches"}
              </span>
            ) : null}
            {workspace.selectedPathName ? (
              <span className="rounded-full border border-white/15 px-3 py-1.5 text-blue-100">
                Path: {workspace.selectedPathName}
              </span>
            ) : null}
          </div>
        </div>
      </section>

      <div className="border-primary/15 bg-primary-soft/30 mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3 sm:px-5">
        <div>
          <p className="text-navy text-sm font-semibold">
            Matching is guidance, not a hidden employability score
          </p>
          <p className="text-muted mt-0.5 text-xs">
            Age band, country when supplied, selected path and demonstrated capability labels are used; unknowns stay explicit.
          </p>
        </div>
        <ButtonLink href="/profile" variant="secondary" className="min-h-10">
          Open Skill Tree
        </ButtonLink>
      </div>

      {errorMessage ? (
        <Surface className="mt-5 border-amber-500/40 p-5" role="alert">
          <p className="text-navy font-semibold">
            That opportunity action did not finish.
          </p>
          <p className="text-muted mt-2 text-sm">{errorMessage}</p>
        </Surface>
      ) : null}

      <section className="mt-8" aria-labelledby="deployment-doors-heading">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-gold text-xs font-semibold tracking-[0.14em] uppercase">
              Doors available now
            </p>
            <h2
              id="deployment-doors-heading"
              className="text-navy mt-2 text-3xl font-semibold tracking-tight"
            >
              Choose what deserves your next real-world attempt
            </h2>
          </div>
          <span className="text-muted max-w-sm text-xs leading-5">
            Inspect the fit, verify official eligibility, then decide whether this opportunity is worth your effort.
          </span>
        </div>

        {workspace.matches.length > 0 ? (
          <div className="mt-5 grid gap-5 xl:grid-cols-2">
            {workspace.matches.map((match) => (
              <MatchCard
                key={match.opportunity.id}
                match={match}
                marketplaceItem={workspace.marketplaceItems.get(
                  match.opportunity.id,
                )}
                isMinor={workspace.context.isMinor}
              />
            ))}
          </div>
        ) : (
          <Surface className="mt-5 p-7 sm:p-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="border-border bg-background text-muted mx-auto grid size-16 place-items-center rounded-full border-2 text-xl">
                ?
              </span>
              <p className="text-primary mt-4 text-xs font-semibold tracking-[0.14em] uppercase">
                No door open right now
              </p>
              <h3 className="text-navy mt-2 text-2xl font-semibold">
                This is a supply state, not a judgement about your potential.
              </h3>
              <p className="text-muted mt-3 text-sm leading-6">
                There may be no currently published opportunity that passes your known eligibility boundaries. Keep building; new vetted supply can appear without changing who you are.
              </p>
              <ButtonLink href="/build" className="mt-5">
                Continue Building →
              </ButtonLink>
            </div>
          </Surface>
        )}
      </section>

      {workspace.trackedApplications.length > 0 ? (
        <section className="mt-9" aria-labelledby="application-trails-heading">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-primary text-xs font-semibold tracking-[0.14em] uppercase">
                Deployment trails
              </p>
              <h2
                id="application-trails-heading"
                className="text-navy mt-2 text-2xl font-semibold tracking-tight"
              >
                Attempts already in motion
              </h2>
            </div>
            <span className="text-muted text-xs">
              {workspace.trackedApplications.length} tracked
            </span>
          </div>
          <div className="mt-5 flex gap-4 overflow-x-auto pb-3 [scrollbar-width:thin]">
            {workspace.trackedApplications.map((item) => (
              <TrackedApplicationCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      ) : null}

      <p className="text-muted mt-8 text-center text-xs leading-5">
        Always read official eligibility and terms before applying. PipuPath never promises selection, income or provider outcomes.
      </p>
    </main>
  );
}
