"use client"

import { useEffect, useRef, useState } from "react"

interface SearchBarProps {
  onSearch: (query: string) => void
  loading: boolean
  placeholder?: string
}

export function SearchBar({
  onSearch,
  loading,
  placeholder = "Search skills — e.g. review FastAPI pull requests",
}: SearchBarProps) {
  const [value, setValue] = useState("")
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
    }
    timerRef.current = setTimeout(() => {
      if (value.trim() !== "") {
        onSearch(value)
      }
    }, 350)

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
      }
    }
  }, [value, onSearch])

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        width: "100%",
      }}
    >
      <input
        type="text"
        role="textbox"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "6px",
          padding: "0.625rem 2.75rem 0.625rem 1rem",
          color: "var(--text-primary)",
          fontFamily: "IBM Plex Sans, sans-serif",
          fontSize: "0.9rem",
          fontWeight: 300,
          outline: "none",
          transition: "border-color 0.15s",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--accent-dim)"
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "var(--border)"
        }}
      />
      {loading && (
        <div
          data-testid="search-loading"
          style={{
            position: "absolute",
            right: "0.875rem",
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            border: "2px solid var(--border)",
            borderTopColor: "var(--accent)",
            fontFamily: "IBM Plex Mono, monospace",
            animation: "spin 0.7s linear infinite",
          }}
        />
      )}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
