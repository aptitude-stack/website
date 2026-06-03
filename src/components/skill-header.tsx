import type { CSSProperties } from "react"
import Link from "next/link"
import { InstallButton } from "@/components/install-button"
import { SkillStarButton } from "@/components/skill-star-button"
import type { SkillVersionMetadataDto } from "@/lib/types"

interface SkillHeaderProps {
  meta: SkillVersionMetadataDto
  installVersion?: string
}

function scoreTone(value: number) {
  if (value >= 80) return "score-high"
  if (value >= 60) return "score-mid"
  return "score-low"
}

function ScoreDonut({ label, value }: { label: string; value: number | null }) {
  const score = value === null ? null : Math.max(0, Math.min(100, Math.round(value * 100)))
  const ariaLabel = score === null
    ? `${label} score unavailable`
    : `${label} score ${score} out of 100`
  const title = score === null ? `${label}: unavailable` : `${label}: ${score}/100`
  const style = {
    "--score-offset": `${100 - (score ?? 0)}`,
  } as CSSProperties

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      title={title}
      data-tooltip={title}
      className={`score-donut ${score === null ? "score-empty" : scoreTone(score)}`}
      style={style}
    >
      <span className="score-donut__ring" aria-hidden="true">
        <svg className="score-donut__svg" viewBox="0 0 52 52" focusable="false">
          <circle className="score-donut__track" cx="26" cy="26" r="21" />
          <circle className="score-donut__progress" cx="26" cy="26" r="21" pathLength="100" />
        </svg>
      </span>
      <span className="score-donut__label">{label}</span>
    </div>
  )
}

export function SkillHeader({ meta, installVersion }: SkillHeaderProps) {
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

      <div className="skill-score-strip" role="group" aria-label="Skill scores">
        <ScoreDonut label="Maturity" value={meta.metadata.maturity_score} />
        <ScoreDonut label="Security" value={meta.metadata.security_score} />
      </div>

      {meta.metadata.tags.length > 0 && (
        <div className="skill-hero__tags tag-list" aria-label="Skill tags">
          {meta.metadata.tags.map((tag) => (
            <Link key={tag} href={`/catalog?tag=${encodeURIComponent(tag)}#catalog-features`} className="tag">
              {tag}
            </Link>
          ))}
        </div>
      )}

      <div className="skill-actions">
        <InstallButton slug={meta.slug} version={installVersion} />
        <SkillStarButton
          slug={meta.slug}
          name={meta.metadata.name}
          starCount={meta.star_count}
        />
      </div>
    </header>
  )
}
