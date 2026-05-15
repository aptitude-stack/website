import { render, screen } from "@testing-library/react"
import { SkillHeader } from "@/components/skill-header"
import type { SkillVersionMetadataDto } from "@/lib/types"

const meta: SkillVersionMetadataDto = {
  slug: "documentation-writing",
  version: "0.1.0-publish.20260515115306",
  install_count: 10,
  version_checksum: { algorithm: "sha256", digest: "abc" },
  content: { checksum: { algorithm: "sha256", digest: "abc" }, media_type: "application/zstd", size_bytes: 2048 },
  metadata: {
    name: "Documentation Writing",
    description: "Use when writing, reviewing, or reorganizing README files.",
    tags: ["catalog", "documentation", "skill", "writing"],
    inputs_schema: null,
    outputs_schema: null,
    token_estimate: 900,
    maturity_score: 0.9,
    security_score: 0.8,
  },
  lifecycle_status: "published",
  trust_tier: "internal",
  namespace: "public",
  artifact_origin: "authored",
  review_state: "approved",
  promotion_channel: "prod",
  policy_pack_slug: null,
  provenance: null,
  published_at: "2026-05-15T00:00:00Z",
}

describe("SkillHeader", () => {
  it("keeps status metadata out of the hero line", () => {
    render(<SkillHeader meta={meta} />)

    expect(screen.getByRole("heading", { name: "Documentation Writing" })).toBeInTheDocument()
    expect(screen.getByText(/Use when writing/)).toBeInTheDocument()
    expect(screen.queryByText("documentation-writing@0.1.0-publish.20260515115306")).not.toBeInTheDocument()
    expect(screen.queryByText("published")).not.toBeInTheDocument()
    expect(screen.queryByText("internal")).not.toBeInTheDocument()
    expect(screen.queryByText("May 15, 2026")).not.toBeInTheDocument()
  })

  it("shows tags under the description", () => {
    const { container } = render(<SkillHeader meta={meta} />)

    const description = screen.getByText(/Use when writing/)
    const tags = container.querySelector(".skill-hero__tags")

    expect(tags).not.toBeNull()
    expect(description.compareDocumentPosition(tags as Element) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.getByText("documentation")).toBeInTheDocument()
    expect(screen.getByText("writing")).toBeInTheDocument()
  })
})
