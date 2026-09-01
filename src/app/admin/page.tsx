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
const retentionDisclosure =
  "Feature telemetry begins with Stage 14. Day-7 and Day-30 retention require cohort-age history that was not captured retroactively. Historical funnel counts can be reconstructed from durable product state, but PipuPath will not pretend it has historical feature-retention data that was never captured.";

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
      className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8"
    >
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,#061027_0%,#0b1f47_58%,#173c82_100%)] px-5 py-8 text-white shadow-[0_28px_80px_-50px_rgba(79,124,255,0.85)] sm:px-8 sm:py-11">
        <div className="absolute -top-28 -right-16 size-72 rounded-full border border-white/10" />
        <div className="relative max-w-4xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold tracking-[0.18em] text-[#e5c96f] uppercase">
              PipuPath Mission Control
            </p>
            <span className="rounded-full border border-white/12 bg-white/7 px-3 py-1.5 text-xs font-semibold text-blue-100">
              Admin role: {state.role}
            </span>
          </div>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-5xl">
            Measure whether PipuPath is creating Builders, not screen time.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-blue-100/78 sm:text-base">
            Aggregate product intelligence only. Private Discovery answers,
            Human Potential Profile prose, reflections, evidence and contact
            details are not part of this dashboard.
          </p>
        </div>
      </section>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-muted text-xs font-semibold tracking-[0.12em] uppercase">
            Observation window
          </p>
          <p className="text-navy mt-1 text-sm font-semibold">
            Separate signal from noise before making product decisions.
          </p>
        </div>
        <nav aria-label="Analytics observation window" className="flex gap-2">
          {windows.map((days) => (
            <Link
              key={days}
              href={`/admin?window=${days}`}
              aria-current={days === windowDays ? "page" : undefined}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                days === windowDays
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-panel text-muted hover:border-primary/35 hover:text-white"
              }`}
            >
              {days} days
            </Link>
          ))}
        </nav>
      </div>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
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

      <section className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <Surface className="p-5 sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
                Developmental funnel
              </p>
              <h2 className="text-navy mt-2 text-2xl font-semibold tracking-tight">
                Where Builders currently reach
              </h2>
            </div>
            <span className="text-muted text-xs">All-time truthful state</span>
          </div>
          <ol className="mt-6 space-y-4">
            {funnel.map(([label, value]) => {
              const share = percentage(value, snapshot.funnel.joined);
              return (
                <li key={label}>
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-navy font-semibold">{label}</span>
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

        <Surface className="p-5 sm:p-7">
          <p className="text-gold text-xs font-semibold tracking-[0.16em] uppercase">
            Measurement rule
          </p>
          <h2 className="text-navy mt-2 text-2xl font-semibold tracking-tight">
            Data before feature opinion.
          </h2>
          <p className="text-muted mt-4 leading-7">{retentionDisclosure}</p>
          <div className="border-gold/25 bg-gold/5 mt-6 rounded-2xl border p-5">
            <p className="text-navy text-sm font-semibold">
              Current decision signal
            </p>
            <p className="text-muted mt-2 text-sm leading-6">
              Compare distinct Builders and repeat Builders by feature. Future
              retention experiments should promote only the behaviours that
              correlate with real developmental progress.
            </p>
          </div>
        </Surface>
      </section>

      <Surface className="mt-6 p-5 sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
              Feature intelligence
            </p>
            <h2 className="text-navy mt-2 text-2xl font-semibold tracking-tight">
              Which surfaces are earning useful repeat use?
            </h2>
          </div>
          <span className="text-muted text-xs">Last {windowDays} days</span>
        </div>

        {featureUsage.length ? (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-border text-muted border-b">
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
                    <td className="text-navy py-4 pr-4 font-semibold capitalize">
                      {row.featureKey.replaceAll("_", " ")}
                    </td>
                    <td className="text-muted px-4 py-4">
                      {number(row.views)}
                    </td>
                    <td className="text-muted px-4 py-4">
                      {number(row.builders)}
                    </td>
                    <td className="text-muted px-4 py-4">
                      {number(row.repeatBuilders)}
                    </td>
                    <td className="text-navy py-4 pl-4 font-semibold">
                      {percentage(row.repeatBuilders, row.builders)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border-border mt-6 rounded-2xl border border-dashed p-6">
            <p className="text-navy font-semibold">
              Feature telemetry has not accumulated enough signal yet.
            </p>
            <p className="text-muted mt-2 text-sm leading-6">
              This table populates as authenticated Builders use PipuPath. Stage
              23 groups that experience into Home, Discover, Build, Connect and
              Profile while preserving the deeper product events underneath.
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
