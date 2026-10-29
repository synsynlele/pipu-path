import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Continue your journey",
  robots: { index: false, follow: false },
};

export default async function ContinuePage() {
  redirect("/");
}
