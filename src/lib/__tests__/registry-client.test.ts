import fetchMock from "jest-fetch-mock"
import { registryFetch, fetchSkillCardData, fetchSkillVersionList, fetchSkillMetadata, discoverSlugs, fetchTopSkillCards } from "@/lib/registry-client"
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
})

describe("fetchSkillCardData", () => {
  it("returns SkillCardData by combining version list and metadata", async () => {
    const versionList: SkillVersionListDto = {
      slug: "fastapi",
      versions: [{ version: "1.0.0", lifecycle_status: "published", trust_tier: "trusted", namespace: "public", artifact_origin: "authored", review_state: "approved", promotion_channel: "prod", policy_pack_slug: null, published_at: "2024-01-01T00:00:00Z", is_current_default: true }],
    }
    const meta: SkillVersionMetadataDto = {
      slug: "fastapi", version: "1.0.0", install_count: 5,
      version_checksum: { algorithm: "sha256", digest: "abc" },
      content: { checksum: { algorithm: "sha256", digest: "abc" }, media_type: "application/zstd", size_bytes: 2048 },
      metadata: { name: "FastAPI", description: "FastAPI skill", tags: ["python"], inputs_schema: null, outputs_schema: null, token_estimate: 900, maturity_score: 0.9, security_score: 0.85 },
      lifecycle_status: "published", trust_tier: "trusted", namespace: "public",
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
      lifecycle_status: "published", trust_tier: "trusted", namespace: "public",
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
})

describe("discoverSlugs", () => {
  it("posts { name: query } and returns candidates array", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ candidates: ["fastapi", "ruff"] }))
    const result = await discoverSlugs("review fastapi code")
    expect(fetchMock).toHaveBeenCalledWith(
      "https://registry.example.com/discovery",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ name: "review fastapi code" }),
      })
    )
    expect(result).toEqual(["fastapi", "ruff"])
  })

  it("returns empty array when no candidates", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ candidates: [] }))
    const result = await discoverSlugs("nonexistent")
    expect(result).toEqual([])
  })
})
