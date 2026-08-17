import { NextResponse } from "next/server";
import { z } from "zod";
import {
  productFeatureKeys,
  recordCurrentUserFeatureView,
} from "@/modules/analytics/infrastructure/product-events";

export const runtime = "nodejs";

const requestSchema = z.object({
  featureKey: z.enum(productFeatureKeys),
});

export async function POST(request: Request) {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "same-site") {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > 1_024) {
    return NextResponse.json({ ok: false }, { status: 413 });
  }

  try {
    const input = requestSchema.parse(await request.json());
    const recorded = await recordCurrentUserFeatureView(input.featureKey);
    if (!recorded) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
