import type { Metadata } from "next";
import { Button, ButtonLink } from "@/components/ui/button";
import {
  markBuilderNetworkConversationReadAction,
  sendBuilderNetworkMessageAction,
} from "@/modules/builder-network/application/builder-network-actions";
import { getBuilderNetworkConversation } from "@/modules/builder-network/infrastructure/builder-network-dal";
import { requireAuthenticatedIdentity } from "@/modules/identity/infrastructure/identity-dal";

export const metadata: Metadata = {
  title: "Builder Conversation",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function BuilderConversationPage({
  params,
  searchParams,
}: {
  params: Promise<{ conversationId: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const [{ conversationId }, query, identity] = await Promise.all([
    params,
    searchParams,
    requireAuthenticatedIdentity(),
  ]);
  const conversation = await getBuilderNetworkConversation(conversationId);

  return (
    <main id="main-content" className="w-full pb-10">
      <section className="bg-[#201b59] px-4 pt-5 pb-10 text-white sm:px-6 sm:pt-8 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-white/12 text-sm font-bold text-white">
              {conversation.otherUser.preferredName.slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold tracking-[0.12em] text-[#d9ceff] uppercase">
                Builder conversation
              </p>
              <h1 className="truncate text-2xl font-bold tracking-[-0.03em] sm:text-3xl">
                {conversation.otherUser.preferredName}
              </h1>
              <p className="mt-0.5 text-xs text-indigo-100/70">
                @{conversation.otherUser.username}
              </p>
            </div>
            <ButtonLink
              href="/connect/messages"
              variant="secondary"
              className="shrink-0 rounded-full"
            >
              Inbox
            </ButtonLink>
          </div>
        </div>
      </section>

      <div className="relative -mt-4 rounded-t-[2rem] bg-[#f7f8fc] pt-5">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {query.status === "error" ? (
            <p
              role="alert"
              className="mb-4 rounded-2xl border border-[#f4b7c1] bg-[#fff3f5] p-4 text-sm text-[#a7354a]"
            >
              That message action could not be completed safely.
            </p>
          ) : null}

          <section className="pp-app-card p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ececf3] pb-4">
              <p className="text-xs leading-5 text-[#747b90]">
                Keep conversation tied to learning, helping or building.
                Blocking, removing the connection, or a school policy change can
                close messaging access immediately.
              </p>
              <form action={markBuilderNetworkConversationReadAction}>
                <input
                  type="hidden"
                  name="conversationId"
                  value={conversation.conversationId}
                />
                <Button
                  type="submit"
                  variant="ghost"
                  className="min-h-9 rounded-full px-3 text-xs"
                >
                  Mark read
                </Button>
              </form>
            </div>

            <div className="mt-4 grid gap-3">
              {conversation.messages.length ? (
                conversation.messages.map((message) => {
                  const mine = message.senderId === identity.user.id;
                  return (
                    <div
                      key={message.id}
                      className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                        mine
                          ? "ml-auto bg-[#5b3be0] text-white"
                          : "mr-auto border border-[#e7e7ef] bg-[#f8f8fb] text-[#43475f]"
                      }`}
                    >
                      {message.body}
                    </div>
                  );
                })
              ) : (
                <p className="rounded-2xl bg-[#f8f8fb] p-4 text-sm leading-6 text-[#747b90]">
                  No messages yet. Start with a specific reason: an idea, a
                  skill, a problem, a request for help, or a build you can move
                  together.
                </p>
              )}
            </div>

            <form
              action={sendBuilderNetworkMessageAction}
              className="mt-5 flex items-end gap-2 border-t border-[#ececf3] pt-4"
            >
              <input
                type="hidden"
                name="conversationId"
                value={conversation.conversationId}
              />
              <label className="sr-only" htmlFor="builder-message-body">
                Message
              </label>
              <textarea
                id="builder-message-body"
                name="body"
                required
                maxLength={1200}
                rows={2}
                placeholder="Write something useful…"
                className="min-h-12 flex-1 resize-none rounded-2xl border border-[#e2e3eb] bg-white px-3 py-3 text-sm leading-5 text-[#25284a] shadow-sm outline-none placeholder:text-[#9ba1b4] focus:border-[#765fe8]"
              />
              <Button type="submit" className="shrink-0 rounded-full">
                Send
              </Button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
