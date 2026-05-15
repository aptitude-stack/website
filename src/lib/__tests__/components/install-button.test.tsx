import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { InstallButton } from "@/components/install-button"

Object.assign(navigator, {
  clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
})

describe("InstallButton", () => {
  it("renders the install command", () => {
    render(<InstallButton slug="fastapi" />)
    expect(screen.getByText(/uvx aptitude install fastapi/)).toBeInTheDocument()
  })

  it("includes version when provided", () => {
    render(<InstallButton slug="fastapi" version="1.2.0" />)
    expect(screen.getByText(/fastapi --version 1\.2\.0/)).toBeInTheDocument()
  })

  it("copies the command to clipboard on click", async () => {
    render(<InstallButton slug="fastapi" />)
    await userEvent.click(screen.getByRole("button", { name: /copy/i }))
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("uvx aptitude install fastapi")
  })

  it("uses an icon-only copy control with status feedback", async () => {
    render(<InstallButton slug="fastapi" />)
    const button = screen.getByRole("button", { name: /copy/i })

    expect(button).toContainHTML("svg")
    expect(button).not.toHaveTextContent(/copy/i)

    await userEvent.click(button)
    expect(screen.getByRole("status")).toHaveTextContent(/clipboard/i)
  })
})
