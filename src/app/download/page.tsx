import type { Metadata } from "next";

import { PublicShell } from "@/components/shells/public-shell";
import { Surface } from "@/components/ui/surface";

export const metadata: Metadata = {
  title: "Download PipuPath Lite | PipuPath",
  description:
    "Download the official lightweight PipuPath Android app and continue your Builder Path from your phone.",
};

const release = {
  version: "1.0.0",
  versionCode: 1,
  packageId: "ng.name.pipupath.lite",
  apk: "/downloads/PipuPath-Lite-1.0.0.apk",
} as const;

const installSteps = [
  ["Download", "Tap the button below to get the official PipuPath Lite APK."],
  [
    "Open the APK",
    "Open the downloaded file. Android may ask you to allow installation from your browser or Files app.",
  ],
  [
    "Install",
    "Approve the Android installation prompt. PipuPath Lite will appear in your app launcher.",
  ],
  [
    "Continue your path",
    "Open PipuPath Lite and sign in with the same PipuPath account you already use on the web.",
  ],
] as const;

export default function DownloadPipuPathLitePage() {
  return (
    <PublicShell>
      <main id="main-content">
        <section className="mx-auto grid min-h-[calc(100svh-5rem)] max-w-7xl gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-12">
          <div>
            <div className="border-primary/15 bg-primary-soft/55 text-primary inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold tracking-[0.12em] uppercase">
              <span className="bg-gold size-2 rounded-full" />
              Official Android Release
            </div>
            <h1 className="text-navy mt-6 max-w-4xl text-5xl leading-[1.02] font-semibold tracking-[-0.055em] text-balance sm:text-7xl">
              PipuPath, now in your app launcher.
            </h1>
            <p className="text-muted mt-7 max-w-2xl text-lg leading-8 sm:text-xl">
              PipuPath Lite gives you the same University for Human Potential in
              a lightweight Android app. Your account, Mission, Journey, Quests,
              Projects, Connect and Profile stay in sync with the web.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a
                href={release.apk}
                download
                className="bg-primary hover:bg-primary-light focus-visible:ring-primary inline-flex min-h-12 min-w-56 items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold text-white shadow-lg transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                Download PipuPath Lite
              </a>
              <a
                href="/login"
                className="border-border bg-panel text-navy hover:border-primary/30 hover:bg-primary-soft/35 focus-visible:ring-primary inline-flex min-h-12 items-center justify-center rounded-2xl border px-6 py-3 text-sm font-semibold transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                Continue on the web
              </a>
            </div>

            <div className="text-muted mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              <span>Version {release.version}</span>
              <span>•</span>
              <span>Official package</span>
              <span>•</span>
              <span>Same PipuPath account</span>
            </div>
          </div>

          <Surface className="overflow-hidden p-6 sm:p-8">
            <div className="flex items-start justify-between gap-5 border-b border-border pb-6">
              <div>
                <p className="text-primary text-xs font-semibold tracking-[0.14em] uppercase">
                  PipuPath Lite
                </p>
                <h2 className="text-navy mt-2 text-2xl font-semibold">
                  Lightweight Android delivery. Full PipuPath experience.
                </h2>
              </div>
              <span className="border-gold/35 bg-gold/10 text-gold shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold">
                v{release.version}
              </span>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                ["Package", release.packageId],
                ["Version code", String(release.versionCode)],
                ["Delivery", "Trusted Web Activity"],
                ["Updates", "Web-first + signed APK upgrades"],
              ].map(([label, value]) => (
                <div key={label} className="bg-soft rounded-2xl p-4">
                  <p className="text-muted text-xs font-semibold tracking-wide uppercase">
                    {label}
                  </p>
                  <p className="text-navy mt-2 break-words text-sm font-semibold">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </Surface>
        </section>

        <section className="border-border bg-soft border-y">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12">
            <p className="text-primary text-xs font-semibold tracking-[0.18em] uppercase">
              Install in four steps
            </p>
            <h2 className="text-navy mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
              From download to your Builder Path in minutes.
            </h2>
            <ol className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {installSteps.map(([title, description], index) => (
                <li key={title}>
                  <Surface className="h-full p-6">
                    <span className="bg-primary-soft text-primary grid size-10 place-items-center rounded-2xl font-mono text-sm font-bold">
                      {index + 1}
                    </span>
                    <h3 className="text-navy mt-5 text-lg font-semibold">
                      {title}
                    </h3>
                    <p className="text-muted mt-3 text-sm leading-6">
                      {description}
                    </p>
                  </Surface>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12">
          <div className="bg-navy overflow-hidden rounded-[2rem] px-6 py-10 text-white sm:px-10">
            <p className="text-gold text-xs font-semibold tracking-[0.18em] uppercase">
              How updates work
            </p>
            <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
              Most PipuPath improvements arrive without another APK download.
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300">
              PipuPath Lite uses the live PipuPath product, so normal product and
              content improvements arrive through the web automatically. When
              the Android wrapper itself changes, download the newest official
              APK here. Because every production release uses the same package
              and permanent signing identity, Android can install it as an
              upgrade over your existing PipuPath Lite app.
            </p>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
