import { render, screen, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { SearchBar } from "@/components/search-bar"

describe("SearchBar", () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it("renders the search input", () => {
    render(<SearchBar onSearch={jest.fn()} loading={false} />)
    expect(screen.getByRole("textbox")).toBeInTheDocument()
  })

  it("calls onSearch after 350ms debounce", async () => {
    const onSearch = jest.fn()
    render(<SearchBar onSearch={onSearch} loading={false} />)
    await userEvent.type(screen.getByRole("textbox"), "fastapi")
    expect(onSearch).not.toHaveBeenCalled()
    act(() => jest.advanceTimersByTime(350))
    expect(onSearch).toHaveBeenCalledWith("fastapi")
  })

  it("does not call onSearch for blank query", async () => {
    const onSearch = jest.fn()
    render(<SearchBar onSearch={onSearch} loading={false} />)
    await userEvent.type(screen.getByRole("textbox"), "   ")
    act(() => jest.advanceTimersByTime(350))
    expect(onSearch).not.toHaveBeenCalled()
  })

  it("shows loading indicator when loading=true", () => {
    render(<SearchBar onSearch={jest.fn()} loading={true} />)
    expect(screen.getByTestId("search-loading")).toBeInTheDocument()
  })
})
