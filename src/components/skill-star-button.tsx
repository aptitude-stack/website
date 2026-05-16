"use client"

import {
  getOptimisticStarCount,
  setOptimisticStarCount,
  useStarCount,
} from "@/lib/star-count-store"
import { enqueueStarEvent } from "@/lib/star-event-queue"
import { setSkillStarred, useIsSkillStarred } from "@/lib/starred-skills-store"

interface SkillStarButtonProps {
  slug: string
  name: string
  starCount: number
}

const numberFormatter = new Intl.NumberFormat("en-US")

export function SkillStarButton({ slug, name, starCount }: SkillStarButtonProps) {
  const isStarred = useIsSkillStarred(slug)
  const displayCount = useStarCount(slug, starCount)

  function toggleStar() {
    const willStar = !isStarred
    const baseline = getOptimisticStarCount(slug) ?? starCount
    const next = Math.max(0, baseline + (willStar ? 1 : -1))
    setSkillStarred(slug, willStar)
    setOptimisticStarCount(slug, next)
    enqueueStarEvent({ slug, action: willStar ? "star" : "unstar" })
  }

  const label = isStarred ? `Unstar ${name}` : `Star ${name}`
  const starCountLabel = `${numberFormatter.format(displayCount)} ${displayCount === 1 ? "star" : "stars"}`

  return (
    <button
      type="button"
      className="skill-star-button"
      aria-label={label}
      aria-pressed={isStarred}
      title={starCountLabel}
      data-tooltip={starCountLabel}
      data-state={isStarred ? "starred" : "idle"}
      onClick={toggleStar}
    >
      <svg
        aria-hidden="true"
        className="skill-star-button__icon"
        viewBox="0 0 24 24"
        fill={isStarred ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="m12 3.75 2.44 4.95 5.46.79-3.95 3.85.93 5.43L12 16.2l-4.88 2.57.93-5.43L4.1 9.49l5.46-.79L12 3.75Z" />
      </svg>
    </button>
  )
}
