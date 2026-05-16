"use client"

import { useEffect, useState } from "react"

const LOADING_INDICATOR_DELAY_MS = 400

type LoadingIndicatorProps = {
  delayMs?: number
}

export function LoadingIndicator({
  delayMs = LOADING_INDICATOR_DELAY_MS,
}: LoadingIndicatorProps) {
  const [visible, setVisible] = useState(delayMs <= 0)

  useEffect(() => {
    if (delayMs <= 0) {
      setVisible(true)
      return
    }

    const timer = window.setTimeout(() => setVisible(true), delayMs)
    return () => window.clearTimeout(timer)
  }, [delayMs])

  if (!visible) return null

  return (
    <div className="loading-page">
      <div
        className="loading-indicator"
        role="status"
        aria-label="Loading…"
      >
        <div className="loading-indicator__cube" aria-hidden="true">
          <div data-testid="loading-cube-face" />
          <div data-testid="loading-cube-face" />
          <div data-testid="loading-cube-face" />
          <div data-testid="loading-cube-face" />
          <div data-testid="loading-cube-face" />
          <div data-testid="loading-cube-face" />
        </div>
      </div>
    </div>
  )
}
