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

const MAX_DPR = 1.5
const GRAPH_EDGE_LIMIT = 60
const DEFAULT_GRAPH_PALETTE: GraphPalette = {
  node: 0xffd982,
  nodeEmissive: 0x5c3608,
  nodeHover: 0xfff5c7,
  nodeHoverEmissive: 0xffbd42,
  edge: {
    depends_on: 0xffd66b,
    extends: 0xa9d9ff,
    overlaps_with: 0xe8cf97,
  },
  edgeHover: {
    depends_on: 0xffefad,
    extends: 0xd6efff,
    overlaps_with: 0xffe9b6,
  },
  edgeIdleOpacity: 0.54,
  edgeDimOpacity: 0.16,
  edgeHoverOpacity: 0.94,
}

interface GraphPalette {
  node: number
  nodeEmissive: number
  nodeHover: number
  nodeHoverEmissive: number
  edge: Record<SkillGraphEdgeType, number>
  edgeHover: Record<SkillGraphEdgeType, number>
  edgeIdleOpacity: number
  edgeDimOpacity: number
  edgeHoverOpacity: number
}

interface EdgeRecord {
  key: string
  edgeType: SkillGraphEdgeType
  material: InstanceType<typeof import("three").LineBasicMaterial>
}

export function SkillGraphHero({ graph }: SkillGraphHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const frameRef = useRef<number | null>(null)
  const [mode, setMode] = useState<"pending" | "canvas" | "static">("pending")
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const positionedNodes = useMemo(() => positionNodes(graph), [graph])
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
    let themeObserver: MutationObserver | null = null
    let cleanupScene: (() => void) | null = null

    async function initScene() {
      const canvas = canvasRef.current
      if (!canvas) return

      try {
        const THREE = await import("three")
        if (cancelled) return
        const activeCanvas = canvas

        let palette = readGraphPalette(window.getComputedStyle(document.documentElement))
        const renderer = new THREE.WebGLRenderer({
          canvas: activeCanvas,
          antialias: true,
          alpha: true,
          powerPreference: "low-power",
        })
        renderer.setClearAlpha(0)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_DPR))

        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
        camera.position.set(0, 0, 7)

        const group = new THREE.Group()
        scene.add(group)

        const ambient = new THREE.AmbientLight(0xffffff, 0.7)
        const key = new THREE.DirectionalLight(0xffffff, 1.1)
        key.position.set(3, 4, 6)
        scene.add(ambient, key)

        const nodeGeometry = new THREE.SphereGeometry(0.105, 20, 16)
        const nodeMaterial = new THREE.MeshStandardMaterial({
          color: palette.node,
          emissive: palette.nodeEmissive,
          roughness: 0.52,
          metalness: 0.18,
        })
        const hoverMaterial = new THREE.MeshStandardMaterial({
          color: palette.nodeHover,
          emissive: palette.nodeHoverEmissive,
          roughness: 0.34,
          metalness: 0.1,
        })

        const meshBySlug = new Map<string, InstanceType<typeof THREE.Mesh>>()
        const nodeObjects: InstanceType<typeof THREE.Mesh>[] = []
        const edgeRecords: EdgeRecord[] = []
        const installMax = Math.max(...positionedNodes.map((node) => node.install_count), 1)
        for (const node of positionedNodes) {
          const mesh = new THREE.Mesh(nodeGeometry, nodeMaterial)
          const scale = 0.82 + (node.install_count / installMax) * 0.58
          mesh.scale.setScalar(scale)
          mesh.position.set(node.x, node.y, node.z)
          mesh.userData = { slug: node.slug, name: node.name }
          group.add(mesh)
          meshBySlug.set(node.slug, mesh)
          nodeObjects.push(mesh)
        }

        for (const edge of graph.edges.slice(0, GRAPH_EDGE_LIMIT)) {
          const source = meshBySlug.get(edge.source_slug)
          const target = meshBySlug.get(edge.target_slug)
          if (!source || !target) continue
          const material = new THREE.LineBasicMaterial({
            color: palette.edge[edge.edge_type],
            transparent: true,
            opacity: palette.edgeIdleOpacity,
          })
          const geometry = new THREE.BufferGeometry().setFromPoints([
            source.position,
            target.position,
          ])
          group.add(new THREE.Line(geometry, material))
          edgeRecords.push({
            key: getEdgeKey(edge),
            edgeType: edge.edge_type,
            material,
          })
        }

        const raycaster = new THREE.Raycaster()
        const pointer = new THREE.Vector2(2, 2)
        let activeMesh: InstanceType<typeof THREE.Mesh> | null = null
        let activeEdgeKeys = new Set<string>()
        let isVisible = true

        function resize() {
          const width = Math.max(activeCanvas.clientWidth, 1)
          const height = Math.max(activeCanvas.clientHeight, 1)
          renderer.setSize(width, height, false)
          camera.aspect = width / height
          camera.updateProjectionMatrix()
          renderer.render(scene, camera)
        }

        function setActiveMesh(mesh: InstanceType<typeof THREE.Mesh> | null) {
          if (activeMesh === mesh) return
          if (activeMesh) activeMesh.material = nodeMaterial
          activeMesh = mesh
          if (activeMesh) {
            activeMesh.material = hoverMaterial
            activeEdgeKeys = getIncidentEdgeKeys(graph.edges, String(activeMesh.userData.slug))
            setHoveredNode(String(activeMesh.userData.name))
          } else {
            activeEdgeKeys = new Set()
            setHoveredNode(null)
          }
          updateEdgeMaterials()
        }

        function updateEdgeMaterials() {
          for (const edge of edgeRecords) {
            const active = activeEdgeKeys.has(edge.key)
            edge.material.color.set(active ? palette.edgeHover[edge.edgeType] : palette.edge[edge.edgeType])
            edge.material.opacity = activeEdgeKeys.size === 0
              ? palette.edgeIdleOpacity
              : active
                ? palette.edgeHoverOpacity
                : palette.edgeDimOpacity
          }
        }

        function updateTheme() {
          palette = readGraphPalette(window.getComputedStyle(document.documentElement))
          nodeMaterial.color.set(palette.node)
          nodeMaterial.emissive.set(palette.nodeEmissive)
          hoverMaterial.color.set(palette.nodeHover)
          hoverMaterial.emissive.set(palette.nodeHoverEmissive)
          updateEdgeMaterials()
          renderer.render(scene, camera)
        }

        function renderFrame() {
          if (!isVisible) {
            frameRef.current = null
            return
          }
          group.rotation.y += 0.0022
          group.rotation.x = Math.sin(group.rotation.y * 0.6) * 0.08
          raycaster.setFromCamera(pointer, camera)
          const [hit] = raycaster.intersectObjects(nodeObjects, false)
          setActiveMesh(hit?.object instanceof THREE.Mesh ? hit.object : null)
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
          pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
          pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
        }

        function onPointerLeave() {
          pointer.set(2, 2)
          setActiveMesh(null)
        }

        activeCanvas.addEventListener("pointermove", onPointerMove)
        activeCanvas.addEventListener("pointerleave", onPointerLeave)
        resizeObserver = new ResizeObserver(resize)
        resizeObserver.observe(activeCanvas)
        themeObserver = new MutationObserver(updateTheme)
        themeObserver.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ["data-theme"],
        })
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
          nodeGeometry.dispose()
          nodeMaterial.dispose()
          hoverMaterial.dispose()
          edgeRecords.forEach(({ material }) => material.dispose())
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
  }, [graph, hasGraph, positionedNodes])

  if (!hasGraph) return null

  return (
    <div className="skill-graph-hero" aria-hidden="true">
      <canvas
        ref={canvasRef}
        className={mode === "canvas" ? "skill-graph-canvas is-ready" : "skill-graph-canvas"}
        width={640}
        height={420}
      />
      {hoveredNode && <div className="skill-graph-label">{hoveredNode}</div>}
      {mode !== "canvas" && (
        <div className="skill-graph-static">
          <span className="skill-graph-static__count" translate="no">{graph.nodes.length}</span>
          <span>current-default skills</span>
        </div>
      )}
    </div>
  )
}

export function getIncidentEdgeKeys(
  edges: SkillGraphData["edges"],
  slug: string
): Set<string> {
  return new Set(
    edges
      .filter((edge) => edge.source_slug === slug || edge.target_slug === slug)
      .map(getEdgeKey)
  )
}

function getEdgeKey(edge: SkillGraphData["edges"][number]): string {
  return `${edge.source_slug}->${edge.target_slug}:${edge.edge_type}`
}

function positionNodes(graph: SkillGraphData): PositionedNode[] {
  const total = Math.max(graph.nodes.length, 1)
  const radius = total < 8 ? 1.55 : 2.12
  return graph.nodes.map((node, index) => {
    const y = 1 - (index / Math.max(total - 1, 1)) * 2
    const radial = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = index * Math.PI * (3 - Math.sqrt(5)) + hashSlug(node.slug) * 0.0009
    return {
      slug: node.slug,
      name: node.name,
      install_count: node.install_count,
      x: Math.cos(theta) * radial * radius,
      y: y * radius * 0.78,
      z: Math.sin(theta) * radial * radius,
    }
  })
}

function hashSlug(value: string): number {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 1009
  }
  return hash
}

function readGraphPalette(style: CSSStyleDeclaration): GraphPalette {
  return {
    node: readColor(style, "--skill-graph-node", DEFAULT_GRAPH_PALETTE.node),
    nodeEmissive: readColor(style, "--skill-graph-node-emissive", DEFAULT_GRAPH_PALETTE.nodeEmissive),
    nodeHover: readColor(style, "--skill-graph-node-hover", DEFAULT_GRAPH_PALETTE.nodeHover),
    nodeHoverEmissive: readColor(style, "--skill-graph-node-hover-emissive", DEFAULT_GRAPH_PALETTE.nodeHoverEmissive),
    edge: {
      depends_on: readColor(style, "--skill-graph-edge-depends", DEFAULT_GRAPH_PALETTE.edge.depends_on),
      extends: readColor(style, "--skill-graph-edge-extends", DEFAULT_GRAPH_PALETTE.edge.extends),
      overlaps_with: readColor(style, "--skill-graph-edge-overlaps", DEFAULT_GRAPH_PALETTE.edge.overlaps_with),
    },
    edgeHover: {
      depends_on: readColor(style, "--skill-graph-edge-depends-hover", DEFAULT_GRAPH_PALETTE.edgeHover.depends_on),
      extends: readColor(style, "--skill-graph-edge-extends-hover", DEFAULT_GRAPH_PALETTE.edgeHover.extends),
      overlaps_with: readColor(style, "--skill-graph-edge-overlaps-hover", DEFAULT_GRAPH_PALETTE.edgeHover.overlaps_with),
    },
    edgeIdleOpacity: DEFAULT_GRAPH_PALETTE.edgeIdleOpacity,
    edgeDimOpacity: DEFAULT_GRAPH_PALETTE.edgeDimOpacity,
    edgeHoverOpacity: DEFAULT_GRAPH_PALETTE.edgeHoverOpacity,
  }
}

function readColor(style: CSSStyleDeclaration, name: string, fallback: number): number {
  const value = style.getPropertyValue(name).trim()
  if (!/^#[\da-f]{6}$/i.test(value)) return fallback
  return Number.parseInt(value.slice(1), 16)
}
