import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { setSchoolBuilderNetworkSettingsAction } from "@/modules/builder-network/application/builder-network-actions";
import { getSchoolBuilderNetworkSettings } from "@/modules/builder-network/infrastructure/builder-network-dal";
import { getInstitutionWorkspaceState } from "@/modules/institution/infrastructure/institution-dal";

export const metadata: Metadata = {
  title: "School Builder Network",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function InstitutionBuilderNetworkPage({
  searchParams,
}: {
  searchParams: Promise<{ workspace?: string; status?: string }>;
}) {
  const query = await searchParams;
  const state = await getInstitutionWorkspaceState(query.workspace, 90);
  if (state.access === "unauthenticated") {
    redirect("/login?next=%2Finstitution%2Fnetwork");
  }
  if (state.access === "forbidden") notFound();

  const workspace = state.selected;
  const settings = await getSchoolBuilderNetworkSettings(workspace.workspaceId);
  const owner = settings.role === "owner";

  return (
    <main id="main-content" className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-10 text-white sm:px-10 sm:py-14">
        <div className="border-gold/20 absolute -top-24 -right-20 size-72 rounded-full border" />
        <div className="relative max-w-3xl">
          <p className="text-gold font-mono text-xs tracking-[0.2em] uppercase">
            School Builder Network
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            {workspace.organisationName}
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            Give eligible students a protected social layer for building,
            collaboration and peer support without opening unrestricted youth
            social networking.
          </p>
        </div>
      </section>

      {query.status === "updated" ? (
        <Surface className="mt-5 border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-900">
            School Builder Network settings updated.
          </p>
        </Surface>
      ) : query.status === "error" ? (
        <Surface className="mt-5 border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-900">
            That network policy change could not be completed safely.
          </p>
        </Surface>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {state.choices.map((choice) => (
          <Link
            key={choice.workspaceId}
            href={`/institution/network?workspace=${choice.workspaceId}`}
            aria-current={choice.workspaceId === workspace.workspaceId ? "page" : undefined}
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${
              choice.workspaceId === workspace.workspaceId
                ? "border-primary bg-primary text-white"
                : "border-border bg-white text-slate-700"
            }`}
          >
            {choice.organisationName}
          </Link>
        ))}
        <ButtonLink href={`/institution?workspace=${workspace.workspaceId}`} variant="ghost">
          Back to Institution
        </ButtonLink>
      </div>

      <Surface className="border-gold/25 bg-gold/5 mt-8 p-6 sm:p-8">
        <p className="text-gold text-xs font-semibold uppercase">Safety model</p>
        <p className="text-muted mt-3 max-w-4xl leading-7">
          Only students aged 13–17 with an active school cohort membership can
          enter the School Builder Network. Under-13 accounts remain excluded.
          Adult Builders are never mixed into the school social scope. Cross-school
          interaction works only when both participating schools deliberately
          enable it.
        </p>
      </Surface>

      <section className="mt-8 grid gap-5 lg:grid-cols-3">
        <Surface className="p-6">
          <p className="text-primary text-xs font-semibold uppercase">1 · Network</p>
          <h2 className="mt-2 text-xl font-semibold">Student Builder World</h2>
          <p className="text-muted mt-3 text-sm leading-6">
            Lets eligible students join the bounded feed, discover compatible
            school Builders, connect, comment and react to purposeful activity.
          </p>
          <p className="mt-4 text-sm font-semibold">
            Current: {settings.networkEnabled ? "Enabled" : "Disabled"}
          </p>
        </Surface>
        <Surface className="p-6">
          <p className="text-primary text-xs font-semibold uppercase">2 · Reach</p>
          <h2 className="mt-2 text-xl font-semibold">Cross-school Builders</h2>
          <p className="text-muted mt-3 text-sm leading-6">
            Allows students to discover and connect with eligible Builders from
            another participating school. Both schools must enable this setting.
          </p>
          <p className="mt-4 text-sm font-semibold">
            Current: {settings.crossSchoolEnabled ? "Enabled" : "Disabled"}
          </p>
        </Surface>
        <Surface className="p-6">
          <p className="text-primary text-xs font-semibold uppercase">3 · Contact</p>
          <h2 className="mt-2 text-xl font-semibold">Direct messages</h2>
          <p className="text-muted mt-3 text-sm leading-6">
            Enables private PipuPath messages only after an accepted Builder
            connection. Blocking, relationship removal or policy withdrawal
            immediately removes messaging authority.
          </p>
          <p className="mt-4 text-sm font-semibold">
            Current: {settings.directMessagesEnabled ? "Enabled" : "Disabled"}
          </p>
        </Surface>
      </section>

      <Surface className="mt-8 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-primary text-xs font-semibold uppercase">Policy control</p>
            <h2 className="mt-2 text-2xl font-semibold">Set the school boundary.</h2>
            <p className="text-muted mt-3 max-w-2xl leading-7">
              These are institutional permissions, not cosmetic settings. Turning
              the main network off withdraws active school participation. Private
              developmental evidence remains outside Builder World.
            </p>
          </div>
          <span className="border-border rounded-full border px-3 py-1.5 text-xs font-semibold capitalize">
            {settings.role}
          </span>
        </div>

        {owner ? (
          <form action={setSchoolBuilderNetworkSettingsAction} className="mt-6 grid gap-4">
            <input type="hidden" name="workspaceId" value={workspace.workspaceId} />
            <label className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4">
              <input type="checkbox" name="networkEnabled" defaultChecked={settings.networkEnabled} className="mt-1" />
              <span>
                <strong className="block">Enable School Builder Network</strong>
                <span className="text-muted mt-1 block text-sm leading-6">
                  Eligible students may opt into Builder World. If this is off,
                  cross-school interaction and direct messaging are also forced off.
                </span>
              </span>
            </label>
            <label className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4">
              <input type="checkbox" name="crossSchoolEnabled" defaultChecked={settings.crossSchoolEnabled} className="mt-1" />
              <span>
                <strong className="block">Allow cross-school Builder discovery</strong>
                <span className="text-muted mt-1 block text-sm leading-6">
                  Students can see compatible school Builders outside this school
                  only when the other school has independently enabled the same policy.
                </span>
              </span>
            </label>
            <label className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4">
              <input type="checkbox" name="directMessagesEnabled" defaultChecked={settings.directMessagesEnabled} className="mt-1" />
              <span>
                <strong className="block">Allow direct Builder messages</strong>
                <span className="text-muted mt-1 block text-sm leading-6">
                  Messaging still requires an accepted connection and all live
                  safeguarding, block and network-scope checks.
                </span>
              </span>
            </label>
            <Button type="submit" className="w-fit">Save network policy</Button>
          </form>
        ) : (
          <p className="text-muted mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6">
            You can view this policy, but only an Institution Workspace owner can
            change School Builder Network permissions.
          </p>
        )}
      </Surface>
    </main>
  );
}
