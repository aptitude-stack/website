"use client"

import { useState } from "react"

interface InstallButtonProps {
  slug: string
  version?: string
}

const MONO = "var(--font-space-mono), 'Space Mono', ui-monospace, monospace"

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
    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-strong)", padding: "14px 20px 14px 20px", display: "flex", alignItems: "center", gap: "0.75rem" }}>
      <code style={{ flex: 1, fontFamily: MONO, fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.04em", color: "var(--accent)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {command}
      </code>
      <button
        onClick={handleCopy}
        aria-label="Copy install command"
        style={{
          flexShrink: 0,
          background: "transparent",
          border: `1px solid ${copied ? "var(--accent)" : "var(--border-strong)"}`,
          borderRadius: "999px",
          padding: "6px 16px",
          fontFamily: MONO,
          fontSize: "0.72rem",
          fontWeight: 700,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: copied ? "var(--accent)" : "var(--text-dim)",
          cursor: "pointer",
          transition: "all 0.15s",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: copied ? "var(--accent)" : "var(--text-dim)", display: "inline-block", flexShrink: 0, transition: "background 0.15s" }} />
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  )
}
