import { NextRequest, NextResponse } from "next/server"
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth-session"
import {
  MAX_STAR_EVENT_BATCH_SIZE,
  StarEventSubmissionError,
  submitStarEvents,
} from "@/lib/registry-client"
import type { StarEventDto } from "@/lib/types"

const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,127})$/
const MAX_DIAGNOSTIC_BODY_LENGTH = 2000

export async function POST(req: NextRequest) {
  const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value
  logStarEventRequest(req, Boolean(sessionCookie))

  const session = await verifySessionToken(sessionCookie)
  if (!session) {
    console.error("Star events unauthenticated", {
      hasSessionCookie: Boolean(sessionCookie),
      host: req.headers.get("host"),
      origin: req.headers.get("origin"),
      referer: req.headers.get("referer"),
    })
    return NextResponse.json(
      {
        error: "Unauthorized",
        code: "STAR_EVENTS_UNAUTHENTICATED",
        detail: "Missing or invalid aptitude_session cookie.",
      },
      { status: 401 },
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    console.error("Star events invalid JSON body")
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 })
  }

  const events = parseStarEventBatch(body)
  if (!events) {
    console.error("Star events invalid batch")
    return NextResponse.json({ error: "events must be a non-empty array" }, { status: 400 })
  }
  if (events.length > MAX_STAR_EVENT_BATCH_SIZE) {
    console.error("Star events batch too large", {
      eventCount: events.length,
      limit: MAX_STAR_EVENT_BATCH_SIZE,
    })
    return NextResponse.json(
      { error: `events must contain at most ${MAX_STAR_EVENT_BATCH_SIZE} entries` },
      { status: 400 },
    )
  }

  try {
    const result = await submitStarEvents(events, { userSubject: session.sub })
    console.info("Star events submitted", {
      accepted: result.accepted,
      eventCount: events.length,
      slugs: [...new Set(events.map((event) => event.slug))],
    })
    return NextResponse.json(result)
  } catch (error) {
    logStarEventFailure(error, events)
    if (error instanceof StarEventSubmissionError) {
      const registryBody = truncateDiagnosticBody(error.bodyText)
      if (error.status === 404) {
        return NextResponse.json(
          {
            error: "Unknown skill slug",
            code: "STAR_EVENTS_UNKNOWN_SKILL",
            registryStatus: error.status,
            registryBody,
          },
          { status: 404 },
        )
      }
      return NextResponse.json(
        {
          error: "Star events unavailable",
          code: "STAR_EVENTS_REGISTRY_REJECTED",
          registryStatus: error.status,
          registryBody,
        },
        { status: 502 },
      )
    }
    return NextResponse.json(
      {
        error: "Star events unavailable",
        code: "STAR_EVENTS_REGISTRY_UNAVAILABLE",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 502 },
    )
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

function logStarEventRequest(req: NextRequest, hasSessionCookie: boolean): void {
  console.info("Star events request received", {
    hasSessionCookie,
    host: req.headers.get("host"),
    origin: req.headers.get("origin"),
    referer: req.headers.get("referer"),
  })
}

function logStarEventFailure(error: unknown, events: StarEventDto[]): void {
  const details: Record<string, unknown> = {
    eventCount: events.length,
    slugs: [...new Set(events.map((event) => event.slug))],
  }

  if (error instanceof StarEventSubmissionError) {
    details.registryStatus = error.status
    details.registryBody = truncateDiagnosticBody(error.bodyText)
  } else if (error instanceof Error) {
    details.errorName = error.name
    details.errorMessage = error.message
  } else {
    details.error = String(error)
  }

  console.error("Star events submission failed", details)
}

function truncateDiagnosticBody(body: string): string {
  if (body.length <= MAX_DIAGNOSTIC_BODY_LENGTH) return body
  return `${body.slice(0, MAX_DIAGNOSTIC_BODY_LENGTH)}...`
}
