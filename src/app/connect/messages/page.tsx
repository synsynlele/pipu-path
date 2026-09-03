import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { getBuilderNetworkConversations } from "@/modules/builder-network/infrastructure/builder-network-dal";

export const metadata: Metadata = {
  title: "Builder Messages",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function BuilderMessagesPage() {
  const conversations = await getBuilderNetworkConversations();

  return (
    <main id="main-content" className="w-full pb-10">
      <section className="bg-[#201b59] px-4 pt-5 pb-12 text-white sm:px-6 sm:pt-8 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs font-bold tracking-[0.12em] text-[#d9ceff] uppercase">
            Builder World
          </p>
          <div className="mt-1 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[2rem] font-bold tracking-[-0.04em] sm:text-4xl">
                Messages
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-100/75">
                Private conversation is available only between accepted,
                currently authorised Builder connections.
              </p>
            </div>
            <ButtonLink
              href="/connect/world"
              variant="secondary"
              className="shrink-0 rounded-full"
            >
              Builder World
            </ButtonLink>
          </div>
        </div>
      </section>

      <div className="relative -mt-5 rounded-t-[2rem] bg-[#f7f8fc] pt-5">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {conversations.length ? (
            <div className="grid gap-3">
              {conversations.map((conversation) => (
                <Link
                  key={conversation.conversationId}
                  href={`/connect/messages/${conversation.conversationId}`}
                  className="pp-app-card pp-app-card-interactive flex items-center gap-4 p-4 sm:p-5"
                >
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#6d5df5] to-[#2b236e] text-sm font-bold text-white">
                    {conversation.otherUser.preferredName
                      .slice(0, 1)
                      .toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[#303353]">
                          {conversation.otherUser.preferredName}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-[#858b9f]">
                          @{conversation.otherUser.username}
                        </p>
                      </div>
                      {conversation.unreadCount > 0 ? (
                        <span className="grid min-w-7 place-items-center rounded-full bg-[#5b3be0] px-2 py-1 text-[0.68rem] font-bold text-white">
                          {conversation.unreadCount}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 truncate text-sm text-[#697086]">
                      {conversation.lastMessage ??
                        "Conversation ready. Start with a useful reason to connect."}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <section className="pp-app-card p-6 sm:p-8">
              <p className="text-xs font-bold tracking-[0.12em] text-[#6848dc] uppercase">
                No conversations yet
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-[#25284a]">
                Messaging starts from a deliberate connection.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#747b90]">
                Find a compatible Builder, connect first, then message when the
                relationship and—where applicable—school policy allow it.
              </p>
              <ButtonLink href="/connect/world" className="mt-5 rounded-full">
                Find Builders →
              </ButtonLink>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
