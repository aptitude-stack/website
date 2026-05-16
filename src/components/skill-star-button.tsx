"use client"

import { useEffect, useState } from "react"
import {
  getOptimisticStarCount,
  setOptimisticStarCount,
  useStarCount,
} from "@/lib/star-count-store"
import { enqueueStarEvent } from "@/lib/star-event-queue"

interface SkillStarButtonProps {
  slug: string
  name: string
  starCount: number
}

const STARRED_SKILLS_KEY = "aptitude.starredSkills"
const numberFormatter = new Intl.NumberFormat("en-US")

export function SkillStarButton({ slug, name, starCount }: SkillStarButtonProps) {
  const [isStarred, setIsStarred] = useState(false)
  const displayCount = useStarCount(slug, starCount)

  useEffect(() => {
    setIsStarred(readStarredSkills().has(slug))
  }, [slug])

  function toggleStar() {
    const starredSkills = readStarredSkills()
    const willStar = !starredSkills.has(slug)
    if (willStar) {
      starredSkills.add(slug)
    } else {
      starredSkills.delete(slug)
    }
    setIsStarred(willStar)
    const baseline = getOptimisticStarCount(slug) ?? starCount
    const next = Math.max(0, baseline + (willStar ? 1 : -1))
    setOptimisticStarCount(slug, next)
    writeStarredSkills(starredSkills)
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

function readStarredSkills() {
  if (typeof window === "undefined") return new Set<string>()

  try {
    const stored = window.localStorage.getItem(STARRED_SKILLS_KEY)
    const parsed: unknown = stored ? JSON.parse(stored) : []
    if (!Array.isArray(parsed)) return new Set<string>()

    return new Set(parsed.filter((value): value is string => typeof value === "string"))
  } catch {
    return new Set<string>()
  }
}

function writeStarredSkills(starredSkills: Set<string>) {
  try {
    window.localStorage.setItem(STARRED_SKILLS_KEY, JSON.stringify([...starredSkills]))
  } catch {
    // Keep the control responsive even if browser storage is unavailable.
  }
}
