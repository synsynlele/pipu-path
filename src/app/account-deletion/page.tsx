import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/shells/public-shell";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { privacyOperationsConfig } from "@/modules/privacy/infrastructure/privacy-config";
import { getOwnDeletionRequest } from "@/modules/privacy/infrastructure/deletion-requests";
import { DeletionRequestForm } from "@/modules/privacy/ui/deletion-request-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Delete your PipuPath account",
  robots: { index: false, follow: false },
};

export default async function AccountDeletionPage() {
  const config = privacyOperationsConfig();
  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  let request = null;
  let unavailable = false;
  if (user && config.enabled) {
    try {
      request = await getOwnDeletionRequest(user.id);
    } catch {
      unavailable = true;
    }
  }
  return (
    <PublicShell>
      <main id="main-content" className="mx-auto max-w-2xl px-5 py-12">
        <h1 className="text-navy text-3xl font-semibold">
          Delete your PipuPath account
        </h1>
        <p className="text-muted mt-5 leading-7">
          Request deletion of your account and associated Discovery answers,
          private profiles, missions, proof, reflections and projects. You can
          use this website without reinstalling the Android app.
        </p>
        <p className="text-muted mt-4 leading-7">
          The privacy team verifies account ownership before deleting data. Any
          information that must be retained for a legal or safeguarding reason,
          and its retention period, must be explained before completion.
          Uninstalling the app does not delete your account.
        </p>
        {config.email ? (
          <p className="mt-5">
            Cannot sign in, or acting for a child in your care? Email{" "}
            <a
              className="text-primary underline"
              href={`mailto:${config.email}?subject=PipuPath%20account%20deletion`}
            >
              {config.email}
            </a>
            . Do not send passwords, identity documents or private evidence.
          </p>
        ) : (
          <p className="mt-5" role="status">
            Online privacy requests are being prepared. A monitored privacy
            contact must be published before public release.
          </p>
        )}
        {!user ? (
          <div className="mt-6 flex flex-wrap gap-5">
            <Link
              className="text-primary underline"
              href="/login?next=/account-deletion"
            >
              Sign in to request deletion
            </Link>
            <Link className="text-primary underline" href="/forgot-password">
              Recover account access
            </Link>
          </div>
        ) : request ? (
          <p role="status" className="mt-6 break-words">
            Request {request.id}: {request.status}. A pending or reviewing
            request is not confirmation of deletion.
          </p>
        ) : config.enabled && !unavailable ? (
          <DeletionRequestForm />
        ) : (
          <p role="status" className="mt-6">
            The online request form is unavailable.{" "}
            {config.email
              ? "Please use the privacy email above."
              : "Online requests are not enabled yet."}
          </p>
        )}
        <Link
          href={user ? "/profile" : "/"}
          className="text-primary mt-8 inline-block underline"
        >
          {user ? "Back to Profile" : "Back to PipuPath"}
        </Link>
      </main>
    </PublicShell>
  );
}
