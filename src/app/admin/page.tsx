import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Surface } from "@/components/ui/surface";
import { getAdminDashboardState } from "@/modules/admin/infrastructure/admin-dal";

export const metadata: Metadata = {
  title: "PipuPath Mission Control",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const windows = [7, 30, 90] as const;

function number(value: number) {
  return new Intl.NumberFormat("en").format(value);
}

function percentage(part: number, whole: number) {
  if (whole <= 0) return 0;
  return Math.min(100, Math.round((part / whole) * 100));
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ window?: string }>;
}) {
  const query = await searchParams;
  const requested = Number(query.window ?? 30);
  const windowDays = windows.includes(requested as (typeof windows)[number])
    ? requested
    : 30;
  const state = await getAdminDashboardState(windowDays);

  if (state.access === "unauthenticated") {
    redirect(
      `/login?next=${encodeURIComponent(`/admin?window=${windowDays}`)}`,
    );
  }
  if (state.access === "forbidden") notFound();

  const { snapshot, featureUsage } = state;
  const repeatRate = percentage(
    snapshot.totals.repeatBuilders,
    snapshot.totals.windowActiveBuilders,
  );
  const funnel = [
    ["Joined", snapshot.funnel.joined],
    ["Discovery completed", snapshot.funnel.discoveryCompleted],
    ["Human Potential Profile", snapshot.funnel.profileReady],
    ["Path selected", snapshot.funnel.pathSelected],
    ["Mission started", snapshot.funnel.missionStarted],
    ["Journey started", snapshot.funnel.journeyStarted],
    ["Quest completed", snapshot.funnel.questCompleted],
    ["Project started", snapshot.funnel.projectStarted],
    ["Project completed", snapshot.funnel.projectCompleted],
    ["Connected", snapshot.funnel.connected],
  ] as const;

  return (
    <main
      id="main-content"
      className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14"
    >
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-10 text-white sm:px-10 sm:py-14">
        <div className="absolute -top-28 -right-16 size-72 rounded-full border border-white/10" />
        <div className="relative max-w-4xl">
          <p className="text-gold font-mono text-xs tracking-[0.2em] uppercase">
            PipuPath Mission Control
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
            Measure what makes Builders return and build.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
            Aggregate product intelligence only. Private Discovery answers,
            Human Potential Profile prose, reflections, evidence and contact
            details are not part of this dashboard.
          </p>
          <p className="mt-5 text-sm font-semibold text-slate-400">
            Admin role: {state.role}
          </p>
        </div>
      </section>

      <nav
        aria-label="Analytics observation window"
        className="mt-6 flex flex-wrap gap-2"
      >
        {windows.map((days) => (
          <Link
            key={days}
            href={`/admin?window=${days}`}
            aria-current={days === windowDays ? "page" : undefined}
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${
              days === windowDays
                ? "border-primary bg-primary text-white"
                : "border-border bg-white text-slate-700"
            }`}
          >
            {days} days
          </Link>
        ))}
      </nav>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <Metric
          label="Total Builders"
          value={snapshot.totals.builders}
          detail="All non-deleted accounts"
        />
        <Metric
          label="New Builders"
          value={snapshot.totals.newBuilders}
          detail={`Created in ${windowDays} days`}
        />
        <Metric
          label="Weekly Active"
          value={snapshot.totals.weeklyActiveBuilders}
          detail="Private product telemetry"
        />
        <Metric
          label="Monthly Active"
          value={snapshot.totals.monthlyActiveBuilders}
          detail="Private product telemetry"
        />
        <Metric
          label="Repeat Builders"
          value={snapshot.totals.repeatBuilders}
          detail={`${repeatRate}% of active Builders used PipuPath on 2+ days`}
        />
        <Metric
          label="Progress Events"
          value={snapshot.totals.builderProgressEvents}
          detail="Completed HQLS Quests with evidence + reflection"
        />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Surface className="p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
                Developmental funnel
              </p>
              <h2 className="text-navy mt-3 text-3xl font-semibold tracking-tight">
                Where Builders currently reach
              </h2>
            </div>
            <span className="text-muted text-sm">All-time truthful state</span>
          </div>
          <ol className="mt-7 space-y-5">
            {funnel.map(([label, value]) => {
              const share = percentage(value, snapshot.funnel.joined);
              return (
                <li key={label}>
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="font-semibold text-slate-800">
                      {label}
                    </span>
                    <span className="text-muted">
                      {number(value)} · {share}%
                    </span>
                  </div>
                  <div className="bg-soft-blue mt-2 h-2 overflow-hidden rounded-full">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{ width: `${share}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ol>
        </Surface>

        <Surface className="p-6 sm:p-8">
          <p className="text-gold text-xs font-semibold tracking-[0.16em] uppercase">
            Measurement rule
          </p>
          <h2 className="text-navy mt-3 text-3xl font-semibold tracking-tight">
            Data before feature opinion.
          </h2>
          <p className="text-muted mt-4 leading-7">
            Feature telemetry begins with Stage 14. Historical funnel counts can
            be reconstructed from durable product state, but PipuPath will not
            pretend it has historical feature-retention data that was never
            captured.
          </p>
          <div className="border-gold/25 bg-gold/5 mt-6 rounded-2xl border p-5">
            <p className="text-sm font-semibold text-slate-800">
              Current decision signal
            </p>
            <p className="text-muted mt-2 text-sm leading-6">
              Compare distinct Builders and repeat Builders by feature. Later
              Retention Experiment stages can promote this into cohort-based
              Day-7 and Day-30 retention once enough observation time exists.
            </p>
          </div>
        </Surface>
      </section>

      <Surface className="mt-8 p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
              Feature intelligence
            </p>
            <h2 className="text-navy mt-3 text-3xl font-semibold tracking-tight">
              Which surfaces are earning repeat use?
            </h2>
          </div>
          <span className="text-muted text-sm">Last {windowDays} days</span>
        </div>

        {featureUsage.length ? (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-border border-b text-slate-500">
                  <th className="py-3 pr-4 font-semibold">Feature</th>
                  <th className="px-4 py-3 font-semibold">Views</th>
                  <th className="px-4 py-3 font-semibold">Builders</th>
                  <th className="px-4 py-3 font-semibold">Repeat Builders</th>
                  <th className="py-3 pl-4 font-semibold">Repeat rate</th>
                </tr>
              </thead>
              <tbody>
                {featureUsage.map((row) => (
                  <tr
                    key={row.featureKey}
                    className="border-border border-b last:border-0"
                  >
                    <td className="py-4 pr-4 font-semibold text-slate-900 capitalize">
                      {row.featureKey.replaceAll("_", " ")}
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      {number(row.views)}
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      {number(row.builders)}
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      {number(row.repeatBuilders)}
                    </td>
                    <td className="py-4 pl-4 font-semibold text-slate-900">
                      {percentage(row.repeatBuilders, row.builders)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border-border mt-6 rounded-2xl border border-dashed p-6">
            <p className="font-semibold text-slate-800">
              Stage 14 feature telemetry has not accumulated yet.
            </p>
            <p className="text-muted mt-2 text-sm leading-6">
              This table will populate as authenticated Builders use the
              instrumented Home, Profile, Journey, Build, Portfolio and Connect
              surfaces after Stage 14 is deployed.
            </p>
          </div>
        )}
      </Surface>
    </main>
  );
}

function Metric({
  label,
  value,
  detail,
}: {
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <Surface className="p-5">
      <p className="text-primary text-xs font-semibold tracking-[0.14em] uppercase">
        {label}
      </p>
      <p className="text-navy mt-3 text-3xl font-semibold tracking-tight">
        {number(value)}
      </p>
      <p className="text-muted mt-2 text-xs leading-5">{detail}</p>
    </Surface>
  );
}
