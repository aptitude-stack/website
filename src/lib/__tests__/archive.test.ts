import { extractMarkdownFromTarZst } from "@/lib/archive"

describe("extractMarkdownFromTarZst", () => {
  it("returns null for empty input", () => {
    const result = extractMarkdownFromTarZst(new Uint8Array(0))
    expect(result).toBeNull()
  })

  it("returns null for invalid zstd data", () => {
    const result = extractMarkdownFromTarZst(new Uint8Array([1, 2, 3, 4, 5]))
    expect(result).toBeNull()
  })
})
