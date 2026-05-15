"use client"

import { useEffect, useId, useRef, useState } from "react"

interface SearchBarProps {
  onSearch: (query: string) => void
  onClear?: () => void
  loading: boolean
  placeholder?: string
}

export function SearchBar({
  onSearch,
  onClear,
  loading,
  placeholder = "Search skills, e.g. review FastAPI pull requests…",
}: SearchBarProps) {
  const inputId = useId()
  const [value, setValue] = useState("")
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSearchedValueRef = useRef("")

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
        placeholder={placeholder}
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
