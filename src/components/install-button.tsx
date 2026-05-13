"use client"

import { useState } from "react"

interface InstallButtonProps {
  slug: string
  version?: string
}

export function InstallButton({ slug, version }: InstallButtonProps) {
  const command = version
    ? `uvx aptitude install ${slug} --version ${version}`
    : `uvx aptitude install ${slug}`
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(command)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "8px", padding: "0.875rem 1.25rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
      <code style={{ flex: 1, fontFamily: "IBM Plex Mono, monospace", fontSize: "0.875rem", color: "var(--accent)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {command}
      </code>
      <button
        onClick={handleCopy}
        aria-label="Copy install command"
        style={{
          flexShrink: 0,
          background: copied ? "var(--accent-dim)" : "var(--bg-surface)",
          border: `1px solid ${copied ? "var(--accent-dim)" : "var(--border)"}`,
          borderRadius: "5px",
          padding: "0.3rem 0.75rem",
          fontFamily: "IBM Plex Mono, monospace",
          fontSize: "0.75rem",
          color: copied ? "var(--accent)" : "var(--text-muted)",
          cursor: "pointer",
          transition: "all 0.15s",
          letterSpacing: "0.02em",
        }}
      >
        {copied ? "copied ✓" : "copy"}
      </button>
    </div>
  )
}
