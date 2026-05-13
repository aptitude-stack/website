import { InstallButton } from "@/components/install-button"
import type { SkillVersionMetadataDto } from "@/lib/types"

const lifecycleStyle = {
  published: { bg: "rgba(168,85,247,0.08)", color: "#d8b4fe" },
  deprecated: { bg: "rgba(242,201,76,0.08)", color: "#f2c94c" },
  archived: { bg: "transparent", color: "#7a766d" },
} as Record<string, { bg: string; color: string }>

const trustColor = { trusted: "#d8b4fe", community: "#c9c4b7", unverified: "#7a766d" } as Record<string, string>

const MONO = "var(--font-space-mono), 'Space Mono', ui-monospace, monospace"

interface SkillHeaderProps {
  meta: SkillVersionMetadataDto
}

export function SkillHeader({ meta }: SkillHeaderProps) {
  const lc = lifecycleStyle[meta.lifecycle_status] ?? lifecycleStyle.archived
  return (
    <div style={{ marginBottom: "clamp(28px, 3.6vw, 48px)", paddingBottom: "clamp(18px, 2vw, 26px)", borderBottom: "1px solid var(--border)" }}>
      <p style={{ fontFamily: MONO, fontSize: "0.74rem", fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--text-dim)", margin: "0 0 0.75rem", display: "flex", alignItems: "center", gap: "0" }}>
        <a href="/" style={{ color: "var(--text-dim)", textDecoration: "none" }}>registry</a>
        <span style={{ color: "var(--border-strong)", margin: "0 8px" }}>/</span>
        <span style={{ color: "var(--text-muted)" }}>{meta.slug}</span>
      </p>

      <h1 style={{
        fontFamily: "var(--font-archivo-black), 'Archivo Black', sans-serif",
        fontWeight: 900,
        fontSize: "clamp(2.5rem, 7vw, 5.5rem)",
        lineHeight: 0.88,
        letterSpacing: "-0.02em",
        textTransform: "uppercase",
        margin: "0 0 clamp(14px, 1.6vw, 20px)",
        color: "var(--text-primary)",
      }}>
        {meta.metadata.name}
      </h1>

      {meta.metadata.description && (
        <p style={{ fontFamily: MONO, fontSize: "0.84rem", fontWeight: 700, letterSpacing: "0.12em", color: "var(--text-muted)", margin: "0 0 clamp(14px, 1.6vw, 20px)", lineHeight: 1.6, maxWidth: "56rem", textTransform: "uppercase" }}>
          {meta.metadata.description}
        </p>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center", marginBottom: "1.25rem" }}>
        <code style={{ fontFamily: MONO, fontSize: "0.82rem", fontWeight: 700, color: "var(--accent)", letterSpacing: "0.04em" }}>
          {meta.slug}@{meta.version}
        </code>
        <span style={{ fontSize: "0.72rem", fontFamily: MONO, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "0.2em 0.6em", background: lc.bg, color: lc.color }}>
          {meta.lifecycle_status}
        </span>
        <span style={{ fontSize: "0.72rem", color: trustColor[meta.trust_tier] ?? "var(--text-dim)", fontFamily: MONO, fontWeight: 700, letterSpacing: "0.08em" }}>
          {meta.trust_tier}
        </span>
        <span style={{ fontSize: "0.72rem", color: "var(--text-dim)", fontFamily: MONO, fontWeight: 700, letterSpacing: "0.08em" }}>
          {new Date(meta.published_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
        </span>
      </div>

      <InstallButton slug={meta.slug} version={meta.version} />
    </div>
  )
}
