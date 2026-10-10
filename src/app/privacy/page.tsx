import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/shells/public-shell";
import { Surface } from "@/components/ui/surface";

export const metadata: Metadata = { title: "Privacy Policy" };

const sections = [
  [
    "Data we collect",
    "PipuPath collects the account information needed for sign-in and age-appropriate access, including email, preferred name, username and declared age band. Your voluntary Discovery answers, missions, journeys, project work, evidence, uploaded files and reflections are saved to support your development. If you use permitted networking features, we also process the content, connections, messages, reports and contact-sharing choices associated with those features.",
  ],
  [
    "How information is used",
    "KAEC-NG Ltd operates PipuPath to authenticate users, maintain the Builder journey, save achievements and submitted work, provide personalised guidance, operate permitted collaboration, prevent misuse, handle safety reports and account deletion requests, and diagnose operational problems. Limited technical and operational records are kept for reliability and security.",
  ],
  [
    "Your privacy choices",
    "Private developmental work does not become public automatically. Eligible adults may deliberately publish selected Portfolio proof, review it before publishing and withdraw it later. Contact sharing and networking are subject to the account's age and eligibility rules. Published or shared content may already have been copied by its recipients before withdrawal.",
  ],
  [
    "Young Builders and guardians",
    "Users under 18 require approval from a separately signed-in adult who declares that they are a parent or legal guardian. External AI providers are disabled for under-18 accounts. Public Portfolio publishing and adult-only Connect features are unavailable to minors. School networking is limited to eligible users aged 13–17 in participating schools and is disabled until an approved guardian explicitly enables it; the guardian can also turn it off. Under-13 users cannot use school networking.",
  ],
  [
    "AI guidance",
    "For consenting eligible adults, OpenAI may process relevant context sent when they request AI-assisted interpretation or planning. This guidance does not determine anyone's identity and is not a guarantee of earnings or employment. Under-18 accounts instead use PipuPath's evidence-based guidance without sending their requests to external AI providers.",
  ],
  [
    "Service providers and safeguards",
    "Supabase supports authentication, database records and file storage; Vercel hosts the application; OpenAI supplies eligible adult AI features. Access controls, private-by-default settings and restricted operational permissions are used to protect account data. Some operational information and provider records may remain in system logs, caches or backups for their applicable retention periods.",
  ],
  [
    "Retention and deletion",
    "Developmental records are kept while needed for an active account unless deletion is requested. To request account and associated-data deletion, use the website's account-deletion page, which includes the privacy contact and a way to seek help if you cannot sign in. A request is reviewed for account ownership and any legal or safeguarding retention exception; submitting it is not immediate deletion. Limited completion receipts and provider backups may have separate retention periods. Copies previously downloaded by other people cannot be remotely erased.",
  ],
  [
    "Safety and reporting",
    "PipuPath provides reporting and blocking controls for permitted networking. Reports may be reviewed by authorised safety operators, and relevant records may be restricted where a safeguarding or legal obligation requires it. A parent or legal guardian's approval does not automatically grant access to a young person's private reflections.",
  ],
] as const;

export default function PrivacyPage() {
  return (
    <PublicShell>
      <main id="main-content" className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
        <p className="text-primary text-sm font-semibold tracking-[0.15em] uppercase">
          KAEC-NG Ltd · Effective 10 October 2026
        </p>
        <h1 className="text-navy mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          PipuPath Privacy Policy
        </h1>
        <p className="text-muted mt-5 max-w-3xl text-lg leading-8">
          Your developmental work belongs to you. This policy describes how
          KAEC-NG Ltd handles information when you use PipuPath.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {sections.map(([title, description]) => (
            <Surface key={title} className="p-6">
              <h2 className="text-navy text-xl font-semibold">{title}</h2>
              <p className="text-muted mt-3 leading-7">{description}</p>
            </Surface>
          ))}
        </div>
        <Surface className="mt-6 p-6">
          <h2 className="text-navy text-xl font-semibold">
            Questions or deletion requests
          </h2>
          <p className="text-muted mt-3 leading-7">
            Contact the PipuPath privacy team at{" "}
            <a
              className="text-primary underline"
              href="mailto:copyartint@gmail.com"
            >
              copyartint@gmail.com
            </a>
            , or visit the{" "}
            <Link className="text-primary underline" href="/account-deletion">
              account-deletion page
            </Link>
            . Do not email passwords, identity documents or private evidence.
          </p>
        </Surface>
      </main>
    </PublicShell>
  );
}
