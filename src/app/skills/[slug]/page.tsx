import { notFound } from "next/navigation"
import { fetchSkillVersionList, fetchSkillMetadata, fetchSkillContent } from "@/lib/registry-client"
import { extractMarkdownFromTarZst } from "@/lib/archive"
import { SkillHeader } from "@/components/skill-header"
import { SkillMetadata } from "@/components/skill-metadata"
import { SkillContent } from "@/components/skill-content"
import { VersionList } from "@/components/version-list"
import { requireSession } from "@/lib/auth"

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ version?: string }>
}

export default async function SkillDetailPage({ params, searchParams }: Props) {
  await requireSession()
  const { slug } = await params
  const { version: versionParam } = await searchParams

  const versionList = await fetchSkillVersionList(slug).catch(() => notFound() as never)

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
    <div className="detail-page">
      <SkillHeader meta={meta} />
      <div className="detail-grid">
        <div className="detail-main">
          {markdown ? (
            <SkillContent markdown={markdown} />
          ) : (
            <div className="empty-panel">
              SKILL.md not available for this version.
            </div>
          )}
          {versionList.versions.length > 1 && (
            <VersionList slug={slug} versions={versionList.versions} />
          )}
        </div>
        <div className="detail-aside">
          <SkillMetadata meta={meta} />
        </div>
      </div>
    </div>
  )
}
