import Link from "next/link";
import type { Metadata } from "next";
import { Button, ButtonLink } from "@/components/ui/button";
import {
  manageConnectionAction,
  saveConnectProfileAction,
  shareContactAction,
} from "@/modules/connect/application/connect-actions";
import {
  getConnectState,
  type BuilderCard,
  type NetworkItem,
} from "@/modules/connect/infrastructure/connect-dal";

export const metadata: Metadata = {
  title: "Builder Connect",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

const inputClass =
  "mt-2 min-h-12 w-full rounded-2xl border border-[#e1e2ea] bg-white px-3 text-sm text-[#25284a] shadow-sm focus:border-[#765fe8]";
const textareaClass =
  "mt-2 min-h-24 w-full rounded-2xl border border-[#e1e2ea] bg-white p-4 text-sm leading-6 text-[#25284a] shadow-sm focus:border-[#765fe8]";

function Notice({ status }: { status?: string }) {
  if (!status) return null;
  const error = status === "error";
  return (
    <p
      role={error ? "alert" : "status"}
      className={`mt-4 rounded-2xl border p-4 text-sm ${
        error
          ? "border-[#f4b7c1] bg-[#fff3f5] text-[#b33a50]"
          : "border-[#b9e9df] bg-[#effbf8] text-[#147b6c]"
      }`}
    >
      {error
        ? "That Connect action could not be completed. Review the details and try again."
        : status === "saved"
          ? "Your Builder World profile and privacy choice were saved."
          : "Your network was updated."}
    </p>
  );
}

function ActionForm({
  action,
  connectionId,
  targetUserId,
  label,
  variant = "secondary",
}: {
  action: "accept" | "decline" | "cancel" | "remove" | "unblock";
  connectionId?: string;
  targetUserId?: string;
  label: string;
  variant?: "primary" | "secondary" | "ghost";
}) {
  return (
    <form action={manageConnectionAction}>
      <input type="hidden" name="action" value={action} />
      <input type="hidden" name="returnTo" value="/connect" />
      {connectionId ? <input type="hidden" name="connectionId" value={connectionId} /> : null}
      {targetUserId ? <input type="hidden" name="targetUserId" value={targetUserId} /> : null}
      <Button type="submit" variant={variant} className="min-h-9 rounded-full px-3 py-1.5 text-xs">
        {label}
      </Button>
    </form>
  );
}

function BuilderCardView({ builder }: { builder: BuilderCard }) {
  return (
    <article className="pp-app-card pp-app-card-interactive flex h-full w-[19rem] shrink-0 flex-col p-4 sm:w-[21rem] sm:p-5">
      <div className="flex items-start gap-3">
        <span className="pp-story-ring shrink-0 rounded-full">
          <span className="grid size-12 place-items-center rounded-full border-2 border-white bg-gradient-to-br from-[#6d5df5] to-[#2b236e] text-sm font-bold text-white">
            {builder.preferredName.slice(0, 1).toUpperCase()}
          </span>
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-bold text-[#282b4b]">{builder.preferredName}</h3>
            {builder.relationship !== "none" ? (
              <span className="shrink-0 rounded-full bg-[#f0ebff] px-2 py-0.5 text-[0.62rem] font-bold text-[#6042d8]">
                {builder.relationship}
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 truncate text-xs font-semibold text-[#6547db]">@{builder.username}</p>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-[0.66rem] font-bold tracking-[0.08em] text-[#8a90a4] uppercase">Mission</p>
        <p className="mt-1 line-clamp-2 text-sm leading-5 font-semibold text-[#353857]">
          {builder.missionStatement ?? builder.missionTitle ?? "Building evidence around a practical mission."}
        </p>
      </div>

      {builder.interests.length > 0 || builder.capabilities.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {[...builder.capabilities.slice(0, 2), ...builder.interests.slice(0, 2)].slice(0, 4).map((signal) => (
            <span key={signal} className="rounded-full bg-[#f1eeff] px-2.5 py-1 text-[0.68rem] font-semibold text-[#5c43ce]">
              {signal}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-4 grid gap-2 border-t border-[#ececf3] pt-4 text-xs">
        <p className="line-clamp-2 leading-5 text-[#737a90]">
          <strong className="text-[#159f8a]">Can help with:</strong> {builder.canHelpWith || "Not stated yet"}
        </p>
        <p className="line-clamp-2 leading-5 text-[#737a90]">
          <strong className="text-[#e25d55]">Needs help with:</strong> {builder.needsHelpWith || "Not stated yet"}
        </p>
      </div>

      <ButtonLink href={`/connect/builders/${builder.username}`} className="mt-4 w-full rounded-full" variant="secondary">
        Meet this Builder →
      </ButtonLink>
    </article>
  );
}

function RequestRow({ item, type }: { item: NetworkItem; type: "incoming" | "sent" }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ececf3] py-3 last:border-0">
      <div className="min-w-0">
        <Link href={`/connect/builders/${item.username}`} className="truncate text-sm font-bold text-[#303353] hover:underline">
          {item.preferredName}
        </Link>
        <p className="mt-0.5 text-xs text-[#858b9f]">@{item.username}</p>
      </div>
      <div className="flex gap-2">
        {type === "incoming" ? (
          <>
            <ActionForm action="accept" connectionId={item.connectionId} label="Accept" variant="primary" />
            <ActionForm action="decline" connectionId={item.connectionId} label="Decline" />
          </>
        ) : (
          <ActionForm action="cancel" connectionId={item.connectionId} label="Cancel" />
        )}
      </div>
    </li>
  );
}

function ConnectionCard({
  item,
  profileHasEmail,
  profileHasWhatsapp,
}: {
  item: NetworkItem;
  profileHasEmail: boolean;
  profileHasWhatsapp: boolean;
}) {
  return (
    <article className="pp-app-card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#e9e5ff] to-[#e7f8f5] text-sm font-bold text-[#5b3be0]">
            {item.preferredName.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0">
            <Link href={`/connect/builders/${item.username}`} className="block truncate text-base font-bold text-[#303353] hover:underline">
              {item.preferredName}
            </Link>
            <p className="mt-0.5 text-xs text-[#858b9f]">@{item.username}</p>
          </div>
        </div>
        <ActionForm action="remove" connectionId={item.connectionId} label="Remove" variant="ghost" />
      </div>

      <div className="mt-4 rounded-2xl border border-[#e8e8f0] bg-[#fafaff] p-3 text-xs">
        <p className="font-bold text-[#303353]">Contact shared with you</p>
        <p className="mt-1.5 leading-5 text-[#747b90]">
          {item.sharedEmail ?? item.sharedWhatsapp
            ? [item.sharedEmail, item.sharedWhatsapp].filter(Boolean).join(" · ")
            : "Nothing shared yet. A connection does not create private messaging access."}
        </p>
      </div>

      <details className="mt-4 border-t border-[#ececf3] pt-4">
        <summary className="cursor-pointer text-xs font-bold text-[#4b4f6e]">Manage my contact consent</summary>
        <form action={shareContactAction} className="mt-3">
          <input type="hidden" name="connectionId" value={item.connectionId} />
          <input type="hidden" name="returnTo" value="/connect" />
          <fieldset>
            <legend className="text-xs font-bold text-[#303353]">Explicit contact sharing</legend>
            <div className="mt-3 grid gap-2 text-xs text-[#60677f]">
              <label className="flex items-center gap-2">
                <input type="checkbox" name="shareEmail" defaultChecked={item.myShareEmail} disabled={!profileHasEmail} />
                Share saved email
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="shareWhatsapp" defaultChecked={item.myShareWhatsapp} disabled={!profileHasWhatsapp} />
                Share saved WhatsApp
              </label>
            </div>
          </fieldset>
          <Button type="submit" variant="secondary" className="mt-3 min-h-9 rounded-full px-3 py-1.5 text-xs">
            Update consent
          </Button>
        </form>
      </details>
    </article>
  );
}

export default async function ConnectPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const [state, query] = await Promise.all([getConnectState(), searchParams]);
  const pendingCount = state.incoming.length + state.sent.length;
  const search = query.q?.trim().toLocaleLowerCase() ?? "";
  const builders = search
    ? state.discover.filter((builder) =>
        [
          builder.preferredName,
          builder.username,
          builder.missionTitle,
          builder.missionStatement,
          builder.canHelpWith,
          builder.needsHelpWith,
          ...builder.interests,
          ...builder.capabilities,
        ]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase()
          .includes(search),
      )
    : state.discover;

  return (
    <main id="main-content" className="w-full pb-8">
      <section className="bg-[#201b59] px-4 pt-5 pb-12 text-white sm:px-6 sm:pt-8 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-start justify-between gap-4 px-1">
            <div>
              <h1 className="text-[2rem] font-bold tracking-[-0.04em] sm:text-4xl">Connect</h1>
              <p className="mt-1 text-sm text-indigo-100/72">Find people to build with—not people to impress.</p>
            </div>
            {state.eligible ? (
              <span className="rounded-full border border-white/12 bg-white/8 px-3 py-2 text-xs font-semibold text-indigo-50">
                {state.connections.length} connected
              </span>
            ) : null}
          </div>

          {state.eligible ? (
            <form action="/connect" method="get" className="mt-5 flex items-center gap-2">
              <label className="sr-only" htmlFor="builder-search">Search builders</label>
              <div className="flex min-h-12 flex-1 items-center gap-2 rounded-2xl border border-white/12 bg-white/9 px-3 backdrop-blur-sm">
                <span aria-hidden="true" className="text-indigo-100/70">⌕</span>
                <input
                  id="builder-search"
                  name="q"
                  defaultValue={query.q ?? ""}
                  placeholder="Search builders, skills, missions…"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-indigo-100/55"
                />
              </div>
              <Button type="submit" variant="ghost" className="min-h-12 rounded-2xl border border-white/12 bg-white/8 px-4 text-white hover:bg-white/14">
                Search
              </Button>
            </form>
          ) : null}

          {state.eligible ? (
            <nav aria-label="Connect sections" className="pp-stage26-scroll mt-4 overflow-x-auto pb-1">
              <div className="flex w-max gap-2">
                <a href="#builders" className="rounded-full bg-white px-4 py-2 text-xs font-bold text-[#4330b8]">Builders</a>
                <a href="#network" className="rounded-full border border-white/14 bg-white/7 px-4 py-2 text-xs font-semibold text-indigo-50">My Network</a>
                <a href="#requests" className="rounded-full border border-white/14 bg-white/7 px-4 py-2 text-xs font-semibold text-indigo-50">Requests {pendingCount ? `· ${pendingCount}` : ""}</a>
                <a href="#privacy" className="rounded-full border border-white/14 bg-white/7 px-4 py-2 text-xs font-semibold text-indigo-50">Privacy</a>
              </div>
            </nav>
          ) : null}
        </div>
      </section>

      <div className="relative -mt-5 rounded-t-[2rem] bg-[#f7f8fc] pt-5">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Notice status={query.status} />

          {!state.eligible ? (
            <section className="pp-app-card pp-mobile-section mt-4 p-6 sm:p-8">
              <span className="grid size-14 place-items-center rounded-full bg-[#fff5da] text-xl text-[#a87d20]">◇</span>
              <p className="mt-4 text-xs font-bold tracking-[0.12em] text-[#9a7520] uppercase">Builder World protected by safeguarding</p>
              <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-[#25284a]">Public discovery and direct contact sharing stay closed for younger Builders.</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[#747b90]">
                Your complete private PipuPath adventure remains available. Youth networking needs dedicated guardian and institutional safeguarding, so PipuPath will not reduce that protection to a checkbox.
              </p>
              <ButtonLink href="/build" className="mt-5 rounded-full">Continue my adventure →</ButtonLink>
            </section>
          ) : (
            <>
              <section id="builders" className="pp-mobile-section mt-4 scroll-mt-28" aria-labelledby="discover-builders-heading">
                <div className="flex items-end justify-between gap-4 px-1">
                  <div>
                    <p className="text-xs font-bold tracking-[0.12em] text-[#6848dc] uppercase">Active Builders</p>
                    <h2 id="discover-builders-heading" className="pp-section-title mt-1 text-xl sm:text-2xl">
                      Complementary people
                    </h2>
                  </div>
                  <span className="text-xs font-semibold text-[#8a90a4]">{builders.length} shown</span>
                </div>
                <p className="mt-2 px-1 text-xs leading-5 text-[#858b9f]">Discovery is opt-in. Only safe fields deliberately made discoverable appear here.</p>

                {builders.length ? (
                  <div className="pp-stage26-scroll -mx-4 mt-3 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 lg:grid-cols-3">
                    {builders.map((builder) => <BuilderCardView key={builder.userId} builder={builder} />)}
                  </div>
                ) : (
                  <div className="pp-app-card mt-3 p-5">
                    <p className="text-sm leading-6 text-[#747b90]">
                      {search ? "No discoverable Builder matches that search yet." : "The Builder World is quiet right now. No other eligible Builder has deliberately enabled discoverability yet."}
                    </p>
                    {search ? <Link href="/connect" className="mt-3 inline-block text-sm font-bold text-[#5b3be0]">Clear search →</Link> : null}
                  </div>
                )}
              </section>

              <section id="network" className="pp-mobile-section mt-6 scroll-mt-28">
                <div className="flex items-end justify-between gap-3 px-1">
                  <div>
                    <p className="text-xs font-bold tracking-[0.12em] text-[#16a28f] uppercase">My Network</p>
                    <h2 className="pp-section-title mt-1 text-xl sm:text-2xl">People you deliberately connected with</h2>
                  </div>
                  <ButtonLink href="/connect/collaborations" variant="secondary" className="min-h-10 shrink-0 rounded-full">Collaborate</ButtonLink>
                </div>

                {state.connections.length ? (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {state.connections.map((item) => (
                      <ConnectionCard
                        key={item.connectionId}
                        item={item}
                        profileHasEmail={Boolean(state.profile?.contactEmail)}
                        profileHasWhatsapp={Boolean(state.profile?.contactWhatsapp)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="pp-app-card mt-3 p-5">
                    <p className="text-sm leading-6 text-[#747b90]">No accepted connections yet. Connecting creates a deliberate relationship and consent controls—not unrestricted private messaging.</p>
                  </div>
                )}
              </section>

              <section id="requests" className="pp-app-card pp-mobile-section mt-4 scroll-mt-28 p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold tracking-[0.12em] text-[#6848dc] uppercase">Requests</p>
                    <h2 className="mt-1 text-lg font-bold text-[#303353]">{pendingCount > 0 ? `${pendingCount} waiting` : "Nothing waiting"}</h2>
                  </div>
                  <span className="grid size-10 place-items-center rounded-full bg-[#f0ebff] text-xs font-bold text-[#5b3be0]">{pendingCount}</span>
                </div>
                {state.incoming.length > 0 ? (
                  <div className="mt-4">
                    <p className="text-[0.66rem] font-bold tracking-[0.08em] text-[#8a90a4] uppercase">Incoming</p>
                    <ul>{state.incoming.map((item) => <RequestRow key={item.connectionId} item={item} type="incoming" />)}</ul>
                  </div>
                ) : null}
                {state.sent.length > 0 ? (
                  <div className="mt-4">
                    <p className="text-[0.66rem] font-bold tracking-[0.08em] text-[#8a90a4] uppercase">Sent</p>
                    <ul>{state.sent.map((item) => <RequestRow key={item.connectionId} item={item} type="sent" />)}</ul>
                  </div>
                ) : null}
                {pendingCount === 0 ? <p className="mt-3 text-sm leading-6 text-[#747b90]">When someone deliberately requests a connection, it will appear here for you to accept or decline.</p> : null}
              </section>

              <details id="privacy" className="pp-app-card pp-mobile-section mt-4 scroll-mt-28 p-5 sm:p-6">
                <summary className="cursor-pointer text-sm font-bold text-[#303353]">My discovery profile & privacy</summary>
                <p className="mt-2 text-xs leading-5 text-[#7d8398]">You decide whether your safe Builder fields are discoverable. Contact details remain private unless you explicitly share them with an accepted connection.</p>
                <form action={saveConnectProfileAction} className="mt-5 grid gap-4">
                  <input type="hidden" name="returnTo" value="/connect" />
                  <label className="text-sm font-bold text-[#303353]">
                    Interests <span className="font-normal text-[#8a90a4]">(comma separated)</span>
                    <input name="interests" required defaultValue={state.profile?.interests.join(", ") ?? ""} className={inputClass} placeholder="education, agriculture, technology" />
                  </label>
                  <label className="text-sm font-bold text-[#303353]">
                    Capabilities <span className="font-normal text-[#8a90a4]">(comma separated)</span>
                    <input name="capabilities" required defaultValue={state.profile?.capabilities.join(", ") ?? ""} className={inputClass} placeholder="teaching, design, research" />
                  </label>
                  <label className="text-sm font-bold text-[#303353]">I can help with<textarea name="canHelpWith" maxLength={320} defaultValue={state.profile?.canHelpWith ?? ""} className={textareaClass} /></label>
                  <label className="text-sm font-bold text-[#303353]">I need help with<textarea name="needsHelpWith" maxLength={320} defaultValue={state.profile?.needsHelpWith ?? ""} className={textareaClass} /></label>
                  <label className="text-sm font-bold text-[#303353]">Private contact email<input name="contactEmail" type="email" defaultValue={state.profile?.contactEmail ?? ""} className={inputClass} /></label>
                  <label className="text-sm font-bold text-[#303353]">Private WhatsApp number<input name="contactWhatsapp" defaultValue={state.profile?.contactWhatsapp ?? ""} className={inputClass} /></label>
                  <label className="text-sm font-bold text-[#303353]">
                    Discovery visibility
                    <select name="visibility" defaultValue={state.profile?.visibility ?? "private"} className={inputClass}>
                      <option value="private">Private — not discoverable</option>
                      <option value="discoverable">Discoverable — show safe Builder fields</option>
                    </select>
                  </label>
                  <Button type="submit" className="rounded-full">Save Builder World profile</Button>
                </form>
              </details>

              {state.blocked.length ? (
                <details className="pp-app-card pp-mobile-section mt-4 p-5 sm:p-6">
                  <summary className="cursor-pointer text-sm font-bold text-[#303353]">Blocked Builders · {state.blocked.length}</summary>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {state.blocked.map((builder) => (
                      <div key={builder.userId} className="flex items-center justify-between gap-4 rounded-2xl border border-[#e8e8f0] bg-[#fafaff] p-4">
                        <div className="min-w-0">
                          <p className="truncate font-bold text-[#303353]">{builder.preferredName}</p>
                          <p className="text-xs text-[#858b9f]">@{builder.username}</p>
                        </div>
                        <ActionForm action="unblock" targetUserId={builder.userId} label="Unblock" />
                      </div>
                    ))}
                  </div>
                </details>
              ) : null}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
