import { render, screen } from "@testing-library/react"
import fetchMock from "jest-fetch-mock"
import { SkillCard } from "@/components/skill-card"
import { __resetStarCountStoreForTests } from "@/lib/star-count-store"
import { __resetStarEventQueueForTests } from "@/lib/star-event-queue"
import {
  __resetStarredSkillsStoreForTests,
  __setStarredSkillsStoreForTests,
} from "@/lib/starred-skills-store"
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
  maturity_score: 0.9,
  security_score: 0.85,
  size_bytes: 2048,
  published_at: "2024-06-01T00:00:00Z",
}

describe("SkillCard", () => {
  beforeEach(() => {
    fetchMock.resetMocks()
    fetchMock.mockResponse(JSON.stringify({ accepted: 1, counts: [{ slug: "fastapi", star_count: 43 }] }))
    __resetStarEventQueueForTests({ flushIntervalMs: 0 })
    __resetStarCountStoreForTests()
    __resetStarredSkillsStoreForTests()
    __setStarredSkillsStoreForTests([])
  })

  afterEach(() => {
    window.localStorage.clear()
    __resetStarCountStoreForTests()
    __resetStarredSkillsStoreForTests()
  })

  it("does not render slug or version metadata", () => {
    render(<SkillCard card={fixture} />)
    expect(screen.queryByText("fastapi")).not.toBeInTheDocument()
    expect(screen.queryByText("v1.2.0")).not.toBeInTheDocument()
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

  it("does not expose the star action from catalog cards", () => {
    render(<SkillCard card={fixture} />)

    expect(screen.queryByRole("button", { name: "Star FastAPI" })).not.toBeInTheDocument()
  })

  it("shows an icon-only indicator when the user has saved the skill", () => {
    __setStarredSkillsStoreForTests(["fastapi"])

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

  it.each(["verified", "internal", "untrusted"] as const)("does not render %s trust tier on catalog cards", (trust_tier) => {
    render(<SkillCard card={{ ...fixture, trust_tier }} />)
    expect(screen.queryByText(trust_tier)).not.toBeInTheDocument()
  })

  it("encodes slug in the detail link", () => {
    render(<SkillCard card={{ ...fixture, slug: "python/security scan" }} />)
    const link = screen.getByRole("link")
    expect(link).toHaveAttribute("href", "/skills/python%2Fsecurity%20scan")
  })
})
