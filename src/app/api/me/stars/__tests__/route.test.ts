/**
 * @jest-environment node
 */
import fetchMock from "jest-fetch-mock"
import { GET } from "@/app/api/me/stars/route"
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
  process.env.REGISTRY_TELEMETRY_TOKEN = "telemetry-id.telemetry-secret"
  process.env.APTITUDE_SESSION_SECRET = "test-session-secret"
})

async function makeRequest(subject = "test1@example.com") {
  const token = await createSessionToken(subject)
  return new NextRequest("http://localhost/api/me/stars", {
    headers: {
      Cookie: `${SESSION_COOKIE_NAME}=${token}`,
    },
  })
}

describe("GET /api/me/stars", () => {
  it("returns 401 when session is missing", async () => {
    const res = await GET(new NextRequest("http://localhost/api/me/stars"))

    expect(res.status).toBe(401)
  })

  it("fetches starred slugs for the authenticated subject", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ starred_slugs: ["fastapi"] }))

    const res = await GET(await makeRequest("test1@example.com"))

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ starred_slugs: ["fastapi"] })
    expect(fetchMock).toHaveBeenCalledWith(
      "https://registry.example.com/catalog/user-stars?user_subject=test1%40example.com",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer telemetry-id.telemetry-secret",
        }),
      }),
    )
  })
})
