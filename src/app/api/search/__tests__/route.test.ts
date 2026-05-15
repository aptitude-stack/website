/**
 * @jest-environment node
 */
import fetchMock from "jest-fetch-mock"
import { POST } from "@/app/api/search/route"
import { SESSION_COOKIE_NAME, createSessionToken } from "@/lib/auth-session"
import { NextRequest } from "next/server"

// jest-fetch-mock replaces global.Response with cross-fetch's implementation,
// which lacks the static Response.json() method added in the Fetch living standard.
// Restore it from Node's built-in so NextResponse.json() works in tests.
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
  process.env.REGISTRY_READ_TOKEN = "tid.secret"
  process.env.APTITUDE_SESSION_SECRET = "test-session-secret"
})

async function makeRequest(body: unknown) {
  const token = await createSessionToken("operator")
  return new NextRequest("http://localhost/api/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `${SESSION_COOKIE_NAME}=${token}`,
    },
    body: JSON.stringify(body),
  })
}

async function makeRawRequest(body: string) {
  const token = await createSessionToken("operator")
  return new NextRequest("http://localhost/api/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `${SESSION_COOKIE_NAME}=${token}`,
    },
    body,
  })
}

function makeUnauthenticatedRequest(body: unknown) {
  return new NextRequest("http://localhost/api/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

describe("POST /api/search", () => {
  it("returns 401 when session is missing", async () => {
    const res = await POST(makeUnauthenticatedRequest({ query: "fastapi" }))
    expect(res.status).toBe(401)
  })

  it("returns 400 when query is missing", async () => {
    const res = await POST(await makeRequest({}))
    expect(res.status).toBe(400)
  })

  it("returns 400 when query is not a string", async () => {
    const res = await POST(await makeRequest({ query: 42 }))
    expect(res.status).toBe(400)
  })

  it("returns 400 when query is empty after trimming", async () => {
    const res = await POST(await makeRequest({ query: "   " }))
    expect(res.status).toBe(400)
  })

  it("returns 400 when query is too long", async () => {
    const res = await POST(await makeRequest({ query: "a".repeat(201) }))
    expect(res.status).toBe(400)
  })

  it("returns 400 when JSON is malformed", async () => {
    const res = await POST(await makeRawRequest("{"))
    expect(res.status).toBe(400)
  })

  it("returns 502 when registry is unavailable", async () => {
    fetchMock.mockRejectOnce(new Error("Network error"))
    const res = await POST(await makeRequest({ query: "fastapi" }))
    expect(res.status).toBe(502)
  })

  it("returns candidates on success", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({
      skills: [{
        slug: "fastapi", version: "1.0.0", install_count: 0,
        version_checksum: { algorithm: "sha256", digest: "abc" },
        content: { checksum: { algorithm: "sha256", digest: "abc" }, media_type: "application/zstd", size_bytes: 2048 },
        metadata: { name: "FastAPI", description: "FastAPI skill", tags: ["python"], inputs_schema: null, outputs_schema: null, token_estimate: 900, maturity_score: 0.9, security_score: 0.85 },
        lifecycle_status: "published", trust_tier: "verified", namespace: "public",
        artifact_origin: "authored", review_state: "approved", promotion_channel: "prod",
        policy_pack_slug: null, provenance: null, published_at: "2024-01-01T00:00:00Z",
      }],
    }))

    const res = await POST(await makeRequest({ query: "fastapi" }))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.candidates).toHaveLength(1)
    expect(data.candidates[0].slug).toBe("fastapi")
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(
      "https://registry.example.com/catalog/search?limit=20",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ name: "fastapi" }),
      }),
    )
  })

  it("performs exactly one registry fetch for browser search", async () => {
    fetchMock.mockResponse(async (req) => {
      const url = new URL(req.url)
      if (url.pathname === "/catalog/search") {
        return JSON.stringify({
          skills: Array.from({ length: 20 }, (_, index) => ({
            slug: `skill-${index}`, version: "1.0.0", install_count: 0,
            version_checksum: { algorithm: "sha256", digest: "abc" },
            content: { checksum: { algorithm: "sha256", digest: "abc" }, media_type: "application/zstd", size_bytes: 2048 },
            metadata: { name: `skill-${index}`, description: null, tags: ["test"], inputs_schema: null, outputs_schema: null, token_estimate: null, maturity_score: null, security_score: null },
            lifecycle_status: "published", trust_tier: "verified", namespace: "public",
            artifact_origin: "authored", review_state: "approved", promotion_channel: "prod",
            policy_pack_slug: null, provenance: null, published_at: "2024-01-01T00:00:00Z",
          })),
        })
      }

      return { status: 404, body: "Not found" }
    })

    const res = await POST(await makeRequest({ query: "skills" }))

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.candidates).toHaveLength(20)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0][0]).toBe("https://registry.example.com/catalog/search?limit=20")
  })
})
