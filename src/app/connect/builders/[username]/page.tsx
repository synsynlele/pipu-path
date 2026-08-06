import type { Metadata } from "next";
import { Button, ButtonLink } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import {
  manageConnectionAction,
  reportBuilderAction,
} from "@/modules/connect/application/connect-actions";
import { getBuilderDetail } from "@/modules/connect/infrastructure/connect-dal";

export const metadata: Metadata = {
  title: "Builder Profile",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function BuilderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const [{ username }, query] = await Promise.all([params, searchParams]);
  const builder = await getBuilderDetail(username);
  const returnTo = `/connect/builders/${builder.username}`;

  return (
    <main
      id="main-content"
      className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-16"
    >
      <ButtonLink
        href="/connect"
        variant="ghost"
        className="px-0 hover:translate-y-0 hover:bg-transparent"
      >
        ← Back to Builder Connect
      </ButtonLink>
      {query.status ? (
        <p
          role="status"
          className="border-border mt-5 rounded-2xl border p-4 text-sm"
        >
          {query.status === "error"
            ? "That action could not be completed."
            : "Builder Connect was updated."}
        </p>
      ) : null}
      <Surface className="mt-6 p-6 sm:p-10">
        <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
          @{builder.username}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-6xl">
          {builder.preferredName}
        </h1>
        <p className="text-muted mt-5 max-w-3xl text-lg leading-8">
          {builder.missionStatement ??
            "Building evidence around a practical mission."}
        </p>
        {builder.missionTitle ? (
          <p className="text-gold mt-4 text-sm font-semibold">
            Mission: {builder.missionTitle}
          </p>
        ) : null}

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="border-border rounded-2xl border p-5">
            <h2 className="font-semibold">Can help with</h2>
            <p className="text-muted mt-3 leading-7">
              {builder.canHelpWith || "Not stated yet."}
            </p>
          </div>
          <div className="border-border rounded-2xl border p-5">
            <h2 className="font-semibold">Needs help with</h2>
            <p className="text-muted mt-3 leading-7">
              {builder.needsHelpWith || "Not stated yet."}
            </p>
          </div>
        </div>
        <div className="mt-7 grid gap-5 md:grid-cols-2">
          <div>
            <h2 className="font-semibold">Interests</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {builder.interests.map((item) => (
                <span
                  key={item}
                  className="bg-primary-soft text-primary rounded-full px-3 py-1 text-xs font-semibold"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h2 className="font-semibold">Capabilities</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {builder.capabilities.map((item) => (
                <span
                  key={item}
                  className="border-border rounded-full border px-3 py-1 text-xs font-semibold"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {builder.relationship === "none" ||
          ["declined", "cancelled", "removed"].includes(
            builder.relationship,
          ) ? (
            <form action={manageConnectionAction}>
              <input type="hidden" name="action" value="send" />
              <input type="hidden" name="targetUserId" value={builder.userId} />
              <input type="hidden" name="returnTo" value={returnTo} />
              <Button type="submit">Send Connection Request</Button>
            </form>
          ) : builder.relationship === "pending" ? (
            builder.requesterId === builder.userId ? (
              <div className="flex flex-wrap gap-3">
                <form action={manageConnectionAction}>
                  <input type="hidden" name="action" value="accept" />
                  <input
                    type="hidden"
                    name="connectionId"
                    value={builder.connectionId ?? ""}
                  />
                  <input type="hidden" name="returnTo" value={returnTo} />
                  <Button type="submit">Accept Request</Button>
                </form>
                <form action={manageConnectionAction}>
                  <input type="hidden" name="action" value="decline" />
                  <input
                    type="hidden"
                    name="connectionId"
                    value={builder.connectionId ?? ""}
                  />
                  <input type="hidden" name="returnTo" value={returnTo} />
                  <Button type="submit" variant="secondary">
                    Decline
                  </Button>
                </form>
              </div>
            ) : (
              <p className="border-border rounded-xl border px-4 py-3 text-sm font-semibold">
                Request sent — no message or contact detail was included.
              </p>
            )
          ) : (
            <p className="border-success/30 bg-success/10 text-success rounded-xl border px-4 py-3 text-sm font-semibold">
              Connected. Contact remains consent-controlled in My Network.
            </p>
          )}
          <form action={manageConnectionAction}>
            <input type="hidden" name="action" value="block" />
            <input type="hidden" name="targetUserId" value={builder.userId} />
            <input type="hidden" name="returnTo" value="/connect" />
            <Button type="submit" variant="ghost">
              Block Builder
            </Button>
          </form>
        </div>
      </Surface>

      <Surface className="mt-6 p-6 sm:p-8">
        <p className="text-gold text-xs font-semibold tracking-wide uppercase">
          Safety report
        </p>
        <h2 className="mt-3 text-2xl font-semibold">
          Report unsafe or misleading behaviour.
        </h2>
        <form action={reportBuilderAction} className="mt-5 grid gap-4">
          <input type="hidden" name="targetUserId" value={builder.userId} />
          <input type="hidden" name="returnTo" value={returnTo} />
          <label className="text-sm font-semibold">
            Reason
            <select
              name="reasonCode"
              className="border-border mt-2 min-h-12 w-full rounded-xl border bg-white px-3 text-slate-950"
            >
              <option value="spam">Spam</option>
              <option value="harassment">Harassment</option>
              <option value="unsafe_contact">Unsafe contact</option>
              <option value="impersonation">Impersonation</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label className="text-sm font-semibold">
            Safe factual detail <span className="text-muted">(optional)</span>
            <textarea
              name="detail"
              maxLength={500}
              className="border-border mt-2 min-h-24 w-full rounded-2xl border bg-white p-4 text-slate-950"
            />
          </label>
          <Button type="submit" variant="secondary">
            Submit Report
          </Button>
        </form>
      </Surface>
    </main>
  );
}
