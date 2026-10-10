"use client";
import Link from "next/link";

export default function PrivacyQueueError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto max-w-2xl p-6 text-white">
      <h1 className="text-2xl font-semibold">
        Privacy requests could not be loaded
      </h1>
      <p className="mt-4 leading-7">
        The request status could not be confirmed. Reload the queue before
        retrying a review action.
      </p>
      <button
        className="mt-6 min-h-11 rounded-xl border border-white/30 px-4"
        onClick={reset}
      >
        Reload queue
      </button>
      <Link href="/admin" className="ml-5 underline">
        Back to Mission Control
      </Link>
    </main>
  );
}
