import { readFileSync } from "node:fs"
import { join } from "node:path"
import { cleanSkillMarkdown } from "@/lib/skill-markdown"

describe("SkillContent markdown policy", () => {
  it("does not enable raw HTML rendering plugins", () => {
    const source = readFileSync(
      join(process.cwd(), "src/components/skill-content.tsx"),
      "utf8",
    )

    expect(source).toContain("react-markdown")
    expect(source).not.toContain("rehype-raw")
    expect(source).not.toContain("allowDangerousHtml")
    expect(source).not.toContain("dangerouslySetInnerHTML")
  })

  it("removes registry front matter and duplicate title before rendering docs", () => {
    const markdown = `---
name: documentation-writing
description: Use when writing, reviewing, or reorganizing README files.
version: 0.1.0-publish.20260515115306
schema-version: catalog.skill.v1
catalog-status: test-fixture
---
# Documentation Writing

## Overview

Documentation should answer a reader task directly.
`

    expect(cleanSkillMarkdown(markdown).trim()).toBe(
      "## Overview\n\nDocumentation should answer a reader task directly.",
    )
  })
})
