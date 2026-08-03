import { Button } from "@/components/ui/button";
import { recordProfileFeedbackAction } from "../application/profile-actions";

type SavedFeedback = {
  type: "confirmed" | "partly_true" | "not_true";
  comment: string | null;
} | null;

const feedbackCopy = {
  confirmed: "👍 Accurate",
  partly_true: "😐 Partly accurate",
  not_true: "👎 Not accurate",
} as const;

export function ProfileFeedbackForm({
  insightId,
  savedFeedback,
}: {
  insightId: string;
  savedFeedback: SavedFeedback;
}) {
  return (
    <form
      action={recordProfileFeedbackAction}
      className="border-border mt-5 border-t pt-4"
    >
      <input type="hidden" name="insightId" value={insightId} />
      {savedFeedback ? (
        <p className="text-gold mb-3 text-sm" role="status">
          Saved response: {feedbackCopy[savedFeedback.type]}
          {savedFeedback.comment ? ` — ${savedFeedback.comment}` : ""}
        </p>
      ) : null}
      <fieldset>
        <legend className="text-muted text-sm">Does this feel accurate?</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            type="submit"
            variant="secondary"
            name="feedback"
            value="confirmed"
          >
            👍 Accurate
          </Button>
          <Button
            type="submit"
            variant="secondary"
            name="feedback"
            value="partly_true"
          >
            😐 Partly accurate
          </Button>
          <Button
            type="submit"
            variant="secondary"
            name="feedback"
            value="not_true"
          >
            👎 Not accurate
          </Button>
        </div>
      </fieldset>
      <label
        className="text-muted mt-4 block text-sm"
        htmlFor={`comment-${insightId}`}
      >
        Optional comment
      </label>
      <textarea
        id={`comment-${insightId}`}
        name="comment"
        maxLength={600}
        className="border-border bg-background mt-2 min-h-24 w-full rounded-xl border px-3 py-2 text-sm"
      />
    </form>
  );
}
��8