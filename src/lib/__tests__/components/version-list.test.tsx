import { render, screen } from "@testing-library/react"
import { VersionList } from "@/components/version-list"
import type { SkillVersionSummaryDto } from "@/lib/types"

const versions: SkillVersionSummaryDto[] = [
  {
    version: "1.0.0 beta",
    lifecycle_status: "published",
    trust_tier: "verified",
    namespace: "public",
    artifact_origin: "authored",
    review_state: "approved",
    promotion_channel: "prod",
    policy_pack_slug: null,
    published_at: "2024-01-01T00:00:00Z",
    is_current_default: true,
  },
  {
    version: "0.9.0 beta",
    lifecycle_status: "published",
    trust_tier: "verified",
    namespace: "public",
    artifact_origin: "authored",
    review_state: "approved",
    promotion_channel: "prod",
    policy_pack_slug: null,
    published_at: "2023-12-01T00:00:00Z",
    is_current_default: false,
  },
]

describe("VersionList", () => {
  it("links the default version to the clean skill route", () => {
    render(<VersionList slug="python/security scan" versions={versions} />)
    expect(screen.getByRole("link", { name: "1.0.0 beta" })).toHaveAttribute(
      "href",
      "/skills/python%2Fsecurity%20scan",
    )
  })

  it("encodes slug and version in non-default route links", () => {
    render(<VersionList slug="python/security scan" versions={versions} />)
    expect(screen.getByRole("link", { name: "0.9.0 beta" })).toHaveAttribute(
      "href",
      "/skills/python%2Fsecurity%20scan?version=0.9.0%20beta",
    )
  })
})
