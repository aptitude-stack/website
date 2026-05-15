import { connection } from "next/server"
import { fetchTopSkillCardsSafe } from "@/lib/registry-client"
import { CatalogView } from "@/components/catalog-view"

export default async function CatalogPage() {
  await connection()
  const topSkills = await fetchTopSkillCardsSafe(12)
  return <CatalogView topSkills={topSkills} />
}
