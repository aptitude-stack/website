import { NextRequest, NextResponse } from "next/server"
import { discoverSlugs, fetchSkillCardData } from "@/lib/registry-client"
import type { SkillCardData } from "@/lib/types"

const MAX_SEARCH_QUERY_LENGTH = 200
const MAX_SEARCH_CANDIDATES = 20

export async function POST(req: NextRequest) {
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
    const slugs = await discoverSlugs(query)
    const boundedSlugs = slugs.slice(0, MAX_SEARCH_CANDIDATES)
    const settled = await Promise.allSettled(boundedSlugs.map(fetchSkillCardData))
    const cards: SkillCardData[] = settled
      .filter((r): r is PromiseFulfilledResult<SkillCardData> => r.status === "fulfilled" && r.value !== null)
      .map((r) => r.value)
    return NextResponse.json({ candidates: cards })
  } catch {
    return NextResponse.json({ error: "Search unavailable" }, { status: 502 })
  }
}

function isSearchBody(value: unknown): value is { query: string } {
  return typeof value === "object" && value !== null && "query" in value && typeof value.query === "string"
}
