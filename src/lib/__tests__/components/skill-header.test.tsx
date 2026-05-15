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

  it("links tags back to the filtered catalog", () => {
    render(<SkillHeader meta={meta} />)

    expect(screen.getByRole("link", { name: "documentation" })).toHaveAttribute(
      "href",
      "/catalog?tag=documentation#catalog-features",
    )
  })

  it("shows maturity and security scores in the hero", () => {
    render(<SkillHeader meta={meta} />)

    expect(screen.getByRole("img", { name: "Maturity score 90 out of 100" })).toBeInTheDocument()
    expect(screen.getByRole("img", { name: "Security score 80 out of 100" })).toBeInTheDocument()
  })

  it("keeps score numbers out of the hero donut labels", () => {
    render(<SkillHeader meta={meta} />)

    const scoreGroup = screen.getByRole("group", { name: "Skill scores" })

    expect(scoreGroup).toHaveTextContent("Maturity")
    expect(scoreGroup).toHaveTextContent("Security")
    expect(scoreGroup).not.toHaveTextContent("90")
    expect(scoreGroup).not.toHaveTextContent("80")
  })

  it("renders score donuts as inline SVG circles", () => {
    const { container } = render(<SkillHeader meta={meta} />)

    const donuts = container.querySelectorAll(".score-donut__svg")

    expect(donuts).toHaveLength(2)
    expect(donuts[0]?.querySelectorAll("circle")).toHaveLength(2)
    expect(donuts[0]?.querySelector(".score-donut__progress")).toHaveAttribute("pathLength", "100")
  })

  it("exposes score values as hover hints", () => {
    const { container } = render(<SkillHeader meta={meta} />)

    const donuts = container.querySelectorAll(".score-donut")

    expect(donuts[0]).toHaveAttribute("title", "Maturity: 90/100")
    expect(donuts[0]).toHaveAttribute("data-tooltip", "Maturity: 90/100")
    expect(donuts[1]).toHaveAttribute("title", "Security: 80/100")
    expect(donuts[1]).toHaveAttribute("data-tooltip", "Security: 80/100")
  })
})
