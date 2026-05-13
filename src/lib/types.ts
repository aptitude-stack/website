// Registry nested types
export interface ChecksumDto {
  algorithm: string
  digest: string
}

export interface ContentSummaryDto {
  checksum: ChecksumDto
  media_type: string
  size_bytes: number
}

export interface SkillMetadataDto {
  name: string
  description: string | null
  tags: string[]
  inputs_schema: Record<string, unknown> | null
  outputs_schema: Record<string, unknown> | null
  token_estimate: number | null
  maturity_score: number | null
  security_score: number | null
}

export interface TrustContextDto {
  trust_tier: string
  policy_profile: string
}

export interface ProvenanceDto {
  repo_url: string
  commit_sha: string
  tree_path: string | null
  publisher_identity: string | null
  trust_context: TrustContextDto | null
}

// GET /skills/{slug}/{version}
export interface SkillVersionMetadataDto {
  slug: string
  version: string
  install_count: number
  version_checksum: ChecksumDto
  content: ContentSummaryDto
  metadata: SkillMetadataDto
  lifecycle_status: string
  trust_tier: string
  namespace: string
  artifact_origin: string
  review_state: string
  promotion_channel: string
  policy_pack_slug: string | null
  provenance: ProvenanceDto | null
  published_at: string
}

// GET /skills/{slug} — version list item
export interface SkillVersionSummaryDto {
  version: string
  lifecycle_status: string
  trust_tier: string
  namespace: string
  artifact_origin: string
  review_state: string
  promotion_channel: string
  policy_pack_slug: string | null
  published_at: string
  is_current_default: boolean
}

// GET /skills/{slug}
export interface SkillVersionListDto {
  slug: string
  versions: SkillVersionSummaryDto[]
}

// POST /discovery
export interface DiscoveryResponseDto {
  candidates: string[]
}

// Flattened shape used for SkillCard display (built from SkillVersionMetadataDto)
export interface SkillCardData {
  slug: string
  version: string
  name: string
  description: string | null
  tags: string[]
  lifecycle_status: string
  trust_tier: string
  token_estimate: number | null
  size_bytes: number
  published_at: string
}
