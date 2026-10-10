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
    "Users under 18 require approval from a separately signed-in adult who declares that they are a parent or legal guardian. External AI providers are disabled for under-18 accounts. Public Portfolio publishing and adult-only Connect features are unavailable to minors. School networking is limited to eligible users aged 13–17 in participating schools and is disa...[truncated]