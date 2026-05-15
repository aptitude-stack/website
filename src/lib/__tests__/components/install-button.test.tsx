import { act, fireEvent, render, screen } from "@testing-library/react"
import { InstallButton } from "@/components/install-button"

Object.assign(navigator, {
  clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
})

describe("InstallButton", () => {
  afterEach(() => {
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  it("renders the install command", () => {
    render(<InstallButton slug="fastapi" />)
    expect(screen.getByText(/uvx aptitude install fastapi/)).toBeInTheDocument()
  })

  it("includes version when provided", () => {
    render(<InstallButton slug="fastapi" version="1.2.0" />)
    expect(screen.getByText(/fastapi --version 1\.2\.0/)).toBeInTheDocument()
  })

  it("copies the command to clipboard on click", () => {
    jest.mocked(navigator.clipboard.writeText).mockImplementationOnce(() => new Promise<void>(() => {}))
    render(<InstallButton slug="fastapi" />)
    fireEvent.click(screen.getByRole("button", { name: /copy/i }))
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("uvx aptitude install fastapi")
  })

  it("uses an icon-only copy control with status feedback", async () => {
    render(<InstallButton slug="fastapi" />)
    const button = screen.getByRole("button", { name: /copy/i })

    expect(button).toContainHTML("svg")
    expect(button).not.toHaveTextContent(/copy/i)

    const resolveCopy = mockNextClipboardWrite()
    act(() => { fireEvent.click(button) })
    await resolveCopy()
    expect(screen.getByRole("status")).toHaveTextContent(/clipboard/i)
  })

  it("resets copy feedback from the latest press", async () => {
    jest.useFakeTimers()

    render(<InstallButton slug="fastapi" />)
    const button = screen.getByRole("button", { name: /copy/i })

    const resolveFirstCopy = mockNextClipboardWrite()
    act(() => { fireEvent.click(button) })
    await resolveFirstCopy()
    expect(button).toHaveAttribute("data-state", "copied")

    act(() => jest.advanceTimersByTime(220))
    const resolveSecondCopy = mockNextClipboardWrite()
    act(() => { fireEvent.click(button) })
    await resolveSecondCopy()

    act(() => jest.advanceTimersByTime(449))
    expect(button).toHaveAttribute("data-state", "copied")

    act(() => jest.advanceTimersByTime(1))
    expect(button).toHaveAttribute("data-state", "idle")
  })
})

function mockNextClipboardWrite() {
  let resolveCopy: () => void
  jest.mocked(navigator.clipboard.writeText).mockImplementationOnce(() => new Promise<void>((resolve) => {
    resolveCopy = resolve
  }))

  return async () => {
    await act(async () => {
      resolveCopy()
      await Promise.resolve()
    })
  }
}
