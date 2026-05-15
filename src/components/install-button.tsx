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
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="8" y="8" width="10" height="12" rx="2" />
          <path d="M6 16H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" />
        </svg>
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {copyState === "copied" ? "Install command is on your clipboard." : ""}
        {copyState === "error" ? "Install command could not be copied." : ""}
      </span>
    </div>
  )
}
