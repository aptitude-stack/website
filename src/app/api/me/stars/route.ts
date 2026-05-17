import { NextRequest, NextResponse } from "next/server"
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth-session"
import { fetchUserStarredSkillSlugs, StarEventSubmissionError } from "@/lib/registry-client"

export async function GET(req: NextRequest) {
  const session = await verifySessionToken(req.cookies.get(SESSION_COOKIE_NAME)?.value)
  if (!session) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        code: "USER_STARS_UNAUTHENTICATED",
      },
      { status: 401 },
    )
  }

  try {
    const starredSlugs = await fetchUserStarredSkillSlugs(session.sub)
    return NextResponse.json({ starred_slugs: starredSlugs })
  } catch (error) {
    if (error instanceof StarEventSubmissionError) {
      return NextResponse.json(
        {
          error: "User stars unavailable",
          code: "USER_STARS_REGISTRY_REJECTED",
          registryStatus: error.status,
          registryBody: error.bodyText,
        },
        { status: 502 },
      )
    }
    return NextResponse.json(
      {
        error: "User stars unavailable",
        code: "USER_STARS_REGISTRY_UNAVAILABLE",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 502 },
    )
  }
}
