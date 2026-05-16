import { render, screen } from "@testing-library/react"
import { SkillCard } from "@/components/skill-card"
import { __resetStarredSkillsStoreForTests } from "@/lib/starred-skills-store"
import type { SkillCardData } from "@/lib/types"

const fixture: SkillCardData = {
  slug: "fastapi",
  version: "1.2.0",
  name: "FastAPI",
  description: "Expert guidance for building FastAPI services.",
  tags: ["python", "api", "fastapi"],
  lifecycle_status: "published",
  trust_tier: "verified",
  install_count: 1284,
  star_count: 42,
  token_estimate: 900,
  size_bytes: 2048,
  published_at: "2024-06-01T00:00:00Z",
}

describe("SkillCard", () => {
  afterEach(() => {
    window.localStorage.clear()
    __resetStarredSkillsStoreForTests()
  })

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

  it("renders formatted install count", () => {
    render(<SkillCard card={fixture} />)
    expect(screen.getByText("1,284 installs")).toBeInTheDocument()
  })

  it("renders formatted star count", () => {
    render(<SkillCard card={fixture} />)
    expect(screen.getByText("42 stars")).toBeInTheDocument()
  })

  it("shows an icon-only indicator when the user has saved the skill", () => {
    window.localStorage.setItem("aptitude.starredSkills", JSON.stringify(["fastapi"]))

    render(<SkillCard card={fixture} />)

    expect(screen.getByLabelText("FastAPI saved by you")).toBeInTheDocument()
    expect(screen.queryByText("Starred")).not.toBeInTheDocument()
  })

  it("uses singular star copy when count is 1", () => {
    render(<SkillCard card={{ ...fixture, star_count: 1 }} />)
    expect(screen.getByText("1 star")).toBeInTheDocument()
  })

  it("links to the skill detail page", () => {
    render(<SkillCard card={fixture} />)
    const link = screen.getByRole("link")
    expect(link).toHaveAttribute("href", "/skills/fastapi")
  })

  it.each([
    ["verified", "trust-verified"],
    ["internal", "trust-internal"],
    ["untrusted", "trust-untrusted"],
  ] as const)("renders %s trust tier with a distinct class", (trust_tier, expectedClass) => {
    render(<SkillCard card={{ ...fixture, trust_tier }} />)
    expect(screen.getByText(trust_tier)).toHaveClass(expectedClass)
  })

  it("encodes slug in the detail link", () => {
    render(<SkillCard card={{ ...fixture, slug: "python/security scan" }} />)
    const link = screen.getByRole("link")
    expect(link).toHaveAttribute("href", "/skills/python%2Fsecurity%20scan")
  })
})
