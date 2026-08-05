export function PageLoading({
  label = "Loading your next step",
}: {
  label?: string;
}) {
  return (
    <main
      className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10"
      aria-busy="true"
    >
      <div className="animate-pulse space-y-6" role="status" aria-live="polite">
        <span className="sr-only">{label}…</span>
        <div className="bg-primary-soft h-4 w-32 rounded-full" />
        <div className="bg-soft-blue h-12 max-w-xl rounded-2xl" />
        <div className="bg-soft-blue h-5 max-w-2xl rounded-xl" />
        <div className="grid gap-5 md:grid-cols-3">
          <div className="border-border h-44 rounded-3xl border bg-white" />
          <div className="border-border h-44 rounded-3xl border bg-white" />
          <div className="border-border h-44 rounded-3xl border bg-white" />
        </div>
      </div>
    </main>
  );
}
