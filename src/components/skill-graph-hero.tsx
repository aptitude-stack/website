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
const EDGE_COLORS: Record<SkillGraphEdgeType, number> = {
  depends_on: 0xd9a441,
  extends: 0x86c5ff,
  overlaps_with: 0xbda57a,
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
          color: 0xf2c46b,
          emissive: 0x3f2a10,
          roughness: 0.52,
          metalness: 0.18,
        })
        const hoverMaterial = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: 0xd9a441,
          roughness: 0.34,
          metalness: 0.1,
        })
        const lineMaterials = new Map<SkillGraphEdgeType, InstanceType<typeof THREE.LineBasicMaterial>>()

        const meshBySlug = new Map<string, InstanceType<typeof THREE.Mesh>>()
        const nodeObjects: InstanceType<typeof THREE.Mesh>[] = []
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

        for (const edge of graph.edges.slice(0, 60)) {
          const source = meshBySlug.get(edge.source_slug)
          const target = meshBySlug.get(edge.target_slug)
          if (!source || !target) continue
          let material = lineMaterials.get(edge.edge_type)
          if (!material) {
            material = new THREE.LineBasicMaterial({
              color: EDGE_COLORS[edge.edge_type],
              transparent: true,
              opacity: 0.44,
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
            setHoveredNode(String(activeMesh.userData.name))
          } else {
            setHoveredNode(null)
          }
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
