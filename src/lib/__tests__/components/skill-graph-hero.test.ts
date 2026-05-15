import { getRenderableGraphEdges } from "@/components/skill-graph-hero"
import type { SkillGraphData } from "@/lib/types"

function makeGraph(nodeCount: number, edges: SkillGraphData["edges"] = []): SkillGraphData {
  return {
    nodes: Array.from({ length: nodeCount }, (_, index) => ({
      slug: `skill-${index + 1}`,
      version: "1.0.0",
      name: `Skill ${index + 1}`,
      install_count: 10 - index,
      trust_tier: "verified",
      lifecycle_status: "published",
    })),
    edges,
  }
}

describe("getRenderableGraphEdges", () => {
  it("uses authored graph edges when they are available", () => {
    const edges = getRenderableGraphEdges(
      makeGraph(3, [{ source_slug: "skill-1", target_slug: "skill-2", edge_type: "depends_on" }])
    )

    expect(edges).toEqual([
      { source_slug: "skill-1", target_slug: "skill-2", edge_type: "depends_on", authored: true },
    ])
  })

  it("creates ambient depth links when the graph has nodes but no authored edges", () => {
    const edges = getRenderableGraphEdges(makeGraph(5))

    expect(edges).toHaveLength(5)
    expect(edges.every((edge) => edge.edge_type === "ambient" && !edge.authored)).toBe(true)
    expect(edges.every((edge) => edge.source_slug !== edge.target_slug)).toBe(true)
  })
})
