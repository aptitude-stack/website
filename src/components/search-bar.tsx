"use client"

import { LoaderCircle, Search, X } from "lucide-react"
import type { KeyboardEvent } from "react"
import { useEffect, useId, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface SearchBarProps {
  onSearch: (query: string) => void
  onClear?: () => void
  loading: boolean
  placeholder?: string
  completionHints?: readonly string[]
  placeholderExamples?: readonly string[]
}

const PLACEHOLDER_INDEX_STORAGE_KEY = "aptitude.search.placeholderIndex"
const DEFAULT_PLACEHOLDER = "Search skills by name, tag, or slug…"
let pageLoadPlaceholderIndex: number | null = null

export function SearchBar({
  onSearch,
  onClear,
  loading,
  placeholder,
  completionHints = [],
  placeholderExamples = [],
}: SearchBarProps) {
  const inputId = useId()
  const [value, setValue] = useState("")
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSearchedValueRef = useRef("")
  const placeholderOptions = useMemo(
    () => getPlaceholderOptions(placeholderExamples),
    [placeholderExamples]
  )
  const completionHint = getCompletionHint(value, completionHints)

  function clearValue() {
    if (timerRef.current !== null) clearTimeout(timerRef.current)
    setValue("")
    if (lastSearchedValueRef.current !== "") {
      lastSearchedValueRef.current = ""
      onClear?.()
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if ((event.key !== "ArrowRight" && event.key !== "Tab") || completionHint === null) return
    const target = event.currentTarget
    if (
      target.selectionStart !== target.value.length ||
      target.selectionEnd !== target.value.length
    ) {
      return
    }
    event.preventDefault()
    setValue(completionHint)
  }

  useEffect(() => {
    if (placeholder !== undefined) return
    setPlaceholderIndex(getPageLoadDefaultPlaceholderIndex(placeholderOptions.length))
  }, [placeholder, placeholderOptions.length])

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
    <TooltipProvider>
      <div className="search-shell">
        <label htmlFor={inputId} className="sr-only">Search skills</label>
        <Search className="search-icon" aria-hidden="true" />
        <Input
          id={inputId}
          type="text"
          name="skill-search"
          role="textbox"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? placeholderOptions[placeholderIndex % placeholderOptions.length]}
          autoComplete="off"
          inputMode="search"
          spellCheck={false}
          className="search-input"
        />
        {completionHint !== null && (
          <span className="search-completion-hint" aria-hidden="true">
            <span className="search-completion-prefix">{value}</span>
            <span className="search-completion-suffix">
              {completionHint.slice(value.length)}
            </span>
          </span>
        )}
        {loading && (
          <span
            data-testid="search-loading"
            className="search-spinner"
            aria-hidden="true"
          >
            <LoaderCircle data-icon="inline-start" />
          </span>
        )}
        {!loading && value.length > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="search-clear"
                aria-label="Clear search"
                onClick={clearValue}
              >
                <X data-icon="inline-start" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Clear search</TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  )
}

function getCompletionHint(value: string, completionHints: readonly string[]): string | null {
  if (value.length === 0 || value.trimStart() !== value) return null
  const normalizedValue = value.toLocaleLowerCase()
  return completionHints.find((hint) => {
    const normalizedHint = hint.toLocaleLowerCase()
    return normalizedHint.startsWith(normalizedValue) && hint.length > value.length
  }) ?? null
}

function getPlaceholderOptions(examples: readonly string[]): string[] {
  const seen = new Set<string>()
  const placeholders = examples.reduce<string[]>((result, example) => {
    const trimmed = example.trim()
    const key = trimmed.toLocaleLowerCase()
    if (!trimmed || seen.has(key)) return result
    seen.add(key)
    result.push(`Search skills - e.g. ${trimmed}…`)
    return result
  }, [])

  return placeholders.length > 0 ? placeholders : [DEFAULT_PLACEHOLDER]
}

function getNextDefaultPlaceholderIndex(optionCount: number): number {
  const storedIndex = readStoredPlaceholderIndex(optionCount)
  const nextIndex = storedIndex === null ? 0 : (storedIndex + 1) % optionCount
  writeStoredPlaceholderIndex(nextIndex)
  return nextIndex
}

function getPageLoadDefaultPlaceholderIndex(optionCount: number): number {
  pageLoadPlaceholderIndex ??= getNextDefaultPlaceholderIndex(optionCount)
  return pageLoadPlaceholderIndex % optionCount
}

function readStoredPlaceholderIndex(optionCount: number): number | null {
  try {
    const storedIndex = window.localStorage.getItem(PLACEHOLDER_INDEX_STORAGE_KEY)
    if (storedIndex === null) return null
    const parsedIndex = Number.parseInt(storedIndex, 10)
    if (!Number.isInteger(parsedIndex) || parsedIndex < 0 || parsedIndex >= optionCount) {
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
