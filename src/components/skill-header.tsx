import Link from "next/link"
import { InstallButton } from "@/components/install-button"
import type { SkillVersionMetadataDto } from "@/lib/types"

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

      {meta.metadata.tags.length > 0 && (
        <div className="skill-hero__tags tag-list" aria-label="Skill tags">
          {meta.metadata.tags.map((tag) => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      )}

      <InstallButton slug={meta.slug} version={meta.version} />
    </header>
  )
}
