import { InstallButton } from "@/components/install-button"
import type { SkillVersionMetadataDto } from "@/lib/types"

const lifecycleStyle = {
  published: { bg: "#0D2016", color: "#50C97A" },
  deprecated: { bg: "#1e0a2e", color: "#a855f7" },
  archived: { bg: "#1A1B1D", color: "#7C7D80" },
} as Record<string, { bg: string; color: string }>

const trustColor = { trusted: "#50C97A", community: "#5B9EF0", unverified: "#7C7D80" } as Record<string, string>

interface SkillHeaderProps {
  meta: SkillVersionMetadataDto
}

export function SkillHeader({ meta }: SkillHeaderProps) {
  const lc = lifecycleStyle[meta.lifecycle_status] ?? lifecycleStyle.archived
  return (
    <div style={{ marginBottom: "2.5rem", paddingBottom: "2rem", borderBottom: "1px solid var(--border)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
        <a href="/" style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontFamily: "IBM Plex Mono, monospace", textDecoration: "none" }}>registry</a>
        <span style={{ color: "var(--text-dim)", fontSize: "0.8rem" }}>/</span>
        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontFamily: "IBM Plex Mono, monospace" }}>{meta.slug}</span>
      </div>

      <h1 style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 300, letterSpacing: "-0.03em", margin: "0 0 0.5rem", lineHeight: 1.1 }}>
        {meta.metadata.name}
      </h1>

      {meta.metadata.description && (
        <p style={{ fontSize: "1rem", color: "var(--text-muted)", margin: "0 0 1.25rem", lineHeight: 1.6, fontWeight: 300, maxWidth: "56rem" }}>
          {meta.metadata.description}
        </p>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center", marginBottom: "1.25rem" }}>
        <code style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.85rem", color: "var(--accent)", background: "var(--accent-dim)", padding: "0.2em 0.6em", borderRadius: "4px" }}>
          {meta.slug}@{meta.version}
        </code>
        <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", padding: "0.25em 0.65em", borderRadius: "4px", background: lc.bg, color: lc.color }}>
          {meta.lifecycle_status}
        </span>
        <span style={{ fontSize: "0.75rem", color: trustColor[meta.trust_tier] ?? "var(--text-muted)", fontFamily: "IBM Plex Mono, monospace" }}>
          {meta.trust_tier}
        </span>
        <span style={{ fontSize: "0.75rem", color: "var(--text-dim)", fontFamily: "IBM Plex Mono, monospace" }}>
          {new Date(meta.published_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
        </span>
      </div>

      <InstallButton slug={meta.slug} version={meta.version} />
    </div>
  )
}
