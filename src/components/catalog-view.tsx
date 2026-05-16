"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { SearchBar } from "@/components/search-bar"
import { SkillCard } from "@/components/skill-card"
import { SkillGraphHero } from "@/components/skill-graph-hero"
import type { SkillCardData, SkillGraphData } from "@/lib/types"

interface CatalogViewProps {
  topSkills: SkillCardData[]
  skillGraph?: SkillGraphData
  selectedTag?: string
}

const countFormatter = new Intl.NumberFormat("en-US")
const DEFAULT_TOP_SKILL_LIMIT = 8
const VERIFIED_TRUST_TIER = "verified"
const EMPTY_SKILL_GRAPH: SkillGraphData = { nodes: [], edges: [] }

export function getTopSkillLimitForWidth(width: number): number {
  if (width >= 1024) return 8
  if (width >= 768) return 6
  return 4
}

export function CatalogView({ topSkills, skillGraph = EMPTY_SKILL_GRAPH, selectedTag }: CatalogViewProps) {
  const [results, setResults] = useState<SkillCardData[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [topSkillLimit, setTopSkillLimit] = useState(DEFAULT_TOP_SKILL_LIMIT)
  const [topSkillPage, setTopSkillPage] = useState(0)

  const abortRef = useRef<AbortController | null>(null)

  const handleClearSearch = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setResults([])
    setLoading(false)
    setSearched(false)
    setError(null)
  }, [])

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
        setTopSkillLimit(8)
      } else if (tablet.matches) {
        setTopSkillLimit(6)
      } else {
        setTopSkillLimit(4)
      }
      setTopSkillPage(0)
    }
    updateLimit()
    desktop.addEventListener("change", updateLimit)
    tablet.addEventListener("change", updateLimit)
    return () => {
      desktop.removeEventListener("change", updateLimit)
      tablet.removeEventListener("change", updateLimit)
    }
  }, [])

  const topSkillPageCount = Math.max(1, Math.ceil(topSkills.length / topSkillLimit))
  const topSkillStartIndex = topSkillPage * topSkillLimit
  const visibleTopSkills = topSkills.slice(topSkillStartIndex, topSkillStartIndex + topSkillLimit)
  const heroGraph = useMemo(
    () => (skillGraph.nodes.length > 0 ? skillGraph : toTopSkillGraph(topSkills)),
    [skillGraph, topSkills]
  )
  const normalizedSelectedTag = selectedTag?.trim() ?? ""
  const tagFilteredSkills = useMemo(() => {
    if (!normalizedSelectedTag) return []
    const selected = normalizedSelectedTag.toLocaleLowerCase()
    return topSkills.filter((skill) =>
      skill.tags.some((tag) => tag.toLocaleLowerCase() === selected)
    )
  }, [normalizedSelectedTag, topSkills])

  useEffect(() => {
    setTopSkillPage((page) => Math.min(page, topSkillPageCount - 1))
  }, [topSkillPageCount])

  const displaySkills = searched
    ? results
    : normalizedSelectedTag
      ? tagFilteredSkills
      : visibleTopSkills
  const displayCount = countFormatter.format(displaySkills.length)
  const topSkillCount = countFormatter.format(displaySkills.length)
  const topSkillTotalCount = countFormatter.format(topSkills.length)
  const topSkillPageStart = topSkills.length === 0 ? 0 : topSkillStartIndex + 1
  const topSkillPageEnd = Math.min(topSkills.length, topSkillStartIndex + visibleTopSkills.length)
  const verifiedTopSkillCount = topSkills.filter((skill) => skill.trust_tier === VERIFIED_TRUST_TIER).length
  const verifiedTopSkillShare = topSkills.length
    ? Math.round((verifiedTopSkillCount / topSkills.length) * 100)
    : 0
  const topSkillInstallCount = topSkills.reduce((total, skill) => total + skill.install_count, 0)
  const graphSummary =
    heroGraph.nodes.length > 0
      ? `Showing ${countFormatter.format(heroGraph.nodes.length)} ${heroGraph.nodes.length === 1 ? "skill" : "skills"} and ${countFormatter.format(heroGraph.edges.length)} authored ${heroGraph.edges.length === 1 ? "relation" : "relations"}.`
      : null
  const metrics = [
    { label: "Skills", value: countFormatter.format(topSkills.length) },
    { label: "Verified", value: `${verifiedTopSkillShare}%` },
    { label: "Installs", value: countFormatter.format(topSkillInstallCount) },
  ]
  const sectionLabel = searched
    ? "Search Results"
    : normalizedSelectedTag
      ? `Tag: ${normalizedSelectedTag}`
      : "All Skills"
  const sectionNote = loading
    ? "Searching…"
    : searched
      ? `${displayCount} ${displaySkills.length === 1 ? "match" : "matches"}`
      : normalizedSelectedTag
        ? `${displayCount} ${displaySkills.length === 1 ? "match" : "matches"}`
        : topSkillPageCount > 1
          ? `${topSkillPageStart}-${topSkillPageEnd} of ${topSkillTotalCount} shown`
          : `${topSkillCount} shown`
  const liveStatus = error
    ? error
    : loading
      ? "Searching skills…"
      : searched
        ? `${displayCount} ${displaySkills.length === 1 ? "skill" : "skills"} found.`
        : normalizedSelectedTag
          ? `${displayCount} ${displaySkills.length === 1 ? "skill" : "skills"} tagged ${normalizedSelectedTag}.`
          : topSkillPageCount > 1
            ? `All skills page ${topSkillPage + 1} of ${topSkillPageCount}, showing ${topSkillPageStart} through ${topSkillPageEnd} of ${topSkillTotalCount}.`
            : `${topSkillCount} catalog ${displaySkills.length === 1 ? "skill" : "skills"} shown.`

  return (
    <div className="catalog-page">
      <section className="catalog-hero" aria-labelledby="catalog-title">
        <div className="hero-copy">
          <p className="eyebrow">Skills Registry</p>
          <h1 id="catalog-title" className="hero-title">
            <span className="hero-title__accent" data-text="Aptitude">Aptitude</span>{" "}
            <span className="hero-title__cream" data-text="Registry">Registry</span>
          </h1>
          <p className="hero-description">
            Discover governed, versioned skills for AI agents that need dependable coding workflows, review context, and installable operating knowledge.
          </p>
          <div id="catalog-search" className="hero-search">
            <SearchBar onSearch={handleSearch} onClear={handleClearSearch} loading={loading} />
          </div>
        </div>
        {graphSummary && <p className="sr-only">{graphSummary}</p>}
        <SkillGraphHero graph={heroGraph} />
      </section>

      <section id="catalog-features" className="catalog-results" aria-labelledby="catalog-results-title">
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
        {!searched && normalizedSelectedTag && tagFilteredSkills.length === 0 && (
          <p className="state-message">
            No skills found with the &quot;{normalizedSelectedTag}&quot; tag.
          </p>
        )}
        {!searched && !normalizedSelectedTag && visibleTopSkills.length === 0 && (
          <p className="state-message">
            No catalog skills available.
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

        {!searched && !normalizedSelectedTag && topSkillPageCount > 1 && (
          <nav className="catalog-pagination" aria-label="All skills pages">
            <button
              type="button"
              className="pagination-button"
              aria-label="Previous all skills page"
              disabled={topSkillPage === 0}
              onClick={() => setTopSkillPage((page) => Math.max(0, page - 1))}
            >
              {"<"}
            </button>
            <span className="pagination-status">
              Page {topSkillPage + 1} of {topSkillPageCount}
            </span>
            <button
              type="button"
              className="pagination-button"
              aria-label="Next all skills page"
              disabled={topSkillPage >= topSkillPageCount - 1}
              onClick={() => setTopSkillPage((page) => Math.min(topSkillPageCount - 1, page + 1))}
            >
              {">"}
            </button>
          </nav>
        )}
      </section>

      <section id="catalog-metrics" className="catalog-metrics" aria-label="Registry summary">
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

function toTopSkillGraph(topSkills: SkillCardData[]): SkillGraphData {
  return {
    nodes: topSkills.map((skill) => ({
      slug: skill.slug,
      version: skill.version,
      name: skill.name,
      install_count: skill.install_count,
      star_count: skill.star_count,
      trust_tier: skill.trust_tier,
      lifecycle_status: skill.lifecycle_status,
    })),
    edges: [],
  }
}
