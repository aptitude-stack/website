import { NextRequest, NextResponse } from "next/server"
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth-session"
import {
  MAX_STAR_EVENT_BATCH_SIZE,
  StarEventSubmissionError,
  submitStarEvents,
} from "@/lib/registry-client"
import type { StarEventDto } from "@/lib/types"

const SLUG_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9._-]{0,127})$/

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

  const events = parseStarEventBatch(body)
  if (!events) {
    return NextResponse.json({ error: "events must be a non-empty array" }, { status: 400 })
  }
  if (events.length > MAX_STAR_EVENT_BATCH_SIZE) {
    return NextResponse.json(
      { error: `events must contain at most ${MAX_STAR_EVENT_BATCH_SIZE} entries` },
      { status: 400 },
    )
  }

  try {
    const result = await submitStarEvents(events)
    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof StarEventSubmissionError && error.status === 404) {
      return NextResponse.json({ error: "Unknown skill slug" }, { status: 404 })
    }
    return NextResponse.json({ error: "Star events unavailable" }, { status: 502 })
  }
}

function parseStarEventBatch(value: unknown): StarEventDto[] | null {
  if (typeof value !== "object" || value === null) return null
  const candidate = value as { events?: unknown }
  if (!Array.isArray(candidate.events)) return null
  if (candidate.events.length === 0) return null
  const events: StarEventDto[] = []
  for (const entry of candidate.events) {
    if (typeof entry !== "object" || entry === null) return null
    const event = entry as { slug?: unknown; action?: unknown }
    if (typeof event.slug !== "string" || !SLUG_PATTERN.test(event.slug)) return null
    if (event.action !== "star" && event.action !== "unstar") return null
    events.push({ slug: event.slug, action: event.action })
  }
  return events
}
