import { notFound } from "next/navigation"
import { fetchSkillVersionList, fetchSkillMetadata, fetchSkillContent } from "@/lib/registry-client"
import { extractMarkdownFromTarZst } from "@/lib/archive"
import { SkillHeader } from "@/components/skill-header"
import { SkillMetadata } from "@/components/skill-metadata"
import { SkillContent } from "@/components/skill-content"
import { VersionList } from "@/components/version-list"

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ version?: string }>
}

export default async function SkillDetailPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { version: versionParam } = await searchParams

  let versionList
  try {
    versionList = await fetchSkillVersionList(slug)
  } catch {
    notFound()
  }

  const current = versionParam
    ? versionList.versions.find((v) => v.version === versionParam)
    : versionList.versions.find((v) => v.is_current_default) ?? versionList.versions[0]

  if (!current) notFound()

  const [meta, contentBuffer] = await Promise.all([
    fetchSkillMetadata(slug, current.version).catch(() => null),
    fetchSkillContent(slug, current.version).catch(() => null),
  ])

  if (!meta) notFound()

  const markdown = contentBuffer
    ? extractMarkdownFromTarZst(new Uint8Array(contentBuffer))
    : null

  return (
    <div>
      <SkillHeader meta={meta} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "2rem", alignItems: "start" }}>
        <div>
          {markdown ? (
            <SkillContent markdown={markdown} />
          ) : (
            <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "8px", padding: "2rem", color: "var(--text-dim)", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.875rem", textAlign: "center" }}>
              SKILL.md not available for this version.
            </div>
          )}
          {versionList.versions.length > 1 && (
            <div style={{ marginTop: "2.5rem" }}>
              <VersionList slug={slug} versions={versionList.versions} />
            </div>
          )}
        </div>
        <div style={{ position: "sticky", top: "4.5rem" }}>
          <SkillMetadata meta={meta} />
        </div>
      </div>
    </div>
  )
}
