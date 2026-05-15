import { connection } from "next/server"
import { CatalogView } from "@/components/catalog-view"
import { requireSession } from "@/lib/auth"
import { fetchCatalogSkillCardsSafe, fetchSkillGraphSafe } from "@/lib/registry-client"

export default async function CatalogPage() {
  await requireSession()
  await connection()
  const [catalogSkills, skillGraph] = await Promise.all([
    fetchCatalogSkillCardsSafe(),
    fetchSkillGraphSafe(),
  ])
  return <CatalogView topSkills={catalogSkills} skillGraph={skillGraph} />
}
