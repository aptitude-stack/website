"use client"

import { Check, Clipboard } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface InstallButtonProps {
  slug: string
  version?: string
}

type CopyState = "idle" | "copied" | "error"
const COPY_FEEDBACK_RESET_MS = 900

export function InstallButton({ slug, version }: InstallButtonProps) {
  const command = version
    ? `uvx aptitude-resolver install ${slug} --version ${version}`
    : `uvx aptitude-resolver install ${slug}`
  const [copyState, setCopyState] = useState<CopyState>("idle")
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current)
      }
    }
  }, [])

  function scheduleCopyStateReset() {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current)
    }

    resetTimerRef.current = setTimeout(() => {
      setCopyState("idle")
      resetTimerRef.current = null
    }, COPY_FEEDBACK_RESET_MS)
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(command)
      setCopyState("copied")
    } catch {
      setCopyState("error")
    }
    scheduleCopyStateReset()
  }

  const label = copyState === "copied"
    ? "Copied"
    : copyState === "error"
      ? "Failed"
      : "Copy"

  return (
    <TooltipProvider>
      <div className="install-command">
        <code translate="no">{command}</code>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={handleCopy}
              aria-label="Copy install command"
              title={label}
              className="copy-button"
              data-state={copyState}
            >
              <span
                key={copyState === "copied" ? "copied" : "copy"}
                className="copy-button__icon-frame"
              >
                {copyState === "copied" ? (
                  <Check className="copy-button__icon" data-icon="check" />
                ) : (
                  <Clipboard className="copy-button__icon" data-icon="copy" />
                )}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {label}
          </TooltipContent>
        </Tooltip>
        <span className="sr-only" role="status" aria-live="polite">
          {copyState === "copied" ? "Install command is on your clipboard." : ""}
          {copyState === "error" ? "Install command could not be copied." : ""}
        </span>
      </div>
    </TooltipProvider>
  )
}
