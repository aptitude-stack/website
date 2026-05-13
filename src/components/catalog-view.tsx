"use client";

import { useState, useCallback, useRef } from "react";
import { SearchBar } from "@/components/search-bar";
import { SkillCard } from "@/components/skill-card";
import type { SkillCardData } from "@/lib/types";

interface CatalogViewProps {
  featured: SkillCardData[];
}

export function CatalogView({ featured }: CatalogViewProps) {
  const [results, setResults] = useState<SkillCardData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const handleSearch = useCallback(async (query: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error("Search failed");
      const data: { candidates: SkillCardData[] } = await res.json();
      setResults(data.candidates);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError("Search unavailable — check your connection.");
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  const displaySkills = searched ? results : featured;

  return (
    <div>
      <div
        style={{
          marginBottom: "clamp(28px, 3.6vw, 48px)",
          paddingBottom: "clamp(18px, 2vw, 26px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {/* <p style={{ fontFamily: "var(--font-space-mono), 'Space Mono', ui-monospace, monospace", fontSize: "0.74rem", fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--text-dim)", margin: "0 0 0.75rem" }}>
          Skill Registry
        </p> */}
        <h1
          style={{
            fontFamily:
              "var(--font-archivo-black), 'Archivo Black', sans-serif",
            fontWeight: 900,
            fontSize: "clamp(3rem, 9vw, 7rem)",
            lineHeight: 0.88,
            letterSpacing: "-0.02em",
            textTransform: "uppercase",
            margin: "0 0 clamp(18px, 2vw, 28px)",
            color: "var(--text-primary)",
          }}
        >
          <span style={{ display: "block", color: "var(--accent)" }}>
            Aptitude
          </span>
          <span style={{ display: "block" }}>Registry</span>
        </h1>
        <p
          style={{
            fontFamily:
              "var(--font-space-mono), 'Space Mono', ui-monospace, monospace",
            fontSize: "0.84rem",
            fontWeight: 700,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            margin: "0 0 clamp(18px, 2vw, 28px)",
          }}
        >
          Immutable skills · Deterministic resolves
        </p>
        <SearchBar onSearch={handleSearch} loading={loading} />
      </div>

      {error && (
        <p
          style={{
            color: "var(--red)",
            fontSize: "0.82rem",
            fontFamily: "var(--font-space-mono), 'Space Mono', monospace",
            fontWeight: 700,
            marginBottom: "1.5rem",
            letterSpacing: "0.1em",
          }}
        >
          {error}
        </p>
      )}
      {searched && !loading && results.length === 0 && !error && (
        <p
          style={{
            color: "var(--text-dim)",
            fontSize: "0.82rem",
            fontFamily: "var(--font-space-mono), 'Space Mono', monospace",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          No skills found. Try a different query.
        </p>
      )}
      {!searched && (
        <p
          style={{
            fontSize: "0.72rem",
            color: "var(--text-dim)",
            fontFamily: "var(--font-space-mono), 'Space Mono', monospace",
            fontWeight: 700,
            marginBottom: "1.25rem",
            letterSpacing: "0.24em",
            textTransform: "uppercase",
          }}
        >
          Featured skills
        </p>
      )}

      <div style={{ display: "grid", gap: "0" }}>
        {displaySkills.map((card, i) => (
          <div
            key={card.slug}
            style={{ animation: `fadeUp 0.3s ${i * 0.04}s ease both` }}
          >
            <SkillCard card={card} />
          </div>
        ))}
      </div>
    </div>
  );
}
