import { act, render, screen } from "@testing-library/react"
import {
  __resetStarCountStoreForTests,
  setOptimisticStarCount,
  useStarCount,
} from "@/lib/star-count-store"

function Probe({ slug, initial }: { slug: string; initial: number }) {
  const count = useStarCount(slug, initial)
  return <span data-testid="count">{count}</span>
}

describe("star-count-store", () => {
  beforeEach(() => {
    __resetStarCountStoreForTests()
  })

  it("returns the initial count when there is no override", () => {
    render(<Probe slug="fastapi" initial={5} />)
    expect(screen.getByTestId("count").textContent).toBe("5")
  })

  it("updates subscribers when an override is set", () => {
    render(<Probe slug="fastapi" initial={5} />)

    act(() => {
      setOptimisticStarCount("fastapi", 7)
    })

    expect(screen.getByTestId("count").textContent).toBe("7")
  })

  it("scopes overrides per slug", () => {
    render(
      <>
        <span data-testid="a">
          <Probe slug="fastapi" initial={1} />
        </span>
        <span data-testid="b">
          <Probe slug="docs" initial={9} />
        </span>
      </>,
    )

    act(() => {
      setOptimisticStarCount("fastapi", 12)
    })

    expect(screen.getByTestId("a").textContent).toBe("12")
    expect(screen.getByTestId("b").textContent).toBe("9")
  })

  it("clamps overrides at zero", () => {
    render(<Probe slug="fastapi" initial={5} />)

    act(() => {
      setOptimisticStarCount("fastapi", -3)
    })

    expect(screen.getByTestId("count").textContent).toBe("0")
  })
})
