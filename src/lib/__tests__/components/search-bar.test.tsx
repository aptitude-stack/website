import { render, screen, act, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { SearchBar } from "@/components/search-bar"

function getCompletionSuffix(container: HTMLElement) {
  return container.querySelector(".search-completion-suffix")
}

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

  it("keeps the default placeholder stable during the page session", () => {
    render(<SearchBar onSearch={jest.fn()} loading={false} />)
    const input = screen.getByRole("textbox")

    expect(input).toHaveAttribute("placeholder", "Search skills - e.g. review pull-request…")

    act(() => jest.advanceTimersByTime(2400))
    expect(input).toHaveAttribute("placeholder", "Search skills - e.g. review pull-request…")

    act(() => jest.advanceTimersByTime(2400))
    expect(input).toHaveAttribute("placeholder", "Search skills - e.g. review pull-request…")
  })

  it("does not advance the default placeholder on remounts in the same page session", () => {
    const firstRender = render(<SearchBar onSearch={jest.fn()} loading={false} />)
    expect(screen.getByRole("textbox")).toHaveAttribute("placeholder", "Search skills - e.g. review pull-request…")

    firstRender.unmount()

    render(<SearchBar onSearch={jest.fn()} loading={false} />)
    expect(screen.getByRole("textbox")).toHaveAttribute("placeholder", "Search skills - e.g. review pull-request…")
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

  it("shows an inline completion suffix for a matching partial query", async () => {
    const { container } = render(<SearchBar onSearch={jest.fn()} loading={false} />)
    await userEvent.type(screen.getByRole("textbox"), "doc")

    expect(getCompletionSuffix(container)).toHaveTextContent("s writing")
  })

  it("does not show completion suffixes for blank, exact, or nonmatching queries", async () => {
    const { container } = render(<SearchBar onSearch={jest.fn()} loading={false} />)
    const input = screen.getByRole("textbox")

    expect(getCompletionSuffix(container)).not.toBeInTheDocument()

    await userEvent.type(input, "docs writing")
    expect(getCompletionSuffix(container)).not.toBeInTheDocument()

    await userEvent.clear(input)
    await userEvent.type(input, "unknown")
    expect(getCompletionSuffix(container)).not.toBeInTheDocument()
  })

  it("accepts the inline completion with ArrowRight at the end of the input", async () => {
    render(<SearchBar onSearch={jest.fn()} loading={false} />)
    const input = screen.getByRole("textbox")

    await userEvent.type(input, "doc")
    await userEvent.keyboard("{ArrowRight}")

    expect(input).toHaveValue("docs writing")
  })

  it("accepts the inline completion with Tab at the end of the input", async () => {
    render(<SearchBar onSearch={jest.fn()} loading={false} />)
    const input = screen.getByRole("textbox")

    await userEvent.type(input, "doc")
    fireEvent.keyDown(input, { key: "Tab" })

    expect(input).toHaveValue("docs writing")
    expect(input).toHaveFocus()
  })

  it("does not accept the inline completion with ArrowRight before the end of the input", async () => {
    render(<SearchBar onSearch={jest.fn()} loading={false} />)
    const input = screen.getByRole("textbox") as HTMLInputElement

    await userEvent.type(input, "doc")
    input.setSelectionRange(1, 1)
    fireEvent.keyDown(input, { key: "ArrowRight" })

    expect(input).toHaveValue("doc")
  })

  it("searches the completed value after the debounce", async () => {
    const onSearch = jest.fn()
    render(<SearchBar onSearch={onSearch} loading={false} />)
    const input = screen.getByRole("textbox")

    await userEvent.type(input, "doc")
    await userEvent.keyboard("{ArrowRight}")
    act(() => jest.advanceTimersByTime(350))

    expect(onSearch).toHaveBeenCalledWith("docs writing")
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
