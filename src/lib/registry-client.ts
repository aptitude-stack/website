import "server-only"
import type {
  DiscoveryResponseDto,
  SkillCardData,
  SkillVersionListDto,
  SkillVersionMetadataDto,
  TopSkillsResponseDto,
} from "@/lib/types"

function getRegistryEnv(): { baseUrl: string; token: string } {
  const baseUrl = process.env.REGISTRY_BASE_URL
  const token = process.env.REGISTRY_READ_TOKEN
  if (!baseUrl || !token) throw new Error("REGISTRY_BASE_URL and REGISTRY_READ_TOKEN must be set")
  return { baseUrl, token }
}

export async function registryFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const { baseUrl, token } = getRegistryEnv()
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...init?.headers },
  })
  if (!res.ok) throw new Error(`Registry ${res.status}: ${path}`)
  return res.json() as Promise<T>
}

export async function fetchSkillVersionList(slug: string): Promise<SkillVersionListDto> {
  return registryFetch<SkillVersionListDto>(`/skills/${encodeURIComponent(slug)}`)
}

export async function fetchSkillMetadata(slug: string, version: string): Promise<SkillVersionMetadataDto> {
  return registryFetch<SkillVersionMetadataDto>(
    `/skills/${encodeURIComponent(slug)}/${encodeURIComponent(version)}`
  )
}

export async function fetchSkillContent(slug: string, version: string): Promise<ArrayBuffer> {
  const { baseUrl, token } = getRegistryEnv()
  const res = await fetch(
    `${baseUrl}/skills/${encodeURIComponent(slug)}/${encodeURIComponent(version)}/content`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  if (!res.ok) throw new Error(`Registry ${res.status}: content`)
  return res.arrayBuffer()
}

export async function discoverSlugs(query: string): Promise<string[]> {
  const result = await registryFetch<DiscoveryResponseDto>("/discovery", {
    method: "POST",
    body: JSON.stringify({ name: query }),
  })
  return result.candidates
}

function toSkillCardData(meta: SkillVersionMetadataDto): SkillCardData {
  return {
    slug: meta.slug,
    version: meta.version,
    install_count: meta.install_count,
    name: meta.metadata.name,
    description: meta.metadata.description,
    tags: meta.metadata.tags,
    lifecycle_status: meta.lifecycle_status,
    trust_tier: meta.trust_tier,
    token_estimate: meta.metadata.token_estimate,
    size_bytes: meta.content.size_bytes,
    published_at: meta.published_at,
  }
}

export async function fetchTopSkillCards(limit = 12): Promise<SkillCardData[]> {
  const result = await registryFetch<TopSkillsResponseDto>(
    `/catalog/top-skills?limit=${encodeURIComponent(limit)}`
  )
  return result.skills.map(toSkillCardData)
}

export async function fetchSkillCardData(slug: string): Promise<SkillCardData | null> {
  const list = await fetchSkillVersionList(slug)
  const current = list.versions.find((v) => v.is_current_default) ?? list.versions[0]
  if (!current) return null
  const meta = await fetchSkillMetadata(slug, current.version)
  return toSkillCardData(meta)
}
