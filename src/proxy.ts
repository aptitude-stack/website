import { NextRequest, NextResponse } from "next/server"
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth-session"

const PUBLIC_FILE = /\.[^/]+$/

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || PUBLIC_FILE.test(pathname)) {
    return
  }

  const isLogin = pathname === "/login"
  const isRoot = pathname === "/"
  const isCatalog = pathname === "/catalog"

  const session = await verifySessionToken(req.cookies.get(SESSION_COOKIE_NAME)?.value)
  const loggedIn = Boolean(session)

  if (!loggedIn) {
    if (isLogin || isRoot) return
    if (isCatalog) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
    return
  }

  if (isLogin) {
    return NextResponse.redirect(new URL("/catalog", req.url))
  }

  return
}

export const config = {
  matcher: "/:path*",
}
