import { fireEvent, render, screen, within } from "@testing-library/react"
import fetchMock from "jest-fetch-mock"
import { SkillHeader } from "@/components/skill-header"
import { SkillMetadata } from "@/components/skill-metadata"
import { __resetStarCountStoreForTests } from "@/lib/star-count-store"
import { __resetStarEventQueueForTests, flushStarEvents } from "@/lib/star-event-queue"
import {
  __resetStarredSkillsStoreForTests,
  __setStarredSkillsStoreForTests,
} from "@/lib/starred-skills-store"
import type { SkillVersionMetadataDto } from "@/lib/types"

const meta: SkillVersionMetadataDto = {
  slug: "documentation-writing",
  version: "0.1.0-publish.20260515115306",
  install_count: 10,
  star_count: 7,
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
  beforeEach(() => {
    fetchMock.resetMocks()
    fetchMock.mockResponse(JSON.stringify({ accepted: 1, counts: [] }))
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

  it("includes the star action to the right of the install command", () => {
    const { container } = render(<SkillHeader meta={meta} />)

    const skillActions = container.querySelector(".skill-actions")
    const installCommand = skillActions?.querySelector(".install-command")
    const button = screen.getByRole("button", { name: "Star Documentation Writing" })

    expect(skillActions).not.toBeNull()
    expect(installCommand).not.toBeNull()
    expect(button).toHaveAttribute("title", "7 stars")
    expect(skillActions?.lastElementChild).toBe(button)
  })

  it("omits a version flag from the default install command", () => {
    render(<SkillHeader meta={meta} />)

    expect(screen.getByText("uvx aptitude-resolver install documentation-writing")).toBeInTheDocument()
    expect(screen.queryByText(/--version/)).not.toBeInTheDocument()
  })

  it("includes a version flag for explicit version installs", () => {
    render(<SkillHeader meta={meta} installVersion={meta.version} />)

    expect(screen.getByText(
      "uvx aptitude-resolver install documentation-writing --version 0.1.0-publish.20260515115306",
    )).toBeInTheDocument()
  })

  it("updates metadata stars and sends star event deltas from the header action", async () => {
    render(
      <>
        <SkillHeader meta={meta} />
        <SkillMetadata meta={meta} />
      </>,
    )

    const starsRow = screen.getByText("Stars").closest(".meta-row")
    expect(starsRow).not.toBeNull()
    expect(within(starsRow as HTMLElement).getByText("7")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Star Documentation Writing" }))
    await flushStarEvents()

    expect(within(starsRow as HTMLElement).getByText("8")).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({
      events: [{ slug: "documentation-writing", action: "star" }],
    })

    fireEvent.click(screen.getByRole("button", { name: "Unstar Documentation Writing" }))
    await flushStarEvents()

    expect(within(starsRow as HTMLElement).getByText("7")).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(JSON.parse(String(fetchMock.mock.calls[1][1]?.body))).toEqual({
      events: [{ slug: "documentation-writing", action: "unstar" }],
    })
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
