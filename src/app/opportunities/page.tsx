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
  eligibility_check: "Eligibility check",
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
        Save self-reported outcome
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
    <Surface className="flex h-full flex-col p-6 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-gold text-xs font-semibold tracking-[0.14em] uppercase">
            {readable(item.category)}
          </p>
          <h2 className="text-navy mt-2 text-2xl font-semibold tracking-tight">
            {item.title}
          </h2>
          <p className="text-muted mt-1 text-sm">{item.providerName}</p>
          {native ? (
            <p className="mt-2 text-xs font-semibold text-emerald-700">
              Approved PipuPath provider · private application packet supported
            </p>
          ) : null}
        </div>
        <span className="border-primary/20 bg-primary-soft text-primary rounded-full border px-3 py-1.5 text-xs font-semibold">
          {tierLabels[match.tier]}
        </span>
      </div>

      <p className="text-muted mt-5 leading-7">{item.summary}</p>

      <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
        <div className="border-border rounded-2xl border p-4">
          <dt className="text-muted text-xs font-semibold uppercase">
            Eligibility
          </dt>
          <dd className="text-navy mt-2 leading-6">
            {item.eligibilitySummary}
          </dd>
        </div>
        <div className="border-border rounded-2xl border p-4">
          <dt className="text-muted text-xs font-semibold uppercase">
            What it offers
          </dt>
          <dd className="text-navy mt-2 leading-6">{item.benefitSummary}</dd>
        </div>
        <div className="border-border rounded-2xl border p-4">
          <dt className="text-muted text-xs font-semibold uppercase">
            Geography
          </dt>
          <dd className="text-navy mt-2 leading-6">
            {item.geographyLabel} · {readable(item.deliveryMode)}
          </dd>
        </div>
        <div className="border-border rounded-2xl border p-4">
          <dt className="text-muted text-xs font-semibold uppercase">
            Deadline
          </dt>
          <dd className="text-navy mt-2 leading-6">
            {formatDeadline(item.deadlineDate)}
          </dd>
        </div>
      </dl>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="border-success/25 bg-success/5 rounded-2xl border p-4">
          <h3 className="text-sm font-semibold">Why this may fit</h3>
          <ul className="text-muted mt-3 space-y-2 text-sm leading-6">
            {match.reasons.map((reason) => (
              <li key={reason}>• {reason}</li>
            ))}
          </ul>
        </div>
        <div className="border-border rounded-2xl border p-4">
          <h3 className="text-sm font-semibold">Readiness / checks</h3>
          {match.readinessGaps.length > 0 ? (
            <ul className="text-muted mt-3 space-y-2 text-sm leading-6">
              {match.readinessGaps.map((gap) => (
                <li key={gap}>• {gap}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted mt-3 text-sm leading-6">
              No unresolved age, location or capability check was identified by
              the current PipuPath rules. Read the official eligibility before
              applying.
            </p>
          )}
        </div>
      </div>

      <div className="border-border mt-6 flex flex-wrap gap-2 border-t pt-5">
        <form action={setOpportunitySavedAction}>
          <input type="hidden" name="opportunityId" value={item.id} />
          <input type="hidden" name="saved" value={saved ? "false" : "true"} />
          <Button type="submit" variant="ghost">
            {saved ? "Remove saved" : "Save opportunity"}
          </Button>
        </form>
        <ButtonLink href={`/opportunities/${item.id}`} variant="secondary">
          View details
        </ButtonLink>
        {native ? (
          isMinor ? null : (
            <ButtonLink href={`/opportunities/${item.id}/apply`}>
              {applicationStatus
                ? `Application: ${readable(applicationStatus)}`
                : "Prepare PipuPath application"}
            </ButtonLink>
          )
        ) : (
          <>
            <form action={openOpportunityAction}>
              <input type="hidden" name="opportunityId" value={item.id} />
              <Button type="submit" variant="secondary">
                Open official opportunity
              </Button>
            </form>
            {!applied ? (
              <form action={markOpportunityAppliedAction}>
                <input type="hidden" name="opportunityId" value={item.id} />
                <Button type="submit">I applied</Button>
              </form>
            ) : null}
          </>
        )}
      </div>

      {native && isMinor ? (
        <p className="mt-4 text-sm font-semibold text-amber-800">
          Stage 20 provider application submission is adult-only. You can still
          evaluate the opportunity and review its official information.
        </p>
      ) : null}

      {native && applicationStatus ? (
        <div className="border-primary/20 bg-primary-soft mt-5 rounded-2xl border p-4">
          <p className="text-primary text-xs font-semibold tracking-wide uppercase">
            PipuPath application
          </p>
          <p className="text-muted mt-2 text-sm leading-6">
            Current provider workflow state: {readable(applicationStatus)}. Open
            the application to review consent and withdrawal options.
          </p>
        </div>
      ) : null}

      {!native && applied ? (
        <div className="border-primary/20 bg-primary-soft mt-5 rounded-2xl border p-4">
          <p className="text-primary text-xs font-semibold tracking-wide uppercase">
            Application — self-reported
          </p>
          <p className="text-muted mt-2 text-sm leading-6">
            You marked this external opportunity as applied. PipuPath has not
            independently verified the application or its result.
          </p>
          <OutcomeForm item={item} />
        </div>
      ) : null}
    </Surface>
  );
}

function TrackedApplicationCard({ item }: { item: MarketplaceCatalogItem }) {
  const native =
    item.nativeApplicationEnabled || item.applicationStatus !== null;

  return (
    <Surface className="p-6 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-gold text-xs font-semibold tracking-[0.14em] uppercase">
            Tracked application · {readable(item.category)}
          </p>
          <h3 className="text-navy mt-2 text-xl font-semibold">{item.title}</h3>
          <p className="text-muted mt-1 text-sm">{item.providerName}</p>
        </div>
        <span className="border-border text-muted rounded-full border px-3 py-1.5 text-xs font-semibold">
          {native && item.applicationStatus
            ? readable(item.applicationStatus)
            : "Opportunity no longer active"}
        </span>
      </div>

      {native && item.applicationStatus ? (
        <>
          <p className="text-muted mt-4 text-sm leading-6">
            Your PipuPath application record remains available even if the
            provider or listing is no longer accepting new applications.
            Existing withdrawal rights are preserved by the application
            lifecycle.
          </p>
          <ButtonLink href={`/opportunities/${item.id}/apply`} className="mt-5">
            Open application history
          </ButtonLink>
        </>
      ) : (
        <>
          <p className="text-muted mt-4 text-sm leading-6">
            You previously marked this external opportunity as applied. Its
            deadline, publication or review state has changed, so PipuPath will
            not treat it as an active match. You can still record your outcome.
          </p>
          <div className="border-primary/20 bg-primary-soft mt-5 rounded-2xl border p-4">
            <p className="text-primary text-xs font-semibold tracking-wide uppercase">
              Application — self-reported
            </p>
            <p className="text-muted mt-2 text-sm">
              PipuPath has not independently verified the application or result.
            </p>
            <OutcomeForm item={item} />
          </div>
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

  return (
    <main
      id="main-content"
      className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-16 lg:px-10"
    >
      <section className="border-gold/20 bg-panel relative overflow-hidden rounded-[2rem] border px-6 py-10 sm:px-10 sm:py-14">
        <div
          aria-hidden="true"
          className="bg-gold/10 absolute -top-24 -right-20 size-64 rounded-full blur-3xl"
        />
        <div className="relative max-w-4xl">
          <p className="text-gold font-mono text-xs tracking-[0.2em] uppercase">
            Opportunities
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
            Put your development evidence in front of a larger real-world test.
          </h1>
          <p className="text-muted mt-5 max-w-3xl text-lg leading-8">
            PipuPath shows curated opportunities and explains why they may fit.
            Approved marketplace providers can receive a Builder-controlled
            exact application packet; ordinary curated listings still use the
            official external application route.
          </p>
        </div>
      </section>

      <Surface className="mt-8 p-6 sm:p-8">
        <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
          Matching context
        </p>
        <h2 className="text-navy mt-3 text-2xl font-semibold">
          {workspace.selectedPathName
            ? `Selected path: ${workspace.selectedPathName}`
            : "No Economic Pathway selected yet"}
        </h2>
        <p className="text-muted mt-3 max-w-4xl leading-7">
          Recommendations use your declared age band, country when you supplied
          one, selected path and capability labels. Missing details are shown as
          eligibility checks rather than guessed. There is no hidden
          employability score or selection probability.
        </p>
      </Surface>

      {errorMessage ? (
        <Surface className="mt-6 border-amber-500/40 p-5" role="alert">
          <p className="font-semibold">
            That opportunity action did not finish.
          </p>
          <p className="text-muted mt-2 text-sm">{errorMessage}</p>
        </Surface>
      ) : null}

      <section className="mt-10" aria-labelledby="opportunity-list-heading">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-gold text-xs font-semibold tracking-wide uppercase">
              Active vetted supply
            </p>
            <h2
              id="opportunity-list-heading"
              className="mt-3 text-3xl font-semibold tracking-tight"
            >
              {workspace.matches.length} opportunities to evaluate
            </h2>
          </div>
          <p className="text-muted max-w-md text-sm leading-6">
            “Strong match” means current PipuPath evidence overlaps the listing;
            it is not a selection probability or employability score.
          </p>
        </div>

        {workspace.matches.length > 0 ? (
          <div className="mt-6 grid gap-6 xl:grid-cols-2">
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
          <Surface className="mt-6 p-8">
            <h3 className="text-2xl font-semibold">No active match yet.</h3>
            <p className="text-muted mt-3 max-w-3xl leading-7">
              PipuPath may have no currently published opportunity that passes
              your known eligibility boundaries. This is a supply state, not a
              judgement about your potential. New vetted opportunities can be
              added without changing your profile.
            </p>
          </Surface>
        )}
      </section>

      {workspace.trackedApplications.length > 0 ? (
        <section
          className="mt-12"
          aria-labelledby="tracked-applications-heading"
        >
          <p className="text-gold text-xs font-semibold tracking-wide uppercase">
            Your application history
          </p>
          <h2
            id="tracked-applications-heading"
            className="mt-3 text-3xl font-semibold tracking-tight"
          >
            Applications and outcomes you are tracking
          </h2>
          <p className="text-muted mt-3 max-w-3xl leading-7">
            Native PipuPath applications retain their controlled lifecycle even
            after supply closes. External applications remain explicitly
            self-reported.
          </p>
          <div className="mt-6 grid gap-5 xl:grid-cols-2">
            {workspace.trackedApplications.map((item) => (
              <TrackedApplicationCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      ) : null}

      <p className="text-muted mt-8 text-center text-xs leading-5">
        Always read the official eligibility and terms before applying. PipuPath
        never promises selection, income or provider outcomes.
      </p>
    </main>
  );
}
