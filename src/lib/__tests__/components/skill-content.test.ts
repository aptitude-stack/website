import { readFileSync } from "node:fs"
import { join } from "node:path"

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
})
