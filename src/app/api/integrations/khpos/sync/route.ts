import { NextResponse } from "next/server";
import { syncRequestSchema } from "@/modules/khpos-integration/domain/contract";
import {
  KhposBridgeError,
  syncKhposSchoolCohort,
} from "@/modules/khpos-integration/infrastructure/bridge";

export const runtime = "nodejs";
const MAX_BODY_BYTES = 8_192;

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { ok: false, error: "Institutional sync request is too large." },
      { status: 413 },
    );
  }
  try {
    const input = syncRequestSchema.parse(await request.json());
    const aggregate = await syncKhposSchoolCohort(input);
    return NextResponse.json({
      ok: true,
      reportingEligible: aggregate.reportingEligible,
    });
  } catch (error) {
    if (error instanceof KhposBridgeError) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: error.status },
      );
    }
    return NextResponse.json(
      { ok: false, error: "Invalid KHP-OS institutional sync request." },
      { status: 400 },
    );
  }
}
