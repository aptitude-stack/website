import type { ReactNode } from "react"
import type { SkillVersionMetadataDto } from "@/lib/types"

const numberFormatter = new Intl.NumberFormat("en-US")
const sizeFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
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
  if (value === null) return <span className="metadata-score metadata-score-empty">—</span>

  return <span className="metadata-score">{Math.round(value * 100)}/100</span>
}

export function SkillMetadata({ meta }: { meta: SkillVersionMetadataDto }) {
  const { metadata, content, provenance } = meta
  const repoUrl = provenance?.repo_url ? safeHttpUrl(provenance.repo_url) : null
  const repoHost = repoUrl?.hostname ?? null
  const lifecycleStatus = meta.lifecycle_status.toUpperCase()
  const trustTier = meta.trust_tier.toUpperCase()

  return (
    <aside className="metadata-panel" aria-labelledby="metadata-title">
      <div className="metadata-panel__header">
        <h2 id="metadata-title" className="panel-title">Metadata</h2>
      </div>

      <div className="metadata-panel__body">
        <MetaRow label="Status"><span translate="no">{lifecycleStatus}</span></MetaRow>
        <MetaRow label="Access"><span translate="no">{trustTier}</span></MetaRow>
        <MetaRow label="Published">{dateFormatter.format(new Date(meta.published_at))}</MetaRow>
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
        {repoUrl && repoHost && (
          <MetaRow label="Source">
            <a href={repoUrl.toString()} target="_blank" rel="noopener noreferrer">
              {repoHost} ↗
            </a>
          </MetaRow>
        )}
      </div>
    </aside>
  )
}

function safeHttpUrl(value: string): URL | null {
  try {
    const url = new URL(value)
    if (url.protocol !== "https:" && url.protocol !== "http:") return null
    return url
  } catch {
    return null
  }
}
