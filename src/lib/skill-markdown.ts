export function cleanSkillMarkdown(markdown: string) {
  let cleaned = markdown.replace(/^\uFEFF/, "").trimStart()

  if (cleaned.startsWith("---")) {
    const frontMatterEnd = cleaned.indexOf("\n---", 3)
    if (frontMatterEnd !== -1) {
      const afterFrontMatter = cleaned.indexOf("\n", frontMatterEnd + 4)
      cleaned = afterFrontMatter === -1
        ? ""
        : cleaned.slice(afterFrontMatter + 1).trimStart()
    }
  }

  cleaned = cleaned.replace(/^# [^\n]+\n+/, "")

  return cleaned
}
