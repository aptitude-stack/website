/**
 * @jest-environment node
 */
import fetchMock from "jest-fetch-mock"
import { POST } from "@/app/api/star-events/route"
import { SESSION_COOKIE_NAME, createSessionToken } from "@/lib/auth-session"
import { NextRequest } from "next/server"

beforeAll(() => {
  if (!global.Response.json) {
    global.Response.json = function (data: unknown, init?: ResponseInit) {
      return new global.Response(JSON.stringify(data), {
        ...init,
        headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
      })
    }
  }
})

beforeEach(() => {
  fetchMock.resetMocks()
  process.env.REGISTRY_BASE_URL = "https://registry.example.com"
  process.env.REGISTRY_READ_TOKEN = "reader.secret"
  process.env.REGISTRY_TELEMETRY_TOKEN = "telemetry-id.telemetry-secret"
  process.env.APTITUDE_SESSION_SECRET = "test-session-secret"
})

async function makeRequest(body: unknown, subject = "operator@example.com") {
  const token = await createSessionToken(subject)
  return new NextRequest("http://localhost/api/star-events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `${SESSION_COOKIE_NAME}=${token}`,
    },
    body: JSON.stringify(body),
  })
}

async function makeRawRequest(body: string) {
  const token = await createSessionToken("operator@example.com")
  return new NextRequest("http://localhost/api/star-events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `${SESSION_COOKIE_NAME}=${token}`,
    },
    body,
  })
}

function makeUnauthenticatedRequest(body: unknown) {
  return new NextRequest("http://localhost/api/star-events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

describe("POST /api/star-events", () => {
  it("returns 401 when session is missing", async () => {
    const res = await POST(
      makeUnauthenticatedRequest({ events: [{ slug: "fastapi", action: "star" }] }),
    )
    expect(res.status).toBe(401)
    await expect(res.json()).resolves.toMatchObject({
      error: "Unauthorized",
      code: "STAR_EVENTS_UNAUTHENTICATED",
      detail: "Missing or invalid aptitude_session cookie.",
    })
  })

  it("returns 400 when JSON is malformed", async () => {
    const res = await POST(await makeRawRequest("{"))
    expect(res.status).toBe(400)
  })

  it("returns 400 when events is missing", async () => {
    const res = await POST(await makeRequest({}))
    expect(res.status).toBe(400)
  })

  it("returns 400 when events is empty", async () => {
    const res = await POST(await makeRequest({ events: [] }))
    expect(res.status).toBe(400)
  })

  it("returns 400 when event action is invalid", async () => {
    const res = await POST(await makeRequest({ events: [{ slug: "fastapi", action: "favorite" }] }))
    expect(res.status).toBe(400)
  })

  it("returns 400 when slug is invalid", async () => {
    const res = await POST(await makeRequest({ events: [{ slug: "***bad***", action: "star" }] }))
    expect(res.status).toBe(400)
  })

  it("returns 400 when slug is dotted", async () => {
    const res = await POST(await makeRequest({ events: [{ slug: "python.lint", action: "star" }] }))
    expect(res.status).toBe(400)
  })

  it("returns 400 when more than 100 events are submitted", async () => {
    const events = Array.from({ length: 101 }, (_, index) => ({
      slug: `python-lint-${index}`,
      action: "star" as const,
    }))
    const res = await POST(await makeRequest({ events }))
    expect(res.status).toBe(400)
  })

  it("returns 502 when registry is unavailable", async () => {
    fetchMock.mockRejectOnce(new Error("Network error"))
    const res = await POST(await makeRequest({ events: [{ slug: "fastapi", action: "star" }] }))
    expect(res.status).toBe(502)
    await expect(res.json()).resolves.toMatchObject({
      error: "Star events unavailable",
      code: "STAR_EVENTS_REGISTRY_UNAVAILABLE",
      detail: "Network error",
    })
  })

  it("returns 404 when registry rejects an unknown slug", async () => {
    fetchMock.mockResponseOnce("Unknown skill", { status: 404 })
    const res = await POST(await makeRequest({ events: [{ slug: "fastapi", action: "star" }] }))
    expect(res.status).toBe(404)
    await expect(res.json()).resolves.toMatchObject({
      error: "Unknown skill slug",
      code: "STAR_EVENTS_UNKNOWN_SKILL",
      registryStatus: 404,
      registryBody: "Unknown skill",
    })
  })

  it("forwards the batch with the telemetry token and session subject on success", async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        accepted: 1,
        counts: [{ slug: "fastapi", star_count: 12 }],
      }),
    )

    const res = await POST(await makeRequest({ events: [{ slug: "fastapi", action: "star" }] }))

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.accepted).toBe(1)
    expect(data.counts).toEqual([{ slug: "fastapi", star_count: 12 }])
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(
      "https://registry.example.com/catalog/star-events",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          user_subject: "operator@example.com",
          events: [{ slug: "fastapi", action: "star" }],
        }),
        headers: expect.objectContaining({
          Authorization: "Bearer telemetry-id.telemetry-secret",
        }),
      }),
    )
  })
})
