import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { grantGuardianAuthorizationAction } from "@/modules/identity/application/guardian-actions";
import { getIdentityState } from "@/modules/identity/infrastructure/identity-dal";

export const metadata: Metadata = {
  title: "Guardian approval",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function GuardianApprovalPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; error?: string }>;
}) {
  const identity = await getIdentityState();
  if (!identity.user) redirect("/login?next=/guardian");
  if (!identity.profile || identity.checkpoint?.status !== "completed") {
    redirect("/onboarding/identity");
  }
  if (identity.profile.is_minor) redirect("/onboarding/guardian");

  const params = await searchParams;

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-10 sm:px-6">
      <Surface className="p-6 sm:p-8">
        <p className="text-primary text-sm font-semibold tracking-[0.12em] uppercase">
          Parent / legal guardian
        </p>
        <h1 className="text-navy mt-2 text-3xl font-bold">
          Approve a young Builder
        </h1>
        <p className="text-muted mt-3 text-sm leading-6">
          Enter the one-time code shared with you by the young person. Approval
          confirms that you are their parent or legal guardian and consent to
          their use of PipuPath under the current youth safeguards.
        </p>

        {params.status === "approved" ? (
          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            Approval recorded. The young Builder can now refresh PipuPath and
            continue.
          </div>
        ) : null}
        {params.error ? (
          <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
            That code could not be approved. Check the code, expiry and your
            adult account, then try again.
          </div>
        ) : null}

        <form
          action={grantGuardianAuthorizationAction}
          className="mt-6 space-y-5"
        >
          <label className="block">
            <span className="text-sm font-medium">Guardian code</span>
            <input
              required
              name="code"
              minLength={16}
              maxLength={20}
              autoCapitalize="characters"
              autoComplete="off"
              className="border-border bg-panel-raised focus:border-primary mt-2 min-h-12 w-full rounded-xl border px-3 font-mono tracking-[0.12em] uppercase"
              placeholder="AB12CD34EF56GH78"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Your relationship</span>
            <select
              required
              name="relationship"
              defaultValue=""
              className="border-border bg-panel-raised focus:border-primary mt-2 min-h-12 w-full rounded-xl border px-3"
            >
              <option value="" disabled>
                Select one
              </option>
              <option value="parent">Parent</option>
              <option value="legal_guardian">Legal guardian</option>
            </select>
          </label>

          <label className="flex items-start gap-3 text-sm leading-6">
            <input
              required
              type="checkbox"
              name="declaration"
              className="mt-1 size-5"
            />
            <span>
              I confirm that I am 18 or older, I am this young person&apos;s
              parent or legal guardian, and I approve their use of PipuPath
              under the current Terms, Privacy Notice and youth safeguards.
            </span>
          </label>

          <Button type="submit" className="w-full">
            Approve young Builder
          </Button>
        </form>
      </Surface>
    </main>
  );
}
