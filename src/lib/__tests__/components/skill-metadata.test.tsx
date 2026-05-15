import { render, screen } from "@testing-library/react"
import { SkillMetadata } from "@/components/skill-metadata"
import type { SkillVersionMetadataDto } from "@/lib/types"

function makeMeta(repo_url: string | null): SkillVersionMetadataDto {
  return {
    slug: "fastapi",
    version: "1.0.0",
    install_count: 10,
    version_checksum: { algorithm: "sha256", digest: "abc" },
    content: { checksum: { algorithm: "sha256", digest: "abc" }, media_type: "application/zstd", size_bytes: 2048 },
    metadata: {
      name: "FastAPI",
      description: "FastAPI skill",
      tags: ["python"],
      inputs_schema: null,
      outputs_schema: null,
      token_estimate: 900,
      maturity_score: 0.9,
      security_score: 0.8,
    },
    lifecycle_status: "published",
    trust_tier: "verified",
    namespace: "public",
    artifact_origin: "authored",
    review_state: "approved",
    promotion_channel: "prod",
    policy_pack_slug: null,
    provenance: repo_url
      ? {
          repo_url,
          commit_sha: "abc123",
          tree_path: null,
          publisher_identity: null,
          trust_context: null,
        }
      : null,
    published_at: "2024-01-01T00:00:00Z",
  }
}

describe("SkillMetadata", () => {
  it("renders publication metadata without tag chips", () => {
    render(<SkillMetadata meta={makeMeta(null)} />)

    expect(screen.getByText("Status")).toBeInTheDocument()
    expect(screen.getByText("PUBLISHED")).toBeInTheDocument()
    expect(screen.getByText("Access")).toBeInTheDocument()
    expect(screen.getByText("VERIFIED")).toBeInTheDocument()
    expect(screen.getByText("Published")).toBeInTheDocument()
    expect(screen.getByText("Jan 1, 2024")).toBeInTheDocument()
    expect(screen.getByText("Maturity")).toBeInTheDocument()
    expect(screen.getByText("90/100")).toBeInTheDocument()
    expect(screen.getByText("Security")).toBeInTheDocument()
    expect(screen.getByText("80/100")).toBeInTheDocument()
    expect(screen.queryByText("Tags")).not.toBeInTheDocument()
    expect(screen.queryByText("python")).not.toBeInTheDocument()
  })

  it("does not crash or render a source link for invalid provenance URLs", () => {
    render(<SkillMetadata meta={makeMeta("not a url")} />)
    expect(screen.queryByRole("link")).not.toBeInTheDocument()
  })

  it("renders safe source links", () => {
    render(<SkillMetadata meta={makeMeta("https://github.com/aptitude-stack/registry")} />)
    expect(screen.getByRole("link", { name: /github.com/ })).toHaveAttribute(
      "href",
      "https://github.com/aptitude-stack/registry",
    )
  })

  it("renders all metadata without a collapsed disclosure", () => {
    render(<SkillMetadata meta={makeMeta("https://github.com/aptitude-stack/registry")} />)

    expect(screen.queryByText("More Details")).not.toBeInTheDocument()
    expect(screen.getByText("Tokens")).toBeInTheDocument()
    expect(screen.getByText("~900")).toBeInTheDocument()
    expect(screen.getByText("Size")).toBeInTheDocument()
    expect(screen.getByText("2.0 KB")).toBeInTheDocument()
    expect(screen.getByText("Namespace")).toBeInTheDocument()
    expect(screen.getByText("public")).toBeInTheDocument()
  })
})
