import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { CatalogView, getTopSkillLimitForWidth } from "@/components/catalog-view"
import type { SkillCardData } from "@/lib/types"

function makeSkill(slug: string, install_count: number): SkillCardData {
  return {
    slug,
    version: "1.0.0",
    install_count,
    name: slug,
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

describe("CatalogView", () => {
  beforeEach(() => {
    fetchMock.resetMocks()
    mockViewport(390)
  })

  it("maps viewport width to top skill count", () => {
    expect(getTopSkillLimitForWidth(390)).toBe(4)
    expect(getTopSkillLimitForWidth(800)).toBe(8)
    expect(getTopSkillLimitForWidth(1280)).toBe(12)
  })

  it("shows top installed skills before search using the viewport limit", async () => {
    const skills = Array.from({ length: 12 }, (_, index) => makeSkill(`skill-${index + 1}`, 20 - index))

    render(<CatalogView topSkills={skills} />)

    await waitFor(() => {
      expect(screen.queryByText("skill-5")).not.toBeInTheDocument()
    })
    expect(screen.getByText("Top Installed Skills")).toBeInTheDocument()
    expect(screen.getByText("skill-1")).toBeInTheDocument()
    expect(screen.getByText("skill-4")).toBeInTheDocument()
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
})
