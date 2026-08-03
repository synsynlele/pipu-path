import Link from "next/link";
import { AuthShell } from "@/components/shells/auth-shell";
import { signInAction } from "@/modules/identity/application/auth-actions";
import { AuthForm } from "@/modules/identity/ui/auth-form";
import { GoogleAuthForm } from "@/modules/identity/ui/google-auth-form";

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
      <GoogleAuthForm next={next} />
      <div className="text-muted my-5 text-center text-sm">or use email</div>
      <AuthForm action={signInAction} submitLabel="Sign in" next={next} />
      <div className="text-muted mt-6 flex justify-between text-sm">
        <Link href="/forgot-password">Forgot password?</Link>
        <Link href="/signup">Create account</Link>
      </div>
    </AuthShell>
  );
}
Ÿ®8