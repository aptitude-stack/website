import { render, screen } from "@testing-library/react"
import { SkillCard } from "@/components/skill-card"
import type { SkillCardData } from "@/lib/types"

const fixture: SkillCardData = {
  slug: "fastapi",
  version: "1.2.0",
  name: "FastAPI",
  description: "Expert guidance for building FastAPI services.",
  tags: ["python", "api", "fastapi"],
  lifecycle_status: "published",
  trust_tier: "trusted",
  token_estimate: 900,
  size_bytes: 2048,
  published_at: "2024-06-01T00:00:00Z",
}

describe("SkillCard", () => {
  it("renders the skill slug", () => {
    render(<SkillCard card={fixture} />)
    expect(screen.getByText("fastapi")).toBeInTheDocument()
  })

  it("renders the description", () => {
    render(<SkillCard card={fixture} />)
    expect(screen.getByText(/Expert guidance for building FastAPI services/)).toBeInTheDocument()
  })

  it("renders lifecycle badge", () => {
    render(<SkillCard card={fixture} />)
    expect(screen.getByText("published")).toBeInTheDocument()
  })

  it("renders tags", () => {
    render(<SkillCard card={fixture} />)
    expect(screen.getByText("python")).toBeInTheDocument()
  })

  it("links to the skill detail page", () => {
    render(<SkillCard card={fixture} />)
    const link = screen.getByRole("link")
    expect(link).toHaveAttribute("href", "/skills/fastapi")
  })
})
