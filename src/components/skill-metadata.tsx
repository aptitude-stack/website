import type { ReactNode } from "react"
import type { SkillVersionMetadataDto } from "@/lib/types"

function MetaRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: "flex", gap: "1rem", padding: "0.625rem 0", borderBottom: "1px solid var(--border-subtle)" }}>
      <span style={{ width: "9rem", flexShrink: 0, fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "var(--text-muted)", letterSpacing: "0.04em", textTransform: "uppercase", paddingTop: "0.1rem" }}>
        {label}
      </span>
      <div style={{ fontSize: "0.875rem", fontWeight: 300 }}>{children}</div>
    </div>
  )
}

function Score({ value }: { value: number | null }) {
  if (value === null) return <span style={{ color: "var(--text-dim)" }}>—</span>
  const pct = Math.round(value * 100)
  const color = pct >= 80 ? "var(--green)" : pct >= 60 ? "var(--accent)" : "var(--red)"
  return <span style={{ color, fontFamily: "IBM Plex Mono, monospace" }}>{pct}<span style={{ color: "var(--text-dim)", fontSize: "0.85em" }}>/100</span></span>
}

export function SkillMetadata({ meta }: { meta: SkillVersionMetadataDto }) {
  const { metadata, content, provenance } = meta
  return (
    <aside style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "8px", padding: "1.25rem 1.5rem" }}>
      <h2 style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", margin: "0 0 0.75rem" }}>Metadata</h2>

      {metadata.tags.length > 0 && (
        <MetaRow label="Tags">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
            {metadata.tags.map((tag) => (
              <span key={tag} style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.75rem", padding: "0.15em 0.5em", borderRadius: "3px", background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>{tag}</span>
            ))}
          </div>
        </MetaRow>
      )}

      <MetaRow label="Maturity"><Score value={metadata.maturity_score} /></MetaRow>
      <MetaRow label="Security"><Score value={metadata.security_score} /></MetaRow>

      {metadata.token_estimate !== null && (
        <MetaRow label="Tokens"><span style={{ fontFamily: "IBM Plex Mono, monospace" }}>~{metadata.token_estimate.toLocaleString()}</span></MetaRow>
      )}

      <MetaRow label="Bundle size">
        <span style={{ fontFamily: "IBM Plex Mono, monospace", color: "var(--text-muted)" }}>{(content.size_bytes / 1024).toFixed(1)} KB</span>
      </MetaRow>

      <MetaRow label="Namespace">
        <span style={{ fontFamily: "IBM Plex Mono, monospace", color: "var(--text-muted)" }}>{meta.namespace}</span>
      </MetaRow>

      {provenance?.repo_url && (
        <MetaRow label="Source">
          <a href={provenance.repo_url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.8rem", textDecoration: "none" }}>
            {new URL(provenance.repo_url).hostname} ↗
          </a>
        </MetaRow>
      )}
    </aside>
  )
}
