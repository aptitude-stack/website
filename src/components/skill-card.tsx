"use client"

import Link from "next/link"
import type { SkillCardData } from "@/lib/types"

const lifecycleStyle = {
  published: { bg: "rgba(168,85,247,0.08)", color: "#d8b4fe" },
  deprecated: { bg: "rgba(242,201,76,0.08)", color: "#f2c94c" },
  archived: { bg: "transparent", color: "#7a766d" },
} as Record<string, { bg: string; color: string }>

const trustColor = {
  trusted: "#d8b4fe",
  community: "#c9c4b7",
  unverified: "#7a766d",
} as Record<string, string>

const MONO = "var(--font-space-mono), 'Space Mono', ui-monospace, monospace"

export function SkillCard({ card }: { card: SkillCardData }) {
  const { slug, version, description, tags, lifecycle_status, trust_tier, token_estimate, size_bytes } = card
  const lc = lifecycleStyle[lifecycle_status] ?? lifecycleStyle.archived

  return (
    <Link
      href={`/skills/${slug}`}
      style={{
        display: "grid",
        gridTemplateColumns: "16px 1fr",
        alignItems: "start",
        gap: "clamp(14px, 1.8vw, 28px)",
        padding: "clamp(14px, 1.6vw, 20px) clamp(20px, 2.4vw, 28px)",
        borderBottom: "1px solid var(--border)",
        textDecoration: "none",
        color: "inherit",
        transition: "background 0.12s ease",
        background: "transparent",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-surface)" }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent" }}
    >
      <span style={{ width: "10px", height: "10px", borderRadius: 0, background: lc.color, border: `1px solid ${lc.color}`, display: "block", marginTop: "4px", flexShrink: 0 }} />
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "1rem", marginBottom: "0.4rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", flexWrap: "wrap" }}>
            <span style={{ fontFamily: MONO, fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "0.04em" }}>{slug}</span>
            <span style={{ fontFamily: MONO, fontSize: "0.72rem", color: "var(--text-dim)", letterSpacing: "0.06em" }}>v{version}</span>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexShrink: 0 }}>
            <span style={{ fontSize: "0.7rem", fontFamily: MONO, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "0.2em 0.6em", background: lc.bg, color: lc.color }}>{lifecycle_status}</span>
            <span style={{ fontSize: "0.7rem", fontFamily: MONO, fontWeight: 700, letterSpacing: "0.08em", color: trustColor[trust_tier] ?? "var(--text-dim)" }}>{trust_tier}</span>
          </div>
        </div>

        {description && (
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", margin: "0 0 0.625rem", lineHeight: 1.6 }}>{description}</p>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
            {tags.filter(t => t !== slug).slice(0, 5).map((tag) => (
              <span key={tag} style={{ fontSize: "0.68rem", fontFamily: MONO, fontWeight: 700, letterSpacing: "0.08em", padding: "0.15em 0.5em", background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-dim)" }}>{tag}</span>
            ))}
          </div>
          <div style={{ display: "flex", gap: "1.25rem", flexShrink: 0 }}>
            {token_estimate !== null && (
              <span style={{ fontSize: "0.68rem", fontFamily: MONO, fontWeight: 700, color: "var(--text-dim)", letterSpacing: "0.06em" }}>~{token_estimate.toLocaleString()} tok</span>
            )}
            <span style={{ fontSize: "0.68rem", fontFamily: MONO, fontWeight: 700, color: "var(--text-dim)", letterSpacing: "0.06em" }}>{(size_bytes / 1024).toFixed(1)} KB</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
