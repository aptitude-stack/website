"use client"

import { useSyncExternalStore } from "react"

const STARRED_SKILLS_KEY = "aptitude.starredSkills"
const EMPTY_STARRED_SKILLS = new Set<string>()
const listeners = new Set<() => void>()

let starredSkills = EMPTY_STARRED_SKILLS
let hasLoadedStarredSkills = false

function notify() {
  for (const listener of listeners) {
    listener()
  }
}

function readStarredSkillsFromStorage(): Set<string> {
  if (typeof window === "undefined") return new Set<string>()

  try {
    const stored = window.localStorage.getItem(STARRED_SKILLS_KEY)
    const parsed: unknown = stored ? JSON.parse(stored) : []
    if (!Array.isArray(parsed)) return new Set<string>()

    return new Set(parsed.filter((value): value is string => typeof value === "string"))
  } catch {
    return new Set<string>()
  }
}

function ensureStarredSkillsLoaded() {
  if (hasLoadedStarredSkills) return

  starredSkills = readStarredSkillsFromStorage()
  hasLoadedStarredSkills = true
}

function getSnapshot(): ReadonlySet<string> {
  ensureStarredSkillsLoaded()
  return starredSkills
}

function getServerSnapshot(): ReadonlySet<string> {
  return EMPTY_STARRED_SKILLS
}

function handleStorage(event: StorageEvent) {
  if (event.key !== null && event.key !== STARRED_SKILLS_KEY) return

  starredSkills = readStarredSkillsFromStorage()
  hasLoadedStarredSkills = true
  notify()
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  if (typeof window !== "undefined" && listeners.size === 1) {
    window.addEventListener("storage", handleStorage)
  }

  return () => {
    listeners.delete(listener)
    if (typeof window !== "undefined" && listeners.size === 0) {
      window.removeEventListener("storage", handleStorage)
    }
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

  try {
    window.localStorage.setItem(STARRED_SKILLS_KEY, JSON.stringify([...next]))
  } catch {
    // Keep the UI responsive even if browser storage is unavailable.
  }

  notify()
}

export function __resetStarredSkillsStoreForTests(): void {
  starredSkills = EMPTY_STARRED_SKILLS
  hasLoadedStarredSkills = false
  listeners.clear()
}
