import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/shells/auth-shell";
import { signInAction } from "@/modules/identity/application/auth-actions";
import { AuthForm } from "@/modules/identity/ui/auth-form";
import { GoogleAuthForm } from "@/modules/identity/ui/google-auth-form";
export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const next = (await searchParams).next;
  return (
    <AuthShell
      title="Welcome back"
      description="Continue your PipuPath securely."
    >
      {process.env.VERCEL_ENV === "preview" ? (
        <p className="mb-4 rounded-xl border border-[#bdcce7] bg-[#eff5ff] p-3 text-sm leading-6 text-[#233b60]">
          This is the test version of PipuPath. Use email and password to sign
          in here. Google sign-in also needs the test address allowed in our
          authentication settings to return here rather than live.
        </p>
      ) : null}
      <GoogleAuthForm next={next} />
      <div className="text-muted my-5 text-center text-sm">
        or use your account password
      </div>
      <p className="text-muted mb-4 text-sm">
        Joined with Google? Use Continue with Google above.
      </p>
      <AuthForm action={signInAction} submitLabel="Sign in" next={next} />
      <div className="text-muted mt-6 flex justify-between text-sm">
        <Link href="/forgot-password">Forgot password?</Link>
        <Link href="/signup">Create account</Link>
      </div>
    </AuthShell>
  );
}
