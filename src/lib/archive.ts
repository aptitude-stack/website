import { decompress } from "fzstd"

const PREVIEW_FILENAMES = new Set(["SKILL.md", "content.md", "README.md", "readme.md"])

export function extractMarkdownFromTarZst(bytes: Uint8Array): string | null {
  if (bytes.length === 0) return null
  let decompressed: Uint8Array
  try {
    decompressed = decompress(bytes)
  } catch {
    return null
  }
  return findFileInTar(decompressed)
}

function findFileInTar(buffer: Uint8Array): string | null {
  let offset = 0
  while (offset + 512 <= buffer.length) {
    const name = readCString(buffer, offset, 100)
    if (!name) break
    const size = parseInt(readCString(buffer, offset + 124, 12).trim(), 8) || 0
    const basename = name.split("/").pop() ?? ""
    if (PREVIEW_FILENAMES.has(basename) && size > 0) {
      return new TextDecoder().decode(buffer.subarray(offset + 512, offset + 512 + size))
    }
    offset += 512 + Math.ceil(size / 512) * 512
  }
  return null
}

function readCString(buffer: Uint8Array, start: number, maxLen: number): string {
  const slice = buffer.subarray(start, start + maxLen)
  const end = slice.indexOf(0)
  return new TextDecoder().decode(end >= 0 ? slice.subarray(0, end) : slice)
}
