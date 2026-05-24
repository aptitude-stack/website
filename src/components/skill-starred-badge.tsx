"use client"

import { Star } from "lucide-react"
import { useIsSkillStarred } from "@/lib/starred-skills-store"

interface SkillStarredBadgeProps {
  slug: string
  name: string
}

export function SkillStarredBadge({ slug, name }: SkillStarredBadgeProps) {
  const isStarred = useIsSkillStarred(slug)
  if (!isStarred) return null

  return (
    <span
      className="skill-card__starred"
      aria-label={`${name} saved by you`}
    >
      <Star
        aria-hidden="true"
        className="skill-card__starred-icon"
        fill="currentColor"
      />
    </span>
  )
}
