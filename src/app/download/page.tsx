import type { Metadata } from "next";

import { PublicShell } from "@/components/shells/public-shell";
import { ButtonLink } from "@/components/ui/button";
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
  ["Download", "Get the official PipuPath Lite APK from this page."],
  [
    "Open the APK",
    "Open the downloaded file and allow installation from your browser or Files app if Android asks.",
  ],
  [
    "Install",
    "Approve the Android installation prompt. PipuPath Lite will appear in your app launcher.",
  ],
  [
    "Continue your path",
    "Sign in with the same PipuPath account you already use on the web.",
  ],
] as const;

export default function DownloadPipuPathLitePage() {
  return (
    <PublicShell>
      <main id="main-content">
        <section className="mx-auto grid min-h-[calc(100svh-5rem)] max-w-7xl gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:px-12">
          <div>
            <div className="border-primary/15 bg-primary-soft/55 text-primary inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold tracking-[0.12em] uppercase">
              <span className="bg-gold size-2 rounded-full" />
              Official Android Release
            </div>
            <h1 className="text-navy mt-6 max-w-4xl text-5xl leading-[1.02] font-semibold tracking-[-0.055em] text-balance sm:text-7xl lg:text-[5.35rem]">
              PipuPath, now in your app launcher.
            </h1>
            <p className="text-muted mt-7 max-w-2xl text-lg leading-8 sm:text-xl">
              PipuPath Lite gives you the same University for Human Potential in
              a lightweight Android app. Your account, Mission, Journey, Quests,
              Projects, Connect and Profile stay in sync with the web.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href={release.apk} download className="min-w-44">
                Download PipuPath Lite
              </ButtonLink>
              <ButtonLink
                href="/login"
                variant="secondary"
                className="min-w-32"
              >
                Continue on the web
              </ButtonLink>
            </div>
            <div className="text-muted mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm">
              <span className="inline-flex items-center gap-2">
                Version {release.version}
              </span>
              <span className="inline-flex items-center gap-2">
                Official package
              </span>
              <span className="inline-flex items-center gap-2">
                Same PipuPath account
              </span>
            </div>
          </div>

          <Surface className="h-full p-6">
            <p className="text-primary text-sm font-semibold">PipuPath Lite</p>
            <h2 className="text-navy mt-2 text-2xl font-semibold">
              Lightweight Android delivery. Full PipuPath experience.
            </h2>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <ReleaseFact label="Package" value={release.packageId} />
              <ReleaseFact
                label="Version code"
                value={String(release.versionCode)}
              />
              <ReleaseFact label="Delivery" value="Trusted Web Activity" />
              <ReleaseFact
                label="Updates"
                value="Web-first + signed APK upgrades"
              />
            </div>
          </Surface>
        </section>

        <section className="border-border bg-soft border-y">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12">
            <p className="text-primary text-sm font-semibold">
              Install in four steps
            </p>
            <h2 className="text-navy mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              From download to your Builder Path.
            </h2>
            <ol className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {installSteps.map(([title, description], index) => (
                <li key={title}>
                  <Surface className="h-full p-6">
                    <span className="bg-primary-soft text-primary grid size-10 place-items-center rounded-2xl font-mono text-sm font-bold">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-navy mt-5 text-xl font-semibold">
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

        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12">
          <Surface className="p-6">
            <p className="text-primary text-sm font-semibold">
              How updates work
            </p>
            <h2 className="text-navy mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Most PipuPath improvements arrive without another APK download.
            </h2>
            <p className="text-muted mt-5 max-w-3xl text-base leading-7">
              PipuPath Lite uses the live PipuPath product, so normal product and
              content improvements arrive through the web automatically. When
              the Android wrapper itself changes, download the newest official
              APK here. The permanent package and signing identity allow Android
              to install it as an upgrade over your existing PipuPath Lite app.
            </p>
          </Surface>
        </section>
      </main>
    </PublicShell>
  );
}

function ReleaseFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted text-xs font-semibold uppercase">{label}</p>
      <p className="text-navy mt-2 break-words text-sm font-semibold">{value}</p>
    </div>
  );
}
