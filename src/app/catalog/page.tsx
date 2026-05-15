import { connection } from "next/server"
import { CatalogView } from "@/components/catalog-view"
import { requireSession } from "@/lib/auth"
import { fetchCatalogSkillCardsSafe, fetchSkillGraphSafe } from "@/lib/registry-client"

type Props = {
  searchParams: Promise<{ tag?: string | string[] }>
}

export default async function CatalogPage({ searchParams }: Props) {
  await requireSession()
  await connection()
  const { tag: tagParam } = await searchParams
  const selectedTag = Array.isArray(tagParam) ? tagParam[0] : tagParam
  const [catalogSkills, skillGraph] = await Promise.all([
    fetchCatalogSkillCardsSafe(),
    fetchSkillGraphSafe(),
  ])
  return <CatalogView topSkills={catalogSkills} skillGraph={skillGraph} selectedTag={selectedTag} />
}
