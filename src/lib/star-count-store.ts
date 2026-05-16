"use client"

import { useCallback, useSyncExternalStore } from "react"

const overrides = new Map<string, number>()
const listeners = new Set<() => void>()

function notify() {
  for (const listener of listeners) {
    listener()
  }
}

export function setOptimisticStarCount(slug: string, count: number): void {
  const next = Math.max(0, Math.floor(count))
  if (overrides.get(slug) === next) return
  overrides.set(slug, next)
  notify()
}

export function getOptimisticStarCount(slug: string): number | undefined {
  return overrides.get(slug)
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useStarCount(slug: string, initial: number): number {
  const subscribeFn = useCallback(
    (listener: () => void) => subscribe(listener),
    [],
  )
  const getSnapshot = useCallback(
    () => overrides.get(slug) ?? initial,
    [slug, initial],
  )
  const getServerSnapshot = useCallback(() => initial, [initial])
  return useSyncExternalStore(subscribeFn, getSnapshot, getServerSnapshot)
}

export function __resetStarCountStoreForTests(): void {
  overrides.clear()
  listeners.clear()
}
