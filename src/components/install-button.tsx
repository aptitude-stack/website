"use client"

import { useState } from "react"

interface InstallButtonProps {
  slug: string
  version?: string
}

type CopyState = "idle" | "copied" | "error"

export function InstallButton({ slug, version }: InstallButtonProps) {
  const command = version
    ? `uvx aptitude install ${slug} --version ${version}`
    : `uvx aptitude install ${slug}`
  const [copyState, setCopyState] = useState<CopyState>("idle")

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(command)
      setCopyState("copied")
    } catch {
      setCopyState("error")
    }
    setTimeout(() => setCopyState("idle"), 2000)
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
        className="copy-button"
        data-state={copyState}
      >
        <span className="copy-dot" aria-hidden="true" />
        {label}
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {copyState === "copied" ? "Install command is on your clipboard." : ""}
        {copyState === "error" ? "Install command could not be copied." : ""}
      </span>
    </div>
  )
}
