import { fireEvent, render, screen } from "@testing-library/react"
import { SkillStarButton } from "@/components/skill-star-button"

describe("SkillStarButton", () => {
  afterEach(() => {
    window.localStorage.clear()
  })

  it("toggles the starred state and persists the skill slug", () => {
    render(<SkillStarButton slug="documentation-writing" name="Documentation Writing" starCount={10} />)

    const button = screen.getByRole("button", { name: "Star Documentation Writing" })
    expect(button).toHaveAttribute("aria-pressed", "false")
    expect(button).toHaveAttribute("title", "10 stars")
    expect(button).toHaveAttribute("data-tooltip", "10 stars")

    fireEvent.click(button)

    expect(button).toHaveAttribute("aria-pressed", "true")
    expect(button).toHaveAccessibleName("Unstar Documentation Writing")
    expect(window.localStorage.getItem("aptitude.starredSkills")).toBe(
      JSON.stringify(["documentation-writing"]),
    )
  })

  it("restores starred state from local storage", () => {
    window.localStorage.setItem("aptitude.starredSkills", JSON.stringify(["documentation-writing"]))

    render(<SkillStarButton slug="documentation-writing" name="Documentation Writing" starCount={1} />)

    const button = screen.getByRole("button", { name: "Unstar Documentation Writing" })
    expect(button).toHaveAttribute("aria-pressed", "true")
    expect(button).toHaveAttribute("title", "1 star")
  })
})
