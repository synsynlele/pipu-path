import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { builderPassportShareSecretSchema } from "@/modules/passport/domain/passport-contract";
import {
  consumePassportShareRateLimit,
  resolveBuilderPassportShare,
} from "@/modules/passport/infrastructure/passport-dal";
import {
  hashPassportShareSecret,
  passportShareRateLimitFingerprint,
} from "@/modules/passport/infrastructure/passport-security";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const unavailableBody = { error: "passport_share_unavailable" } as const;
const responseHeaders = {
  "Cache-Control": "no-store",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex, nofollow",
} as const;

function unavailable(status: 404 | 429 | 503) {
  return NextResponse.json(unavailableBody, {
    status,
    headers: responseHeaders,
  });
}

function requestIdentity(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  const firstForwarded = forwarded?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  return firstForwarded || realIp || "unknown";
}

function bearerSecret(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return null;
  const candidate = authorization.slice("Bearer ".length).trim();
  const parsed = builderPassportShareSecretSchema.safeParse(candidate);
  return parsed.success ? parsed.data : null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> },
) {
  const { shareId: rawShareId } = await params;
  const shareId = z.uuid().safeParse(rawShareId);
  if (!shareId.success) return unavailable(404);

  const fingerprint = passportShareRateLimitFingerprint(
    shareId.data,
    requestIdentity(request),
  );

  try {
    const allowed = await consumePassportShareRateLimit(fingerprint);
    if (!allowed) return unavailable(429);

    const secret = bearerSecret(request);
    if (!secret) return unavailable(404);

    const passport = await resolveBuilderPassportShare(
      shareId.data,
      hashPassportShareSecret(secret),
    );
    if (!passport) return unavailable(404);

    return NextResponse.json(passport, {
      status: 200,
      headers: responseHeaders,
    });
  } catch {
    return unavailable(503);
  }
}
