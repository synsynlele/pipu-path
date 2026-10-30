"use client";
export default function BuildError({ reset }: { reset: () => void }) {
  return (
    <main id="main-content" className="build-card">
      <h1 className="text-2xl font-bold">Your work could not be loaded.</h1>
      <p className="mt-3 text-sm leading-6">
        We have not changed your saved attempts. Try again in a moment.
      </p>
      <button onClick={reset} className="build-primary mt-5">
        Try again
      </button>
    </main>
  );
}
