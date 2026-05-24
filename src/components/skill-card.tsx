import Link from "next/link"
import { SkillStarCount } from "@/components/skill-star-count"
import { SkillStarredBadge } from "@/components/skill-starred-badge"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { LifecycleStatus, SkillCardData, TrustTier } from "@/lib/types"

const numberFormatter = new Intl.NumberFormat("en-US")
const sizeFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

function lifecycleClass(status: LifecycleStatus) {
  if (status === "published") return "status-published"
  if (status === "deprecated") return "status-deprecated"
  return "status-archived"
}

function badgeClass(status: LifecycleStatus) {
  if (status === "published") return "badge-published"
  if (status === "deprecated") return "badge-deprecated"
  return "badge-archived"
}

function trustClass(tier: TrustTier) {
  if (tier === "verified") return "trust-verified"
  if (tier === "internal") return "trust-internal"
  return "trust-untrusted"
}

export function SkillCard({ card }: { card: SkillCardData }) {
  const {
    slug,
    name,
    version,
    install_count,
    star_count,
    description,
    tags,
    lifecycle_status,
    trust_tier,
    token_estimate,
    size_bytes,
  } = card
  const visibleTags = tags.filter((tag) => tag !== slug).slice(0, 5)
  const displayName = name && name.trim().length > 0 ? name : slug

  const href = `/skills/${encodeURIComponent(slug)}`

  return (
    <Card className={`skill-card ${lifecycleClass(lifecycle_status)}`}>
      <Link href={href} className="skill-card__link">
        <CardHeader className="skill-card__top">
          <div className="skill-card__identity">
            <CardTitle className="skill-card__name">{displayName}</CardTitle>
            <span className="skill-card__sub">
              <span className="skill-card__slug" translate="no">{slug}</span>
              <span className="skill-card__version" translate="no">v{version}</span>
            </span>
          </div>
          <CardAction className="skill-card__meta">
            <SkillStarredBadge slug={slug} name={displayName} />
            <Badge variant="outline" className={`badge ${badgeClass(lifecycle_status)}`}>{lifecycle_status}</Badge>
            <Badge variant="outline" className={`badge ${trustClass(trust_tier)}`}>{trust_tier}</Badge>
          </CardAction>
        </CardHeader>

        {description && (
          <CardDescription className="skill-card__description">{description}</CardDescription>
        )}

        <CardFooter className="skill-card__footer">
          {visibleTags.length > 0 && (
            <div className="tag-list" aria-label="Skill tags">
              {visibleTags.map((tag) => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          )}
          <div className="skill-card__stats">
            <span>{numberFormatter.format(install_count)} installs</span>
            <span>
              <SkillStarCount slug={slug} initial={star_count} variant="label" />
            </span>
            {token_estimate !== null && (
              <span>~{numberFormatter.format(token_estimate)} tok</span>
            )}
            <span>{sizeFormatter.format(size_bytes / 1024)} KB</span>
          </div>
        </CardFooter>
      </Link>
    </Card>
  )
}
