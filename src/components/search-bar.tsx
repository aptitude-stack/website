"use client"

import { useEffect, useId, useRef, useState } from "react"

interface SearchBarProps {
  onSearch: (query: string) => void
  onClear?: () => void
  loading: boolean
  placeholder?: string
}

const PLACEHOLDER_INTERVAL_MS = 2400
const DEFAULT_PLACEHOLDERS = [
  "Search skills - e.g. review pull-request…",
  "Search skills - e.g. linter…",
  "Search skills - e.g. python patterns…",
  "Search skills - e.g. docs writing…",
  "Search skills - e.g. git workflow…",
]

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
    const interval = setInterval(() => {
      setPlaceholderIndex((index) => (index + 1) % DEFAULT_PLACEHOLDERS.length)
    }, PLACEHOLDER_INTERVAL_MS)
    return () => clearInterval(interval)
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
