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
        title={label}
        className="copy-button"
        data-state={copyState}
      >
        <svg
          aria-hidden="true"
          className="copy-button__icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M6.5 8.75h-0.25a2.5 2.5 0 0 0-2.5 2.5v6a2.5 2.5 0 0 0 2.5 2.5h6.5a2.5 2.5 0 0 0 2.5-2.5V17" />
          <rect x="8.75" y="4.25" width="11.5" height="13" rx="2.75" />
        </svg>
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {copyState === "copied" ? "Install command is on your clipboard." : ""}
        {copyState === "error" ? "Install command could not be copied." : ""}
      </span>
    </div>
  )
}
