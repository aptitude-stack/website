import { connection } from "next/server"
import { fetchTopSkillCards } from "@/lib/registry-client"
import { CatalogView } from "@/components/catalog-view"

export default async function CatalogPage() {
  await connection()
  const topSkills = await fetchTopSkillCards(12)
  return <CatalogView topSkills={topSkills} />
}
