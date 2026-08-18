import Link from "next/link";
import { AppShell } from "@/components/shells/app-shell";
import {
  revokePassportAction,
  revokePassportShareAction,
} from "@/modules/passport/application/passport-actions";
import { getBuilderPassportWorkspace } from "@/modules/passport/infrastructure/passport-dal";
import { PassportShareCreator } from "@/modules/passport/ui/passport-share-creator";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BuilderPassportPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const workspace = await getBuilderPassportWorkspace();
  const params = await searchParams;
  const currentPassport = workspace.passports.find(
    (passport) => passport.status === "issued",
  );
  const currentShares = currentPassport
    ? workspace.shares.filter(
        (share) => share.passportId === currentPassport.id,
      )
    : [];

  return (
    <AppShell>
      <main id="main-content" className="mx-auto max-w-6xl px-6 py-10 lg:py-14">
        <header className="flex flex-col gap-6 border-b pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-muted-foreground text-sm font-medium tracking-[0.18em] uppercase">
              Builder Passport
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">
              Portable proof, controlled by you.
            </h1>
            <p className="text-muted-foreground mt-4 max-w-3xl text-base leading-7">
              Issue an exact evidence snapshot, then create revocable, expiring
              shares for the people or organisations you choose. PipuPath does
              not turn your private development record into a public profile.
            </p>
          </div>
          <Link
            className="bg-foreground text-background inline-flex w-fit rounded-full px-5 py-3 text-sm font-medium"
            href="/passport/preview"
          >
            {currentPassport ? "Prepare a new version" : "Prepare Passport"}
          </Link>
        </header>

        {params.issued === "1" ? (
          <p className="mt-6 rounded-xl border p-4 text-sm font-medium">
            Passport issued. Review it below before creating a share.
          </p>
        ) : null}
        {params.revoked === "1" ? (
          <p className="mt-6 rounded-xl border p-4 text-sm font-medium">
            Passport revoked. Its active shares are no longer valid.
          </p>
        ) : null}
        {params.share_revoked === "1" ? (
          <p className="mt-6 rounded-xl border p-4 text-sm font-medium">
            Share revoked.
          </p>
        ) : null}
        {typeof params.error === "string" ? (
          <p className="mt-6 rounded-xl border p-4 text-sm font-medium">
            That Passport action could not be completed.
          </p>
        ) : null}

        {!workspace.adultEligible ? (
          <section className="mt-8 rounded-2xl border p-6">
            <h2 className="text-xl font-semibold">
              External Passport sharing is unavailable.
            </h2>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              Stage 21 external issuance is limited to eligible adults with no
              safeguarding review hold. This does not remove or change any
              private PipuPath development feature.
            </p>
          </section>
        ) : null}

        <section className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-muted-foreground text-sm font-medium tracking-[0.16em] uppercase">
                Current Passport
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                {currentPassport
                  ? `Version ${currentPassport.version}`
                  : "No issued Passport yet"}
              </h2>
            </div>
            {currentPassport ? (
              <form action={revokePassportAction}>
                <input
                  name="passportId"
                  type="hidden"
                  value={currentPassport.id}
                />
                <button
                  className="rounded-full border px-4 py-2 text-sm font-medium"
                  type="submit"
                >
                  Revoke current Passport
                </button>
              </form>
            ) : null}
          </div>

          {currentPassport ? (
            <div className="mt-5 rounded-2xl border p-6">
              <p className="text-muted-foreground text-sm">
                Issued {new Date(currentPassport.issuedAt).toLocaleString()}
              </p>
              <h3 className="mt-3 text-xl font-semibold">
                {currentPassport.displayName}
              </h3>
              {currentPassport.selectedPathName ? (
                <p className="text-muted-foreground mt-1">
                  {currentPassport.selectedPathName}
                </p>
              ) : null}
              {currentPassport.publicSummary ? (
                <p className="mt-4 max-w-3xl leading-7">
                  {currentPassport.publicSummary}
                </p>
              ) : null}
            </div>
          ) : (
            <div className="text-muted-foreground mt-5 rounded-2xl border p-6 text-sm">
              Prepare a Passport to choose the exact capability evidence you
              want to make portable.
            </div>
          )}
        </section>

        {currentPassport && workspace.adultEligible ? (
          <section className="mt-10 space-y-5 border-t pt-8">
            <div>
              <p className="text-muted-foreground text-sm font-medium tracking-[0.16em] uppercase">
                Shares
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                Create and revoke access
              </h2>
            </div>
            <PassportShareCreator passportId={currentPassport.id} />

            {currentShares.length > 0 ? (
              <div className="space-y-3">
                {currentShares.map((share) => (
                  <article className="rounded-2xl border p-5" key={share.id}>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="font-medium">
                          {share.label ?? "Passport share"}
                        </h3>
                        <p className="text-muted-foreground mt-1 text-sm">
                          {share.active
                            ? "Active"
                            : share.revokedAt
                              ? "Revoked"
                              : "Expired"}{" "}
                          · expires {new Date(share.expiresAt).toLocaleString()} ·{" "}
                          {share.accessCount} successful
                          {share.accessCount === 1 ? " access" : " accesses"}
                        </p>
                        {share.lastAccessedAt ? (
                          <p className="text-muted-foreground mt-1 text-xs">
                            Last opened{" "}
                            {new Date(share.lastAccessedAt).toLocaleString()}
                          </p>
                        ) : null}
                      </div>
                      {share.active ? (
                        <form action={revokePassportShareAction}>
                          <input
                            name="shareId"
                            type="hidden"
                            value={share.id}
                          />
                          <button
                            className="rounded-full border px-4 py-2 text-sm font-medium"
                            type="submit"
                          >
                            Revoke share
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                No shares have been created yet.
              </p>
            )}
          </section>
        ) : null}

        <section className="mt-10 border-t pt-8">
          <p className="text-muted-foreground text-sm font-medium tracking-[0.16em] uppercase">
            Version history
          </p>
          <div className="mt-4 space-y-3">
            {workspace.passports.length > 0 ? (
              workspace.passports.map((passport) => (
                <article className="rounded-2xl border p-5" key={passport.id}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="font-medium">
                      Passport v{passport.version}
                    </h3>
                    <span className="text-muted-foreground text-sm capitalize">
                      {passport.status}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Issued {new Date(passport.issuedAt).toLocaleString()}
                  </p>
                </article>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">
                No Passport history yet.
              </p>
            )}
          </div>
        </section>

        <footer className="text-muted-foreground mt-10 border-t pt-8 text-sm leading-6">
          A PipuPath Builder Passport is a Builder-selected evidence snapshot.
          It is not government identity, an academic credential, employment
          verification, or a public Builder directory.
        </footer>
      </main>
    </AppShell>
  );
}
