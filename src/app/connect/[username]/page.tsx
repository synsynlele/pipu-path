import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import {
  builderSafetyAction,
  sendConnectionRequestAction,
} from "@/modules/connect/application/connect-actions";
import {
  connectionReasonLabel,
  connectionReasons,
  reportReasons,
} from "@/modules/connect/domain/connect-contract";
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
          {builder.display_name}
        </h1>
        <p className="text-primary mt-2">@{builder.username}</p>
        <p className="text-muted mt-5 max-w-3xl text-lg leading-8">
          {builder.headline}
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <BuilderList title="Can help with" items={builder.can_help_with} />
          <BuilderList
            title="Needs help with"
            items={builder.needs_help_with}
          />
          <BuilderList title="Interests" items={builder.interests} />
        </div>

        {builder.portfolio_slug ? (
          <div className="border-border mt-8 border-t pt-7">
            <p className="text-gold text-xs font-semibold uppercase">
              Selective public proof
            </p>
            <ButtonLink
              href={`/proof/${builder.portfolio_slug}`}
              variant="secondary"
              className="mt-3"
            >
              {builder.portfolio_title ?? "View Builder proof"}
            </ButtonLink>
          </div>
        ) : null}

        <div className="border-border mt-8 border-t pt-7">
          {builder.relationship_status === "none" ? (
            <form
              action={sendConnectionRequestAction}
              className="flex flex-wrap gap-3"
            >
              <input type="hidden" name="recipientId" value={builder.user_id} />
              <select
                name="reason"
                className="border-border bg-soft min-h-11 rounded-xl border px-4"
                defaultValue="collaborate"
              >
                {connectionReasons.map((reason) => (
                  <option key={reason} value={reason}>
                    {connectionReasonLabel(reason)}
                  </option>
                ))}
              </select>
              <Button type="submit">Send Connection Request</Button>
            </form>
          ) : (
            <p className="text-muted text-sm capitalize">
              Connection status: {builder.relationship_status}
            </p>
          )}
        </div>
      </Surface>

      <Surface className="mt-6 p-6">
        <h2 className="text-lg font-semibold">Safety controls</h2>
        <p className="text-muted mt-2 text-sm leading-6">
          Blocking removes active network access. Reports are private and do not
          notify the reported Builder.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <form action={builderSafetyAction}>
            <input type="hidden" name="action" value="block" />
            <input type="hidden" name="userId" value={builder.user_id} />
            <Button type="submit" variant="secondary">
              Block Builder
            </Button>
          </form>
          <form action={builderSafetyAction} className="flex flex-wrap gap-2">
            <input type="hidden" name="action" value="report" />
            <input type="hidden" name="userId" value={builder.user_id} />
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
      <ul className="text-muted mt-3 grid gap-2 text-sm">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}
