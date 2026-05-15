"use client"

import { useEffect, useId, useRef, useState } from "react"

interface SearchBarProps {
  onSearch: (query: string) => void
  onClear?: () => void
  loading: boolean
  placeholder?: string
}

const PLACEHOLDER_INDEX_STORAGE_KEY = "aptitude.search.placeholderIndex"
const DEFAULT_PLACEHOLDERS = [
  "Search skills - e.g. review pull-request…",
  "Search skills - e.g. linter…",
  "Search skills - e.g. python patterns…",
  "Search skills - e.g. docs writing…",
  "Search skills - e.g. git workflow…",
]
let pageLoadPlaceholderIndex: number | null = null

export function SearchBar({
  onSearch,
  onClear,
  loading,
  placeholder,
}: SearchBarProps) {
  const inputId = useId()
  const [value, setValue] = useState("")
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSearchedValueRef = useRef("")

  useEffect(() => {
    if (placeholder !== undefined) return
    setPlaceholderIndex(getPageLoadDefaultPlaceholderIndex())
  }, [placeholder])

  useEffect(() => {
    if (timerRef.current !== null) clearTimeout(timerRef.current)
    const trimmedValue = value.trim()
    timerRef.current = setTimeout(() => {
      if (trimmedValue !== "") {
        lastSearchedValueRef.current = trimmedValue
        onSearch(trimmedValue)
        return
      }
      if (lastSearchedValueRef.current !== "") {
        lastSearchedValueRef.current = ""
        onClear?.()
      }
    }, 350)
    return () => { if (timerRef.current !== null) clearTimeout(timerRef.current) }
  }, [value, onSearch, onClear])

  return (
    <div className="search-shell">
      <label htmlFor={inputId} className="sr-only">Search skills</label>
      <input
        id={inputId}
        type="text"
        name="skill-search"
        role="textbox"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder ?? DEFAULT_PLACEHOLDERS[placeholderIndex]}
        autoComplete="off"
        inputMode="search"
        spellCheck={false}
        className="search-input"
      />
      {loading && (
        <span
          data-testid="search-loading"
          className="search-spinner"
          aria-hidden="true"
        />
      )}
    </div>
  )
}

function getNextDefaultPlaceholderIndex(): number {
  const storedIndex = readStoredPlaceholderIndex()
  const nextIndex = storedIndex === null ? 0 : (storedIndex + 1) % DEFAULT_PLACEHOLDERS.length
  writeStoredPlaceholderIndex(nextIndex)
  return nextIndex
}

function getPageLoadDefaultPlaceholderIndex(): number {
  pageLoadPlaceholderIndex ??= getNextDefaultPlaceholderIndex()
  return pageLoadPlaceholderIndex
}

function readStoredPlaceholderIndex(): number | null {
  try {
    const storedIndex = window.localStorage.getItem(PLACEHOLDER_INDEX_STORAGE_KEY)
    if (storedIndex === null) return null
    const parsedIndex = Number.parseInt(storedIndex, 10)
    if (!Number.isInteger(parsedIndex) || parsedIndex < 0 || parsedIndex >= DEFAULT_PLACEHOLDERS.length) {
      return null
    }
    return parsedIndex
  } catch {
    return null
  }
}

function writeStoredPlaceholderIndex(index: number) {
  try {
    window.localStorage.setItem(PLACEHOLDER_INDEX_STORAGE_KEY, String(index))
  } catch {
    // Storage can be unavailable in restricted browser contexts; keep the in-memory fallback.
  }
}
