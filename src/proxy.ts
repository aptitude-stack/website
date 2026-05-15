import { NextRequest, NextResponse } from "next/server";
import {
  LOGIN_PATH,
  SESSION_COOKIE_NAME,
  isProtectedPath,
  verifySessionToken,
} from "@/lib/auth-session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE_NAME)?.value);
  if (session) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL(LOGIN_PATH, request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/catalog",
    "/catalog/:path*",
    "/skills",
    "/skills/:path*",
    "/audit",
    "/audit/:path*",
    "/api/search",
  ],
};
