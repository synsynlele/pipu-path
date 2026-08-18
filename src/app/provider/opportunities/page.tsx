import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { requireAuthenticatedIdentity } from "@/modules/identity/infrastructure/identity-dal";
import { saveProviderOpportunityAction } from "@/modules/opportunities/application/marketplace-actions";
import type { OpportunityProviderWorkspace } from "@/modules/opportunities/domain/marketplace-contract";
import { opportunityCategories } from "@/modules/opportunities/domain/opportunity-contract";
import { getProviderWorkspace } from "@/modules/opportunities/infrastructure/marketplace-dal";
import { listProviderWorkspaceChoices } from "@/modules/opportunities/infrastructure/provider-workspace-dal";

export const metadata: Metadata = {
  title: "Provider Opportunities",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const inputClass =
  "border-border bg-background text-foreground mt-2 min-h-11 w-full rounded-xl border px-3 py-2 text-sm";

type ProviderOpportunity =
  OpportunityProviderWorkspace["opportunities"][number];

function readable(value: string) {
  return value.replaceAll("_", " ");
}

function OpportunityForm({
  providerId,
  providerName,
  item,
}: {
  providerId: string;
  providerName: string;
  item?: ProviderOpportunity;
}) {
  return (
    <form
      action={saveProviderOpportunityAction}
      className="grid gap-4 lg:grid-cols-2"
    >
      <input type="hidden" name="providerId" value={providerId} />
      <input type="hidden" name="providerName" value={providerName} />
      {item ? (
        <input type="hidden" name="opportunityId" value={item.id} />
      ) : null}
      <label className="text-sm font-semibold">
        Title
        <input
          className={inputClass}
          name="title"
          required
          maxLength={180}
          defaultValue={item?.title ?? ""}
        />
      </label>
      <label className="text-sm font-semibold">
        Category
        <select
          className={inputClass}
          name="category"
          required
          defaultValue={item?.category ?? "challenge"}
        >
          {opportunityCategories.map((category) => (
            <option key={category} value={category}>
              {readable(category)}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm font-semibold lg:col-span-2">
        Summary
        <textarea
          className={inputClass}
          name="summary"
          rows={3}
          required
          maxLength={1200}
          defaultValue={item?.summary ?? ""}
        />
      </label>
      <label className="text-sm font-semibold lg:col-span-2">
        Eligibility summary
        <textarea
          className={inputClass}
          name="eligibilitySummary"
          rows={3}
          required
          maxLength={1200}
          defaultValue={item?.eligibilitySummary ?? ""}
        />
      </label>
      <label className="text-sm font-semibold lg:col-span-2">
        What it offers
        <textarea
          className={inputClass}
          name="benefitSummary"
          rows={2}
          required
          maxLength={600}
          defaultValue={item?.benefitSummary ?? ""}
        />
      </label>
      <label className="text-sm font-semibold">
        Minimum age
        <input
          className={inputClass}
          type="number"
          min={0}
          max={120}
          name="minAge"
          defaultValue={item?.minAge ?? ""}
        />
      </label>
      <label className="text-sm font-semibold">
        Maximum age
        <input
          className={inputClass}
          type="number"
          min={0}
          max={120}
          name="maxAge"
          defaultValue={item?.maxAge ?? ""}
        />
      </label>
      <label className="text-sm font-semibold">
        Geography scope
        <select
          className={inputClass}
          name="geographyScope"
          defaultValue={item?.geographyScope ?? "global"}
        >
          <option value="global">Global</option>
          <option value="country">Country</option>
          <option value="region">Region</option>
        </select>
      </label>
      <label className="text-sm font-semibold">
        Delivery mode
        <select
          className={inputClass}
          name="deliveryMode"
          defaultValue={item?.deliveryMode ?? "unspecified"}
        >
          <option value="in_person">In person</option>
          <option value="remote">Remote</option>
          <option value="hybrid">Hybrid</option>
          <option value="unspecified">Unspecified</option>
        </select>
      </label>
      <label className="text-sm font-semibold">
        Country codes
        <input
          className={inputClass}
          name="countryCodes"
          placeholder="NG, GH"
          defaultValue={item?.countryCodes.join(", ") ?? ""}
        />
      </label>
      <label className="text-sm font-semibold">
        Geography label
        <input
          className={inputClass}
          name="geographyLabel"
          required
          maxLength={180}
          placeholder="Global / Nigeria / West Africa"
          defaultValue={item?.geographyLabel ?? "Global"}
        />
      </label>
      <label className="text-sm font-semibold">
        Pathway tags
        <input
          className={inputClass}
          name="pathwayTags"
          placeholder="technology, education"
          defaultValue={item?.pathwayTags.join(", ") ?? ""}
        />
      </label>
      <label className="text-sm font-semibold">
        Capability tags
        <input
          className={inputClass}
          name="capabilityTags"
          placeholder="leadership, design"
          defaultValue={item?.capabilityTags.join(", ") ?? ""}
        />
      </label>
      <label className="text-sm font-semibold lg:col-span-2">
        Official HTTPS URL
        <input
          className={inputClass}
          type="url"
          name="officialUrl"
          required
          placeholder="https://provider.org/opportunity"
          defaultValue={item?.officialUrl ?? ""}
        />
      </label>
      <label className="text-sm font-semibold">
        Deadline date
        <input
          className={inputClass}
          type="date"
          name="deadlineDate"
          defaultValue={item?.deadlineDate ?? ""}
        />
      </label>
      <div className="flex items-end">
        <Button type="submit">
          {item ? "Save changes for re-review" : "Create draft"}
        </Button>
      </div>
    </form>
  );
}

export default async function ProviderOpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ provider?: string; saved?: string; error?: string }>;
}) {
  await requireAuthenticatedIdentity();
  const query = await searchParams;
  const choices = await listProviderWorkspaceChoices();
  if (choices.length === 0) notFound();
  const selected =
    choices.find((choice) => choice.providerId === query.provider) ??
    choices[0];

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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-gold text-xs font-semibold tracking-wide uppercase">
            Provider Opportunity Supply
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            {workspace.provider.organisationName}
          </h1>
          <p className="text-muted mt-3 max-w-3xl leading-7">
            Provider operators can create and edit only this provider&apos;s
            drafts. Every edit resets platform review and publication so the
            provider can never self-approve a listing.
          </p>
        </div>
        <ButtonLink
          href={`/provider?provider=${selected.providerId}`}
          variant="ghost"
        >
          Back to provider workspace
        </ButtonLink>
      </div>

      {query.saved === "1" ? (
        <Surface className="mt-6 border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-900">
            Draft saved and queued for independent platform review.
          </p>
        </Surface>
      ) : null}
      {query.error ? (
        <Surface className="mt-6 border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-900">
            The requested provider opportunity change was rejected.
          </p>
        </Surface>
      ) : null}

      {workspace.provider.status === "approved" ? (
        <Surface className="mt-8 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold">Create a provider draft</h2>
          <p className="text-muted mt-2 leading-7">
            Supply accurate, official information. PipuPath does not accept
            guaranteed-income claims, speculative trading schemes or other
            unsafe money-making copy.
          </p>
          <div className="border-border mt-6 border-t pt-6">
            <OpportunityForm
              providerId={selected.providerId}
              providerName={workspace.provider.organisationName}
            />
          </div>
        </Surface>
      ) : (
        <Surface className="mt-8 border-amber-300 bg-amber-50 p-6">
          <p className="font-semibold text-amber-950">
            Provider approval is required before creating or editing listings.
          </p>
        </Surface>
      )}

      <section className="mt-10" aria-labelledby="provider-listings-heading">
        <h2 id="provider-listings-heading" className="text-3xl font-semibold">
          Provider listings
        </h2>
        {workspace.opportunities.length === 0 ? (
          <Surface className="mt-5 p-6">
            <p className="text-muted">
              No provider-owned opportunity draft yet.
            </p>
          </Surface>
        ) : (
          <div className="mt-5 space-y-5">
            {workspace.opportunities.map((item) => (
              <Surface key={item.id} className="p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-gold text-xs font-semibold uppercase">
                      {readable(item.category)}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold">{item.title}</h3>
                    <p className="text-muted mt-2 text-sm">
                      Review: {readable(item.reviewStatus)} · Publication:{" "}
                      {readable(item.publicationStatus)}
                    </p>
                  </div>
                  {item.reviewNotes ? (
                    <span className="max-w-md text-sm text-amber-800">
                      Review note: {item.reviewNotes}
                    </span>
                  ) : null}
                </div>

                {workspace.provider.status === "approved" ? (
                  <details className="border-border mt-5 border-t pt-5">
                    <summary className="cursor-pointer text-sm font-semibold">
                      Edit listing
                    </summary>
                    <div className="mt-5">
                      <OpportunityForm
                        providerId={selected.providerId}
                        providerName={workspace.provider.organisationName}
                        item={item}
                      />
                    </div>
                  </details>
                ) : null}
              </Surface>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
