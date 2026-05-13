"use client"

import { useEffect, useId, useRef, useState } from "react"

interface SearchBarProps {
  onSearch: (query: string) => void
  loading: boolean
  placeholder?: string
}

export function SearchBar({
  onSearch,
  loading,
  placeholder = "Search skills, e.g. review FastAPI pull requests…",
}: SearchBarProps) {
  const inputId = useId()
  const [value, setValue] = useState("")
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current !== null) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      if (value.trim() !== "") onSearch(value.trim())
    }, 350)
    return () => { if (timerRef.current !== null) clearTimeout(timerRef.current) }
  }, [value, onSearch])

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
