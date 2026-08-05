export function PageLoading({
  label = "Loading your next step",
}: {
  label?: string;
}) {
  return (
    <main
      className="grid min-h-[70vh] place-items-center px-5 py-12"
      aria-busy="true"
    >
      <div
        className="flex max-w-md flex-col items-center rounded-3xl border border-border bg-panel px-8 py-10 text-center shadow-2xl"
        role="status"
        aria-live="polite"
      >
        <span
          aria-hidden="true"
          className="size-12 animate-spin rounded-full border-4 border-primary-soft border-t-primary"
        />
        <p className="text-navy mt-5 text-lg font-semibold">{label}…</p>
        <p className="text-muted mt-2 text-sm">
          PipuPath is preparing the next step.
        </p>
      </div>
    </main>
  );
}
