import type { ReactNode } from "react"
import type { SkillVersionMetadataDto } from "@/lib/types"

const numberFormatter = new Intl.NumberFormat("en-US")
const sizeFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

function MetaRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="meta-row">
      <span className="meta-label">{label}</span>
      <div className="meta-value">{children}</div>
    </div>
  )
}

function Score({ value }: { value: number | null }) {
  if (value === null) return <span className="score score-empty">—</span>
  const pct = Math.round(value * 100)
  const tone = pct >= 80 ? "score-high" : pct >= 60 ? "score-mid" : "score-low"

  return (
    <span className={`score ${tone}`}>
      {pct}<span className="score-denominator">/100</span>
    </span>
  )
}

export function SkillMetadata({ meta }: { meta: SkillVersionMetadataDto }) {
  const { metadata, content, provenance } = meta
  const repoHost = provenance?.repo_url ? new URL(provenance.repo_url).hostname : null

  return (
    <aside className="metadata-panel" aria-labelledby="metadata-title">
      <div className="metadata-panel__header">
        <h2 id="metadata-title" className="panel-title">Metadata</h2>
      </div>

      {metadata.tags.length > 0 && (
        <MetaRow label="Tags">
          <div className="tag-list">
            {metadata.tags.map((tag) => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
        </MetaRow>
      )}

      <MetaRow label="Maturity"><Score value={metadata.maturity_score} /></MetaRow>
      <MetaRow label="Security"><Score value={metadata.security_score} /></MetaRow>

      {metadata.token_estimate !== null && (
        <MetaRow label="Tokens">
          <span>~{numberFormatter.format(metadata.token_estimate)}</span>
        </MetaRow>
      )}

      <MetaRow label="Size">
        <span>{sizeFormatter.format(content.size_bytes / 1024)} KB</span>
      </MetaRow>

      <MetaRow label="Namespace">
        <span translate="no">{meta.namespace}</span>
      </MetaRow>

      {provenance?.repo_url && repoHost && (
        <MetaRow label="Source">
          <a href={provenance.repo_url} target="_blank" rel="noopener noreferrer">
            {repoHost} ↗
          </a>
        </MetaRow>
      )}
    </aside>
  )
}
