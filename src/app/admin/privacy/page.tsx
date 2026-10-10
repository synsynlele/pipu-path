import { deletionDeadlines } from "@/modules/privacy/domain/request-deadlines";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DeletionFulfilmentForm } from "@/modules/privacy/ui/deletion-fulfilment-form";
import { getCurrentPlatformAdminRole } from "@/modules/admin/infrastructure/admin-dal";
import { listOpenDeletionRequests } from "@/modules/privacy/infrastructure/deletion-requests";
import {
  privacyDrillScope,
  privacyOperationsConfig,
} from "@/modules/privacy/infrastructure/privacy-config";
import {
  reviewDeletionRequest,
  takeOverDeletionReviewAction,
} from "@/modules/privacy/application/deletion-actions";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Privacy requests",
  robots: { index: false, follow: false },
};

export default async function PrivacyQueuePage() {
  const role = await getCurrentPlatformAdminRole();
  if (!role) redirect("/login");
  if (role !== "owner" && role !== "operator")
    return (
      <main className="p-6 text-white">
        <h1>Privacy requests</h1>
        <p>Only authorised owners and operators can review requests.</p>
      </main>
    );
  if (!privacyOperationsConfig().enabled)
    return (
      <main className="p-6 text-white">
        <h1>Privacy requests</h1>
        <p>
          Privacy operations are not enabled. Verify the migration, contact and
          fulfilment runbook before enabling them.
        </p>
      </main>
    );
  const drill = privacyDrillScope();
  const requests = await listOpenDeletionRequests();
  return (
    <main className="mx-auto max-w-4xl p-6 text-white">
      <h1 className="text-3xl font-semibold">Account deletion requests</h1>
      {drill ? (
        <p className="mt-4 rounded-xl border border-amber-300 p-4">
          Handover practice: only the designated disposable request is
          available. Record the review, takeover and verified result with your
          release operator.
        </p>
      ) : null}
      <p className="mt-4 leading-7">
        Oldest first, up to 100 open requests. Start review, verify ownership
        and follow the deletion runbook. Starting review does not delete data or
        confirm fulfilment. Acknowledge within 7 calendar days; target
        completion within 30 days. Review overdue work weekly and explain holds
        or delays.
      </p>
      <ul className="mt-6 space-y-4">
        {requests.map((request) => {
          const deadlines = deletionDeadlines(request.created_at);
          return (
            <li
              key={request.id}
              className="rounded-xl border border-white/20 p-5"
            >
              <p className="break-all">Request: {request.id}</p>
              <p className="mt-2 break-all">Account: {request.user_id}</p>
              <p className="mt-2">
                Received: {request.created_at.slice(0, 10)} · {request.status}
              </p>
              <p className="mt-2">
                Acknowledge by {deadlines.acknowledgementDate}; completion
                target {deadlines.completionDate}.
                {deadlines.completionOverdue
                  ? " Completion target overdue: escalate and explain the delay."
                  : deadlines.acknowledgementDue
                    ? " Check that acknowledgement was sent; sending is not tracked here."
                    : ""}
              </p>
              {request.job ? (
                <p className="mt-2">
                  Processing: {request.job.state} · last phase:{" "}
                  {request.job.phase} · attempts: {request.job.attempts}. A
                  failed run may have partially removed data.
                </p>
              ) : null}
              {request.status === "reviewing" ? (
                <form action={takeOverDeletionReviewAction} className="mt-4">
                  <input type="hidden" name="request_id" value={request.id} />
                  <button
                    type="submit"
                    className="min-h-11 rounded-lg border border-white/30 px-4"
                  >
                    Take over review
                  </button>
                  <p className="mt-2 text-sm">
                    For a backup operator. Active processing cannot be
                    reassigned.
                  </p>
                </form>
              ) : null}
              {request.user_id ? (
                <Link
                  href={`/admin/privacy/${request.id}`}
                  className="mt-4 inline-flex min-h-11 items-center underline"
                >
                  Inspect deletion dependencies
                </Link>
              ) : (
                <p className="mt-4">
                  Authentication was removed; retry the same request to verify
                  completion.
                </p>
              )}
              {request.status === "reviewing" &&
              process.env.PRIVACY_FULFILMENT_ENABLED === "true" ? (
                <DeletionFulfilmentForm requestId={request.id} />
              ) : null}
              {request.status === "pending" ? (
                <form action={reviewDeletionRequest} className="mt-4">
                  <input type="hidden" name="request_id" value={request.id} />
                  <button
                    className="min-h-11 rounded-xl border border-white/30 px-4"
                    type="submit"
                  >
                    Start review
                  </button>
                </form>
              ) : null}
            </li>
          );
        })}
      </ul>
      {!requests.length ? (
        <p className="mt-6">No open deletion requests.</p>
      ) : null}
    </main>
  );
}
