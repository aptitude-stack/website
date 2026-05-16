import { fireEvent, render, screen } from "@testing-library/react"
import fetchMock from "jest-fetch-mock"
import { SkillStarButton } from "@/components/skill-star-button"
import { SkillStarCount } from "@/components/skill-star-count"
import { __resetStarCountStoreForTests } from "@/lib/star-count-store"
import { __resetStarEventQueueForTests, flushStarEvents } from "@/lib/star-event-queue"

describe("SkillStarButton", () => {
  beforeEach(() => {
    fetchMock.resetMocks()
    fetchMock.mockResponse(
      JSON.stringify({ accepted: 1, counts: [{ slug: "documentation-writing", star_count: 1 }] }),
    )
    __resetStarEventQueueForTests({ flushIntervalMs: 0 })
    __resetStarCountStoreForTests()
  })

  afterEach(() => {
    window.localStorage.clear()
    __resetStarCountStoreForTests()
  })

  it("toggles the starred state and updates the optimistic tooltip count", () => {
    render(<SkillStarButton slug="documentation-writing" name="Documentation Writing" starCount={10} />)

    const button = screen.getByRole("button", { name: "Star Documentation Writing" })
    expect(button).toHaveAttribute("aria-pressed", "false")
    expect(button).toHaveAttribute("title", "10 stars")
    expect(button).toHaveAttribute("data-tooltip", "10 stars")
    expect(button).not.toHaveTextContent("10")

    fireEvent.click(button)

    expect(button).toHaveAttribute("aria-pressed", "true")
    expect(button).toHaveAccessibleName("Unstar Documentation Writing")
    expect(button).toHaveAttribute("title", "11 stars")
    expect(window.localStorage.getItem("aptitude.starredSkills")).toBe(
      JSON.stringify(["documentation-writing"]),
    )
  })

  it("clamps the optimistic count at zero on unstar", () => {
    window.localStorage.setItem(
      "aptitude.starredSkills",
      JSON.stringify(["documentation-writing"]),
    )
    render(<SkillStarButton slug="documentation-writing" name="Documentation Writing" starCount={0} />)

    const button = screen.getByRole("button", { name: "Unstar Documentation Writing" })
    fireEvent.click(button)

    expect(button).toHaveAttribute("aria-pressed", "false")
    expect(button).toHaveAttribute("title", "0 stars")
  })

  it("restores starred state from local storage", () => {
    window.localStorage.setItem("aptitude.starredSkills", JSON.stringify(["documentation-writing"]))

    render(<SkillStarButton slug="documentation-writing" name="Documentation Writing" starCount={1} />)

    const button = screen.getByRole("button", { name: "Unstar Documentation Writing" })
    expect(button).toHaveAttribute("aria-pressed", "true")
    expect(button).toHaveAttribute("title", "1 star")
  })

  it("enqueues a network event for the star toggle", async () => {
    render(<SkillStarButton slug="documentation-writing" name="Documentation Writing" starCount={3} />)

    fireEvent.click(screen.getByRole("button", { name: "Star Documentation Writing" }))
    await flushStarEvents()

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe("/api/star-events")
    const body = JSON.parse(String(init?.body))
    expect(body).toEqual({
      events: [{ slug: "documentation-writing", action: "star" }],
    })
  })

  it("propagates optimistic count changes to sibling SkillStarCount nodes", () => {
    render(
      <>
        <SkillStarButton slug="documentation-writing" name="Documentation Writing" starCount={2} />
        <span data-testid="meta-stars">
          <SkillStarCount slug="documentation-writing" initial={2} />
        </span>
      </>,
    )

    expect(screen.getByTestId("meta-stars").textContent).toBe("2")

    fireEvent.click(screen.getByRole("button", { name: "Star Documentation Writing" }))
    expect(screen.getByTestId("meta-stars").textContent).toBe("3")

    fireEvent.click(screen.getByRole("button", { name: "Unstar Documentation Writing" }))
    expect(screen.getByTestId("meta-stars").textContent).toBe("2")
  })
})
