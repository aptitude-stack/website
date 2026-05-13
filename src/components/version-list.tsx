import type { SkillVersionSummaryDto } from "@/lib/types"

const lifecycleColor = {
  published: "#50C97A", deprecated: "#E8A427", archived: "#7C7D80",
} as Record<string, string>

export function VersionList({ slug, versions }: { slug: string; versions: SkillVersionSummaryDto[] }) {
  return (
    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "8px", overflow: "hidden" }}>
      <div style={{ padding: "0.875rem 1.25rem", borderBottom: "1px solid var(--border)" }}>
        <h2 style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", margin: 0 }}>Version History</h2>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {versions.map((v) => (
            <tr key={v.version} style={{ borderBottom: "1px solid var(--border-subtle)", background: v.is_current_default ? "var(--accent-dim)" : "transparent" }}>
              <td style={{ padding: "0.625rem 1.25rem" }}>
                <a href={`/skills/${slug}?version=${v.version}`} style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.875rem", color: v.is_current_default ? "var(--accent)" : "var(--text-primary)", textDecoration: "none" }}>
                  {v.version}{v.is_current_default && <span style={{ fontSize: "0.65rem", marginLeft: "0.5rem", opacity: 0.7, color: "var(--accent)" }}>latest</span>}
                </a>
              </td>
              <td style={{ padding: "0.625rem 0.75rem" }}>
                <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: lifecycleColor[v.lifecycle_status] ?? "var(--text-muted)" }}>{v.lifecycle_status}</span>
              </td>
              <td style={{ padding: "0.625rem 1.25rem", textAlign: "right" }}>
                <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "var(--text-dim)" }}>
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
