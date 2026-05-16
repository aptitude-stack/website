import { __resetStarEventQueueForTests } from "@/lib/star-event-queue"

describe("star-event-queue", () => {
  let fetchSpy: jest.Mock
  let consoleErrorSpy: jest.SpyInstance
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    fetchSpy = jest.fn(async () =>
      new Response(JSON.stringify({ accepted: 1, counts: [] }), { status: 200 }),
    )
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
    globalThis.fetch = originalFetch
  })

  it("preserves repeated toggles for one slug in order", async () => {
    const queue = __resetStarEventQueueForTests({ flushIntervalMs: 0, fetchImpl: fetchSpy })

    queue.enqueue({ slug: "fastapi", action: "star" })
    queue.enqueue({ slug: "fastapi", action: "unstar" })
    queue.enqueue({ slug: "fastapi", action: "star" })
    await queue.flush()

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    const init = fetchSpy.mock.calls[0][1] as RequestInit
    expect(JSON.parse(String(init.body))).toEqual({
      events: [
        { slug: "fastapi", action: "star" },
        { slug: "fastapi", action: "unstar" },
        { slug: "fastapi", action: "star" },
      ],
    })
  })

  it("flushes immediately when the batch reaches max size", async () => {
    const queue = __resetStarEventQueueForTests({
      flushIntervalMs: 60_000,
      maxBatchSize: 2,
      fetchImpl: fetchSpy,
    })

    queue.enqueue({ slug: "fastapi", action: "star" })
    queue.enqueue({ slug: "python.test", action: "star" })
    await queue.flush()

    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })

  it("rejects and logs network failures", async () => {
    fetchSpy = jest.fn(async () => {
      throw new Error("offline")
    })
    const queue = __resetStarEventQueueForTests({ flushIntervalMs: 0, fetchImpl: fetchSpy })

    queue.enqueue({ slug: "fastapi", action: "star" })
    await expect(queue.flush()).rejects.toThrow("offline")
    expect(fetchSpy).toHaveBeenCalledTimes(1)
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Star event submission failed",
      expect.objectContaining({
        endpoint: "/api/star-events",
        eventCount: 1,
        slugs: ["fastapi"],
      }),
    )
  })

  it("rejects and logs non-OK responses with response text", async () => {
    fetchSpy = jest.fn(async () => new Response("Unauthorized", { status: 401 }))
    const queue = __resetStarEventQueueForTests({ flushIntervalMs: 0, fetchImpl: fetchSpy })

    queue.enqueue({ slug: "fastapi", action: "star" })

    await expect(queue.flush()).rejects.toThrow("Star event submission failed with 401: Unauthorized")
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Star event submission failed",
      expect.objectContaining({
        endpoint: "/api/star-events",
        eventCount: 1,
        responseStatus: 401,
        responseBody: "Unauthorized",
        slugs: ["fastapi"],
      }),
    )
  })

  it("uses POST with credentials and JSON content type", async () => {
    const queue = __resetStarEventQueueForTests({ flushIntervalMs: 0, fetchImpl: fetchSpy })

    queue.enqueue({ slug: "fastapi", action: "star" })
    await queue.flush()

    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/star-events",
      expect.objectContaining({
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
      }),
    )
  })

  it("calls the default global fetch with the global receiver", async () => {
    globalThis.fetch = jest.fn(function (this: typeof globalThis) {
      if (this !== globalThis) {
        throw new TypeError("Illegal invocation")
      }
      return Promise.resolve(
        new Response(JSON.stringify({ accepted: 1, counts: [] }), { status: 200 }),
      )
    }) as typeof fetch
    const queue = __resetStarEventQueueForTests({ flushIntervalMs: 0 })

    queue.enqueue({ slug: "fastapi", action: "star" })

    await expect(queue.flush()).resolves.toBeUndefined()
    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
  })
})
