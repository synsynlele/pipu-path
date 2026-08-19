import { ButtonLink } from "@/components/ui/button";

export default function QuestNotFound() {
  return (
    <main
      id="main-content"
      className="mx-auto grid min-h-[65vh] max-w-5xl place-items-center px-4 py-10 sm:px-8"
    >
      <section className="relative w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#07142f] p-6 text-white shadow-[0_30px_90px_-52px_rgba(79,124,255,0.9)] sm:p-10">
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-16 size-72 rounded-full border border-white/10"
        />
        <div
          aria-hidden="true"
          className="absolute right-6 -bottom-40 size-80 rounded-full bg-[#4f7cff]/18 blur-3xl"
        />
        <div className="relative max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.18em] text-[#f3c86b] uppercase">
            Your adventure moved forward
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            This Quest is no longer your current proof step.
          </h1>
          <p className="mt-4 text-sm leading-6 text-blue-50/75 sm:text-base">
            It may have been completed, replaced by a newer challenge, or the
            old link may no longer match your saved Journey. Your work has not
            been made public and PipuPath will not invent a missing state.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <ButtonLink href="/quests" variant="premium">
              Find My Current Quest →
            </ButtonLink>
            <ButtonLink href="/app" variant="secondary">
              Return Home
            </ButtonLink>
          </div>
        </div>
      </section>
    </main>
  );
}
