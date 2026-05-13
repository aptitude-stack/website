import { fetchSkillCardData } from "@/lib/registry-client"
import { CatalogView } from "@/components/catalog-view"
import type { SkillCardData } from "@/lib/types"

const FEATURED_SLUGS = (process.env.NEXT_PUBLIC_FEATURED_SLUGS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean)

async function fetchFeaturedCards(): Promise<SkillCardData[]> {
  const settled = await Promise.allSettled(FEATURED_SLUGS.map(fetchSkillCardData))
  return settled
    .filter((r): r is PromiseFulfilledResult<SkillCardData> => r.status === "fulfilled" && r.value !== null)
    .map((r) => r.value)
}

export default async function CatalogPage() {
  const featured = await fetchFeaturedCards()
  return <CatalogView featured={featured} />
}
