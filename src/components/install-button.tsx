"use client"

import { useEffect, useRef, useState } from "react"

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
    <div className="install-command">
      <code translate="no">{command}</code>
      <button
        type="button"
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
          {copyState === "copied" ? <CopiedIcon /> : <CopyIcon />}
        </span>
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {copyState === "copied" ? "Install command is on your clipboard." : ""}
        {copyState === "error" ? "Install command could not be copied." : ""}
      </span>
    </div>
  )
}

function CopyIcon() {
  return (
    <svg
      aria-hidden="true"
      className="copy-button__icon"
      data-icon="copy"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M14.75 14.75v1.5a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h2.5" />
      <rect x="9.25" y="4.75" width="10" height="10" rx="2" />
    </svg>
  )
}

function CopiedIcon() {
  return (
    <svg
      aria-hidden="true"
      className="copy-button__icon"
      data-icon="check"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="m5.5 12.5 4.25 4.25L18.5 7.25" />
    </svg>
  )
}
