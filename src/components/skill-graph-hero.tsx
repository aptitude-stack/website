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

export interface GraphEdgeDetails {
  relationship: string
  sourceName: string
  targetName: string
}

interface NodeHoverCard extends GraphNodeDetails {
  kind: "node"
  x: number
  y: number
}

interface EdgeHoverCard extends GraphEdgeDetails {
  kind: "edge"
  x: number
  y: number
}

type HoverCard = NodeHoverCard | EdgeHoverCard

const MAX_DPR = 1.5
const CAMERA_FOV = 34
const CAMERA_Z = 6.9
const NODE_SCALE_MIN = 0.88
const NODE_SCALE_MAX = 1.22
const EDGE_OPACITY: Record<RenderableEdgeType, number> = {
  depends_on: 0.42,
  extends: 0.38,
  overlaps_with: 0.36,
  ambient: 0.28,
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
    if (reduceMotion.matches) {
      setMode("static")
      return
    }

    let cancelled = false
    let observer: IntersectionObserver | null = null
    let resizeObserver: ResizeObserver | null = null
    let themeObserver: MutationObserver | null = null
    let colorSchemeQuery: MediaQueryList | null = null
    let onThemeChange: (() => void) | null = null
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
        let colors = getThemeGraphColors()

        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.1, 100)
        camera.position.set(0, 0, CAMERA_Z)

        const group = new THREE.Group()
        scene.add(group)

        const ambient = new THREE.AmbientLight(colors.textMuted, 1.14)
        const key = new THREE.DirectionalLight(colors.textPrimary, 0.36)
        key.position.set(0, 0, 4)
        scene.add(ambient, key)

        const nodeGeometry = new THREE.SphereGeometry(0.078, 20, 14)
        const nodeMaterial = new THREE.MeshStandardMaterial({
          color: colors.node,
          emissive: colors.nodeEmissive,
          roughness: 0.76,
          metalness: 0,
          transparent: true,
          opacity: 0.98,
        })
        const hoverMaterial = new THREE.MeshStandardMaterial({
          color: colors.nodeHover,
          emissive: colors.nodeHoverEmissive,
          roughness: 0.72,
          metalness: 0,
          transparent: true,
          opacity: 1,
        })
        const hoverLineMaterial = new THREE.LineBasicMaterial({
          color: colors.edgeHover,
          transparent: true,
          opacity: 0.9,
        })
        const lineMaterials = new Map<RenderableEdgeType, InstanceType<typeof THREE.LineBasicMaterial>>()

        const meshBySlug = new Map<string, InstanceType<typeof THREE.Mesh>>()
        const nodeObjects: InstanceType<typeof THREE.Mesh>[] = []
        const lineObjects: InstanceType<typeof THREE.Line>[] = []
        const lineSegments: Array<{
          attribute: InstanceType<typeof THREE.BufferAttribute>
          edge: RenderableGraphEdge
          line: InstanceType<typeof THREE.Line>
          normalMaterial: InstanceType<typeof THREE.LineBasicMaterial>
          source: InstanceType<typeof THREE.Mesh>
          target: InstanceType<typeof THREE.Mesh>
        }> = []
        const installMax = Math.max(...positionedNodes.map((node) => node.install_count), 1)
        for (const node of positionedNodes) {
          const mesh = new THREE.Mesh(nodeGeometry, nodeMaterial)
          const scale = Math.min(
            NODE_SCALE_MAX,
            NODE_SCALE_MIN + (node.install_count / installMax) * (NODE_SCALE_MAX - NODE_SCALE_MIN)
          )
          mesh.scale.setScalar(scale)
          mesh.position.set(node.x, node.y, node.z)
          mesh.userData = { slug: node.slug, name: node.name, scale, baseX: node.x, baseY: node.y }
          group.add(mesh)
          meshBySlug.set(node.slug, mesh)
          nodeObjects.push(mesh)
        }

        function updateEdgeAttribute(
          attribute: InstanceType<typeof THREE.BufferAttribute>,
          source: InstanceType<typeof THREE.Mesh>,
          target: InstanceType<typeof THREE.Mesh>
        ) {
          attribute.array[0] = source.position.x
          attribute.array[1] = source.position.y
          attribute.array[2] = source.position.z
          attribute.array[3] = target.position.x
          attribute.array[4] = target.position.y
          attribute.array[5] = target.position.z
          attribute.needsUpdate = true
        }

        for (const edge of renderableEdges.slice(0, 60)) {
          const source = meshBySlug.get(edge.source_slug)
          const target = meshBySlug.get(edge.target_slug)
          if (!source || !target) continue
          let material = lineMaterials.get(edge.edge_type)
          if (!material) {
            material = new THREE.LineBasicMaterial({
              color: colors.edges[edge.edge_type],
              transparent: true,
              opacity: EDGE_OPACITY[edge.edge_type],
            })
            lineMaterials.set(edge.edge_type, material)
          }
          const attribute = new THREE.BufferAttribute(new Float32Array(6), 3)
          const geometry = new THREE.BufferGeometry().setAttribute("position", attribute)
          updateEdgeAttribute(attribute, source, target)
          const line = new THREE.Line(geometry, material)
          lineObjects.push(line)
          lineSegments.push({ attribute, edge, line, normalMaterial: material, source, target })
          group.add(line)
        }

        function applyThemeColors() {
          colors = getThemeGraphColors()
          ambient.color.set(colors.textMuted)
          key.color.set(colors.textPrimary)
          nodeMaterial.color.set(colors.node)
          nodeMaterial.emissive.set(colors.nodeEmissive)
          nodeMaterial.needsUpdate = true
          hoverMaterial.color.set(colors.nodeHover)
          hoverMaterial.emissive.set(colors.nodeHoverEmissive)
          hoverMaterial.needsUpdate = true
          hoverLineMaterial.color.set(colors.edgeHover)
          hoverLineMaterial.needsUpdate = true
          lineMaterials.forEach((material, edgeType) => {
            material.color.set(colors.edges[edgeType])
            material.needsUpdate = true
          })
          renderer.render(scene, camera)
        }

        onThemeChange = applyThemeColors
        themeObserver = new MutationObserver(applyThemeColors)
        themeObserver.observe(document.documentElement, {
          attributeFilter: ["data-theme"],
          attributes: true,
        })
        colorSchemeQuery = window.matchMedia("(prefers-color-scheme: light)")
        colorSchemeQuery.addEventListener("change", applyThemeColors)

        const raycaster = new THREE.Raycaster()
        raycaster.params.Line.threshold = 0.14
        const pointer = new THREE.Vector2(2, 2)
        let activeMesh: InstanceType<typeof THREE.Mesh> | null = null
        let activeLineSegment: (typeof lineSegments)[number] | null = null
        let isPointerInside = false
        let pointerClientX = 0
        let pointerClientY = 0
        let isVisible = true
        const animationStartedAt = window.performance.now()
        let fitScale = 1
        const nodeMotion = nodeObjects.map((mesh, index) => {
          const seed = hashSlug(String(mesh.userData.slug ?? index))
          return {
            pulsePhase: seededRange(seed, 1, 0, Math.PI * 2),
            pulseSpeed: seededRange(seed, 2, 0.18, 0.42),
            pulseAmount: seededRange(seed, 3, 0.014, 0.038),
            primaryAngle: seededRange(seed, 4, 0, Math.PI * 2),
            secondaryAngle: seededRange(seed, 5, 0, Math.PI * 2),
            tertiaryAngle: seededRange(seed, 6, 0, Math.PI * 2),
            primaryPhase: seededRange(seed, 7, 0, Math.PI * 2),
            secondaryPhase: seededRange(seed, 8, 0, Math.PI * 2),
            tertiaryPhase: seededRange(seed, 9, 0, Math.PI * 2),
            primarySpeed: seededRange(seed, 10, 0.075, 0.26),
            secondarySpeed: seededRange(seed, 11, 0.04, 0.17),
            tertiarySpeed: seededRange(seed, 12, 0.025, 0.1),
            primaryAmount: seededRange(seed, 13, 0.05, 0.115),
            secondaryAmount: seededRange(seed, 14, 0.025, 0.072),
            tertiaryAmount: seededRange(seed, 15, 0.012, 0.04),
          }
        })

        function resize() {
          const width = Math.max(activeCanvas.clientWidth, 1)
          const height = Math.max(activeCanvas.clientHeight, 1)
          renderer.setSize(width, height, false)
          camera.aspect = width / height
          camera.updateProjectionMatrix()
          fitScale = getGraphFitScale(positionedNodes, camera.aspect)
          group.scale.setScalar(fitScale)
          renderer.render(scene, camera)
        }

        function setActiveTarget(
          mesh: InstanceType<typeof THREE.Mesh> | null,
          lineSegment: (typeof lineSegments)[number] | null,
          clientX?: number,
          clientY?: number
        ) {
          if (activeMesh === mesh && activeLineSegment === lineSegment) return
          if (activeMesh) activeMesh.material = nodeMaterial
          if (activeLineSegment) activeLineSegment.line.material = activeLineSegment.normalMaterial
          activeMesh = mesh
          activeLineSegment = lineSegment

          if ((!activeMesh && !activeLineSegment) || clientX === undefined || clientY === undefined) {
            setHoverCard(null)
            return
          }

          const x = Math.min(Math.max(clientX + 18, 16), window.innerWidth - 248)
          const y = Math.min(Math.max(clientY + 18, 16), window.innerHeight - 156)

          if (activeMesh) {
            activeMesh.material = hoverMaterial
            const slug = String(activeMesh.userData.slug)
            const details = getGraphNodeDetails(graph, renderableEdges, slug)
            if (!details) {
              setHoverCard(null)
              return
            }

            setHoverCard({
              ...details,
              kind: "node",
              x,
              y,
            })
            return
          }

          if (!activeLineSegment) return
          activeLineSegment.line.material = hoverLineMaterial
          const edgeDetails = getGraphEdgeDetails(graph, activeLineSegment.edge)
          if (!edgeDetails) {
            setHoverCard(null)
            return
          }

          setHoverCard({
            ...edgeDetails,
            kind: "edge",
            x,
            y,
          })
        }

        function updateActiveTarget(clientX: number, clientY: number) {
          raycaster.setFromCamera(pointer, camera)
          const [nodeHit] = raycaster.intersectObjects(nodeObjects, false)
          if (nodeHit?.object instanceof THREE.Mesh) {
            setActiveTarget(nodeHit.object, null, clientX, clientY)
            return
          }

          const [lineHit] = raycaster.intersectObjects(lineObjects, false)
          const line =
            lineHit?.object instanceof THREE.Line
              ? lineSegments.find((segment) => segment.line === lineHit.object) ?? null
              : null
          setActiveTarget(null, line, clientX, clientY)
        }

        function renderFrame() {
          if (!isVisible) {
            frameRef.current = null
            return
          }
          const elapsed = (window.performance.now() - animationStartedAt) / 1000
          group.rotation.y = 0
          group.rotation.x = 0
          group.rotation.z =
            Math.sin(elapsed * 0.2) * 0.032 + Math.sin(elapsed * 0.09 + 1.8) * 0.02
          const breath =
            1 + Math.sin(elapsed * 0.24 + 0.6) * 0.013 + Math.sin(elapsed * 0.13 + 2.4) * 0.007
          group.scale.setScalar(fitScale * breath)
          group.position.set(
            Math.sin(elapsed * 0.21 + 0.4) * 0.058 + Math.sin(elapsed * 0.07 + 2.1) * 0.028,
            Math.cos(elapsed * 0.17 + 1.1) * 0.04 + Math.sin(elapsed * 0.11 + 0.7) * 0.022,
            0
          )
          nodeObjects.forEach((mesh, index) => {
            const scale = Number(mesh.userData.scale) || 1
            const baseX = Number(mesh.userData.baseX) || 0
            const baseY = Number(mesh.userData.baseY) || 0
            const motion = nodeMotion[index] ?? {
              pulsePhase: 0,
              pulseSpeed: 0.18,
              pulseAmount: 0.012,
              primaryAngle: 0,
              secondaryAngle: 1.8,
              tertiaryAngle: 4.2,
              primaryPhase: 0,
              secondaryPhase: 1,
              tertiaryPhase: 2,
              primarySpeed: 0.09,
              secondarySpeed: 0.05,
              tertiarySpeed: 0.025,
              primaryAmount: 0.04,
              secondaryAmount: 0.02,
              tertiaryAmount: 0.01,
            }
            const primary = Math.sin(elapsed * motion.primarySpeed + motion.primaryPhase) * motion.primaryAmount
            const secondary =
              Math.sin(elapsed * motion.secondarySpeed + motion.secondaryPhase) * motion.secondaryAmount
            const tertiary =
              Math.cos(elapsed * motion.tertiarySpeed + motion.tertiaryPhase) * motion.tertiaryAmount
            const xOffset =
              Math.cos(motion.primaryAngle) * primary +
              Math.cos(motion.secondaryAngle) * secondary +
              Math.cos(motion.tertiaryAngle) * tertiary
            const yOffset =
              Math.sin(motion.primaryAngle) * primary +
              Math.sin(motion.secondaryAngle) * secondary +
              Math.sin(motion.tertiaryAngle) * tertiary
            mesh.position.set(baseX + xOffset, baseY + yOffset, 0)
            mesh.scale.setScalar(
              scale * (1 + Math.sin(elapsed * motion.pulseSpeed + motion.pulsePhase) * motion.pulseAmount)
            )
          })
          lineSegments.forEach(({ attribute, source, target }) => updateEdgeAttribute(attribute, source, target))
          if (isPointerInside) {
            updateActiveTarget(pointerClientX, pointerClientY)
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
          pointerClientX = event.clientX
          pointerClientY = event.clientY
          pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
          pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
          updateActiveTarget(event.clientX, event.clientY)
        }

        function onPointerLeave() {
          isPointerInside = false
          pointer.set(2, 2)
          setActiveTarget(null, null)
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
          themeObserver?.disconnect()
          colorSchemeQuery?.removeEventListener("change", onThemeChange ?? (() => {}))
          nodeGeometry.dispose()
          nodeMaterial.dispose()
          hoverMaterial.dispose()
          hoverLineMaterial.dispose()
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
    <div id="catalog-graph" className="skill-graph-hero">
      <canvas
        ref={canvasRef}
        className={mode === "canvas" ? "skill-graph-canvas is-ready" : "skill-graph-canvas"}
        aria-hidden="true"
        width={640}
        height={420}
      />
      {mode !== "canvas" && <div className="skill-graph-static" aria-hidden="true" />}
      {hoverCard && (
        <div
          className="skill-graph-tooltip"
          style={{ left: `${hoverCard.x}px`, top: `${hoverCard.y}px` }}
        >
          <span className="skill-graph-tooltip__eyebrow">
            {hoverCard.kind === "node" ? "Current Skill" : "Relation"}
          </span>
          <strong>{hoverCard.kind === "node" ? hoverCard.name : hoverCard.relationship}</strong>
          {hoverCard.kind === "node" ? (
            <span translate="no">{hoverCard.slug}@{hoverCard.version}</span>
          ) : (
            <span>{hoverCard.sourceName} -&gt; {hoverCard.targetName}</span>
          )}
          {hoverCard.kind === "node" && hoverCard.relationships.length > 0 && (
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

function getThemeGraphColors() {
  const styles = window.getComputedStyle(document.documentElement)
  const isLightTheme = styles.colorScheme.includes("light")
  const textPrimary = isLightTheme ? 0x241324 : 0xf6efe2
  const textMuted = isLightTheme ? 0x5a435f : 0xddd5c8

  return {
    accent: isLightTheme ? 0x8a7d96 : 0xf5edf7,
    edges: {
      depends_on: isLightTheme ? 0x7f735f : 0xfffbf3,
      extends: isLightTheme ? 0x667986 : 0xf2fbff,
      overlaps_with: isLightTheme ? 0x746a80 : 0xfbf7ff,
      ambient: isLightTheme ? 0x8a8175 : 0xeee9df,
    } satisfies Record<RenderableEdgeType, number>,
    node: isLightTheme ? 0x7b7166 : 0xfffffb,
    nodeEmissive: isLightTheme ? 0x5d554b : 0x7d7469,
    nodeHover: isLightTheme ? 0xffffff : 0xffffff,
    nodeHoverEmissive: isLightTheme ? 0x8c8173 : 0xa69c91,
    edgeHover: isLightTheme ? 0x2d2823 : 0xffffff,
    textMuted,
    textPrimary,
  }
}

function positionNodes(graph: SkillGraphData): PositionedNode[] {
  const total = Math.max(graph.nodes.length, 1)
  const radius = total < 8 ? 2.48 : 3.02
  const nodes = graph.nodes.map((node, index) => {
    const hash = hashSlug(node.slug)
    const isSmallGraph = total < 8
    const theta = isSmallGraph
      ? (index / total) * Math.PI * 2 + hash * 0.0016
      : index * Math.PI * (3 - Math.sqrt(5)) + hash * 0.002
    const ring = isSmallGraph ? 0.78 + ((hash % 19) / 19) * 0.2 : 0.58 + ((hash % 37) / 37) * 0.58
    const verticalBias = ((hash % 17) - 8) / 8
    return {
      slug: node.slug,
      name: node.name,
      install_count: node.install_count,
      x: Math.cos(theta) * ring * radius * (isSmallGraph ? 1.86 : 1.66),
      y: Math.sin(theta) * ring * radius * (isSmallGraph ? 0.72 : 0.78) + verticalBias * 0.24,
      z: 0,
    }
  })
  const bounds = getPositionedNodeBounds(nodes)
  const centerX = (bounds.minX + bounds.maxX) / 2
  const centerY = (bounds.minY + bounds.maxY) / 2

  return nodes.map((node) => ({
    ...node,
    x: node.x - centerX,
    y: node.y - centerY,
  }))
}

function getGraphFitScale(nodes: PositionedNode[], aspect: number): number {
  if (nodes.length === 0) return 1

  const bounds = getPositionedNodeBounds(nodes)
  const layoutWidth = Math.max(bounds.maxX - bounds.minX + 0.5, 1)
  const layoutHeight = Math.max(bounds.maxY - bounds.minY + 0.5, 1)
  const visibleHeight = 2 * Math.tan((CAMERA_FOV * Math.PI) / 360) * CAMERA_Z
  const visibleWidth = visibleHeight * aspect

  return Math.min(1, (visibleWidth * 0.9) / layoutWidth, (visibleHeight * 0.8) / layoutHeight)
}

function getPositionedNodeBounds(nodes: PositionedNode[]) {
  return nodes.reduce(
    (bounds, node) => ({
      minX: Math.min(bounds.minX, node.x),
      maxX: Math.max(bounds.maxX, node.x),
      minY: Math.min(bounds.minY, node.y),
      maxY: Math.max(bounds.maxY, node.y),
    }),
    {
      minX: Number.POSITIVE_INFINITY,
      maxX: Number.NEGATIVE_INFINITY,
      minY: Number.POSITIVE_INFINITY,
      maxY: Number.NEGATIVE_INFINITY,
    }
  )
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

export function getGraphEdgeDetails(graph: SkillGraphData, edge: RenderableGraphEdge): GraphEdgeDetails | null {
  const source = graph.nodes.find((node) => node.slug === edge.source_slug)
  const target = graph.nodes.find((node) => node.slug === edge.target_slug)
  if (!source || !target) return null

  if (!edge.authored) {
    return {
      relationship: "near",
      sourceName: source.name,
      targetName: target.name,
    }
  }

  if (edge.edge_type === "depends_on") {
    return {
      relationship: "depends on",
      sourceName: source.name,
      targetName: target.name,
    }
  }
  if (edge.edge_type === "extends") {
    return {
      relationship: "extends",
      sourceName: source.name,
      targetName: target.name,
    }
  }
  return {
    relationship: "overlaps with",
    sourceName: source.name,
    targetName: target.name,
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

function seededRange(seed: number, salt: number, min: number, max: number): number {
  const value = Math.sin(seed * 12.9898 + salt * 78.233) * 43758.5453
  const unit = value - Math.floor(value)
  return min + unit * (max - min)
}
