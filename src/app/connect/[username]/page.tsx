import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import {
  builderSafetyAction,
  sendConnectionRequestAction,
} from "@/modules/connect/application/connect-actions";
import { reportReasons } from "@/modules/connect/domain/connect-contract";
import { getBuilderConnectProfile } from "@/modules/connect/infrastructure/connect-dal";

export const metadata: Metadata = {
  title: "Builder Profile",
  robots: { index: false, follow: false },
};

export default async function BuilderConnectPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const builder = await getBuilderConnectProfile(username);
  if (!builder) notFound();

  const canRequest = ["none", "declined", "cancelled", "removed"].includes(
    builder.relationship,
  );

  return (
    <main id="main-content" className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
      <ButtonLink href="/connect" variant="ghost">
        ← Back to Connect
      </ButtonLink>
      <Surface className="mt-6 p-6 sm:p-10">
        <p className="text-gold text-xs font-semibold tracking-wide uppercase">
          Discoverable Builder
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          {builder.preferredName}
        </h1>
        <p className="text-primary mt-2">@{builder.username}</p>

        <div className="border-border mt-8 border-t pt-7">
          <p className="text-gold text-xs font-semibold uppercase">
            Active Mission
          </p>
          <h2 className="mt-3 text-2xl font-semibold">
            {builder.missionTitle ?? "Mission in progress"}
          </h2>
          <p className="text-muted mt-3 max-w-3xl leading-7">
            {builder.missionStatement ??
              "This Builder has not published an active Mission statement yet."}
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <BuilderList title="Capabilities" items={builder.capabilities} />
          <BuilderList title="Interests" items={builder.interests} />
          <BuilderText title="Can help with" value={builder.canHelpWith} />
          <BuilderText title="Needs help with" value={builder.needsHelpWith} />
        </div>

        <div className="border-border mt-8 border-t pt-7">
          {canRequest ? (
            <form action={sendConnectionRequestAction}>
              <input type="hidden" name="targetUserId" value={builder.userId} />
              <Button type="submit">Send Connection Request</Button>
            </form>
          ) : (
            <p className="text-muted text-sm capitalize">
              Connection status: {builder.relationship}
            </p>
          )}
        </div>
      </Surface>

      <Surface className="mt-6 p-6">
        <h2 className="text-lg font-semibold">Safety controls</h2>
        <p className="text-muted mt-2 text-sm leading-6">
          Blocking removes network access. Reports are private and do not notify
          the reported Builder.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <form action={builderSafetyAction}>
            <input type="hidden" name="action" value="block" />
            <input type="hidden" name="userId" value={builder.userId} />
            <Button type="submit" variant="secondary">
              Block Builder
            </Button>
          </form>
          <form action={builderSafetyAction} className="flex flex-wrap gap-2">
            <input type="hidden" name="action" value="report" />
            <input type="hidden" name="userId" value={builder.userId} />
            <select
              name="reason"
              className="border-border bg-soft min-h-11 rounded-xl border px-3"
              defaultValue="unsafe_contact"
            >
              {reportReasons.map((reason) => (
                <option key={reason} value={reason}>
                  {reason.replaceAll("_", " ")}
                </option>
              ))}
            </select>
            <Button type="submit" variant="secondary">
              Report
            </Button>
          </form>
        </div>
      </Surface>
    </main>
  );
}

function BuilderList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="border-border bg-soft rounded-2xl border p-5">
      <h2 className="font-semibold">{title}</h2>
      {items.length ? (
        <ul className="text-muted mt-3 grid gap-2 text-sm">
          {items.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      ) : (
        <p className="text-muted mt-3 text-sm">Not provided.</p>
      )}
    </div>
  );
}

function BuilderText({ title, value }: { title: string; value: string }) {
  return (
    <div className="border-border bg-soft rounded-2xl border p-5">
      <h2 className="font-semibold">{title}</h2>
      <p className="text-muted mt-3 text-sm leading-6">
        {value || "Not provided."}
      </p>
    </div>
  );
}
