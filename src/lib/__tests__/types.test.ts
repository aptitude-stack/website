import type {
  SkillVersionMetadataDto,
  SkillVersionListDto,
  DiscoveryResponseDto,
  SkillCardData,
} from "@/lib/types"

describe("registry DTO types", () => {
  it("SkillVersionMetadataDto has nested metadata block", () => {
    const fixture: SkillVersionMetadataDto = {
      slug: "fastapi",
      version: "1.0.0",
      install_count: 0,
      star_count: 0,
      version_checksum: { algorithm: "sha256", digest: "abc" },
      content: { checksum: { algorithm: "sha256", digest: "abc" }, media_type: "application/zstd", size_bytes: 2048 },
      metadata: { name: "FastAPI", description: "FastAPI skill", tags: ["python"], inputs_schema: null, outputs_schema: null, token_estimate: 900, maturity_score: 0.9, security_score: 0.85 },
      lifecycle_status: "published",
      trust_tier: "verified",
      namespace: "public",
      artifact_origin: "authored",
      review_state: "approved",
      promotion_channel: "prod",
      policy_pack_slug: null,
      provenance: null,
      published_at: "2024-01-01T00:00:00Z",
    }
    expect(fixture.metadata.name).toBe("FastAPI")
    expect(fixture.content.size_bytes).toBe(2048)
  })

  it("SkillVersionListDto has versions with is_current_default", () => {
    const fixture: SkillVersionListDto = {
      slug: "fastapi",
      versions: [{
        version: "1.0.0",
        lifecycle_status: "published",
        trust_tier: "verified",
        namespace: "public",
        artifact_origin: "authored",
        review_state: "approved",
        promotion_channel: "prod",
        policy_pack_slug: null,
        published_at: "2024-01-01T00:00:00Z",
        is_current_default: true,
      }],
    }
    expect(fixture.versions[0].is_current_default).toBe(true)
  })

  it("DiscoveryResponseDto has candidates as string[]", () => {
    const fixture: DiscoveryResponseDto = { candidates: ["fastapi", "python-testing"] }
    expect(fixture.candidates[0]).toBe("fastapi")
  })

  it("SkillCardData flattens metadata for display", () => {
    const fixture: SkillCardData = {
      slug: "fastapi", version: "1.0.0", name: "FastAPI", description: "FastAPI skill",
      tags: ["python"], lifecycle_status: "published", trust_tier: "verified",
      install_count: 5, star_count: 0, token_estimate: 900, maturity_score: 0.9,
      security_score: 0.85, size_bytes: 2048, published_at: "2024-01-01T00:00:00Z",
    }
    expect(fixture.name).toBe("FastAPI")
    expect(fixture.security_score).toBe(0.85)
  })
})
