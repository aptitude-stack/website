import fetchMock from "jest-fetch-mock"
import {
  REGISTRY_FETCH_TIMEOUT_MS,
  fetchSkillCardData,
  fetchTopSkillCards,
  fetchTopSkillCardsSafe,
  registryFetch,
  searchSkillCards,
} from "@/lib/registry-client"
import type { SkillVersionListDto, SkillVersionMetadataDto } from "@/lib/types"

beforeEach(() => {
  fetchMock.resetMocks()
  process.env.REGISTRY_BASE_URL = "https://registry.example.com"
  process.env.REGISTRY_READ_TOKEN = "tid.secret"
})

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
})

describe("fetchSkillCardData", () => {
  it("returns SkillCardData by combining version list and metadata", async () => {
    const versionList: SkillVersionListDto = {
      slug: "fastapi",
      versions: [{ version: "1.0.0", lifecycle_status: "published", trust_tier: "verified", namespace: "public", artifact_origin: "authored", review_state: "approved", promotion_channel: "prod", policy_pack_slug: null, published_at: "2024-01-01T00:00:00Z", is_current_default: true }],
    }
    const meta: SkillVersionMetadataDto = {
      slug: "fastapi", version: "1.0.0", install_count: 5,
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
      slug: "fastapi", version: "1.0.0", install_count: 1284,
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

describe("searchSkillCards", () => {
  it("posts { name: query } to catalog search and returns skill cards", async () => {
    const meta: SkillVersionMetadataDto = {
      slug: "fastapi", version: "1.0.0", install_count: 3,
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
