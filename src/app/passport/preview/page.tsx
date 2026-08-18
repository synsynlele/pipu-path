import Link from "next/link";
import { AppShell } from "@/components/shells/app-shell";
import { getBuilderPassportWorkspace } from "@/modules/passport/infrastructure/passport-dal";
import { PassportIssueForm } from "@/modules/passport/ui/passport-issue-form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BuilderPassportPreviewPage() {
  const workspace = await getBuilderPassportWorkspace();

  return (
    <AppShell>
      <main id="main-content" className="mx-auto max-w-6xl px-6 py-10 lg:py-14">
        <header className="border-b pb-8">
          <Link
            className="text-sm underline underline-offset-4"
            href="/passport"
          >
            ← Passport workspace
          </Link>
          <p className="text-muted-foreground mt-8 text-sm font-medium tracking-[0.18em] uppercase">
            Passport preview
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Choose exactly what becomes portable.
          </h1>
          <p className="text-muted-foreground mt-4 max-w-3xl text-base leading-7">
            Nothing is shared by opening this page. Select the capability
            evidence you want, review the exact snapshot, then explicitly
            consent before PipuPath issues a version.
          </p>
        </header>

        <div className="mt-10">
          <PassportIssueForm workspace={workspace} />
        </div>
      </main>
    </AppShell>
  );
}
