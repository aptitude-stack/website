"use client"

import { useStarCount } from "@/lib/star-count-store"

const numberFormatter = new Intl.NumberFormat("en-US")

interface SkillStarCountProps {
  slug: string
  initial: number
  variant?: "value" | "label"
}

export function SkillStarCount({ slug, initial, variant = "value" }: SkillStarCountProps) {
  const count = useStarCount(slug, initial)
  if (variant === "label") {
    return (
      <>
        {numberFormatter.format(count)} {count === 1 ? "star" : "stars"}
      </>
    )
  }
  return <>{numberFormatter.format(count)}</>
}
