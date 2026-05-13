import "@testing-library/jest-dom"
import fetchMock from "jest-fetch-mock"
// Import @testing-library/react so its dom.configure() runs first, then we override.
import { configure as configureDTL } from "@testing-library/react"

fetchMock.enableMocks()

// When fake timers are active, @testing-library/user-event's internal delay:0
// setTimeout needs to be advanced. Override asyncWrapper to advance fake timers
// repeatedly until the callback resolves (one advance per keystroke in userEvent.type).
configureDTL({
  asyncWrapper: async (cb) => {
    const isFake =
      (setTimeout as unknown as { _isMockFunction?: boolean })._isMockFunction === true ||
      Object.prototype.hasOwnProperty.call(setTimeout, "clock")

    if (!isFake) {
      return cb()
    }

    let done = false
    let result: unknown
    let caughtError: unknown
    let hasError = false

    cb().then(
      (r: unknown) => { result = r; done = true },
      (e: unknown) => { caughtError = e; hasError = true; done = true },
    )

    // Advance timers in microtask-interleaved ticks until the callback settles.
    // Each tick flushes pending delay:0 fake timers used by userEvent internally.
    while (!done) {
      jest.advanceTimersByTime(0)
      await Promise.resolve()
    }

    if (hasError) throw caughtError
    return result
  },
})
