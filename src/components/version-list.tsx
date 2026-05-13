import type { SkillVersionSummaryDto } from "@/lib/types"

const MONO = "var(--font-space-mono), 'Space Mono', ui-monospace, monospace"

const lifecycleColor = {
  published: "#d8b4fe",
  deprecated: "#f2c94c",
  archived: "#7a766d",
} as Record<string, string>

export function VersionList({ slug, versions }: { slug: string; versions: SkillVersionSummaryDto[] }) {
  return (
    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
      <div style={{ padding: "clamp(10px, 1.2vw, 14px) clamp(20px, 2.4vw, 28px)", borderBottom: "1px solid var(--border)" }}>
        <h2 style={{ fontFamily: MONO, fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase", color: "var(--text-dim)", margin: 0 }}>Version History</h2>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {versions.map((v) => (
            <tr key={v.version} style={{ borderBottom: "1px solid var(--border)", background: v.is_current_default ? "rgba(168,85,247,0.06)" : "transparent" }}>
              <td style={{ padding: "clamp(10px, 1.2vw, 14px) clamp(20px, 2.4vw, 28px)" }}>
                <a href={`/skills/${slug}?version=${v.version}`} style={{ fontFamily: MONO, fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.04em", color: v.is_current_default ? "var(--accent)" : "var(--text-primary)", textDecoration: "none" }}>
                  {v.version}
                  {v.is_current_default && <span style={{ fontSize: "0.65rem", marginLeft: "0.5rem", color: "var(--accent)", letterSpacing: "0.16em", textTransform: "uppercase" }}>latest</span>}
                </a>
              </td>
              <td style={{ padding: "clamp(10px, 1.2vw, 14px) 0.75rem" }}>
                <span style={{ fontSize: "0.7rem", fontFamily: MONO, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: lifecycleColor[v.lifecycle_status] ?? "var(--text-dim)" }}>{v.lifecycle_status}</span>
              </td>
              <td style={{ padding: "clamp(10px, 1.2vw, 14px) clamp(20px, 2.4vw, 28px)", textAlign: "right" }}>
                <span style={{ fontSize: "0.7rem", fontFamily: MONO, fontWeight: 700, letterSpacing: "0.06em", color: "var(--text-dim)" }}>
                  {new Date(v.published_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
