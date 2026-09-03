import { NextRequest, NextResponse } from "next/server";

import release from "../../../../public/downloads/pipupath-lite.json";

export function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL(release.apk, request.url), 307);
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}
