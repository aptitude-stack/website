import { connection } from "next/server"
import { CatalogView } from "@/components/catalog-view"
import { requireSession } from "@/lib/auth"
import { fetchSkillGraphSafe, fetchTopSkillCardsSafe } from "@/lib/registry-client"

export default async function CatalogPage() {
  await requireSession()
  await connection()
  const [topSkills, skillGraph] = await Promise.all([
    fetchTopSkillCardsSafe(12),
    fetchSkillGraphSafe(),
  ])
  return <CatalogView topSkills={topSkills} skillGraph={skillGraph} />
}
