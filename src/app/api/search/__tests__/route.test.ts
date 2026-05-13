/**
 * @jest-environment node
 */
import fetchMock from "jest-fetch-mock"
import { POST } from "@/app/api/search/route"
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
})

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

describe("POST /api/search", () => {
  it("returns 400 when query is missing", async () => {
    const res = await POST(makeRequest({}))
    expect(res.status).toBe(400)
  })

  it("returns 400 when query is not a string", async () => {
    const res = await POST(makeRequest({ query: 42 }))
    expect(res.status).toBe(400)
  })

  it("returns 502 when registry is unavailable", async () => {
    fetchMock.mockRejectOnce(new Error("Network error"))
    const res = await POST(makeRequest({ query: "fastapi" }))
    expect(res.status).toBe(502)
  })

  it("returns candidates on success", async () => {
    // discoverSlugs call
    fetchMock.mockResponseOnce(JSON.stringify({ candidates: ["fastapi"] }))
    // fetchSkillVersionList for "fastapi"
    fetchMock.mockResponseOnce(JSON.stringify({
      slug: "fastapi",
      versions: [{ version: "1.0.0", lifecycle_status: "published", trust_tier: "trusted", namespace: "public", artifact_origin: "authored", review_state: "approved", promotion_channel: "prod", policy_pack_slug: null, published_at: "2024-01-01T00:00:00Z", is_current_default: true }],
    }))
    // fetchSkillMetadata for "fastapi" + "1.0.0"
    fetchMock.mockResponseOnce(JSON.stringify({
      slug: "fastapi", version: "1.0.0", install_count: 0,
      version_checksum: { algorithm: "sha256", digest: "abc" },
      content: { checksum: { algorithm: "sha256", digest: "abc" }, media_type: "application/zstd", size_bytes: 2048 },
      metadata: { name: "FastAPI", description: "FastAPI skill", tags: ["python"], inputs_schema: null, outputs_schema: null, token_estimate: 900, maturity_score: 0.9, security_score: 0.85 },
      lifecycle_status: "published", trust_tier: "trusted", namespace: "public",
      artifact_origin: "authored", review_state: "approved", promotion_channel: "prod",
      policy_pack_slug: null, provenance: null, published_at: "2024-01-01T00:00:00Z",
    }))

    const res = await POST(makeRequest({ query: "fastapi" }))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.candidates).toHaveLength(1)
    expect(data.candidates[0].slug).toBe("fastapi")
  })
})
