"use client"

import { useSyncExternalStore } from "react"

const EMPTY_STARRED_SKILLS = new Set<string>()
const listeners = new Set<() => void>()

let starredSkills = EMPTY_STARRED_SKILLS
let hasLoadedStarredSkills = false
let hasRequestedServerStarredSkills = false

function notify() {
  for (const listener of listeners) {
    listener()
  }
}

function ensureStarredSkillsLoaded() {
  if (hasLoadedStarredSkills) return

  starredSkills = new Set<string>()
  hasLoadedStarredSkills = true
}

function getSnapshot(): ReadonlySet<string> {
  ensureStarredSkillsLoaded()
  return starredSkills
}

function getServerSnapshot(): ReadonlySet<string> {
  return EMPTY_STARRED_SKILLS
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  void hydrateStarredSkillsFromServer()

  return () => {
    listeners.delete(listener)
  }
}

export function useIsSkillStarred(slug: string): boolean {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return snapshot.has(slug)
}

export function setSkillStarred(slug: string, isStarred: boolean): void {
  ensureStarredSkillsLoaded()

  const next = new Set(starredSkills)
  if (isStarred) {
    next.add(slug)
  } else {
    next.delete(slug)
  }

  starredSkills = next
  hasLoadedStarredSkills = true

  notify()
}

async function hydrateStarredSkillsFromServer(): Promise<void> {
  if (typeof window === "undefined" || hasRequestedServerStarredSkills) return
  hasRequestedServerStarredSkills = true

  try {
    const response = await fetch("/api/me/stars", { credentials: "same-origin" })
    if (!response.ok) return
    const parsed: unknown = await response.json()
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !Array.isArray((parsed as { starred_slugs?: unknown }).starred_slugs)
    ) {
      return
    }
    starredSkills = new Set(
      (parsed as { starred_slugs: unknown[] }).starred_slugs.filter(
        (value): value is string => typeof value === "string",
      ),
    )
    hasLoadedStarredSkills = true
    notify()
  } catch {
    // Keep the UI responsive if the session or registry is temporarily unavailable.
  }
}

export function __resetStarredSkillsStoreForTests(): void {
  starredSkills = EMPTY_STARRED_SKILLS
  hasLoadedStarredSkills = false
  hasRequestedServerStarredSkills = false
  listeners.clear()
}

export function __setStarredSkillsStoreForTests(slugs: string[]): void {
  starredSkills = new Set(slugs)
  hasLoadedStarredSkills = true
  hasRequestedServerStarredSkills = true
}
