import { __resetStarEventQueueForTests } from "@/lib/star-event-queue"

describe("star-event-queue", () => {
  let fetchSpy: jest.Mock

  beforeEach(() => {
    fetchSpy = jest.fn(async () =>
      new Response(JSON.stringify({ accepted: 1, counts: [] }), { status: 200 }),
    )
  })

  it("coalesces repeated toggles for one slug into the latest action", async () => {
    const queue = __resetStarEventQueueForTests({ flushIntervalMs: 0, fetchImpl: fetchSpy })

    queue.enqueue({ slug: "fastapi", action: "star" })
    queue.enqueue({ slug: "fastapi", action: "unstar" })
    queue.enqueue({ slug: "fastapi", action: "star" })
    await queue.flush()

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    const init = fetchSpy.mock.calls[0][1] as RequestInit
    expect(JSON.parse(String(init.body))).toEqual({
      events: [{ slug: "fastapi", action: "star" }],
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

  it("swallows network failures so the UI keeps responding", async () => {
    fetchSpy = jest.fn(async () => {
      throw new Error("offline")
    })
    const queue = __resetStarEventQueueForTests({ flushIntervalMs: 0, fetchImpl: fetchSpy })

    queue.enqueue({ slug: "fastapi", action: "star" })
    await expect(queue.flush()).resolves.toBeUndefined()
    expect(fetchSpy).toHaveBeenCalledTimes(1)
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
})
