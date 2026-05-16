import { render, screen } from "@testing-library/react"
import fetchMock from "jest-fetch-mock"
import { __resetStarCountStoreForTests } from "@/lib/star-count-store"
import { __resetStarEventQueueForTests } from "@/lib/star-event-queue"
import { __resetStarredSkillsStoreForTests } from "@/lib/starred-skills-store"

jest.mock("react-markdown", () => ({
  __esModule: true,
  default: ({ children }: { children: string }) => <div>{children}</div>,
}))
jest.mock("remark-gfm", () => jest.fn())
jest.mock("rehype-highlight", () => jest.fn())

import { SkillContent } from "@/components/skill-content"

describe("SkillContent", () => {
  beforeEach(() => {
    fetchMock.resetMocks()
    fetchMock.mockResponse(
      JSON.stringify({ accepted: 1, counts: [{ slug: "documentation-writing", star_count: 8 }] }),
    )
    __resetStarEventQueueForTests({ flushIntervalMs: 0 })
    __resetStarCountStoreForTests()
    __resetStarredSkillsStoreForTests()
  })

  afterEach(() => {
    window.localStorage.clear()
    __resetStarCountStoreForTests()
    __resetStarredSkillsStoreForTests()
  })

  it("does not expose star actions from the content panel", () => {
    render(
      <SkillContent
        markdown="## Overview\n\nUse when writing docs."
      />,
    )

    expect(screen.getByRole("heading", { name: "Content" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /star/i })).not.toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
