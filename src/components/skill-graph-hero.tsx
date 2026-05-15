"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { SkillGraphData, SkillGraphEdgeType } from "@/lib/types"

interface SkillGraphHeroProps {
  graph: SkillGraphData
}

interface PositionedNode {
  slug: string
  name: string
  install_count: number
  x: number
  y: number
  z: number
}

type RenderableEdgeType = SkillGraphEdgeType | "ambient"

export interface RenderableGraphEdge {
  source_slug: string
  target_slug: string
  edge_type: RenderableEdgeType
  authored: boolean
}

export interface GraphNodeDetails {
  name: string
  slug: string
  version: string
  install_count: number
  relationships: string[]
}

interface HoverCard extends GraphNodeDetails {
  x: number
  y: number
}

const MAX_DPR = 1.5
const EDGE_COLORS: Record<RenderableEdgeType, number> = {
  depends_on: 0xf2c94c,
  extends: 0x9e94a3,
  overlaps_with: 0xddd5c8,
  ambient: 0x66556a,
}
const EDGE_OPACITY: Record<RenderableEdgeType, number> = {
  depends_on: 0.2,
  extends: 0.18,
  overlaps_with: 0.16,
  ambient: 0.15,
}

export function SkillGraphHero({ graph }: SkillGraphHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const frameRef = useRef<number | null>(null)
  const [mode, setMode] = useState<"pending" | "canvas" | "static">("pending")
  const [hoverCard, setHoverCard] = useState<HoverCard | null>(null)
  const positionedNodes = useMemo(() => positionNodes(graph), [graph])
  const renderableEdges = useMemo(() => getRenderableGraphEdges(graph), [graph])
  const hasGraph = graph.nodes.length > 0

  useEffect(() => {
    if (!hasGraph) return
    if (typeof window === "undefined") return

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    const desktop = window.matchMedia("(min-width: 768px)")
    if (reduceMotion.matches || !desktop.matches) {
      setMode("static")
      return
    }

    let cancelled = false
    let observer: IntersectionObserver | null = null
    let resizeObserver: ResizeObserver | null = null
    let cleanupScene: (() => void) | null = null

    async function initScene() {
      const canvas = canvasRef.current
      if (!canvas) return

      try {
        const THREE = await import("three")
        if (cancelled) return
        const activeCanvas = canvas

        const renderer = new THREE.WebGLRenderer({
          canvas: activeCanvas,
          antialias: true,
          alpha: true,
          powerPreference: "low-power",
        })
        renderer.setClearAlpha(0)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_DPR))

        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
        camera.position.set(0, 0, 8.4)

        const group = new THREE.Group()
        scene.add(group)

        const ambient = new THREE.AmbientLight(0xf2ddbb, 0.62)
        const key = new THREE.DirectionalLight(0xf6efe2, 0.68)
        key.position.set(2, 3, 5)
        scene.add(ambient, key)

        const nodeGeometry = new THREE.SphereGeometry(0.052, 18, 12)
        const nodeMaterial = new THREE.MeshStandardMaterial({
          color: 0xf6efe2,
          emissive: 0x2a252b,
          roughness: 0.7,
          metalness: 0.08,
          transparent: true,
          opacity: 0.78,
        })
        const hoverMaterial = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: 0xb319cf,
          roughness: 0.54,
          metalness: 0.08,
          transparent: true,
          opacity: 0.96,
        })
        const lineMaterials = new Map<RenderableEdgeType, InstanceType<typeof THREE.LineBasicMaterial>>()

        const meshBySlug = new Map<string, InstanceType<typeof THREE.Mesh>>()
        const nodeObjects: InstanceType<typeof THREE.Mesh>[] = []
        const installMax = Math.max(...positionedNodes.map((node) => node.install_count), 1)
        for (const node of positionedNodes) {
          const mesh = new THREE.Mesh(nodeGeometry, nodeMaterial)
          const scale = 0.82 + (node.install_count / installMax) * 0.48
          mesh.scale.setScalar(scale)
          mesh.position.set(node.x, node.y, node.z)
          mesh.userData = { slug: node.slug, name: node.name }
          group.add(mesh)
          meshBySlug.set(node.slug, mesh)
          nodeObjects.push(mesh)
        }

        for (const edge of renderableEdges.slice(0, 60)) {
          const source = meshBySlug.get(edge.source_slug)
          const target = meshBySlug.get(edge.target_slug)
          if (!source || !target) continue
          let material = lineMaterials.get(edge.edge_type)
          if (!material) {
            material = new THREE.LineBasicMaterial({
              color: EDGE_COLORS[edge.edge_type],
              transparent: true,
              opacity: EDGE_OPACITY[edge.edge_type],
            })
            lineMaterials.set(edge.edge_type, material)
          }
          const geometry = new THREE.BufferGeometry().setFromPoints([
            source.position,
            target.position,
          ])
          group.add(new THREE.Line(geometry, material))
        }

        const raycaster = new THREE.Raycaster()
        const pointer = new THREE.Vector2(2, 2)
        let activeMesh: InstanceType<typeof THREE.Mesh> | null = null
        let isPointerInside = false
        let isVisible = true
        let drift = 0

        function resize() {
          const width = Math.max(activeCanvas.clientWidth, 1)
          const height = Math.max(activeCanvas.clientHeight, 1)
          renderer.setSize(width, height, false)
          camera.aspect = width / height
          camera.updateProjectionMatrix()
          renderer.render(scene, camera)
        }

        function setActiveMesh(mesh: InstanceType<typeof THREE.Mesh> | null, event?: PointerEvent) {
          if (activeMesh === mesh) return
          if (activeMesh) activeMesh.material = nodeMaterial
          activeMesh = mesh

          if (!activeMesh || !event) {
            setHoverCard(null)
            return
          }

          activeMesh.material = hoverMaterial
          const slug = String(activeMesh.userData.slug)
          const details = getGraphNodeDetails(graph, renderableEdges, slug)
          if (!details) {
            setHoverCard(null)
            return
          }

          const rect = activeCanvas.getBoundingClientRect()
          setHoverCard({
            ...details,
            x: Math.min(Math.max(event.clientX - rect.left + 18, 16), rect.width - 180),
            y: Math.min(Math.max(event.clientY - rect.top + 18, 16), rect.height - 96),
          })
        }

        function renderFrame() {
          if (!isVisible) {
            frameRef.current = null
            return
          }
          drift += 0.0032
          group.rotation.y += 0.00024
          group.rotation.x = Math.sin(drift * 0.58) * 0.025
          group.rotation.z = Math.sin(drift * 0.34) * 0.018
          group.position.set(Math.sin(drift * 0.42) * 0.07, Math.cos(drift * 0.31) * 0.045, 0)
          if (isPointerInside) {
            raycaster.setFromCamera(pointer, camera)
            const [hit] = raycaster.intersectObjects(nodeObjects, false)
            setActiveMesh(hit?.object instanceof THREE.Mesh ? hit.object : null)
          }
          renderer.render(scene, camera)
          frameRef.current = window.requestAnimationFrame(renderFrame)
        }

        function start() {
          if (frameRef.current === null) {
            frameRef.current = window.requestAnimationFrame(renderFrame)
          }
        }

        function stop() {
          if (frameRef.current !== null) {
            window.cancelAnimationFrame(frameRef.current)
            frameRef.current = null
          }
        }

        function onPointerMove(event: PointerEvent) {
          const rect = activeCanvas.getBoundingClientRect()
          isPointerInside = true
          pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
          pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
          raycaster.setFromCamera(pointer, camera)
          const [hit] = raycaster.intersectObjects(nodeObjects, false)
          setActiveMesh(hit?.object instanceof THREE.Mesh ? hit.object : null, event)
        }

        function onPointerLeave() {
          isPointerInside = false
          pointer.set(2, 2)
          setActiveMesh(null)
        }

        activeCanvas.addEventListener("pointermove", onPointerMove)
        activeCanvas.addEventListener("pointerleave", onPointerLeave)
        resizeObserver = new ResizeObserver(resize)
        resizeObserver.observe(activeCanvas)
        observer = new IntersectionObserver(([entry]) => {
          isVisible = Boolean(entry?.isIntersecting)
          if (isVisible) start()
          else stop()
        })
        observer.observe(activeCanvas)
        resize()
        setMode("canvas")
        start()

        cleanupScene = () => {
          stop()
          activeCanvas.removeEventListener("pointermove", onPointerMove)
          activeCanvas.removeEventListener("pointerleave", onPointerLeave)
          observer?.disconnect()
          resizeObserver?.disconnect()
          nodeGeometry.dispose()
          nodeMaterial.dispose()
          hoverMaterial.dispose()
          lineMaterials.forEach((material) => material.dispose())
          group.traverse((object) => {
            if (object instanceof THREE.Line) object.geometry.dispose()
          })
          renderer.dispose()
        }
      } catch {
        if (!cancelled) setMode("static")
      }
    }

    void initScene()

    return () => {
      cancelled = true
      cleanupScene?.()
    }
  }, [graph, hasGraph, positionedNodes, renderableEdges])

  if (!hasGraph) return null

  return (
    <div className="skill-graph-hero">
      <canvas
        ref={canvasRef}
        className={mode === "canvas" ? "skill-graph-canvas is-ready" : "skill-graph-canvas"}
        aria-hidden="true"
        width={640}
        height={420}
      />
      {hoverCard && (
        <div
          className="skill-graph-tooltip"
          style={{ left: `${hoverCard.x}px`, top: `${hoverCard.y}px` }}
        >
          <span className="skill-graph-tooltip__eyebrow">Current Skill</span>
          <strong>{hoverCard.name}</strong>
          <span translate="no">{hoverCard.slug}@{hoverCard.version}</span>
          {hoverCard.relationships.length > 0 && (
            <ul>
              {hoverCard.relationships.slice(0, 3).map((relationship) => (
                <li key={relationship}>{relationship}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

function positionNodes(graph: SkillGraphData): PositionedNode[] {
  const total = Math.max(graph.nodes.length, 1)
  const radius = total < 8 ? 2.6 : 3.75
  return graph.nodes.map((node, index) => {
    const hash = hashSlug(node.slug)
    const theta = index * Math.PI * (3 - Math.sqrt(5)) + hash * 0.004
    const ring = 0.52 + ((hash % 37) / 37) * 0.68
    const verticalBias = ((hash % 17) - 8) / 8
    return {
      slug: node.slug,
      name: node.name,
      install_count: node.install_count,
      x: Math.cos(theta) * ring * radius * 1.22,
      y: Math.sin(theta) * ring * radius * 0.92 + verticalBias * 0.52,
      z: ((hash % 101) / 100 - 0.5) * 2.1,
    }
  })
}

export function getRenderableGraphEdges(graph: SkillGraphData): RenderableGraphEdge[] {
  const nodeSlugs = new Set(graph.nodes.map((node) => node.slug))
  const authoredEdges = graph.edges
    .filter((edge) => nodeSlugs.has(edge.source_slug) && nodeSlugs.has(edge.target_slug))
    .map((edge) => ({ ...edge, authored: true }))

  if (authoredEdges.length > 0) return authoredEdges
  if (graph.nodes.length < 2) return []

  const ambientEdges: RenderableGraphEdge[] = []
  const seen = new Set<string>()
  const edgeCount = Math.min(graph.nodes.length, 18)
  for (let index = 0; index < edgeCount; index += 1) {
    const source = graph.nodes[index]
    const target = graph.nodes[(index + 2) % graph.nodes.length]
    if (!source || !target || source.slug === target.slug) continue

    const key = [source.slug, target.slug].sort().join(":")
    if (seen.has(key)) continue
    seen.add(key)
    ambientEdges.push({
      source_slug: source.slug,
      target_slug: target.slug,
      edge_type: "ambient",
      authored: false,
    })
  }

  return ambientEdges
}

export function getGraphNodeDetails(
  graph: SkillGraphData,
  edges: RenderableGraphEdge[],
  slug: string
): GraphNodeDetails | null {
  const node = graph.nodes.find((candidate) => candidate.slug === slug)
  if (!node) return null

  const relationships = edges
    .filter((edge) => edge.source_slug === slug || edge.target_slug === slug)
    .map((edge) => describeRelationship(graph, edge, slug))
    .filter((relationship): relationship is string => Boolean(relationship))

  return {
    name: node.name,
    slug: node.slug,
    version: node.version,
    install_count: node.install_count,
    relationships,
  }
}

function describeRelationship(graph: SkillGraphData, edge: RenderableGraphEdge, slug: string): string | null {
  const isSource = edge.source_slug === slug
  const otherSlug = isSource ? edge.target_slug : edge.source_slug
  const other = graph.nodes.find((node) => node.slug === otherSlug)
  if (!other) return null

  if (!edge.authored) return `near ${other.name}`

  if (edge.edge_type === "depends_on") {
    return isSource ? `depends on ${other.name}` : `used by ${other.name}`
  }
  if (edge.edge_type === "extends") {
    return isSource ? `extends ${other.name}` : `extended by ${other.name}`
  }
  return `overlaps with ${other.name}`
}

function hashSlug(value: string): number {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 1009
  }
  return hash
}
