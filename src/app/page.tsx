import { connection } from "next/server"
import { fetchTopSkillCards, hasRegistryEnv } from "@/lib/registry-client"
import { CatalogView } from "@/components/catalog-view"

export default async function CatalogPage() {
  await connection()
  if (process.env.NODE_ENV === "development" && !hasRegistryEnv()) {
    return <CatalogView topSkills={[]} />
  }

  const topSkills = await fetchTopSkillCards(12)
  return <CatalogView topSkills={topSkills} />
}
