export function AppPageSkeleton() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading PipuPath"
      className="w-full animate-pulse pb-8"
    >
      <section className="bg-[#201b59] px-4 pt-5 pb-12 sm:px-6 sm:pt-8 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="h-8 w-40 rounded-xl bg-white/14" />
          <div className="mt-2 h-4 w-64 max-w-[70%] rounded-lg bg-white/10" />
          <div className="mt-5 min-h-[16rem] rounded-[2rem] bg-white/10" />
        </div>
      </section>
      <div className="relative -mt-5 rounded-t-[2rem] bg-[#f7f8fc] pt-6">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="size-16 shrink-0 rounded-full bg-[#e7e7f0]"
              />
            ))}
          </div>
          <div className="mt-6 h-6 w-36 rounded-lg bg-[#e5e5ee]" />
          <div className="mt-3 h-48 rounded-[1.55rem] bg-white shadow-sm" />
          <div className="mt-4 h-28 rounded-[1.55rem] bg-white shadow-sm" />
        </div>
      </div>
    </main>
  );
}
