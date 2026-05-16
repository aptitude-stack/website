import fetchMock from "jest-fetch-mock"
import {
  REGISTRY_FETCH_TIMEOUT_MS,
  StarEventSubmissionError,
  fetchCatalogSkillCards,
  fetchCatalogSkillCardsSafe,
  fetchSkillGraph,
  fetchSkillCardData,
  fetchTopSkillCards,
  fetchTopSkillCardsSafe,
  hasRegistryEnv,
  registryFetch,
  searchSkillCards,
  submitStarEvents,
} from "@/lib/registry-client"
import type { SkillGraphResponseDto, SkillVersionListDto, SkillVersionMetadataDto } from "@/lib/types"

const ORIGINAL_NODE_ENV = process.env.NODE_ENV

beforeEach(() => {
  fetchMock.resetMocks()
  setNodeEnv(ORIGINAL_NODE_ENV)
  process.env.REGISTRY_BASE_URL = "https://registry.example.com"
  process.env.REGISTRY_READ_TOKEN = "tid.secret"
  process.env.REGISTRY_TELEMETRY_TOKEN = "telemetry-id.telemetry-secret"
})

function setNodeEnv(value: string | undefined): void {
  const env = process.env as Record<string, string | undefined>
  env.NODE_ENV = value
}

describe("registryFetch", () => {
  it("sends bearer token", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ ok: true }))
    await registryFetch("/test")
    expect(fetchMock).toHaveBeenCalledWith(
      "https://registry.example.com/test",
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: "Bearer tid.secret" }) })
    )
  })

  it("throws on non-ok response", async () => {
    fetchMock.mockResponseOnce("Forbidden", { status: 403 })
    await expect(registryFetch("/test")).rejects.toThrow("Registry 403")
  })

  it("rejects invalid registry base URLs", async () => {
    process.env.REGISTRY_BASE_URL = "javascript:alert(1)"
    await expect(registryFetch("/test")).rejects.toThrow("REGISTRY_BASE_URL")
  })

  it("uses seeded local registry defaults in development", async () => {
    setNodeEnv("development")
    delete process.env.REGISTRY_BASE_URL
    delete process.env.REGISTRY_READ_TOKEN
    fetchMock.mockResponseOnce(JSON.stringify({ ok: true }))

    await registryFetch("/test")

    expect(hasRegistryEnv()).toBe(true)
    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:8000/test",
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer reader-token.dev-reader-secret" }),
      })
    )
  })
})

describe("fetchSkillCardData", () => {
  it("returns SkillCardData by combining version list and metadata", async () => {
    const versionList: SkillVersionListDto = {
      slug: "fastapi",
      versions: [{ version: "1.0.0", lifecycle_status: "published", trust_tier: "verified", namespace: "public", artifact_origin: "authored", review_state: "approved", promotion_channel: "prod", policy_pack_slug: null, published_at: "2024-01-01T00:00:00Z", is_current_default: true }],
    }
    const meta: SkillVersionMetadataDto = {
      slug: "fastapi", version: "1.0.0", install_count: 5, star_count: 2,
      version_checksum: { algorithm: "sha256", digest: "abc" },
      content: { checksum: { algorithm: "sha256", digest: "abc" }, media_type: "application/zstd", size_bytes: 2048 },
      metadata: { name: "FastAPI", description: "FastAPI skill", tags: ["python"], inputs_schema: null, outputs_schema: null, token_estimate: 900, maturity_score: 0.9, security_score: 0.85 },
      lifecycle_status: "published", trust_tier: "verified", namespace: "public",
      artifact_origin: "authored", review_state: "approved", promotion_channel: "prod",
      policy_pack_slug: null, provenance: null, published_at: "2024-01-01T00:00:00Z",
    }
    fetchMock.mockResponseOnce(JSON.stringify(versionList))
    fetchMock.mockResponseOnce(JSON.stringify(meta))

    const result = await fetchSkillCardData("fastapi")

    expect(result?.name).toBe("FastAPI")
    expect(result?.size_bytes).toBe(2048)
    expect(result?.version).toBe("1.0.0")
    expect(result?.install_count).toBe(5)
    expect(result?.star_count).toBe(2)
  })

  it("returns null if no versions available", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ slug: "empty", versions: [] }))
    const result = await fetchSkillCardData("empty")
    expect(result).toBeNull()
  })
})

describe("fetchTopSkillCards", () => {
  it("fetches top skills and flattens metadata", async () => {
    const meta: SkillVersionMetadataDto = {
      slug: "fastapi", version: "1.0.0", install_count: 1284, star_count: 9,
      version_checksum: { algorithm: "sha256", digest: "abc" },
      content: { checksum: { algorithm: "sha256", digest: "abc" }, media_type: "application/zstd", size_bytes: 2048 },
      metadata: { name: "FastAPI", description: "FastAPI skill", tags: ["python"], inputs_schema: null, outputs_schema: null, token_estimate: 900, maturity_score: 0.9, security_score: 0.85 },
      lifecycle_status: "published", trust_tier: "verified", namespace: "public",
      artifact_origin: "authored", review_state: "approved", promotion_channel: "prod",
      policy_pack_slug: null, provenance: null, published_at: "2024-01-01T00:00:00Z",
    }
    fetchMock.mockResponseOnce(JSON.stringify({ skills: [meta] }))

    const result = await fetchTopSkillCards()

    expect(fetchMock).toHaveBeenCalledWith(
      "https://registry.example.com/catalog/top-skills?limit=12",
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: "Bearer tid.secret" }) })
    )
    expect(result).toHaveLength(1)
    expect(result[0].slug).toBe("fastapi")
    expect(result[0].install_count).toBe(1284)
    expect(result[0].star_count).toBe(9)
  })

  it("returns empty top skills when registry env is missing", async () => {
    delete process.env.REGISTRY_BASE_URL
    await expect(fetchTopSkillCardsSafe()).resolves.toEqual([])
  })

  it("returns empty top skills when registry env is invalid", async () => {
    process.env.REGISTRY_BASE_URL = "javascript:alert(1)"
    await expect(fetchTopSkillCardsSafe()).resolves.toEqual([])
  })

  it("returns empty top skills when registry returns 500", async () => {
    fetchMock.mockResponseOnce("Internal error", { status: 500 })
    await expect(fetchTopSkillCardsSafe()).resolves.toEqual([])
  })

  it("returns empty top skills when the registry response is malformed", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ skills: [{ slug: "missing-fields" }] }))
    await expect(fetchTopSkillCardsSafe()).resolves.toEqual([])
  })

  it("returns empty top skills when the registry fetch times out", async () => {
    jest.useFakeTimers()
    fetchMock.mockImplementationOnce((_url, init) => {
      const signal = init?.signal
      return new Promise<Response>((_resolve, reject) => {
        signal?.addEventListener("abort", () => {
          reject(Object.assign(new Error("aborted"), { name: "AbortError" }))
        })
      })
    })

    const result = fetchTopSkillCardsSafe()
    jest.advanceTimersByTime(REGISTRY_FETCH_TIMEOUT_MS)

    await expect(result).resolves.toEqual([])
    jest.useRealTimers()
  })
})

describe("fetchCatalogSkillCards", () => {
  it("fetches all catalog skills ordered by registry install rank", async () => {
    const meta: SkillVersionMetadataDto = {
      slug: "fastapi", version: "1.0.0", install_count: 1284, star_count: 0,
      version_checksum: { algorithm: "sha256", digest: "abc" },
      content: { checksum: { algorithm: "sha256", digest: "abc" }, media_type: "application/zstd", size_bytes: 2048 },
      metadata: { name: "FastAPI", description: "FastAPI skill", tags: ["python"], inputs_schema: null, outputs_schema: null, token_estimate: 900, maturity_score: 0.9, security_score: 0.85 },
      lifecycle_status: "published", trust_tier: "verified", namespace: "public",
      artifact_origin: "authored", review_state: "approved", promotion_channel: "prod",
      policy_pack_slug: null, provenance: null, published_at: "2024-01-01T00:00:00Z",
    }
    fetchMock.mockResponseOnce(JSON.stringify({ skills: [meta] }))

    const result = await fetchCatalogSkillCards()

    expect(fetchMock).toHaveBeenCalledWith(
      "https://registry.example.com/catalog/skills",
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: "Bearer tid.secret" }) })
    )
    expect(result).toHaveLength(1)
    expect(result[0].slug).toBe("fastapi")
    expect(result[0].install_count).toBe(1284)
  })

  it("returns empty catalog skills when the registry response is malformed", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ skills: [{ slug: "missing-fields" }] }))
    await expect(fetchCatalogSkillCardsSafe()).resolves.toEqual([])
  })
})

describe("fetchSkillGraph", () => {
  it("fetches the bounded skill graph", async () => {
    const graph: SkillGraphResponseDto = {
      nodes: [
        {
          slug: "fastapi",
          version: "1.0.0",
          name: "FastAPI",
          install_count: 1284,
          star_count: 31,
          trust_tier: "verified",
          lifecycle_status: "published",
        },
      ],
      edges: [],
    }
    fetchMock.mockResponseOnce(JSON.stringify(graph))

    const result = await fetchSkillGraph()

    expect(fetchMock).toHaveBeenCalledWith(
      "https://registry.example.com/catalog/skill-graph?limit=24",
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: "Bearer tid.secret" }) })
    )
    expect(result.nodes[0].name).toBe("FastAPI")
  })

  it("rejects malformed skill graph responses", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ nodes: [{ slug: "missing-fields" }], edges: [] }))
    await expect(fetchSkillGraph()).rejects.toThrow("Invalid registry skill graph node")
  })
})

describe("searchSkillCards", () => {
  it("posts { name: query } to catalog search and returns skill cards", async () => {
    const meta: SkillVersionMetadataDto = {
      slug: "fastapi", version: "1.0.0", install_count: 3, star_count: 0,
      version_checksum: { algorithm: "sha256", digest: "abc" },
      content: { checksum: { algorithm: "sha256", digest: "abc" }, media_type: "application/zstd", size_bytes: 2048 },
      metadata: { name: "FastAPI", description: "FastAPI skill", tags: ["python"], inputs_schema: null, outputs_schema: null, token_estimate: 900, maturity_score: 0.9, security_score: 0.85 },
      lifecycle_status: "published", trust_tier: "verified", namespace: "public",
      artifact_origin: "authored", review_state: "approved", promotion_channel: "prod",
      policy_pack_slug: null, provenance: null, published_at: "2024-01-01T00:00:00Z",
    }
    fetchMock.mockResponseOnce(JSON.stringify({ skills: [meta] }))
    const result = await searchSkillCards("review fastapi code")
    expect(fetchMock).toHaveBeenCalledWith(
      "https://registry.example.com/catalog/search?limit=20",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ name: "review fastapi code" }),
      })
    )
    expect(result).toHaveLength(1)
    expect(result[0].slug).toBe("fastapi")
  })

  it("returns empty array when no skills match", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ skills: [] }))
    const result = await searchSkillCards("nonexistent")
    expect(result).toEqual([])
  })

  it("rejects malformed catalog search responses", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ skills: ["fastapi"] }))
    await expect(searchSkillCards("fastapi")).rejects.toThrow("Invalid registry metadata response")
  })
})

describe("submitStarEvents", () => {
  it("posts the batch with the telemetry token", async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        accepted: 2,
        counts: [
          { slug: "fastapi", star_count: 5 },
          { slug: "python.test", star_count: 3 },
        ],
      }),
    )

    const result = await submitStarEvents([
      { slug: "fastapi", action: "star" },
      { slug: "python.test", action: "unstar" },
    ])

    expect(result.accepted).toBe(2)
    expect(result.counts[0]).toEqual({ slug: "fastapi", star_count: 5 })
    expect(fetchMock).toHaveBeenCalledWith(
      "https://registry.example.com/catalog/star-events",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          events: [
            { slug: "fastapi", action: "star" },
            { slug: "python.test", action: "unstar" },
          ],
        }),
        headers: expect.objectContaining({
          Authorization: "Bearer telemetry-id.telemetry-secret",
        }),
      }),
    )
  })

  it("returns an empty response when no events are queued", async () => {
    const result = await submitStarEvents([])
    expect(result).toEqual({ accepted: 0, counts: [] })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("throws StarEventSubmissionError when the registry returns a non-200", async () => {
    fetchMock.mockResponseOnce("Not Found", { status: 404 })

    let caught: unknown
    try {
      await submitStarEvents([{ slug: "fastapi", action: "star" }])
    } catch (error) {
      caught = error
    }

    expect(caught).toBeInstanceOf(StarEventSubmissionError)
    expect((caught as StarEventSubmissionError).status).toBe(404)
  })

  it("throws when the registry telemetry token is missing", async () => {
    delete process.env.REGISTRY_TELEMETRY_TOKEN
    await expect(
      submitStarEvents([{ slug: "fastapi", action: "star" }]),
    ).rejects.toThrow("REGISTRY_TELEMETRY_TOKEN")
  })
})
