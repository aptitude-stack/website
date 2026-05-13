import { NextRequest, NextResponse } from "next/server"
import { discoverSlugs, fetchSkillCardData } from "@/lib/registry-client"
import type { SkillCardData } from "@/lib/types"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.query || typeof body.query !== "string") {
      return NextResponse.json({ error: "query is required" }, { status: 400 })
    }
    const slugs = await discoverSlugs(body.query.trim())
    const settled = await Promise.allSettled(slugs.map(fetchSkillCardData))
    const cards: SkillCardData[] = settled
      .filter((r): r is PromiseFulfilledResult<SkillCardData> => r.status === "fulfilled" && r.value !== null)
      .map((r) => r.value)
    return NextResponse.json({ candidates: cards })
  } catch {
    return NextResponse.json({ error: "Search unavailable" }, { status: 502 })
  }
}
