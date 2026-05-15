import { render, screen, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { SearchBar } from "@/components/search-bar"

describe("SearchBar", () => {
  beforeEach(() => {
    jest.useFakeTimers()
    window.localStorage.clear()
  })
  afterEach(() => jest.useRealTimers())

  it("renders the search input", () => {
    render(<SearchBar onSearch={jest.fn()} loading={false} />)
    expect(screen.getByRole("textbox")).toBeInTheDocument()
  })

  it("alternates short default placeholder examples", () => {
    render(<SearchBar onSearch={jest.fn()} loading={false} />)
    const input = screen.getByRole("textbox")

    expect(input).toHaveAttribute("placeholder", "Search skills - e.g. review pull-request…")

    act(() => jest.advanceTimersByTime(2400))
    expect(input).toHaveAttribute("placeholder", "Search skills - e.g. linter…")

    act(() => jest.advanceTimersByTime(2400))
    expect(input).toHaveAttribute("placeholder", "Search skills - e.g. python patterns…")
  })

  it("advances the starting default placeholder between reloads", () => {
    const firstRender = render(<SearchBar onSearch={jest.fn()} loading={false} />)
    expect(screen.getByRole("textbox")).toHaveAttribute("placeholder", "Search skills - e.g. review pull-request…")

    firstRender.unmount()

    render(<SearchBar onSearch={jest.fn()} loading={false} />)
    expect(screen.getByRole("textbox")).toHaveAttribute("placeholder", "Search skills - e.g. linter…")
  })

  it("keeps custom placeholders fixed", () => {
    render(<SearchBar onSearch={jest.fn()} loading={false} placeholder="Find skills…" />)
    const input = screen.getByRole("textbox")

    act(() => jest.advanceTimersByTime(4800))
    expect(input).toHaveAttribute("placeholder", "Find skills…")
  })

  it("calls onSearch after 350ms debounce", async () => {
    const onSearch = jest.fn()
    render(<SearchBar onSearch={onSearch} loading={false} />)
    await userEvent.type(screen.getByRole("textbox"), "fastapi")
    expect(onSearch).not.toHaveBeenCalled()
    act(() => jest.advanceTimersByTime(350))
    expect(onSearch).toHaveBeenCalledWith("fastapi")
    expect(onSearch).toHaveBeenCalledTimes(1)
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
