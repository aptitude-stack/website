import "server-only"
import type {
  LifecycleStatus,
  SkillGraphData,
  SkillGraphEdgeType,
  SkillGraphResponseDto,
  SkillCardData,
  SkillVersionSummaryDto,
  SkillVersionListDto,
  SkillVersionMetadataDto,
  StarEventBatchResponseDto,
  StarEventDto,
  TopSkillsResponseDto,
  TrustTier,
} from "@/lib/types"

const HTTP_PROTOCOLS = new Set(["http:", "https:"])
const LOCAL_DEV_REGISTRY_BASE_URL = "http://127.0.0.1:8000"
const LOCAL_DEV_REGISTRY_READ_TOKEN = "reader-token.dev-reader-secret"
const LOCAL_DEV_REGISTRY_TELEMETRY_TOKEN = "telemetry-token.dev-telemetry-secret"
export const REGISTRY_FETCH_TIMEOUT_MS = 5000
export const MAX_STAR_EVENT_BATCH_SIZE = 100

function getRegistryEnv(): { baseUrl: string; token: string } {
  const baseUrl = normalizeBaseUrl(getRegistryBaseUrl())
  const token = getRegistryReadToken()
  if (!baseUrl || !token) throw new Error("REGISTRY_BASE_URL and REGISTRY_READ_TOKEN must be set")
  return { baseUrl, token }
}

export function hasRegistryEnv(): boolean {
  return Boolean(normalizeBaseUrl(getRegistryBaseUrl()) && getRegistryReadToken())
}

function getRegistryBaseUrl(): string | undefined {
  return process.env.REGISTRY_BASE_URL ?? getLocalDevRegistryDefault(LOCAL_DEV_REGISTRY_BASE_URL)
}

function getRegistryReadToken(): string | undefined {
  return process.env.REGISTRY_READ_TOKEN ?? getLocalDevRegistryDefault(LOCAL_DEV_REGISTRY_READ_TOKEN)
}

function getRegistryTelemetryToken(): string | undefined {
  return (
    process.env.REGISTRY_TELEMETRY_TOKEN ??
    process.env.TELEMETRY_TOKEN ??
    getLocalDevRegistryDefault(LOCAL_DEV_REGISTRY_TELEMETRY_TOKEN)
  )
}

export function hasRegistryTelemetryEnv(): boolean {
  return Boolean(normalizeBaseUrl(getRegistryBaseUrl()) && getRegistryTelemetryToken())
}

function getRegistryTelemetryEnv(): { baseUrl: string; token: string } {
  const baseUrl = normalizeBaseUrl(getRegistryBaseUrl())
  const token = getRegistryTelemetryToken()
  if (!baseUrl || !token) {
    throw new Error("REGISTRY_BASE_URL and REGISTRY_TELEMETRY_TOKEN or TELEMETRY_TOKEN must be set")
  }
  return { baseUrl, token }
}

function getLocalDevRegistryDefault(value: string): string | undefined {
  return process.env.NODE_ENV === "development" ? value : undefined
}

export async function registryFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const { baseUrl, token } = getRegistryEnv()
  const res = await fetchWithRegistryTimeout(`${baseUrl}${path}`, {
    init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...init?.headers },
  })
  if (!res.ok) throw new Error(`Registry ${res.status}: ${path}`)
  return res.json() as Promise<T>
}

export async function fetchSkillVersionList(slug: string): Promise<SkillVersionListDto> {
  const result = await registryFetch<unknown>(`/skills/${encodeURIComponent(slug)}`)
  return assertSkillVersionList(result)
}

export async function fetchSkillMetadata(slug: string, version: string): Promise<SkillVersionMetadataDto> {
  const result = await registryFetch<unknown>(
    `/skills/${encodeURIComponent(slug)}/${encodeURIComponent(version)}`
  )
  return assertSkillVersionMetadata(result)
}

export async function fetchSkillContent(slug: string, version: string): Promise<ArrayBuffer> {
  const { baseUrl, token } = getRegistryEnv()
  const res = await fetchWithRegistryTimeout(
    `${baseUrl}/skills/${encodeURIComponent(slug)}/${encodeURIComponent(version)}/content`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  if (!res.ok) throw new Error(`Registry ${res.status}: content`)
  return res.arrayBuffer()
}

export async function searchSkillCards(query: string): Promise<SkillCardData[]> {
  const result = await registryFetch<unknown>("/catalog/search?limit=20", {
    method: "POST",
    body: JSON.stringify({ name: query }),
  })
  return assertTopSkillsResponse(result).skills.map(toSkillCardData)
}

function toSkillCardData(meta: SkillVersionMetadataDto): SkillCardData {
  return {
    slug: meta.slug,
    version: meta.version,
    install_count: meta.install_count,
    star_count: meta.star_count,
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
  const result = await registryFetch<unknown>(
    `/catalog/top-skills?limit=${encodeURIComponent(limit)}`
  )
  return assertTopSkillsResponse(result).skills.map(toSkillCardData)
}

export async function fetchCatalogSkillCards(): Promise<SkillCardData[]> {
  const result = await registryFetch<unknown>("/catalog/skills")
  return assertTopSkillsResponse(result).skills.map(toSkillCardData)
}

export async function fetchCatalogSkillCardsSafe(): Promise<SkillCardData[]> {
  try {
    return await fetchCatalogSkillCards()
  } catch {
    return []
  }
}

export async function fetchTopSkillCardsSafe(limit = 12): Promise<SkillCardData[]> {
  try {
    return await fetchTopSkillCards(limit)
  } catch {
    return []
  }
}

export async function fetchSkillGraph(limit = 24): Promise<SkillGraphData> {
  const result = await registryFetch<unknown>(
    `/catalog/skill-graph?limit=${encodeURIComponent(limit)}`
  )
  return assertSkillGraphResponse(result)
}

export async function fetchSkillGraphSafe(limit = 24): Promise<SkillGraphData> {
  try {
    return await fetchSkillGraph(limit)
  } catch {
    return { nodes: [], edges: [] }
  }
}

export async function fetchSkillCardData(slug: string): Promise<SkillCardData | null> {
  const list = await fetchSkillVersionList(slug)
  const current = list.versions.find((v) => v.is_current_default) ?? list.versions[0]
  if (!current) return null
  const meta = await fetchSkillMetadata(slug, current.version)
  return toSkillCardData(meta)
}

export class StarEventSubmissionError extends Error {
  constructor(public readonly status: number, public readonly bodyText: string) {
    super(`Registry ${status}: /catalog/star-events`)
    this.name = "StarEventSubmissionError"
  }
}

export async function submitStarEvents(
  events: StarEventDto[],
): Promise<StarEventBatchResponseDto> {
  if (events.length === 0) {
    return { accepted: 0, counts: [] }
  }
  if (events.length > MAX_STAR_EVENT_BATCH_SIZE) {
    throw new Error(
      `Star event batch must contain at most ${MAX_STAR_EVENT_BATCH_SIZE} events`,
    )
  }
  const { baseUrl, token } = getRegistryTelemetryEnv()
  const res = await fetchWithRegistryTimeout(`${baseUrl}/catalog/star-events`, {
    init: {
      method: "POST",
      body: JSON.stringify({ events }),
    },
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
  if (!res.ok) {
    const bodyText = await safeReadBody(res)
    throw new StarEventSubmissionError(res.status, bodyText)
  }
  const parsed: unknown = await res.json()
  return assertStarEventBatchResponse(parsed)
}

async function safeReadBody(res: Response): Promise<string> {
  try {
    return await res.text()
  } catch {
    return ""
  }
}

function assertStarEventBatchResponse(value: unknown): StarEventBatchResponseDto {
  if (
    !isRecord(value) ||
    !isNumber(value.accepted) ||
    !Array.isArray(value.counts)
  ) {
    throw new Error("Invalid registry star event response")
  }
  return {
    accepted: value.accepted,
    counts: value.counts.map(assertStarCount),
  }
}

function assertStarCount(value: unknown): { slug: string; star_count: number } {
  if (!isRecord(value) || !isString(value.slug) || !isNumber(value.star_count)) {
    throw new Error("Invalid registry star count entry")
  }
  return { slug: value.slug, star_count: value.star_count }
}

function normalizeBaseUrl(value: string | undefined): string | undefined {
  if (!value) return undefined
  try {
    const url = new URL(value)
    if (!HTTP_PROTOCOLS.has(url.protocol)) return undefined
    return url.origin + url.pathname.replace(/\/+$/, "")
  } catch {
    return undefined
  }
}

async function fetchWithRegistryTimeout(
  input: RequestInfo | URL,
  options: { init?: RequestInit; headers?: HeadersInit } = {},
): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REGISTRY_FETCH_TIMEOUT_MS)
  try {
    return await fetch(input, {
      ...options.init,
      headers: options.headers ?? options.init?.headers,
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeout)
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isString(value: unknown): value is string {
  return typeof value === "string"
}

function isNullableString(value: unknown): value is string | null {
  return value === null || isString(value)
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value)
}

function isNullableNumber(value: unknown): value is number | null {
  return value === null || isNumber(value)
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString)
}

function assertTopSkillsResponse(value: unknown): TopSkillsResponseDto {
  if (!isRecord(value) || !Array.isArray(value.skills)) {
    throw new Error("Invalid registry top skills response")
  }
  return { skills: value.skills.map(assertSkillVersionMetadata) }
}

function assertSkillGraphResponse(value: unknown): SkillGraphResponseDto {
  if (!isRecord(value) || !Array.isArray(value.nodes) || !Array.isArray(value.edges)) {
    throw new Error("Invalid registry skill graph response")
  }
  return {
    nodes: value.nodes.map(assertSkillGraphNode),
    edges: value.edges.map(assertSkillGraphEdge),
  }
}

function assertSkillGraphNode(value: unknown): SkillGraphResponseDto["nodes"][number] {
  if (
    !isRecord(value) ||
    !isString(value.slug) ||
    !isString(value.version) ||
    !isString(value.name) ||
    !isNumber(value.install_count) ||
    !isTrustTier(value.trust_tier) ||
    !isLifecycleStatus(value.lifecycle_status)
  ) {
    throw new Error("Invalid registry skill graph node")
  }
  return {
    slug: value.slug,
    version: value.version,
    name: value.name,
    install_count: value.install_count,
    star_count: isNumber(value.star_count) ? value.star_count : 0,
    trust_tier: value.trust_tier,
    lifecycle_status: value.lifecycle_status,
  }
}

function assertSkillGraphEdge(value: unknown): SkillGraphResponseDto["edges"][number] {
  if (
    !isRecord(value) ||
    !isString(value.source_slug) ||
    !isString(value.target_slug) ||
    !isSkillGraphEdgeType(value.edge_type)
  ) {
    throw new Error("Invalid registry skill graph edge")
  }
  return {
    source_slug: value.source_slug,
    target_slug: value.target_slug,
    edge_type: value.edge_type,
  }
}

function assertSkillVersionList(value: unknown): SkillVersionListDto {
  if (!isRecord(value) || !isString(value.slug) || !Array.isArray(value.versions)) {
    throw new Error("Invalid registry version list response")
  }
  return {
    slug: value.slug,
    versions: value.versions.map(assertSkillVersionSummary),
  }
}

function assertSkillVersionSummary(value: unknown): SkillVersionSummaryDto {
  if (
    !isRecord(value) ||
    !isString(value.version) ||
    !isLifecycleStatus(value.lifecycle_status) ||
    !isTrustTier(value.trust_tier) ||
    !isString(value.namespace) ||
    !isString(value.artifact_origin) ||
    !isString(value.review_state) ||
    !isString(value.promotion_channel) ||
    !isNullableString(value.policy_pack_slug) ||
    !isString(value.published_at) ||
    typeof value.is_current_default !== "boolean"
  ) {
    throw new Error("Invalid registry version summary")
  }
  return {
    version: value.version,
    lifecycle_status: value.lifecycle_status,
    trust_tier: value.trust_tier,
    namespace: value.namespace,
    artifact_origin: value.artifact_origin,
    review_state: value.review_state,
    promotion_channel: value.promotion_channel,
    policy_pack_slug: value.policy_pack_slug,
    published_at: value.published_at,
    is_current_default: value.is_current_default,
  }
}

function assertSkillVersionMetadata(value: unknown): SkillVersionMetadataDto {
  if (!isRecord(value)) throw new Error("Invalid registry metadata response")
  const metadata = value.metadata
  const content = value.content
  const checksum = value.version_checksum
  if (
    !isString(value.slug) ||
    !isString(value.version) ||
    !isNumber(value.install_count) ||
    !isChecksum(checksum) ||
    !isContent(content) ||
    !isMetadata(metadata) ||
    !isLifecycleStatus(value.lifecycle_status) ||
    !isTrustTier(value.trust_tier) ||
    !isString(value.namespace) ||
    !isString(value.artifact_origin) ||
    !isString(value.review_state) ||
    !isString(value.promotion_channel) ||
    !isNullableString(value.policy_pack_slug) ||
    !isProvenance(value.provenance) ||
    !isString(value.published_at)
  ) {
    throw new Error("Invalid registry metadata response")
  }
  return {
    slug: value.slug,
    version: value.version,
    install_count: value.install_count,
    star_count: isNumber(value.star_count) ? value.star_count : 0,
    version_checksum: checksum,
    content,
    metadata,
    lifecycle_status: value.lifecycle_status,
    trust_tier: value.trust_tier,
    namespace: value.namespace,
    artifact_origin: value.artifact_origin,
    review_state: value.review_state,
    promotion_channel: value.promotion_channel,
    policy_pack_slug: value.policy_pack_slug,
    provenance: value.provenance,
    published_at: value.published_at,
  }
}

function isChecksum(value: unknown): value is SkillVersionMetadataDto["version_checksum"] {
  return isRecord(value) && isString(value.algorithm) && isString(value.digest)
}

function isContent(value: unknown): value is SkillVersionMetadataDto["content"] {
  return isRecord(value) && isChecksum(value.checksum) && isString(value.media_type) && isNumber(value.size_bytes)
}

function isMetadata(value: unknown): value is SkillVersionMetadataDto["metadata"] {
  return (
    isRecord(value) &&
    isString(value.name) &&
    isNullableString(value.description) &&
    isStringArray(value.tags) &&
    (value.inputs_schema === null || isRecord(value.inputs_schema)) &&
    (value.outputs_schema === null || isRecord(value.outputs_schema)) &&
    isNullableNumber(value.token_estimate) &&
    isNullableNumber(value.maturity_score) &&
    isNullableNumber(value.security_score)
  )
}

function isLifecycleStatus(value: unknown): value is LifecycleStatus {
  return value === "published" || value === "deprecated" || value === "archived"
}

function isTrustTier(value: unknown): value is TrustTier {
  return value === "untrusted" || value === "internal" || value === "verified"
}

function isSkillGraphEdgeType(value: unknown): value is SkillGraphEdgeType {
  return value === "depends_on" || value === "extends" || value === "overlaps_with"
}

function isProvenance(value: unknown): value is SkillVersionMetadataDto["provenance"] {
  if (value === null) return true
  if (!isRecord(value)) return false
  return (
    isString(value.repo_url) &&
    isString(value.commit_sha) &&
    isNullableString(value.tree_path) &&
    isNullableString(value.publisher_identity) &&
    (value.trust_context === null ||
      (isRecord(value.trust_context) &&
        isTrustTier(value.trust_context.trust_tier) &&
        isString(value.trust_context.policy_profile)))
  )
}
