import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PublicShell } from "@/components/shells/public-shell";
import {
  getIdentityState,
  getGuardianAuthorizationState,
} from "@/modules/identity/infrastructure/identity-dal";
import { WithdrawParentApprovalForm } from "@/modules/identity/ui/withdraw-parent-approval-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Account and privacy",
  robots: { index: false, follow: false },
};

export default async function AccountPrivacyPage() {
  const identity = await getIdentityState();
  if (!identity.user) redirect("/login?next=/account-privacy");
  const approval = identity.profile?.is_minor
    ? await getGuardianAuthorizationState()
    : null;
  return (
    <PublicShell>
      <main
        id="main-content"
        className="mx-auto max-w-2xl space-y-6 px-4 py-10"
      >
        <h1 className="text-2xl font-bold">Account and privacy</h1>
        {approval?.status === "parent_declared" ? (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">
              Parent approval for private learning
            </h2>
            <p className="text-muted text-sm leading-6">
              A parent declaration was saved on this account. Withdrawing it
              pauses private learning. It does not delete your account or
              completed work.
            </p>
            <WithdrawParentApprovalForm />
          </section>
        ) : null}
        <p>
          <Link href="/privacy" className="underline">
            Read the Privacy Notice
          </Link>
        </p>
        <p>
          <Link href="/account-deletion" className="underline">
            Request account and data deletion
          </Link>
        </p>
        <p>
          <Link href="/profile" className="underline">
            Back to your profile
          </Link>
        </p>
      </main>
    </PublicShell>
  );
}
