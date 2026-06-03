import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import {
  CatalogView,
  getCatalogCompletionHints,
  getCatalogPlaceholderExamples,
  getTopSkillLimitForWidth,
} from "@/components/catalog-view"
import type { SkillCardData, SkillGraphData } from "@/lib/types"

function makeSkill(slug: string, install_count: number): SkillCardData {
  return {
    slug,
    version: "1.0.0",
    install_count,
    star_count: 0,
    name: `${slug} name`,
    description: `${slug} description`,
    tags: ["test"],
    lifecycle_status: "published",
    trust_tier: "verified",
    token_estimate: 900,
    maturity_score: 0.8,
    security_score: 0.9,
    size_bytes: 2048,
    published_at: "2024-06-01T00:00:00Z",
  }
}

function mockViewport(width: number) {
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches: query.includes("1024") ? width >= 1024 : width >= 768,
    media: query,
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }))
}

const graphData: SkillGraphData = {
  nodes: [
    {
      slug: "skill-1",
      version: "1.0.0",
      name: "Skill 1",
      install_count: 20,
      star_count: 0,
      trust_tier: "verified",
      lifecycle_status: "published",
    },
    {
      slug: "skill-2",
      version: "1.0.0",
      name: "Skill 2",
      install_count: 12,
      star_count: 0,
      trust_tier: "internal",
      lifecycle_status: "published",
    },
  ],
  edges: [{ source_slug: "skill-1", target_slug: "skill-2", edge_type: "depends_on" }],
}

describe("CatalogView", () => {
  beforeEach(() => {
    fetchMock.resetMocks()
    mockViewport(390)
  })

  it("maps viewport width to catalog page size", () => {
    expect(getTopSkillLimitForWidth(390)).toBe(4)
    expect(getTopSkillLimitForWidth(800)).toBe(6)
    expect(getTopSkillLimitForWidth(1280)).toBe(8)
  })

  it("paginates all catalog skills before search using the viewport page size", async () => {
    mockViewport(1280)
    const skills = Array.from({ length: 12 }, (_, index) => makeSkill(`skill-${index + 1}`, 20 - index))

    render(<CatalogView topSkills={skills} />)

    await waitFor(() => {
      expect(screen.queryByText("skill-9 name")).not.toBeInTheDocument()
    })
    expect(screen.getByText("All Skills")).toBeInTheDocument()
    expect(screen.getByText("skill-1 name")).toBeInTheDocument()
    expect(screen.getByText("skill-8 name")).toBeInTheDocument()
    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Next all skills page" }))

    expect(screen.queryByText("skill-1 name")).not.toBeInTheDocument()
    expect(screen.getByText("skill-9 name")).toBeInTheDocument()
    expect(screen.getByText("skill-12 name")).toBeInTheDocument()
    expect(screen.getByText("Page 2 of 2")).toBeInTheDocument()
  })

  it("filters catalog skills by selected tag", () => {
    const taggedSkill = { ...makeSkill("python-lint", 12), tags: ["python", "quality"] }
    const otherSkill = { ...makeSkill("docs", 10), tags: ["writing"] }

    render(<CatalogView topSkills={[taggedSkill, otherSkill]} selectedTag="quality" />)

    expect(screen.getByText("Tag: quality")).toBeInTheDocument()
    expect(screen.getByText("python-lint name")).toBeInTheDocument()
    expect(screen.queryByText("docs name")).not.toBeInTheDocument()
  })

  it("renders security and maturity metrics from catalog scores", () => {
    render(<CatalogView topSkills={[
      { ...makeSkill("scored-one", 8), security_score: 0.9, maturity_score: 0.8 },
      { ...makeSkill("scored-two", 4), security_score: 0.7, maturity_score: 0.6 },
      { ...makeSkill("unscored", 1), security_score: null, maturity_score: null },
    ]} />)

    expect(screen.getByText("Security")).toBeInTheDocument()
    expect(screen.getByText("Maturity")).toBeInTheDocument()
    expect(screen.getByText("80%")).toBeInTheDocument()
    expect(screen.getByText("70%")).toBeInTheDocument()
    expect(screen.queryByText("2 of 3 scored")).not.toBeInTheDocument()
  })

  it("places installs next to the skills metric", () => {
    const { container } = render(<CatalogView topSkills={[
      makeSkill("skill-one", 8),
      makeSkill("skill-two", 4),
    ]} />)

    expect(
      Array.from(container.querySelectorAll(".metric-label")).map((node) => node.textContent)
    ).toEqual(["Skills", "Installs", "Security", "Maturity"])
  })

  it("builds autocomplete hints from real catalog fields", () => {
    const skills = [
      { ...makeSkill("architect-review", 12), name: "Architect Review", tags: ["architecture", "review"] },
      { ...makeSkill("postgres-patterns", 8), name: "Postgres Patterns", tags: ["postgres", "database"] },
      { ...makeSkill("duplicate-name", 4), name: "Architect Review", tags: ["database"] },
    ]

    expect(getCatalogCompletionHints(skills)).toEqual([
      "architect-review",
      "Architect Review",
      "architecture",
      "review",
      "postgres-patterns",
      "Postgres Patterns",
      "postgres",
      "database",
      "duplicate-name",
    ])
  })

  it("builds rotating placeholder examples from real skill slugs", () => {
    const skills = [
      makeSkill("architect-review", 12),
      makeSkill("postgres-patterns", 8),
      makeSkill("architect-review", 4),
    ]

    expect(getCatalogPlaceholderExamples(skills)).toEqual([
      "architect-review",
      "postgres-patterns",
    ])
  })

  it("shows search results after a query", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ candidates: [makeSkill("search-result", 5)] }))

    render(<CatalogView topSkills={[makeSkill("top-skill", 12)]} />)
    fireEvent.change(screen.getByRole("textbox", { name: "Search skills" }), {
      target: { value: "search" },
    })

    await waitFor(() => {
      expect(screen.getByText("Search Results")).toBeInTheDocument()
      expect(screen.getByText("search-result name")).toBeInTheDocument()
    }, { timeout: 1000 })
    expect(screen.queryByText("top-skill name")).not.toBeInTheDocument()
  })

  it("returns to all catalog skills when the search box is cleared", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ candidates: [makeSkill("search-result", 5)] }))

    render(<CatalogView topSkills={[makeSkill("top-skill", 12)]} />)
    const searchInput = screen.getByRole("textbox", { name: "Search skills" })
    fireEvent.change(searchInput, {
      target: { value: "search" },
    })

    await waitFor(() => {
      expect(screen.getByText("Search Results")).toBeInTheDocument()
      expect(screen.getByText("search-result name")).toBeInTheDocument()
    }, { timeout: 1000 })

    fireEvent.change(searchInput, {
      target: { value: "" },
    })

    await waitFor(() => {
      expect(screen.getByText("All Skills")).toBeInTheDocument()
      expect(screen.getByText("top-skill name")).toBeInTheDocument()
    }, { timeout: 1000 })
    expect(screen.queryByText("search-result name")).not.toBeInTheDocument()
  })

  it("announces graph counts when graph data is provided", () => {
    render(<CatalogView topSkills={[makeSkill("skill-1", 20)]} skillGraph={graphData} />)

    expect(screen.getByText("Showing 2 skills and 1 authored relation.")).toBeInTheDocument()
  })

  it("renders a fallback graph from top skills when graph data is unavailable", () => {
    const { container } = render(<CatalogView topSkills={[makeSkill("skill-1", 20)]} skillGraph={{ nodes: [], edges: [] }} />)

    expect(screen.getByText("Showing 1 skill and 0 authored relations.")).toBeInTheDocument()
    expect(container.querySelector(".catalog-hero .skill-graph-hero")).toBeInTheDocument()
    expect(screen.getByText("Aptitude")).toBeInTheDocument()
  })
})
