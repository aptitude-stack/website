"use client"

import Link from "next/link"
import type { SkillCardData } from "@/lib/types"

const numberFormatter = new Intl.NumberFormat("en-US")
const sizeFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

function lifecycleClass(status: string) {
  if (status === "published") return "status-published"
  if (status === "deprecated") return "status-deprecated"
  return "status-archived"
}

function badgeClass(status: string) {
  if (status === "published") return "badge-published"
  if (status === "deprecated") return "badge-deprecated"
  return "badge-archived"
}

function trustClass(tier: string) {
  if (tier === "trusted") return "trust-trusted"
  if (tier === "community") return "trust-community"
  return "trust-unverified"
}

export function SkillCard({ card }: { card: SkillCardData }) {
  const { slug, version, description, tags, lifecycle_status, trust_tier, token_estimate, size_bytes } = card
  const visibleTags = tags.filter((tag) => tag !== slug).slice(0, 5)

  return (
    <Link
      href={`/skills/${slug}`}
      className={`skill-card ${lifecycleClass(lifecycle_status)}`}
    >
      <span className="skill-card__dot" aria-hidden="true" />
      <div className="skill-card__body">
        <div className="skill-card__top">
          <div className="skill-card__identity">
            <span className="skill-card__slug" translate="no">{slug}</span>
            <span className="skill-card__version" translate="no">v{version}</span>
          </div>
          <div className="skill-card__meta">
            <span className={`badge ${badgeClass(lifecycle_status)}`}>{lifecycle_status}</span>
            <span className={`badge ${trustClass(trust_tier)}`}>{trust_tier}</span>
          </div>
        </div>

        {description && (
          <p className="skill-card__description">{description}</p>
        )}

        <div className="skill-card__footer">
          {visibleTags.length > 0 && (
            <div className="tag-list" aria-label="Skill tags">
              {visibleTags.map((tag) => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          )}
          <div className="skill-card__stats">
            {token_estimate !== null && (
              <span>~{numberFormatter.format(token_estimate)} tok</span>
            )}
            <span>{sizeFormatter.format(size_bytes / 1024)} KB</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
