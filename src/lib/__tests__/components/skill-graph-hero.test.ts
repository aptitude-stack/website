import { getIncidentEdgeKeys } from "@/components/skill-graph-hero"
import type { SkillGraphData } from "@/lib/types"

const graph: SkillGraphData = {
  nodes: [],
  edges: [
    { source_slug: "python.base", target_slug: "python.lint", edge_type: "depends_on" },
    { source_slug: "python.format", target_slug: "python.base", edge_type: "extends" },
    { source_slug: "python.docs", target_slug: "python.review", edge_type: "overlaps_with" },
  ],
}

describe("SkillGraphHero hover helpers", () => {
  it("returns only the edge keys connected to the hovered node", () => {
    expect(getIncidentEdgeKeys(graph.edges, "python.base")).toEqual(
      new Set([
        "python.base->python.lint:depends_on",
        "python.format->python.base:extends",
      ])
    )
  })

  it("returns no edges when the hovered node is isolated", () => {
    expect(getIncidentEdgeKeys(graph.edges, "python.docs.extra")).toEqual(new Set())
  })
})
