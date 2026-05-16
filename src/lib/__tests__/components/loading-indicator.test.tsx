import { act, render, screen } from "@testing-library/react"
import { LoadingIndicator } from "@/components/loading-indicator"

describe("LoadingIndicator", () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it("renders an accessible six-sided cube loader after the loading threshold", () => {
    render(<LoadingIndicator />)

    expect(screen.queryByRole("status", { name: "Loading…" })).not.toBeInTheDocument()

    act(() => jest.advanceTimersByTime(399))
    expect(screen.queryByRole("status", { name: "Loading…" })).not.toBeInTheDocument()

    act(() => jest.advanceTimersByTime(1))
    expect(screen.getByRole("status", { name: "Loading…" })).toBeInTheDocument()
    expect(screen.getAllByTestId("loading-cube-face")).toHaveLength(6)
  })
})
