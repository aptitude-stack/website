"use client"

import {
  getOptimisticStarCount,
  setOptimisticStarCount,
  useStarCount,
} from "@/lib/star-count-store"
import { StarIcon } from "@/components/icons/star-icon"
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
      <StarIcon className="skill-star-button__icon" filled={isStarred} />
    </button>
  )
}
