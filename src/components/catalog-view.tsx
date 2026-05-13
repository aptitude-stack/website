"use client"

import { useState, useCallback, useRef } from "react"
import { SearchBar } from "@/components/search-bar"
import { SkillCard } from "@/components/skill-card"
import type { SkillCardData } from "@/lib/types"

interface CatalogViewProps {
  featured: SkillCardData[]
}

export function CatalogView({ featured }: CatalogViewProps) {
  const [results, setResults] = useState<SkillCardData[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const abortRef = useRef<AbortController | null>(null)

  const handleSearch = useCallback(async (query: string) => {
    // Cancel any in-flight request
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    setError(null)
    setSearched(true)
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
        signal: controller.signal,
      })
      if (!res.ok) throw new Error("Search failed")
      const data: { candidates: SkillCardData[] } = await res.json()
      setResults(data.candidates)
    } catch (err) {
      // Ignore abort errors — they're intentional cancellations
      if (err instanceof Error && err.name === "AbortError") return
      setError("Search unavailable — check your connection.")
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false)
      }
    }
  }, [])

  const displaySkills = searched ? results : featured

  return (
    <div>
      <div style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: "clamp(2rem, 5vw, 3.25rem)", fontWeight: 300, letterSpacing: "-0.03em", margin: "0 0 0.25rem", lineHeight: 1.1 }}>
          Skill Registry
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", margin: "0 0 2rem", fontWeight: 300 }}>
          Governed, versioned skills for AI systems.
        </p>
        <SearchBar onSearch={handleSearch} loading={loading} />
      </div>

      {error && <p style={{ color: "var(--red)", fontSize: "0.875rem", fontFamily: "IBM Plex Mono, monospace", marginBottom: "1.5rem" }}>{error}</p>}
      {searched && !loading && results.length === 0 && !error && (
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>No skills found. Try a different query.</p>
      )}
      {!searched && (
        <p style={{ fontSize: "0.75rem", color: "var(--text-dim)", fontFamily: "IBM Plex Mono, monospace", marginBottom: "1.25rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>Featured skills</p>
      )}

      <div style={{ display: "grid", gap: "0.75rem" }}>
        {displaySkills.map((card, i) => (
          <div key={card.slug} style={{ animation: `fadeUp 0.3s ${i * 0.04}s ease both` }}>
            <SkillCard card={card} />
          </div>
        ))}
      </div>
    </div>
  )
}
