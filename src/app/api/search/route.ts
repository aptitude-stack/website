import { NextRequest, NextResponse } from "next/server"
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth-session"
import { searchSkillCards } from "@/lib/registry-client"

const MAX_SEARCH_QUERY_LENGTH = 200

export async function POST(req: NextRequest) {
  const session = await verifySessionToken(req.cookies.get(SESSION_COOKIE_NAME)?.value)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 })
  }

  if (!isSearchBody(body)) {
    return NextResponse.json({ error: "query is required" }, { status: 400 })
  }

  const query = body.query.trim()
  if (query.length === 0) {
    return NextResponse.json({ error: "query is required" }, { status: 400 })
  }
  if (query.length > MAX_SEARCH_QUERY_LENGTH) {
    return NextResponse.json({ error: "query is too long" }, { status: 400 })
  }

  try {
    const cards = await searchSkillCards(query)
    return NextResponse.json({ candidates: cards })
  } catch {
    return NextResponse.json({ error: "Search unavailable" }, { status: 502 })
  }
}

function isSearchBody(value: unknown): value is { query: string } {
  return typeof value === "object" && value !== null && "query" in value && typeof value.query === "string"
}
