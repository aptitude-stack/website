import { connection } from "next/server"
import { CatalogView } from "@/components/catalog-view"
import { requireSession } from "@/lib/auth"
import { fetchTopSkillCardsSafe } from "@/lib/registry-client"

export default async function CatalogPage() {
  await requireSession()
  await connection()
  const topSkills = await fetchTopSkillCardsSafe(12)
  return <CatalogView topSkills={topSkills} />
}
