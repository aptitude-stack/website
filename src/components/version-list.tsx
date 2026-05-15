import Link from "next/link"
import type { SkillVersionSummaryDto } from "@/lib/types"

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
})

function lifecycleClass(status: string) {
  if (status === "published") return "badge-published"
  if (status === "deprecated") return "badge-deprecated"
  return "badge-archived"
}

export function VersionList({ slug, versions }: { slug: string; versions: SkillVersionSummaryDto[] }) {
  return (
    <section className="version-panel" aria-labelledby="version-history-title">
      <div className="version-panel__header">
        <h2 id="version-history-title" className="panel-title">Version History</h2>
      </div>
      <div className="version-table-wrap">
        <table className="version-table">
          <tbody>
            {versions.map((version) => (
              <tr key={version.version} data-current={version.is_current_default}>
                <td>
                  <Link href={`/skills/${encodeURIComponent(slug)}?version=${encodeURIComponent(version.version)}`} className="version-link">
                    <span translate="no">{version.version}</span>
                  </Link>
                </td>
                <td>
                  <span className={`badge ${lifecycleClass(version.lifecycle_status)}`}>
                    {version.lifecycle_status}
                  </span>
                </td>
                <td className="version-date">
                  {dateFormatter.format(new Date(version.published_at))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
