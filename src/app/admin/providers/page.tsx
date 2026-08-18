import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { requireAuthenticatedIdentity } from "@/modules/identity/infrastructure/identity-dal";
import {
  saveOpportunityProviderAdminAction,
  setOpportunityProviderMemberAdminAction,
  setOpportunityProviderStatusAdminAction,
} from "@/modules/opportunities/application/marketplace-actions";
import type {
  OpportunityProviderRole,
  OpportunityProviderStatus,
} from "@/modules/opportunities/domain/marketplace-contract";
import { opportunityProviderOrganisationTypes } from "@/modules/opportunities/domain/marketplace-contract";
import {
  getAdminProviderRegistry,
  type AdminProvider,
} from "@/modules/opportunities/infrastructure/marketplace-dal";

export const metadata: Metadata = {
  title: "Opportunity Providers | Mission Control",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const inputClass =
  "border-border bg-background text-foreground mt-2 min-h-11 w-full rounded-xl border px-3 py-2 text-sm";

function readable(value: string) {
  return value.replaceAll("_", " ");
}

function providerTransitions(status: OpportunityProviderStatus) {
  if (status === "pending") return ["approved", "revoked"] as const;
  if (status === "approved") return ["suspended", "revoked"] as const;
  if (status === "suspended") return ["approved", "revoked"] as const;
  return [] as const;
}

function ProviderForm({ provider }: { provider?: AdminProvider }) {
  return (
    <form
      action={saveOpportunityProviderAdminAction}
      className="grid gap-4 lg:grid-cols-2"
    >
      {provider ? (
        <input type="hidden" name="providerId" value={provider.id} />
      ) : null}
      <label className="text-sm font-semibold">
        Organisation name
        <input
          className={inputClass}
          name="organisationName"
          required
          maxLength={180}
          defaultValue={provider?.organisationName ?? ""}
        />
      </label>
      <label className="text-sm font-semibold">
        Organisation type
        <select
          className={inputClass}
          name="organisationType"
          required
          defaultValue={provider?.organisationType ?? "company"}
        >
          {opportunityProviderOrganisationTypes.map((type) => (
            <option key={type} value={type}>
              {readable(type)}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm font-semibold">
        Official HTTPS website
        <input
          className={inputClass}
          type="url"
          name="officialWebsite"
          required
          placeholder="https://organisation.org"
          defaultValue={provider?.officialWebsite ?? ""}
        />
      </label>
      <label className="text-sm font-semibold">
        Official domain
        <input
          className={inputClass}
          name="officialDomain"
          required
          placeholder="organisation.org"
          defaultValue={provider?.officialDomain ?? ""}
        />
      </label>
      <label className="text-sm font-semibold">
        Country code
        <input
          className={inputClass}
          name="countryCode"
          required
          minLength={2}
          maxLength={2}
          placeholder="NG"
          defaultValue={provider?.countryCode ?? ""}
        />
      </label>
      <label className="text-sm font-semibold lg:col-span-2">
        Public description
        <textarea
          className={inputClass}
          name="publicDescription"
          rows={4}
          required
          minLength={20}
          maxLength={1200}
          defaultValue={provider?.publicDescription ?? ""}
        />
      </label>
      <div className="lg:col-span-2">
        <Button type="submit">
          {provider ? "Save changes for re-review" : "Create provider record"}
        </Button>
      </div>
    </form>
  );
}

function MemberForm({
  providerId,
  username,
  role,
  active,
}: {
  providerId: string;
  username?: string | null;
  role?: OpportunityProviderRole;
  active?: boolean;
}) {
  return (
    <form
      action={setOpportunityProviderMemberAdminAction}
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
    >
      <input type="hidden" name="providerId" value={providerId} />
      <label className="min-w-0 flex-1 text-sm font-semibold">
        PipuPath username
        <input
          className={inputClass}
          name="username"
          required
          maxLength={60}
          defaultValue={username ?? ""}
          readOnly={Boolean(username)}
          placeholder="provider_operator"
        />
      </label>
      <label className="text-sm font-semibold">
        Role
        <select
          className={inputClass}
          name="role"
          defaultValue={role ?? "operator"}
        >
          <option value="owner">Owner</option>
          <option value="operator">Operator</option>
        </select>
      </label>
      <Button
        type="submit"
        name="action"
        value={active === false ? "revoke" : "activate"}
        variant={active === false ? "ghost" : "secondary"}
      >
        {active === false ? "Revoke" : username ? "Update member" : "Add member"}
      </Button>
    </form>
  );
}

export default async function AdminProvidersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAuthenticatedIdentity();
  const query = await searchParams;

  let registry;
  try {
    registry = await getAdminProviderRegistry();
  } catch (error) {
    if (error instanceof Error && error.message.includes("PLATFORM_ADMIN_REQUIRED")) {
      notFound();
    }
    redirect("/admin?error=provider_registry_unavailable");
  }

  return (
    <main
      id="main-content"
      className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14"
    >
      <section className="rounded-[2rem] bg-slate-950 px-6 py-10 text-white sm:px-10 sm:py-14">
        <p className="text-gold font-mono text-xs tracking-[0.2em] uppercase">
          Marketplace Trust Authority
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
          Opportunity Providers
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
          Approve provider identity separately from individual opportunity
          publication. A trusted provider can prepare supply, but every listing
          still passes independent PipuPath review before it reaches Builders.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href="/admin" variant="secondary">
            Back to Mission Control
          </ButtonLink>
          <ButtonLink href="/admin/opportunities" variant="ghost">
            Opportunity review queue
          </ButtonLink>
        </div>
      </section>

      {query.saved === "1" || query.status === "updated" || query.member === "updated" ? (
        <Surface className="mt-6 border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-900">
            Provider configuration updated.
          </p>
        </Surface>
      ) : null}
      {query.error ? (
        <Surface className="mt-6 border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-900">
            The requested provider change was rejected or could not be completed.
          </p>
        </Surface>
      ) : null}

      <Surface className="mt-8 p-6 sm:p-8">
        <p className="text-gold text-xs font-semibold tracking-wide uppercase">
          New provider
        </p>
        <h2 className="mt-3 text-2xl font-semibold">Create a trust record</h2>
        <p className="text-muted mt-3 max-w-4xl leading-7">
          Creating a provider does not approve it. New records start pending and
          cannot publish opportunities or receive Builder applications until a
          platform owner/operator approves the provider explicitly.
        </p>
        <div className="border-border mt-6 border-t pt-6">
          <ProviderForm />
        </div>
      </Surface>

      <section className="mt-10" aria-labelledby="provider-registry-heading">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-gold text-xs font-semibold tracking-wide uppercase">
              Provider registry
            </p>
            <h2 id="provider-registry-heading" className="mt-3 text-3xl font-semibold">
              {registry.providers.length} provider records
            </h2>
          </div>
          <p className="text-muted max-w-lg text-sm leading-6">
            Provider approval is a marketplace trust decision, not a PipuPath
            endorsement of every opportunity or a guarantee of Builder outcomes.
          </p>
        </div>

        {registry.providers.length === 0 ? (
          <Surface className="mt-6 p-8">
            <p className="text-muted">No provider record exists yet.</p>
          </Surface>
        ) : (
          <div className="mt-6 space-y-6">
            {registry.providers.map((provider) => {
              const transitions = providerTransitions(provider.status);
              return (
                <Surface key={provider.id} className="p-6 sm:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-gold text-xs font-semibold uppercase">
                        {readable(provider.organisationType)} · {provider.countryCode}
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold">
                        {provider.organisationName}
                      </h3>
                      <p className="text-muted mt-2 text-sm">
                        Status: {readable(provider.status)} · Domain:{" "}
                        {provider.officialDomain}
                      </p>
                      <Link
                        href={provider.officialWebsite}
                        className="text-gold mt-2 inline-block text-sm font-semibold"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open official website
                      </Link>
                    </div>
                    <span className="border-border rounded-full border px-3 py-1.5 text-xs font-semibold">
                      {readable(provider.status)}
                    </span>
                  </div>

                  <p className="text-muted mt-5 max-w-4xl leading-7">
                    {provider.publicDescription}
                  </p>

                  {provider.reviewNotes ? (
                    <Surface className="mt-5 border-amber-300 bg-amber-50 p-4">
                      <p className="text-sm text-amber-950">
                        Review note: {provider.reviewNotes}
                      </p>
                    </Surface>
                  ) : null}

                  {transitions.length ? (
                    <form
                      action={setOpportunityProviderStatusAdminAction}
                      className="border-border mt-6 grid gap-3 border-t pt-5 md:grid-cols-[180px_1fr_auto]"
                    >
                      <input type="hidden" name="providerId" value={provider.id} />
                      <label className="text-sm font-semibold">
                        Trust decision
                        <select
                          className={inputClass}
                          name="status"
                          required
                          defaultValue=""
                        >
                          <option value="" disabled>
                            Choose state
                          </option>
                          {transitions.map((status) => (
                            <option key={status} value={status}>
                              {readable(status)}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="text-sm font-semibold">
                        Review note
                        <input
                          className={inputClass}
                          name="reviewNotes"
                          maxLength={1200}
                          placeholder="Why this trust state is appropriate"
                        />
                      </label>
                      <div className="flex items-end">
                        <Button type="submit">Apply decision</Button>
                      </div>
                    </form>
                  ) : (
                    <p className="text-muted border-border mt-6 border-t pt-5 text-sm">
                      Revoked providers are terminal in Stage 20 and cannot be
                      silently reactivated.
                    </p>
                  )}

                  {provider.status !== "revoked" ? (
                    <details className="border-border mt-6 border-t pt-5">
                      <summary className="cursor-pointer text-sm font-semibold">
                        Edit provider identity
                      </summary>
                      <div className="mt-5">
                        <ProviderForm provider={provider} />
                      </div>
                    </details>
                  ) : null}

                  <div className="border-border mt-6 border-t pt-5">
                    <h4 className="font-semibold">Provider operators</h4>
                    <p className="text-muted mt-2 text-sm leading-6">
                      Operators must already have active adult PipuPath accounts
                      with no safeguarding review. Membership is scoped to this
                      provider only.
                    </p>
                    {provider.members.length ? (
                      <div className="mt-4 grid gap-3 lg:grid-cols-2">
                        {provider.members.map((member) => (
                          <div
                            key={member.userId}
                            className="border-border rounded-2xl border p-4"
                          >
                            <p className="font-semibold">
                              {member.displayName || member.username || "PipuPath operator"}
                            </p>
                            <p className="text-muted mt-1 text-sm">
                              {readable(member.role)} · {member.status}
                            </p>
                            {member.status === "active" && member.username ? (
                              <div className="mt-3">
                                <MemberForm
                                  providerId={provider.id}
                                  username={member.username}
                                  role={member.role}
                                  active={false}
                                />
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted mt-3 text-sm">No provider operator assigned.</p>
                    )}
                    {provider.status !== "revoked" ? (
                      <div className="mt-4">
                        <MemberForm providerId={provider.id} active />
                      </div>
                    ) : null}
                  </div>
                </Surface>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
