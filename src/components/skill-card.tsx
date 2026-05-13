import Link from "next/link"
import type { SkillCardData } from "@/lib/types"

const lifecycleStyle = {
  published: { bg: "#0D2016", color: "#50C97A" },
  deprecated: { bg: "#2A1A08", color: "#E8A427" },
  archived: { bg: "#1A1B1D", color: "#7C7D80" },
} as Record<string, { bg: string; color: string }>

const trustColor = {
  trusted: "#50C97A",
  community: "#5B9EF0",
  unverified: "#7C7D80",
} as Record<string, string>

export function SkillCard({ card }: { card: SkillCardData }) {
  const { slug, version, description, tags, lifecycle_status, trust_tier, token_estimate, size_bytes } = card
  const lc = lifecycleStyle[lifecycle_status] ?? lifecycleStyle.archived

  return (
    <Link
      href={`/skills/${slug}`}
      style={{ display: "block", background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "8px", padding: "1.25rem 1.5rem", textDecoration: "none", color: "inherit", transition: "border-color 0.15s, background 0.15s" }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent-dim)"; e.currentTarget.style.background = "var(--bg-elevated)" }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--bg-surface)" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", marginBottom: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", flexWrap: "wrap" }}>
          <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "1rem", fontWeight: 500, color: "var(--text-primary)" }}>{slug}</span>
          <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.75rem", color: "var(--text-muted)" }}>v{version}</span>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexShrink: 0 }}>
          <span style={{ fontSize: "0.7rem", fontFamily: "IBM Plex Mono, monospace", padding: "0.2em 0.6em", borderRadius: "3px", background: lc.bg, color: lc.color, letterSpacing: "0.03em" }}>{lifecycle_status}</span>
          <span style={{ fontSize: "0.7rem", color: trustColor[trust_tier] ?? "var(--text-muted)", fontFamily: "IBM Plex Mono, monospace" }}>{trust_tier}</span>
        </div>
      </div>

      {description && (
        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", margin: "0 0 0.875rem", lineHeight: 1.6, fontWeight: 300 }}>{description}</p>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
          {tags.filter(t => t !== slug).slice(0, 5).map((tag) => (
            <span key={tag} style={{ fontSize: "0.7rem", fontFamily: "IBM Plex Mono, monospace", padding: "0.15em 0.5em", borderRadius: "3px", background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>{tag}</span>
          ))}
        </div>
        <div style={{ display: "flex", gap: "1rem", flexShrink: 0 }}>
          {token_estimate !== null && (
            <span style={{ fontSize: "0.7rem", color: "var(--text-dim)", fontFamily: "IBM Plex Mono, monospace" }}>~{token_estimate.toLocaleString()} tokens</span>
          )}
          <span style={{ fontSize: "0.7rem", color: "var(--text-dim)", fontFamily: "IBM Plex Mono, monospace" }}>{(size_bytes / 1024).toFixed(1)} KB</span>
        </div>
      </div>
    </Link>
  )
}
