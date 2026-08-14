import { NextResponse } from "next/server";
import { bootstrapRequestSchema } from "@/modules/khpos-integration/domain/contract";
import { bootstrapKhposSchoolCohort, KhposBridgeError } from "@/modules/khpos-integration/infrastructure/bridge";

export const runtime = "nodejs";
const MAX_BODY_BYTES = 8_192;

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "Institutional pairing request is too large." }, { status: 413 });
  }
  try {
    const input = bootstrapRequestSchema.parse(await request.json());
    const result = await bootstrapKhposSchoolCohort(input);
    return NextResponse.json({ ok: true, cohortId: result.cohortId });
  } catch (error) {
    if (error instanceof KhposBridgeError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    }
    return NextResponse.json({ ok: false, error: "Invalid KHP-OS institutional pairing request." }, { status: 400 });
  }
}
