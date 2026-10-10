import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/shells/public-shell";
import { Surface } from "@/components/ui/surface";

export const metadata: Metadata = { title: "Terms of Use" };

export default function TermsPage() {
  return (
    <PublicShell>
      <main id="main-content" className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
        <p className="text-primary text-sm font-semibold tracking-[0.15em] uppercase">
          KAEC-NG Ltd · Effective 10 October 2026
        </p>
        <h1 className="text-navy mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          PipuPath Terms of Use
        </h1>
        <Surface className="mt-9 p-6 sm:p-8">
          <div className="text-muted grid gap-6 leading-7">
            <p>
              PipuPath helps people discover, develop and deploy their potential
              through practical action. It does not provide a clinical
              diagnosis, professional licence, employment promise, funding
              guarantee or financial advice. AI suggestions are starting points
              for your judgement, not fixed claims about your identity.
            </p>
            <p>
              Use an account that belongs to you, declare your age group
              accurately and keep your sign-in details private. Under-18
              accounts require parent or legal-guardian approval. Eligible
              school networking for young Builders also requires a separate
              guardian permission that can be withdrawn.
            </p>
            <p>
              Share only truthful, lawful work that you have permission to use.
              Do not publish other people&apos;s private information, exact
              locations, school identifiers or contact details without proper
              authorisation. Do not harass, threaten, impersonate, exploit or
              solicit other users, or post sexual, hateful, violent or otherwise
       ...[truncated]