const day = 86_400_000;

// Approved operating targets. These do not prove that a reply was sent or that
// a held request can be deleted; they make approaching/overdue work visible.
export function deletionDeadlines(createdAt: string, now: number = Date.now()) {
  const received = Date.parse(createdAt);
  if (!Number.isFinite(received) || !Number.isFinite(now))
    throw new Error("INVALID_PRIVACY_REQUEST_DATE");
  const acknowledgement = received + 7 * day;
  const completion = received + 30 * day;
  return {
    acknowledgementDate: new Date(acknowledgement).toISOString().slice(0, 10),
    completionDate: new Date(completion).toISOString().slice(0, 10),
    acknowledgementDue: now >= acknowledgement,
    completionOverdue: now >= completion,
  };
}
