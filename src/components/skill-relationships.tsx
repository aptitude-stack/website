import Link from "next/link"
import type { SkillGraphData, SkillGraphEdgeDto, SkillGraphNodeDto } from "@/lib/types"

interface SkillRelationshipsProps {
  graph: SkillGraphData
  slug: string
}

interface RelationshipItem {
  label: string
  node: SkillGraphNodeDto
}

export function SkillRelationships({ graph, slug }: SkillRelationshipsProps) {
  const relationships = getFirstTierRelationships(graph, slug)
  if (relationships.length === 0) return null

  return (
    <aside className="relationships-panel" aria-labelledby="relationships-title">
      <div className="relationships-panel__header">
        <h2 id="relationships-title" className="panel-title">Relationships</h2>
      </div>
      <ul className="relationships-list">
        {relationships.map((relationship) => (
          <li key={`${relationship.label}-${relationship.node.slug}`} className="relationship-row">
            <span className="relationship-label">{relationship.label}</span>
            <Link href={`/skills/${encodeURIComponent(relationship.node.slug)}`} className="relationship-link">
              {relationship.node.name}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  )
}

function getFirstTierRelationships(graph: SkillGraphData, slug: string): RelationshipItem[] {
  const nodeBySlug = new Map(graph.nodes.map((node) => [node.slug, node]))
  return graph.edges
    .map((edge) => describeRelationship(edge, slug, nodeBySlug))
    .filter((relationship): relationship is RelationshipItem => relationship !== null)
}

function describeRelationship(
  edge: SkillGraphEdgeDto,
  slug: string,
  nodeBySlug: Map<string, SkillGraphNodeDto>,
): RelationshipItem | null {
  const isSource = edge.source_slug === slug
  const isTarget = edge.target_slug === slug
  if (!isSource && !isTarget) return null

  const relatedSlug = isSource ? edge.target_slug : edge.source_slug
  const node = nodeBySlug.get(relatedSlug)
  if (!node) return null

  if (edge.edge_type === "depends_on") {
    return { label: isSource ? "Depends On" : "Used By", node }
  }
  if (edge.edge_type === "extends") {
    return { label: isSource ? "Extends" : "Extended By", node }
  }
  return { label: "Overlaps With", node }
}
