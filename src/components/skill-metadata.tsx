import type { ReactNode } from "react"
import type { SkillVersionMetadataDto } from "@/lib/types"

const MONO = "var(--font-space-mono), 'Space Mono', ui-monospace, monospace"

function MetaRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "clamp(14px, 1.8vw, 28px)", padding: "clamp(10px, 1.2vw, 14px) 0", borderBottom: "1px solid var(--border)" }}>
      <span style={{ fontFamily: MONO, fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--text-dim)", paddingTop: "0.15rem", whiteSpace: "nowrap" }}>
        {label}
      </span>
      <div style={{ fontFamily: MONO, fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.04em", color: "var(--text-muted)" }}>{children}</div>
    </div>
  )
}

function Score({ value }: { value: number | null }) {
  if (value === null) return <span style={{ color: "var(--text-dim)" }}>—</span>
  const pct = Math.round(value * 100)
  const color = pct >= 80 ? "var(--green)" : pct >= 60 ? "var(--accent)" : "var(--red)"
  return <span style={{ color }}>{pct}<span style={{ color: "var(--text-dim)", fontSize: "0.85em" }}>/100</span></span>
}

export function SkillMetadata({ meta }: { meta: SkillVersionMetadataDto }) {
  const { metadata, content, provenance } = meta
  return (
    <aside style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", padding: "clamp(18px, 2vw, 24px) clamp(20px, 2.4vw, 28px)" }}>
      <h2 style={{ fontFamily: MONO, fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase", color: "var(--text-dim)", margin: "0 0 0.75rem" }}>Metadata</h2>

      {metadata.tags.length > 0 && (
        <MetaRow label="Tags">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
            {metadata.tags.map((tag) => (
              <span key={tag} style={{ fontFamily: MONO, fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em", padding: "0.15em 0.5em", background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-dim)" }}>{tag}</span>
            ))}
          </div>
        </MetaRow>
      )}

      <MetaRow label="Maturity"><Score value={metadata.maturity_score} /></MetaRow>
      <MetaRow label="Security"><Score value={metadata.security_score} /></MetaRow>

      {metadata.token_estimate !== null && (
        <MetaRow label="Tokens"><span style={{ color: "var(--text-primary)" }}>~{metadata.token_estimate.toLocaleString()}</span></MetaRow>
      )}

      <MetaRow label="Size">
        <span>{(content.size_bytes / 1024).toFixed(1)} KB</span>
      </MetaRow>

      <MetaRow label="Namespace">
        <span style={{ color: "var(--text-primary)" }}>{meta.namespace}</span>
      </MetaRow>

      {provenance?.repo_url && (
        <MetaRow label="Source">
          <a href={provenance.repo_url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", textDecoration: "none" }}>
            {new URL(provenance.repo_url).hostname} ↗
          </a>
        </MetaRow>
      )}
    </aside>
  )
}
