import { AppShell } from "@/components/shells/app-shell";
import { Button, ButtonLink } from "@/components/ui/button";
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
      <main
        id="main-content"
        className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10 lg:py-14"
      >
        <header className="border-border bg-panel relative overflow-hidden rounded-[2rem] border p-6 shadow-[0_24px_80px_-48px_rgba(79,124,255,0.75)] sm:p-8 lg:flex lg:items-end lg:justify-between lg:gap-8">
          <div
            aria-hidden="true"
            className="bg-primary/10 absolute -top-24 -right-16 size-72 rounded-full blur-3xl"
          />
          <div className="relative min-w-0">
            <p className="text-gold text-sm font-semibold tracking-[0.18em] uppercase">
              Builder Passport
            </p>
            <h1 className="text-navy mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Portable proof, controlled by you.
            </h1>
            <p className="text-muted mt-4 max-w-3xl text-base leading-7">
              Issue an exact evidence snapshot, then create revocable, expiring
              shares for the people or organisations you choose. PipuPath does
              not turn your private development record into a public profile.
            </p>
          </div>
          <ButtonLink
            className="relative mt-6 w-full touch-manipulation sm:w-auto lg:mt-0"
            variant="premium"
            href="/passport/preview"
          >
            {currentPassport ? "Prepare a new version" : "Prepare Passport"}
          </ButtonLink>
        </header>

        {params.issued === "1" ? (
          <p className="border-success/25 bg-success/5 text-success mt-6 rounded-xl border p-4 text-sm font-medium">
            Passport issued. Review it below before creating a share.
          </p>
        ) : null}
        {params.revoked === "1" ? (
          <p className="border-gold/25 bg-gold/5 text-gold mt-6 rounded-xl border p-4 text-sm font-medium">
            Passport revoked. Its active shares are no longer valid.
          </p>
        ) : null}
        {params.share_revoked === "1" ? (
          <p className="border-gold/25 bg-gold/5 text-gold mt-6 rounded-xl border p-4 text-sm font-medium">
            Share revoked.
          </p>
        ) : null}
        {typeof params.error === "string" ? (
          <p className="border-error/25 bg-error/5 text-error mt-6 rounded-xl border p-4 text-sm font-medium">
            That Passport action could not be completed.
          </p>
        ) : null}

        {!workspace.adultEligible ? (
          <section className="border-border bg-panel mt-8 rounded-2xl border p-6">
            <h2 className="text-navy text-xl font-semibold">
              External Passport sharing is unavailable.
            </h2>
            <p className="text-muted mt-2 text-sm leading-6">
              Stage 21 external issuance is limited to eligible adults with no
              safeguarding review hold. This does not remove or change any
              private PipuPath development feature.
            </p>
          </section>
        ) : null}

        <section className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-muted text-sm font-medium tracking-[0.16em] uppercase">
                Current Passport
              </p>
              <h2 className="text-navy mt-2 text-2xl font-semibold">
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
                <Button variant="secondary" type="submit">
                  Revoke current Passport
                </Button>
              </form>
            ) : null}
          </div>

          {currentPassport ? (
            <div className="border-border bg-panel mt-5 rounded-2xl border p-6">
              <p className="text-muted text-sm">
                Issued {new Date(currentPassport.issuedAt).toLocaleString()}
              </p>
              <h3 className="text-navy mt-3 text-xl font-semibold">
                {currentPassport.displayName}
              </h3>
              {currentPassport.selectedPathName ? (
                <p className="text-muted mt-1">
                  {currentPassport.selectedPathName}
                </p>
              ) : null}
              {currentPassport.publicSummary ? (
                <p className="text-navy mt-4 max-w-3xl leading-7">
                  {currentPassport.publicSummary}
                </p>
              ) : null}
            </div>
          ) : (
            <div className="border-border bg-panel text-muted mt-5 rounded-2xl border p-6 text-sm">
              Prepare a Passport to choose the exact capability evidence you
              want to make portable.
            </div>
          )}
        </section>

        {currentPassport && workspace.adultEligible ? (
          <section className="border-border mt-10 space-y-5 border-t pt-8">
            <div>
              <p className="text-muted text-sm font-medium tracking-[0.16em] uppercase">
                Shares
              </p>
              <h2 className="text-navy mt-2 text-2xl font-semibold">
                Create and revoke access
              </h2>
            </div>
            <PassportShareCreator passportId={currentPassport.id} />

            {currentShares.length > 0 ? (
              <div className="space-y-3">
                {currentShares.map((share) => (
                  <article
                    className="border-border bg-panel rounded-2xl border p-5"
                    key={share.id}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <h3 className="text-navy font-medium">
                          {share.label ?? "Passport share"}
                        </h3>
                        <p className="text-muted mt-1 text-sm">
                          {share.active
                            ? "Active"
                            : share.revokedAt
                              ? "Revoked"
                              : "Expired"}{" "}
                          · expires {new Date(share.expiresAt).toLocaleString()}{" "}
                          · {share.accessCount} successful
                          {share.accessCount === 1 ? " access" : " accesses"}
                        </p>
                        {share.lastAccessedAt ? (
                          <p className="text-muted mt-1 text-xs">
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
                          <Button variant="secondary" type="submit">
                            Revoke share
                          </Button>
                        </form>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-muted text-sm">
                No shares have been created yet.
              </p>
            )}
          </section>
        ) : null}

        <section className="border-border mt-10 border-t pt-8">
          <p className="text-muted text-sm font-medium tracking-[0.16em] uppercase">
            Version history
          </p>
          <div className="mt-4 space-y-3">
            {workspace.passports.length > 0 ? (
              workspace.passports.map((passport) => (
                <article
                  className="border-border bg-panel rounded-2xl border p-5"
                  key={passport.id}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-navy font-medium">
                      Passport v{passport.version}
                    </h3>
                    <span className="text-muted text-sm capitalize">
                      {passport.status}
                    </span>
                  </div>
                  <p className="text-muted mt-1 text-sm">
                    Issued {new Date(passport.issuedAt).toLocaleString()}
                  </p>
                </article>
              ))
            ) : (
              <p className="text-muted text-sm">No Passport history yet.</p>
            )}
          </div>
        </section>

        <footer className="border-border text-muted mt-10 border-t pt-8 text-sm leading-6">
          A PipuPath Builder Passport is a Builder-selected evidence snapshot.
          It is not government identity, an academic credential, employment
          verification, or a public Builder directory.
        </footer>
      </main>
    </AppShell>
  );
}
