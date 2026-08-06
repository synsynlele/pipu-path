import type { Metadata } from "next";
import Link from "next/link";
import { Button, ButtonLink } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import {
  respondConnectionRequestAction,
  saveNetworkProfileAction,
  sendConnectionRequestAction,
} from "@/modules/connect/application/connect-actions";
import {
  connectionReasonLabel,
  connectionReasons,
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
  report: "Your safety report has been recorded.",
};
const errors: Record<string, string> = {
  eligibility:
    "Builder Connect is currently available only to verified adult Builders without safeguarding restrictions.",
  "request-exists": "A pending or accepted connection already exists.",
  "builder-unavailable": "That Builder is no longer available to connect.",
  "profile-invalid":
    "Complete every profile field with short, clear comma-separated entries.",
  "request-invalid": "That connection request was not valid.",
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
            This first Connect release is limited to adult Builders whose
            accounts are active and not under safeguarding review. PipuPath will
            not expose minors in a directory or enable unrestricted private
            messaging.
          </p>
          <ButtonLink href="/app" variant="secondary" className="mt-6">
            Return Home
          </ButtonLink>
        </Surface>
      </main>
    );
  }

  const incoming = state.network.filter(
    (item) =>
      item.relationship_status === "pending" && item.direction === "incoming",
  );
  const outgoing = state.network.filter(
    (item) =>
      item.relationship_status === "pending" && item.direction === "outgoing",
  );
  const connections = state.network.filter(
    (item) => item.relationship_status === "accepted",
  );

  return (
    <main
      id="main-content"
      className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10"
    >
      <p className="text-gold font-mono text-xs tracking-[0.18em] uppercase">
        Builder Connect
      </p>
      <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl">
        Find people who can help you build—and people you can help.
      </h1>
      <p className="text-muted mt-5 max-w-3xl text-lg leading-8">
        Discovery is opt-in. Connection requests use a clear purpose, and
        contact details are never exposed automatically.
      </p>

      {updated && notices[updated] ? (
        <p
          role="status"
          className="border-success/30 bg-success/10 text-success mt-6 rounded-2xl border px-4 py-3"
        >
          {notices[updated]}
        </p>
      ) : null}
      {error && errors[error] ? (
        <p
          role="alert"
          className="border-error/30 bg-error/10 text-error mt-6 rounded-2xl border px-4 py-3"
        >
          {errors[error]}
        </p>
      ) : null}

      <section className="mt-8 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Surface className="p-6 sm:p-8">
          <p className="text-gold text-xs font-semibold tracking-wide uppercase">
            Your discovery profile
          </p>
          <h2 className="mt-3 text-2xl font-semibold">
            Choose what other Builders can see.
          </h2>
          <form action={saveNetworkProfileAction} className="mt-6 grid gap-5">
            <label className="grid gap-2 text-sm font-semibold">
              Headline
              <textarea
                name="headline"
                required
                minLength={10}
                maxLength={160}
                defaultValue={state.profile?.headline ?? ""}
                placeholder="I build practical learning programmes for young people."
                className="border-border bg-soft min-h-24 rounded-xl border px-4 py-3 font-normal"
              />
            </label>
            <ConnectListField
              name="canHelpWith"
              label="I can help with"
              defaultValue={state.profile?.can_help_with}
              placeholder="Teaching, public speaking, project planning"
            />
            <ConnectListField
              name="needsHelpWith"
              label="I need help with"
              defaultValue={state.profile?.needs_help_with}
              placeholder="Product design, partnerships, research"
            />
            <ConnectListField
              name="interests"
              label="Interests"
              defaultValue={state.profile?.interests}
              placeholder="Education, agriculture, technology"
            />
            <label className="border-border bg-soft flex items-start gap-3 rounded-xl border p-4 text-sm leading-6">
              <input
                type="checkbox"
                name="discoverable"
                defaultChecked={state.profile?.is_discoverable ?? false}
                className="mt-1 size-4"
              />
              <span>
                <strong className="block">Make me discoverable</strong>I consent
                to showing only the profile fields above to eligible adult
                Builders.
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
              <h2 className="mt-3 text-2xl font-semibold">
                Search by name, interest or capability.
              </h2>
            </div>
            <form className="flex w-full max-w-md gap-2" method="get">
              <input
                name="q"
                defaultValue={search}
                placeholder="Search Builders"
                className="border-border bg-soft min-h-11 min-w-0 flex-1 rounded-xl border px-4"
              />
              <Button type="submit" variant="secondary">
                Search
              </Button>
            </form>
          </div>
          <div className="mt-7 grid gap-4">
            {state.builders.length ? (
              state.builders.map((builder) => (
                <article
                  key={builder.user_id}
                  className="border-border bg-soft rounded-2xl border p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <Link
                        href={`/connect/${builder.username}`}
                        className="text-xl font-semibold hover:underline"
                      >
                        {builder.display_name}
                      </Link>
                      <p className="text-primary mt-1 text-sm">
                        @{builder.username}
                      </p>
                    </div>
                    <span className="border-border rounded-full border px-3 py-1 text-xs font-semibold capitalize">
                      {builder.relationship_status.replaceAll("_", " ")}
                    </span>
                  </div>
                  <p className="text-muted mt-3 leading-7">
                    {builder.headline}
                  </p>
                  <p className="text-muted mt-3 text-sm">
                    Interests: {builder.interests.join(", ")}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <ButtonLink
                      href={`/connect/${builder.username}`}
                      variant="secondary"
                    >
                      View Builder
                    </ButtonLink>
                    {builder.relationship_status === "none" ? (
                      <form
                        action={sendConnectionRequestAction}
                        className="flex flex-wrap gap-2"
                      >
                        <input
                          type="hidden"
                          name="recipientId"
                          value={builder.user_id}
                        />
                        <select
                          name="reason"
                          className="border-border bg-panel rounded-xl border px-3 text-sm"
                          defaultValue="collaborate"
                        >
                          {connectionReasons.map((reason) => (
                            <option key={reason} value={reason}>
                              {connectionReasonLabel(reason)}
                            </option>
                          ))}
                        </select>
                        <Button type="submit">Connect</Button>
                      </form>
                    ) : null}
                  </div>
                </article>
              ))
            ) : (
              <p className="text-muted border-border rounded-2xl border border-dashed p-6 text-center">
                No eligible Builders match this search yet.
              </p>
            )}
          </div>
        </Surface>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <NetworkColumn title="Incoming requests" empty="No incoming requests.">
          {incoming.map((item) => (
            <NetworkRequest
              key={item.request_id}
              item={item}
              actions={["accept", "decline"]}
            />
          ))}
        </NetworkColumn>
        <NetworkColumn title="Sent requests" empty="No pending sent requests.">
          {outgoing.map((item) => (
            <NetworkRequest
              key={item.request_id}
              item={item}
              actions={["cancel"]}
            />
          ))}
        </NetworkColumn>
        <NetworkColumn
          title="My Network"
          empty="Accepted connections will appear here."
        >
          {connections.map((item) => (
            <NetworkRequest
              key={item.request_id}
              item={item}
              actions={["remove"]}
            />
          ))}
        </NetworkColumn>
      </section>
    </main>
  );
}

function ConnectListField({
  name,
  label,
  defaultValue,
  placeholder,
}: {
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
        required
        defaultValue={defaultValue?.join(", ") ?? ""}
        placeholder={placeholder}
        className="border-border bg-soft min-h-11 rounded-xl border px-4 font-normal"
      />
      <span className="text-muted text-xs font-normal">
        Separate entries with commas.
      </span>
    </label>
  );
}

function NetworkColumn({
  title,
  empty,
  children,
}: {
  title: string;
  empty: string;
  children: React.ReactNode;
}) {
  const hasChildren = Array.isArray(children)
    ? children.length > 0
    : Boolean(children);
  return (
    <Surface className="p-6">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-5 grid gap-4">
        {hasChildren ? children : <p className="text-muted text-sm">{empty}</p>}
      </div>
    </Surface>
  );
}

function NetworkRequest({
  item,
  actions,
}: {
  item: Awaited<ReturnType<typeof getConnectHomeState>> extends {
    network: infer T;
  }
    ? T extends Array<infer R>
      ? R
      : never
    : never;
  actions: Array<"accept" | "decline" | "cancel" | "remove">;
}) {
  return (
    <article className="border-border bg-soft rounded-2xl border p-4">
      <Link
        href={`/connect/${item.username}`}
        className="font-semibold hover:underline"
      >
        {item.display_name}
      </Link>
      <p className="text-muted mt-1 text-sm">
        {connectionReasonLabel(item.reason)}
      </p>
      <form
        action={respondConnectionRequestAction}
        className="mt-4 flex flex-wrap gap-2"
      >
        <input type="hidden" name="requestId" value={item.request_id} />
        {actions.map((action) => (
          <Button
            key={action}
            name="action"
            value={action}
            type="submit"
            variant={action === "accept" ? "primary" : "secondary"}
          >
            {action[0].toUpperCase() + action.slice(1)}
          </Button>
        ))}
      </form>
    </article>
  );
}
