import { Button } from "@/components/ui/button";
import { recordProfileFeedbackAction } from "../application/profile-actions";

export function ProfileFeedbackForm({ insightId }: { insightId: string }) {
  return (
    <form
      action={recordProfileFeedbackAction}
      className="border-border mt-5 border-t pt-4"
    >
      <input type="hidden" name="insightId" value={insightId} />
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
