import type { StarEventAction, StarEventDto } from "@/lib/types"

const DEFAULT_FLUSH_INTERVAL_MS = 1500
const DEFAULT_MAX_BATCH_SIZE = 50

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
  private readonly pending = new Map<string, StarEventAction>()
  private timer: ReturnType<typeof setTimeout> | null = null
  private inFlight: Promise<void> | null = null

  constructor(options: StarEventQueueOptions = {}) {
    this.flushIntervalMs = options.flushIntervalMs ?? DEFAULT_FLUSH_INTERVAL_MS
    this.maxBatchSize = options.maxBatchSize ?? DEFAULT_MAX_BATCH_SIZE
    this.endpoint = options.endpoint ?? "/api/star-events"
    this.fetchImpl = options.fetchImpl ?? globalThis.fetch
  }

  enqueue(event: PendingEvent) {
    this.pending.set(event.slug, event.action)
    if (this.pending.size >= this.maxBatchSize) {
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
    if (this.pending.size === 0) return

    const events: StarEventDto[] = Array.from(this.pending, ([slug, action]) => ({ slug, action }))
    this.pending.clear()

    this.inFlight = this.send(events).finally(() => {
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
    try {
      const response = await this.fetchImpl(this.endpoint, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events }),
      })
      if (!response.ok) {
        // Drop the batch silently; the client UI keeps its optimistic state
        // and the local-storage starred set without retrying network errors.
        return
      }
    } catch {
      // Network failures are also silently swallowed; star UI never blocks on telemetry.
    }
  }
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
