"use client"

import Image from "next/image"
import { useCallback, useRef, useState } from "react"
import { SearchBar } from "@/components/search-bar"
import { SkillCard } from "@/components/skill-card"
import type { SkillCardData } from "@/lib/types"

interface CatalogViewProps {
  featured: SkillCardData[]
}

const countFormatter = new Intl.NumberFormat("en-US")

export function CatalogView({ featured }: CatalogViewProps) {
  const [results, setResults] = useState<SkillCardData[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const abortRef = useRef<AbortController | null>(null)

  const handleSearch = useCallback(async (query: string) => {
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
      if (err instanceof Error && err.name === "AbortError") return
      setError("Search unavailable. Check your connection and try again.")
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false)
      }
    }
  }, [])

  const displaySkills = searched ? results : featured
  const displayCount = countFormatter.format(displaySkills.length)
  const featuredCount = countFormatter.format(featured.length)
  const sectionLabel = searched ? "Search Results" : "Featured Skills"
  const sectionNote = loading
    ? "Searching…"
    : searched
      ? `${displayCount} ${displaySkills.length === 1 ? "match" : "matches"}`
      : `${featuredCount} curated`
  const liveStatus = error
    ? error
    : loading
      ? "Searching skills…"
      : searched
        ? `${displayCount} ${displaySkills.length === 1 ? "skill" : "skills"} found.`
        : `${featuredCount} featured ${featured.length === 1 ? "skill" : "skills"} loaded.`

  return (
    <div className="catalog-page">
      <section className="catalog-hero" aria-labelledby="catalog-title">
        <div className="hero-copy">
          <p className="eyebrow">Skill Registry</p>
          <h1 id="catalog-title" className="hero-title">
            <span className="hero-title__accent" data-text="Aptitude">Aptitude</span>{" "}
            <span className="hero-title__cream" data-text="Registry">Registry</span>
          </h1>
          <p className="hero-description">
            Discover governed, versioned skills for AI agents that need dependable coding workflows, review context, and installable operating knowledge.
          </p>
          <div className="hero-search">
            <SearchBar onSearch={handleSearch} loading={loading} />
          </div>
        </div>

        <aside className="registry-panel" aria-label="Registry Signals">
          <div className="registry-panel__top">
            <div>
              <div className="status-label">Catalog Mode</div>
              <div className="status-value">Governed</div>
            </div>
            <div>
              <div className="status-label">Resolver Path</div>
              <div className="status-value">Deterministic</div>
            </div>
          </div>
          <Image className="hero-logo" src="/logo.svg" alt="" width={403} height={451} preload aria-hidden="true" />
          <div className="registry-panel__bottom">
            <div className="registry-row">
              <span className="status-label">Search</span>
              <span className="registry-value">Semantic discovery over trusted skill metadata</span>
            </div>
            <div className="registry-row">
              <span className="status-label">Install</span>
              <span className="registry-value" translate="no">uvx aptitude install &lt;skill&gt;</span>
            </div>
            <div className="registry-row">
              <span className="status-label">Artifact</span>
              <span className="registry-value" translate="no">application/zstd · .tar.zst</span>
            </div>
          </div>
        </aside>
      </section>

      <section className="catalog-metrics" aria-label="Registry summary">
        <div className="metric-card">
          <div className="metric-label">Featured</div>
          <div className="metric-value">{featuredCount}</div>
          <p className="metric-note">Curated skills surfaced before a search.</p>
        </div>
        <div className="metric-card">
          <div className="metric-label">Trust Context</div>
          <div className="metric-value">Policy</div>
          <p className="metric-note">Lifecycle and trust tier stay visible while browsing.</p>
        </div>
        <div className="metric-card">
          <div className="metric-label">Install Surface</div>
          <div className="metric-value" translate="no">uvx</div>
          <p className="metric-note">Commands remain copyable from every detail page.</p>
        </div>
      </section>

      <section className="catalog-results" aria-labelledby="catalog-results-title">
        <div className="catalog-toolbar">
          <h2 id="catalog-results-title" className="section-label">{sectionLabel}</h2>
          <span className="section-note">{sectionNote}</span>
        </div>

        <div className="sr-only" role="status" aria-live="polite">{liveStatus}</div>

        {error && (
          <p className="state-message state-message--error">
            {error}
          </p>
        )}
        {searched && !loading && results.length === 0 && !error && (
          <p className="state-message">
            No skills found. Try a different query.
          </p>
        )}
        {!searched && featured.length === 0 && (
          <p className="state-message">
            No featured skills configured.
          </p>
        )}

        <div className="result-list">
          {displaySkills.map((card, i) => (
            <div
              key={card.slug}
              className="result-item"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <SkillCard card={card} />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
