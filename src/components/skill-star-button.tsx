"use client"

import { Star } from "lucide-react"
import {
  getOptimisticStarCount,
  setOptimisticStarCount,
  useStarCount,
} from "@/lib/star-count-store"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            className="skill-star-button"
            aria-label={label}
            aria-pressed={isStarred}
            title={starCountLabel}
            data-tooltip={starCountLabel}
            data-state={isStarred ? "starred" : "idle"}
            onClick={toggleStar}
          >
            <Star
              className="skill-star-button__icon"
              data-icon="inline-start"
              fill={isStarred ? "currentColor" : "none"}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{starCountLabel}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
