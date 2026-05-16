import { render, screen } from "@testing-library/react"
import { SkillRelationships } from "@/components/skill-relationships"
import type { SkillGraphData } from "@/lib/types"

const graph: SkillGraphData = {
  nodes: [
    {
      slug: "python.fastapi",
      version: "1.0.0",
      name: "FastAPI",
      install_count: 128,
      star_count: 0,
      trust_tier: "verified",
      lifecycle_status: "published",
    },
    {
      slug: "python.testing",
      version: "1.0.0",
      name: "Python Testing",
      install_count: 84,
      star_count: 0,
      trust_tier: "verified",
      lifecycle_status: "published",
    },
    {
      slug: "python.patterns",
      version: "1.0.0",
      name: "Python Patterns",
      install_count: 64,
      star_count: 0,
      trust_tier: "verified",
      lifecycle_status: "published",
    },
    {
      slug: "docs.writer",
      version: "1.0.0",
      name: "Docs Writer",
      install_count: 32,
      star_count: 0,
      trust_tier: "internal",
      lifecycle_status: "published",
    },
  ],
  edges: [
    { source_slug: "python.fastapi", target_slug: "python.testing", edge_type: "depends_on" },
    { source_slug: "python.patterns", target_slug: "python.fastapi", edge_type: "extends" },
    { source_slug: "python.testing", target_slug: "docs.writer", edge_type: "overlaps_with" },
  ],
}

describe("SkillRelationships", () => {
  it("renders first-tier relationships for the current skill", () => {
    render(<SkillRelationships graph={graph} slug="python.fastapi" />)

    expect(screen.getByRole("heading", { name: "Relationships" })).toBeInTheDocument()
    expect(screen.getByText("Depends On")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Python Testing" })).toHaveAttribute("href", "/skills/python.testing")
    expect(screen.getByText("Extended By")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Python Patterns" })).toHaveAttribute("href", "/skills/python.patterns")
    expect(screen.queryByText("Docs Writer")).not.toBeInTheDocument()
  })

  it("renders nothing when the skill has no graph relationships", () => {
    const { container } = render(<SkillRelationships graph={graph} slug="unknown.skill" />)

    expect(container).toBeEmptyDOMElement()
  })
})
