import Link from "next/link"
import { InstallButton } from "@/components/install-button"
import type { LifecycleStatus, SkillVersionMetadataDto, TrustTier } from "@/lib/types"

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
})

function lifecycleClass(status: LifecycleStatus) {
  if (status === "published") return "badge-published"
  if (status === "deprecated") return "badge-deprecated"
  return "badge-archived"
}

function trustClass(tier: TrustTier) {
  if (tier === "verified") return "trust-verified"
  if (tier === "internal") return "trust-internal"
  return "trust-untrusted"
}

interface SkillHeaderProps {
  meta: SkillVersionMetadataDto
}

export function SkillHeader({ meta }: SkillHeaderProps) {
  return (
    <header className="skill-hero">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Registry</Link>
        <span className="breadcrumb-separator" aria-hidden="true">/</span>
        <span>{meta.slug}</span>
      </nav>

      <h1 className="skill-title">
        {meta.metadata.name}
      </h1>

      {meta.metadata.description && (
        <p className="skill-description">
          {meta.metadata.description}
        </p>
      )}

      <div className="skill-kv">
        <code className="code-token" translate="no">
          {meta.slug}@{meta.version}
        </code>
        <span className={`badge ${lifecycleClass(meta.lifecycle_status)}`}>
          {meta.lifecycle_status}
        </span>
        <span className={`badge ${trustClass(meta.trust_tier)}`}>
          {meta.trust_tier}
        </span>
        <span className="badge">
          {dateFormatter.format(new Date(meta.published_at))}
        </span>
      </div>

      <InstallButton slug={meta.slug} version={meta.version} />
    </header>
  )
}
