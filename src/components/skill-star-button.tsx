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
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 17.75 5.83 21l1.18-6.88L2.01 9.25l6.9-1L12 2l3.09 6.25 6.9 1-5 4.87L18.17 21 12 17.75Z" />
      </svg>
    </button>
  )
}
