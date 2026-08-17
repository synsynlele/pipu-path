import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import {
  reviewOpportunityAdminAction,
  saveOpportunityAdminAction,
  setOpportunityPublicationAdminAction,
} from "@/modules/opportunities/application/opportunity-actions";
import {
  opportunityCategories,
  type OpportunityAdminState,
} from "@/modules/opportunities/domain/opportunity-contract";
import { getOpportunityAdminWorkspace } from "@/modules/opportunities/infrastructure/opportunity-dal";

export const metadata: Metadata = {
  title: "Opportunity Supply | Mission Control",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type AdminOpportunity = OpportunityAdminState["items"][number];

const inputClass =
  "border-border bg-background text-foreground mt-2 min-h-11 w-full rounded-xl border px-3 py-2 text-sm";

function readable(value: string) {
  return value.replaceAll("_", " ");
}

function OpportunityForm({ item }: { item?: AdminOpportunity }) {
  return (
    <form action={saveOpportunityAdminAction} className="grid gap-4 lg:grid-cols-2">
      {item ? <input type="hidden" name="id" value={item.id} /> : null}
      <label className="text-sm font-semibold">
        Title
        <input className={inputClass} name="title" required defaultValue={item?.title ?? ""} />
      </label>
      <label className="text-sm font-semibold">
        Provider
        <input
          className={inputClass}
          name="providerName"
          required
          defaultValue={item?.providerName ?? ""}
        />
      </label>
      <label className="text-sm font-semibold">
        Category
        <select className={inputClass} name="category" required defaultValue={item?.category ?? "challenge"}>
          {opportunityCategories.map((category) => (
            <option key={category} value={category}>
              {readable(category)}
            </option>
          ))}
        </select>
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
        What the opportunity offers
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
          required
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
          required
          defaultValue={item?.deliveryMode ?? "unspecified"}
        >
          <option value="unspecified">Unspecified</option>
          <option value="in_person">In person</option>
          <option value="remote">Remote</option>
          <option value="hybrid">Hybrid</option>
        </select>
      </label>
      <label className="text-sm font-semibold">
        Geography label
        <input
          className={inputClass}
          name="geographyLabel"
          required
          placeholder="Global, Nigeria, Lagos State…"
          defaultValue={item?.geographyLabel ?? "Global"}
        />
      </label>
      <label className="text-sm font-semibold">
        Country codes
        <input
          className={inputClass}
          name="countryCodes"
          placeholder="NG, GH — leave blank for global"
          defaultValue={item?.countryCodes.join(", ") ?? ""}
        />
      </label>
      <label className="text-sm font-semibold lg:col-span-2">
        Official HTTPS URL
        <input
          className={inputClass}
          type="url"
          name="officialUrl"
          required
          placeholder="https://…"
          defaultValue={item?.officialUrl ?? ""}
        />
      </label>
      <label className="text-sm font-semibold">
        Pathway tags
        <input
          className={inputClass}
          name="pathwayTags"
          placeholder="design, software, community"
          defaultValue={item?.pathwayTags.join(", ") ?? ""}
        />
      </label>
      <label className="text-sm font-semibold">
        Capability tags
        <input
          className={inputClass}
          name="capabilityTags"
          placeholder="communication, research"
          defaultValue={item?.capabilityTags.join(", ") ?? ""}
        />
      </label>
      <div className="lg:col-span-2">
        <Button type="submit">{item ? "Save changes for re-review" : "Create draft opportunity"}</Button>
      </div>
    </form>
  );
}

export default async function AdminOpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  let workspace: OpportunityAdminState;
  try {
    workspace = await getOpportunityAdminWorkspace();
  } catch {
    notFound();
  }
  const canEdit = workspace.role === "owner" || workspace.role === "operator";
  const error = typeof params.error === "string" ? params.error : null;

  return (
    <main id="main-content" className="mx-auto max-w-7xl px-5 py-10 text-slate-100 sm:px-8 lg:px-10">
      <section className="rounded-[2rem] border border-white/10 bg-[#061027] p-6 sm:p-9">
        <p className="text-xs font-semibold tracking-[0.16em] text-amber-300 uppercase">
          Mission Control · Opportunity Supply
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Curate real-world opportunities without opening an unvetted marketplace.</h1>
        <p className="mt-4 max-w-4xl leading-7 text-slate-300">
          Role: {workspace.role}. Review and publication are separate. Editing a reviewed item resets it to draft so changed eligibility, deadlines or URLs must be deliberately reviewed again.
        </p>
      </section>

      {error ? (
        <Surface className="mt-6 border-amber-500/40 p-5" role="alert">
          <p className="font-semibold">The opportunity operation did not finish.</p>
          <p className="text-muted mt-2 text-sm">Error code: {error.replaceAll("_", " ")}</p>
        </Surface>
      ) : null}

      {canEdit ? (
        <Surface className="mt-8 p-6 sm:p-8">
          <h2 className="text-navy text-2xl font-semibold">Create vetted supply candidate</h2>
          <p className="text-muted mt-2 text-sm leading-6">
            Creation produces a draft pending review. Publishing is impossible until an owner/operator explicitly approves it.
          </p>
          <div className="mt-6"><OpportunityForm /></div>
        </Surface>
      ) : (
        <Surface className="mt-8 p-6">
          <p className="font-semibold">Read-only opportunity access</p>
          <p className="text-muted mt-2 text-sm">Moderator and analyst roles can inspect supply but cannot create, review, publish or withdraw it in Stage 18.</p>
        </Surface>
      )}

      <section className="mt-10" aria-labelledby="supply-heading">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-amber-300 uppercase">Supply registry</p>
            <h2 id="supply-heading" className="mt-2 text-3xl font-semibold">{workspace.items.length} opportunities</h2>
          </div>
          <p className="max-w-lg text-sm leading-6 text-slate-400">Published items appear to Builders only while approved and not past deadline. Private Builder matching data never appears here.</p>
        </div>

        <div className="mt-6 grid gap-5">
          {workspace.items.map((item) => (
            <Surface key={item.id} className="p-6 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-primary text-xs font-semibold uppercase">{readable(item.category)} · {item.providerName}</p>
                  <h3 className="text-navy mt-2 text-2xl font-semibold">{item.title}</h3>
                  <p className="text-muted mt-2 max-w-4xl text-sm leading-6">{item.summary}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="border-border rounded-full border px-3 py-1.5">Review: {item.reviewStatus}</span>
                  <span className="border-border rounded-full border px-3 py-1.5">Publication: {item.publicationStatus}</span>
                </div>
              </div>

              <div className="mt-5 grid gap-3 text-sm md:grid-cols-3">
                <p><strong>Geography:</strong> <span className="text-muted">{item.geographyLabel}</span></p>
                <p><strong>Deadline:</strong> <span className="text-muted">{item.deadlineDate ?? "None published"}</span></p>
                <p><strong>URL:</strong> <span className="text-muted break-all">{item.officialUrl}</span></p>
              </div>

              {canEdit ? (
                <div className="border-border mt-6 grid gap-5 border-t pt-6 lg:grid-cols-2">
                  <div>
                    <h4 className="font-semibold">Review / publication</h4>
                    <form action={reviewOpportunityAdminAction} className="mt-3 grid gap-3">
                      <input type="hidden" name="opportunityId" value={item.id} />
                      <textarea
                        className={inputClass}
                        name="reviewNotes"
                        maxLength={1000}
                        rows={2}
                        placeholder="Optional internal review note"
                        defaultValue={item.reviewNotes ?? ""}
                      />
                      <div className="flex flex-wrap gap-2">
                        <Button type="submit" name="decision" value="approve">Approve review</Button>
                        <Button type="submit" name="decision" value="reject" variant="ghost">Reject review</Button>
                      </div>
                    </form>
                    <form action={setOpportunityPublicationAdminAction} className="mt-3 flex flex-wrap gap-2">
                      <input type="hidden" name="opportunityId" value={item.id} />
                      {item.publicationStatus !== "published" ? (
                        <Button type="submit" name="publicationAction" value="publish" variant="secondary">Publish approved item</Button>
                      ) : (
                        <Button type="submit" name="publicationAction" value="withdraw" variant="ghost">Withdraw publication</Button>
                      )}
                    </form>
                  </div>
                  <details className="border-border rounded-2xl border p-4">
                    <summary className="cursor-pointer font-semibold">Edit item — resets review</summary>
                    <div className="mt-5"><OpportunityForm item={item} /></div>
                  </details>
                </div>
              ) : null}
            </Surface>
          ))}
          {workspace.items.length === 0 ? (
            <Surface className="p-8"><p className="font-semibold">No opportunity supply has been created yet.</p></Surface>
          ) : null}
        </div>
      </section>
    </main>
  );
}
