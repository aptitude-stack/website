import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { CatalogView, getTopSkillLimitForWidth } from "@/components/catalog-view"
import type { SkillCardData, SkillGraphData } from "@/lib/types"

function makeSkill(slug: string, install_count: number): SkillCardData {
  return {
    slug,
    version: "1.0.0",
    install_count,
    name: `${slug} name`,
    description: `${slug} description`,
    tags: ["test"],
    lifecycle_status: "published",
    trust_tier: "verified",
    token_estimate: 900,
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
      trust_tier: "verified",
      lifecycle_status: "published",
    },
    {
      slug: "skill-2",
      version: "1.0.0",
      name: "Skill 2",
      install_count: 12,
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
      expect(screen.queryByText("skill-9")).not.toBeInTheDocument()
    })
    expect(screen.getByText("All Skills")).toBeInTheDocument()
    expect(screen.getByText("skill-1")).toBeInTheDocument()
    expect(screen.getByText("skill-8")).toBeInTheDocument()
    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Next all skills page" }))

    expect(screen.queryByText("skill-1")).not.toBeInTheDocument()
    expect(screen.getByText("skill-9")).toBeInTheDocument()
    expect(screen.getByText("skill-12")).toBeInTheDocument()
    expect(screen.getByText("Page 2 of 2")).toBeInTheDocument()
  })

  it("shows search results after a query", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ candidates: [makeSkill("search-result", 5)] }))

    render(<CatalogView topSkills={[makeSkill("top-skill", 12)]} />)
    fireEvent.change(screen.getByRole("textbox", { name: "Search skills" }), {
      target: { value: "search" },
    })

    await waitFor(() => {
      expect(screen.getByText("Search Results")).toBeInTheDocument()
      expect(screen.getByText("search-result")).toBeInTheDocument()
    }, { timeout: 1000 })
    expect(screen.queryByText("top-skill")).not.toBeInTheDocument()
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
      expect(screen.getByText("search-result")).toBeInTheDocument()
    }, { timeout: 1000 })

    fireEvent.change(searchInput, {
      target: { value: "" },
    })

    await waitFor(() => {
      expect(screen.getByText("All Skills")).toBeInTheDocument()
      expect(screen.getByText("top-skill")).toBeInTheDocument()
    }, { timeout: 1000 })
    expect(screen.queryByText("search-result")).not.toBeInTheDocument()
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
