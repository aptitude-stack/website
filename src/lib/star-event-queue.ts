import type { StarEventAction, StarEventDto } from "@/lib/types"

const DEFAULT_FLUSH_INTERVAL_MS = 0
const DEFAULT_MAX_BATCH_SIZE = 50
const MAX_DIAGNOSTIC_BODY_LENGTH = 2000

export interface StarEventQueueOptions {
  flushIntervalMs?: number
  maxBatchSize?: number
  endpoint?: string
  fetchImpl?: typeof fetch
}

interface PendingEvent {
  slug: string
  action: StarEventAction
}

class StarEventQueue {
  private readonly flushIntervalMs: number
  private readonly maxBatchSize: number
  private readonly endpoint: string
  private readonly fetchImpl: typeof fetch
  private readonly pending: StarEventDto[] = []
  private timer: ReturnType<typeof setTimeout> | null = null
  private inFlight: Promise<void> | null = null

  constructor(options: StarEventQueueOptions = {}) {
    this.flushIntervalMs = options.flushIntervalMs ?? DEFAULT_FLUSH_INTERVAL_MS
    this.maxBatchSize = options.maxBatchSize ?? DEFAULT_MAX_BATCH_SIZE
    this.endpoint = options.endpoint ?? "/api/star-events"
    this.fetchImpl = options.fetchImpl ?? globalThis.fetch
  }

  enqueue(event: PendingEvent) {
    this.pending.push({ slug: event.slug, action: event.action })
    if (this.pending.length >= this.maxBatchSize) {
      void this.flush()
      return
    }
    this.scheduleFlush()
  }

  async flush(): Promise<void> {
    if (this.timer !== null) {
      clearTimeout(this.timer)
      this.timer = null
    }
    if (this.inFlight) {
      await this.inFlight
    }
    if (this.pending.length === 0) return

    const events = this.pending.splice(0, this.maxBatchSize)

    this.inFlight = this.send(events)
      .catch((error: unknown) => {
        logStarEventFailure(error, this.endpoint, events)
        throw error
      })
      .finally(() => {
        this.inFlight = null
      })
    return this.inFlight
  }

  private scheduleFlush() {
    if (this.timer !== null) return
    this.timer = setTimeout(() => {
      this.timer = null
      void this.flush()
    }, this.flushIntervalMs)
  }

  private async send(events: StarEventDto[]): Promise<void> {
    const response = await this.fetchImpl(this.endpoint, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events }),
    })
    if (!response.ok) {
      throw new StarEventQueueSubmissionError(
        response.status,
        await safeReadBody(response),
      )
    }
  }
}

class StarEventQueueSubmissionError extends Error {
  constructor(
    public readonly status: number,
    public readonly bodyText: string,
  ) {
    super(
      `Star event submission failed with ${status}${bodyText ? `: ${bodyText}` : ""}`,
    )
    this.name = "StarEventQueueSubmissionError"
  }
}

function logStarEventFailure(
  error: unknown,
  endpoint: string,
  events: StarEventDto[],
): void {
  const details: Record<string, unknown> = {
    endpoint,
    eventCount: events.length,
    slugs: [...new Set(events.map((event) => event.slug))],
  }

  if (error instanceof StarEventQueueSubmissionError) {
    details.responseStatus = error.status
    details.responseBody = truncateDiagnosticBody(error.bodyText)
  } else if (error instanceof Error) {
    details.errorName = error.name
    details.errorMessage = error.message
  } else {
    details.error = String(error)
  }

  console.error("Star event submission failed", details)
}

async function safeReadBody(response: Response): Promise<string> {
  try {
    return truncateDiagnosticBody(await response.text())
  } catch {
    return ""
  }
}

function truncateDiagnosticBody(body: string): string {
  if (body.length <= MAX_DIAGNOSTIC_BODY_LENGTH) return body
  return `${body.slice(0, MAX_DIAGNOSTIC_BODY_LENGTH)}...`
}

let sharedQueue: StarEventQueue | null = null

export function getStarEventQueue(): StarEventQueue {
  if (sharedQueue === null) {
    sharedQueue = new StarEventQueue()
  }
  return sharedQueue
}

export function enqueueStarEvent(event: PendingEvent): void {
  if (typeof window === "undefined") return
  getStarEventQueue().enqueue(event)
}

export function flushStarEvents(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve()
  return getStarEventQueue().flush()
}

export function __resetStarEventQueueForTests(options?: StarEventQueueOptions): StarEventQueue {
  sharedQueue = new StarEventQueue(options)
  return sharedQueue
}
