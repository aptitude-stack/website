"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { SearchBar } from "@/components/search-bar"
import { SkillCard } from "@/components/skill-card"
import type { SkillCardData } from "@/lib/types"

interface CatalogViewProps {
  topSkills: SkillCardData[]
}

const countFormatter = new Intl.NumberFormat("en-US")
const DEFAULT_TOP_SKILL_LIMIT = 12
const VERIFIED_TRUST_TIER = "verified"

export function getTopSkillLimitForWidth(width: number): number {
  if (width >= 1024) return 12
  if (width >= 768) return 8
  return 4
}

export function CatalogView({ topSkills }: CatalogViewProps) {
  const [results, setResults] = useState<SkillCardData[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [topSkillLimit, setTopSkillLimit] = useState(DEFAULT_TOP_SKILL_LIMIT)

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

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return
    const desktop = window.matchMedia("(min-width: 1024px)")
    const tablet = window.matchMedia("(min-width: 768px)")
    const updateLimit = () => {
      if (desktop.matches) {
        setTopSkillLimit(12)
      } else if (tablet.matches) {
        setTopSkillLimit(8)
      } else {
        setTopSkillLimit(4)
      }
    }
    updateLimit()
    desktop.addEventListener("change", updateLimit)
    tablet.addEventListener("change", updateLimit)
    return () => {
      desktop.removeEventListener("change", updateLimit)
      tablet.removeEventListener("change", updateLimit)
    }
  }, [])

  const visibleTopSkills = topSkills.slice(0, topSkillLimit)
  const displaySkills = searched ? results : visibleTopSkills
  const displayCount = countFormatter.format(displaySkills.length)
  const topSkillCount = countFormatter.format(displaySkills.length)
  const verifiedTopSkillCount = topSkills.filter((skill) => skill.trust_tier === VERIFIED_TRUST_TIER).length
  const verifiedTopSkillShare = topSkills.length
    ? Math.round((verifiedTopSkillCount / topSkills.length) * 100)
    : 0
  const topSkillInstallCount = topSkills.reduce((total, skill) => total + skill.install_count, 0)
  const metrics = [
    { label: "Top Skills", value: countFormatter.format(topSkills.length) },
    { label: "Verified", value: `${verifiedTopSkillShare}%` },
    { label: "Installs", value: countFormatter.format(topSkillInstallCount) },
  ]
  const sectionLabel = searched ? "Search Results" : "Top Installed Skills"
  const sectionNote = loading
    ? "Searching…"
    : searched
      ? `${displayCount} ${displaySkills.length === 1 ? "match" : "matches"}`
      : `${topSkillCount} shown`
  const liveStatus = error
    ? error
    : loading
      ? "Searching skills…"
      : searched
        ? `${displayCount} ${displaySkills.length === 1 ? "skill" : "skills"} found.`
        : `${topSkillCount} top installed ${displaySkills.length === 1 ? "skill" : "skills"} shown.`

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
        {!searched && visibleTopSkills.length === 0 && (
          <p className="state-message">
            No top installed skills available.
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

      <section className="catalog-metrics" aria-label="Registry summary">
        {metrics.map((metric) => (
          <div className="metric-card" key={metric.label}>
            <div className="metric-label">{metric.label}</div>
            <div className="metric-value" translate="no">{metric.value}</div>
          </div>
        ))}
      </section>
    </div>
  )
}
