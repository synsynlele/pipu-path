import { saveDiscoveryResponseAction } from "@/modules/discovery/application/discovery-actions";

export async function POST(request: Request) {
  const result = await saveDiscoveryResponseAction(
    { status: "idle" },
    await request.formData(),
  );
  const destination =
    result.status === "success" && result.destination
      ? result.destination
      : "/onboarding/discovery?error=save";
  return Response.redirect(new URL(destination, request.url), 303);
}
