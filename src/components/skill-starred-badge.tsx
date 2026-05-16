"use client"

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
      aria-label={`${name} is starred by you`}
      title="Starred by you"
    >
      <svg
        aria-hidden="true"
        className="skill-card__starred-icon"
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="m12 3.75 2.44 4.95 5.46.79-3.95 3.85.93 5.43L12 16.2l-4.88 2.57.93-5.43L4.1 9.49l5.46-.79L12 3.75Z" />
      </svg>
      <span>Starred</span>
    </span>
  )
}
