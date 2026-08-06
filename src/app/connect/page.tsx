import type { Metadata } from "next";
import Link from "next/link";
import { Button, ButtonLink } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import {
  builderSafetyAction,
  respondConnectionRequestAction,
  saveNetworkProfileAction,
  sendConnectionRequestAction,
  shareContactAction,
} from "@/modules/connect/application/connect-actions";
import type {
  AcceptedConnection,
  ConnectionRequest,
} from "@/modules/connect/domain/connect-contract";
import { getConnectHomeState } from "@/modules/connect/infrastructure/connect-dal";

export const metadata: Metadata = {
  title: "Connect with Builders",
  robots: { index: false, follow: false },
};

const notices: Record<string, string> = {
  profile: "Your Builder Connect profile has been saved.",
  "request-sent": "Connection request sent.",
  network: "Your network has been updated.",
  block: "That Builder is now blocked.",
  unblock: "That Builder is no longer blocked.",
  report: "Your private safety report has been recorded.",
  "contact-sharing": "Your contact-sharing choice has been updated.",
};
const errors: Record<string, string> = {
  eligibility:
    "Builder Connect is currently available only to adults who completed onboarding and have no safeguarding restriction.",
  "request-exists": "A pending or accepted connection already exists.",
  "builder-unavailable": "That Builder is no longer available to connect.",
  "profile-invalid": "Check the profile fields and try again.",
  "profile-incomplete":
    "Add at least one interest and capability before enabling discovery.",
  "request-invalid": "That connection request was not valid.",
  "contact-missing":
    "Add the contact detail to your private profile before choosing to share it.",
  blocked: "That network action is unavailable because one account blocked the other.",
  "action-failed": "The network action could not be completed safely.",
};

export default async function ConnectPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const search = typeof params.q === "string" ? params.q : "";
  const updated = typeof params.updated === "string" ? params.updated : "";
  const error = typeof params.error === "string" ? params.error : "";
  const state = await getConnectHomeState(search);

  if (!state.eligible) {
    return (
      <main id="main-content" className="mx-auto max-w-4xl px-5 py-12 sm:px-8">
        <p className="text-gold font-mono text-xs tracking-[0.18em] uppercase">
          Builder Connect
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
          Connection must remain safe.
        </h1>
        <Surface className="mt-8 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold">Adult-only launch boundary</h2>
          <p className="text-muted mt-4 leading-7">
            This Connect release is limited to adult Builders who completed onboarding and are not under safeguarding review. PipuPath does not expose minors in a directory or enable unrestricted private messaging.
          </p>
          <ButtonLink href="/app" variant="secondary" className="mt-6">
            Return Home
          </ButtonLink>
        </Surface>
      </main>
    );
  }

  return (
    <main id="main-content" className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
      <p className="text-gold font-mono text-xs tracking-[0.18em] uppercase">
        Builder Connect
      </p>
      <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl">
        Find people who can help you build—and people you can help.
      </h1>
      <p className="text-muted mt-5 max-w-3xl text-lg leading-8">
        Discovery is opt-in. There is no open messaging, and contact details appear only after an accepted connection and an explicit sharing choice.
      </p>

      {updated && notices[updated] ? (
        <p role="status" className="border-success/30 bg-success/10 text-success mt-6 rounded-2xl border px-4 py-3">
          {notices[updated]}
        </p>
      ) : null}
      {error && errors[error] ? (
        <p role="alert" className="border-error/30 bg-error/10 text-error mt-6 rounded-2xl border px-4 py-3">
          {errors[error]}
        </p>
      ) : null}

      <section className="mt-8 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Surface className="p-6 sm:p-8">
          <p className="text-gold text-xs font-semibold tracking-wide uppercase">
            Your discovery profile
          </p>
          <h2 className="mt-3 text-2xl font-semibold">Choose what Builders can see.</h2>
          <form action={saveNetworkProfileAction} className="mt-6 grid gap-5">
            <ListField
              name="interests"
              label="Interests"
              defaultValue={state.profile?.interests}
              placeholder="Education, agriculture, technology"
            />
            <ListField
              name="capabilities"
              label="Capabilities"
              defaultValue={state.profile?.capabilities}
              placeholder="Teaching, public speaking, project planning"
            />
            <TextAreaField
              name="canHelpWith"
              label="I can help with"
              defaultValue={state.profile?.canHelpWith}
              placeholder="Describe practical help you can offer."
            />
            <TextAreaField
              name="needsHelpWith"
              label="I need help with"
              defaultValue={state.profile?.needsHelpWith}
              placeholder="Describe the practical support you need."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold">
                Private contact email
                <input
                  type="email"
                  name="contactEmail"
                  defaultValue={state.profile?.contactEmail ?? ""}
                  placeholder="Optional"
                  className="border-border bg-soft min-h-11 rounded-xl border px-4 font-normal"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Private WhatsApp number
                <input
                  name="contactWhatsapp"
                  defaultValue={state.profile?.contactWhatsapp ?? ""}
                  placeholder="Optional"
                  className="border-border bg-soft min-h-11 rounded-xl border px-4 font-normal"
                />
              </label>
            </div>
            <p className="text-muted -mt-2 text-xs leading-5">
              These details stay private until you accept a connection and deliberately share a channel.
            </p>
            <label className="border-border bg-soft flex items-start gap-3 rounded-xl border p-4 text-sm leading-6">
              <input
                type="checkbox"
                name="discoverable"
                defaultChecked={state.profile?.visibility === "discoverable"}
                className="mt-1 size-4"
              />
              <span>
                <strong className="block">Make me discoverable</strong>
                Show only my name, active Mission and the Builder fields above to eligible adults.
              </span>
            </label>
            <Button type="submit">Save Connect Profile</Button>
          </form>
        </Surface>

        <Surface className="p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-primary text-xs font-semibold tracking-wide uppercase">
                Discover Builders
              </p>
              <h2 className="mt-3 text-2xl font-semibold">Search by name, Mission, interest or capability.</h2>
            </div>
            <form className="flex w-full max-w-md gap-2" method="get">
              <input
                name="q"
                defaultValue={search}
                placeholder="Search Builders"
                className="border-border bg-soft min-h-11 min-w-0 flex-1 rounded-xl border px-4"
              />
              <Button type="submit" variant="secondary">Search</Button>
            </form>
          </div>
          <div className="mt-7 grid gap-4">
            {state.discover.length ? (
              state.discover.map((builder) => (
                <article key={builder.userId} className="border-border bg-soft rounded-2xl border p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <Link href={`/connect/${builder.username}`} className="text-xl font-semibold hover:underline">
                        {builder.preferredName}
                      </Link>
                      <p className="text-primary mt-1 text-sm">@{builder.username}</p>
                    </div>
                    <span className="border-border rounded-full border px-3 py-1 text-xs font-semibold capitalize">
                      {builder.relationship}
                    </span>
                  </div>
                  <h3 className="mt-4 font-semibold">{builder.missionTitle ?? "Mission in progress"}</h3>
                  <p className="text-muted mt-2 leading-7">
                    {builder.missionStatement ?? builder.canHelpWith}
                  </p>
                  <p className="text-muted mt-3 text-sm">
                    Interests: {builder.interests.join(", ")}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <ButtonLink href={`/connect/${builder.username}`} variant="secondary">
                      View Builder
                    </ButtonLink>
                    {builder.relationship === "none" || ["declined", "cancelled", "removed"].includes(builder.relationship) ? (
                      <form action={sendConnectionRequestAction}>
                        <input type="hidden" name="targetUserId" value={builder.userId} />
                        <Button type="submit">Connect</Button>
                      </form>
                    ) : null}
                  </div>
                </article>
              ))
            ) : (
              <p className="text-muted rounded-2xl border border-dashed border-border p-6 text-center">
                No eligible Builders match this search yet.
              </p>
            )}
          </div>
        </Surface>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <NetworkColumn title="Incoming requests" empty="No incoming requests.">
          {state.incoming.map((item) => (
            <PendingRequest key={item.connectionId} item={item} actions={["accept", "decline"]} />
          ))}
        </NetworkColumn>
        <NetworkColumn title="Sent requests" empty="No pending sent requests.">
          {state.sent.map((item) => (
            <PendingRequest key={item.connectionId} item={item} actions={["cancel"]} />
          ))}
        </NetworkColumn>
        <NetworkColumn title="My Network" empty="Accepted connections will appear here.">
          {state.connections.map((item) => (
            <ConnectionCard key={item.connectionId} item={item} />
          ))}
        </NetworkColumn>
      </section>

      {state.blocked.length ? (
        <Surface className="mt-8 p-6">
          <h2 className="text-xl font-semibold">Blocked Builders</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            {state.blocked.map((builder) => (
              <form key={builder.userId} action={builderSafetyAction} className="border-border bg-soft flex items-center gap-3 rounded-xl border p-3">
                <span className="text-sm">{builder.preferredName}</span>
                <input type="hidden" name="action" value="unblock" />
                <input type="hidden" name="userId" value={builder.userId} />
                <Button type="submit" variant="secondary">Unblock</Button>
              </form>
            ))}
          </div>
        </Surface>
      ) : null}
    </main>
  );
}

function ListField({ name, label, defaultValue, placeholder }: {
  name: string;
  label: string;
  defaultValue?: string[];
  placeholder: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      <input
        name={name}
        defaultValue={defaultValue?.join(", ") ?? ""}
        placeholder={placeholder}
        className="border-border bg-soft min-h-11 rounded-xl border px-4 font-normal"
      />
      <span className="text-muted text-xs font-normal">Separate entries with commas. Up to eight.</span>
    </label>
  );
}

function TextAreaField({ name, label, defaultValue, placeholder }: {
  name: string;
  label: string;
  defaultValue?: string;
  placeholder: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      <textarea
        name={name}
        maxLength={320}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className="border-border bg-soft min-h-24 rounded-xl border px-4 py-3 font-normal"
      />
    </label>
  );
}

function NetworkColumn({ title, empty, children }: {
  title: string;
  empty: string;
  children: React.ReactNode;
}) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children);
  return (
    <Surface className="p-6">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-5 grid gap-4">
        {hasChildren ? children : <p className="text-muted text-sm">{empty}</p>}
      </div>
    </Surface>
  );
}

function PendingRequest({ item, actions }: {
  item: ConnectionRequest;
  actions: Array<"accept" | "decline" | "cancel">;
}) {
  return (
    <article className="border-border bg-soft rounded-2xl border p-4">
      <Link href={`/connect/${item.username}`} className="font-semibold hover:underline">
        {item.preferredName}
      </Link>
      <p className="text-muted mt-1 text-sm">@{item.username}</p>
      <form action={respondConnectionRequestAction} className="mt-4 flex flex-wrap gap-2">
        <input type="hidden" name="connectionId" value={item.connectionId} />
        {actions.map((action) => (
          <Button key={action} name="action" value={action} type="submit" variant={action === "accept" ? "primary" : "secondary"}>
            {action[0].toUpperCase() + action.slice(1)}
          </Button>
        ))}
      </form>
    </article>
  );
}

function ConnectionCard({ item }: { item: AcceptedConnection }) {
  return (
    <article className="border-border bg-soft rounded-2xl border p-4">
      <Link href={`/connect/${item.username}`} className="font-semibold hover:underline">
        {item.preferredName}
      </Link>
      <p className="text-muted mt-1 text-sm">@{item.username}</p>
      {item.sharedEmail ? <p className="mt-3 text-sm">Email: {item.sharedEmail}</p> : null}
      {item.sharedWhatsapp ? <p className="mt-1 text-sm">WhatsApp: {item.sharedWhatsapp}</p> : null}
      <form action={shareContactAction} className="border-border mt-4 grid gap-3 border-t pt-4 text-sm">
        <input type="hidden" name="connectionId" value={item.connectionId} />
        <label className="flex items-center gap-2">
          <input type="checkbox" name="shareEmail" defaultChecked={item.myShareEmail} /> Share my saved email
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="shareWhatsapp" defaultChecked={item.myShareWhatsapp} /> Share my saved WhatsApp
        </label>
        <Button type="submit" variant="secondary">Update Contact Sharing</Button>
      </form>
      <form action={respondConnectionRequestAction} className="mt-3">
        <input type="hidden" name="connectionId" value={item.connectionId} />
        <Button name="action" value="remove" type="submit" variant="ghost">Remove Connection</Button>
      </form>
    </article>
  );
}
