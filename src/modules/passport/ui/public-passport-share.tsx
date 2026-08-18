"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { PublicBuilderPassport } from "../domain/passport-contract";

type ResolutionState =
  | { status: "loading" }
  | { status: "unavailable" }
  | { status: "ready"; passport: PublicBuilderPassport };

export function PublicPassportShare({ shareId }: { shareId: string }) {
  const [state, setState] = useState<ResolutionState>({ status: "loading" });

  useEffect(() => {
    let active = true;

    async function resolve() {
      const fragment = window.location.hash.startsWith("#")
        ? window.location.hash.slice(1)
        : "";

      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.search}`,
      );

      if (!fragment) {
        if (active) setState({ status: "unavailable" });
        return;
      }

      try {
        const response = await fetch(`/api/passport/v1/shares/${shareId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${fragment}`,
          },
          cache: "no-store",
        });
        if (!response.ok) {
          if (active) setState({ status: "unavailable" });
          return;
        }
        const passport = (await response.json()) as PublicBuilderPassport;
        if (active) setState({ status: "ready", passport });
      } catch {
        if (active) setState({ status: "unavailable" });
      }
    }

    void resolve();
    return () => {
      active = false;
    };
  }, [shareId]);

  if (state.status === "loading") {
    return (
      <main className="mx-auto min-h-screen max-w-4xl px-6 py-16">
        <p className="text-sm text-muted-foreground">Verifying this Passport…</p>
      </main>
    );
  }

  if (state.status === "unavailable") {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Builder Passport
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          This Passport share is not available.
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          The share may be invalid, expired, revoked, or replaced by the Builder.
          PipuPath does not reveal which condition applies.
        </p>
        <Link className="mt-8 inline-flex underline underline-offset-4" href="/">
          Learn about PipuPath
        </Link>
      </main>
    );
  }

  const { passport } = state;
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-14">
      <header className="border-b pb-8">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
          PipuPath Builder Passport · v{passport.version}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          {passport.builder.displayName}
        </h1>
        {passport.builder.selectedPathName ? (
          <p className="mt-2 text-lg text-muted-foreground">
            {passport.builder.selectedPathName}
          </p>
        ) : null}
        {passport.builder.publicSummary ? (
          <p className="mt-5 max-w-3xl text-base leading-7">
            {passport.builder.publicSummary}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span>Issued {new Date(passport.issuedAt).toLocaleDateString()}</span>
          <span>·</span>
          <span>
            Share expires {new Date(passport.share.expiresAt).toLocaleDateString()}
          </span>
        </div>
      </header>

      <section className="py-8">
        <div className="rounded-2xl border p-5">
          <p className="text-sm font-medium">
            Integrity: {passport.integrity.state === "current" ? "Current" : "Changed"}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Checked {new Date(passport.integrity.checkedAt).toLocaleString()}.
          </p>
          {passport.integrity.notices.length > 0 ? (
            <ul className="mt-4 list-disc space-y-1 pl-5 text-sm">
              {passport.integrity.notices.map((notice) => (
                <li key={notice}>{notice}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      <section className="border-t py-8">
        <h2 className="text-2xl font-semibold">Capabilities</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {passport.capabilities.map((capability) => (
            <article className="rounded-2xl border p-5" key={capability.capabilityKey}>
              <h3 className="font-medium">{capability.capabilityLabel}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {capability.capabilityLevel.replaceAll("_", " ")}
              </p>
            </article>
          ))}
        </div>
      </section>

      {passport.evidence.length > 0 ? (
        <section className="border-t py-8">
          <h2 className="text-2xl font-semibold">Selected evidence</h2>
          <div className="mt-5 space-y-4">
            {passport.evidence.map((item, index) => (
              <article className="rounded-2xl border p-5" key={`${item.capabilityKey}-${index}`}>
                <p className="text-sm text-muted-foreground">
                  {item.sourceType.replaceAll("_", " ")} · {item.verification.replaceAll("_", " ")}
                </p>
                <h3 className="mt-1 font-medium">{item.sourceTitle}</h3>
                <p className="mt-2 text-sm leading-6">{item.evidenceSummary}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {passport.institutionVerifications.length > 0 ? (
        <section className="border-t py-8">
          <h2 className="text-2xl font-semibold">Institution confirmations</h2>
          <div className="mt-5 space-y-4">
            {passport.institutionVerifications.map((item, index) => (
              <article className="rounded-2xl border p-5" key={`${item.institutionName}-${index}`}>
                <h3 className="font-medium">{item.capabilityLabel}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.institutionName} · {item.current ? "currently confirmed" : "confirmation changed"}
                </p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {passport.portfolioProofs.length > 0 ? (
        <section className="border-t py-8">
          <h2 className="text-2xl font-semibold">Portfolio proofs</h2>
          <div className="mt-5 space-y-4">
            {passport.portfolioProofs.map((proof) => (
              <article className="rounded-2xl border p-5" key={proof.slug}>
                <h3 className="font-medium">{proof.publicTitle}</h3>
                <p className="mt-2 text-sm leading-6">{proof.publicSummary}</p>
                {proof.current && proof.proofHref ? (
                  <Link className="mt-3 inline-flex underline underline-offset-4" href={proof.proofHref}>
                    View current public proof
                  </Link>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">
                    This public proof is no longer currently published.
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <footer className="border-t py-8 text-sm text-muted-foreground">
        This is a Builder-selected PipuPath evidence snapshot. It is not government
        identity, an academic credential, employment verification, or a public
        Builder directory.
      </footer>
    </main>
  );
}
