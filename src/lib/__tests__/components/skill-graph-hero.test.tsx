import { act, render, waitFor } from "@testing-library/react"
import { SkillGraphHero } from "@/components/skill-graph-hero"
import type { SkillGraphData } from "@/lib/types"

class MockVector3 {
  x = 0
  y = 0
  z = 0

  set(x: number, y: number, z: number) {
    this.x = x
    this.y = y
    this.z = z
    return this
  }

  setScalar(value: number) {
    this.x = value
    this.y = value
    this.z = value
    return this
  }
}

class MockColor {
  set = jest.fn()
}

class MockObject3D {
  position = new MockVector3()
  rotation = { x: 0, y: 0, z: 0 }
  scale = new MockVector3()
  userData: Record<string, unknown> = {}
  children: MockObject3D[] = []

  add(...objects: MockObject3D[]) {
    this.children.push(...objects)
    return this
  }

  traverse(callback: (object: MockObject3D) => void) {
    this.children.forEach((child) => callback(child))
  }
}

const mockMeshStandardMaterials: Array<{ color: MockColor; emissive: MockColor }> = []
const mockLineBasicMaterials: Array<{ color: MockColor }> = []
const mockGroups: MockObject3D[] = []
let animationCallbacks: FrameRequestCallback[] = []

jest.mock("three", () => {
  class Vector2 {
    x: number
    y: number

    constructor(x = 0, y = 0) {
      this.x = x
      this.y = y
    }

    set(x: number, y: number) {
      this.x = x
      this.y = y
      return this
    }
  }

  class MeshStandardMaterial {
    color = new MockColor()
    emissive = new MockColor()
    dispose = jest.fn()

    constructor() {
      mockMeshStandardMaterials.push(this)
    }
  }

  class LineBasicMaterial {
    color = new MockColor()
    dispose = jest.fn()

    constructor() {
      mockLineBasicMaterials.push(this)
    }
  }

  class Mesh extends MockObject3D {
    material: unknown

    constructor(public geometry: unknown, material: unknown) {
      super()
      this.material = material
    }
  }

  class Line extends MockObject3D {
    material: unknown

    constructor(public geometry: unknown, material: unknown) {
      super()
      this.material = material
    }
  }

  return {
    AmbientLight: class extends MockObject3D {
      color = new MockColor()
      constructor(_color: number, public intensity: number) {
        super()
      }
    },
    BufferAttribute: class {
      needsUpdate = false
      constructor(public array: Float32Array, public itemSize: number) {}
    },
    BufferGeometry: class {
      setAttribute() {
        return this
      }
      dispose = jest.fn()
    },
    DirectionalLight: class extends MockObject3D {
      color = new MockColor()
      constructor(_color: number, public intensity: number) {
        super()
      }
    },
    Group: class extends MockObject3D {
      constructor() {
        super()
        mockGroups.push(this)
      }
    },
    Line,
    LineBasicMaterial,
    Mesh,
    MeshStandardMaterial,
    PerspectiveCamera: class extends MockObject3D {
      aspect = 1
      constructor() {
        super()
      }
      updateProjectionMatrix = jest.fn()
    },
    Raycaster: class {
      params = { Line: { threshold: 0 } }
      setFromCamera = jest.fn()
      intersectObjects = jest.fn(() => [])
    },
    Scene: class extends MockObject3D {},
    SphereGeometry: class {
      dispose = jest.fn()
    },
    Vector2,
    WebGLRenderer: class {
      setClearAlpha = jest.fn()
      setPixelRatio = jest.fn()
      setSize = jest.fn()
      render = jest.fn()
      dispose = jest.fn()
    },
  }
})

const graphData: SkillGraphData = {
  nodes: [
    {
      slug: "source",
      version: "1.0.0",
      name: "Source",
      install_count: 4,
      star_count: 0,
      trust_tier: "verified",
      lifecycle_status: "published",
    },
    {
      slug: "target",
      version: "1.0.0",
      name: "Target",
      install_count: 2,
      star_count: 0,
      trust_tier: "verified",
      lifecycle_status: "published",
    },
  ],
  edges: [{ source_slug: "source", target_slug: "target", edge_type: "depends_on" }],
}

describe("SkillGraphHero", () => {
  beforeEach(() => {
    mockMeshStandardMaterials.length = 0
    mockLineBasicMaterials.length = 0
    mockGroups.length = 0
    animationCallbacks = []
    document.documentElement.dataset.theme = "dark"
    window.matchMedia = jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }))
    window.ResizeObserver = class ResizeObserver {
      constructor(private readonly callback: ResizeObserverCallback) {}
      observe() {
        this.callback([], this)
      }
      disconnect() {}
      unobserve() {}
    }
    window.IntersectionObserver = class IntersectionObserver {
      constructor(private readonly callback: IntersectionObserverCallback) {}
      observe() {
        this.callback([{ isIntersecting: true } as IntersectionObserverEntry], this)
      }
      disconnect() {}
      takeRecords() {
        return []
      }
      unobserve() {}
      root = null
      rootMargin = ""
      thresholds = []
    }
    jest.spyOn(window, "getComputedStyle").mockImplementation(
      () =>
        ({
          colorScheme: document.documentElement.dataset.theme === "light" ? "light" : "dark",
          getPropertyValue: () => "",
        }) as unknown as CSSStyleDeclaration
    )
    jest.spyOn(window.performance, "now").mockReturnValue(0)
    jest.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      animationCallbacks.push(callback)
      return animationCallbacks.length
    })
    jest.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
    document.documentElement.removeAttribute("data-theme")
  })

  it("updates existing Three materials when the document theme changes", async () => {
    await act(async () => {
      render(<SkillGraphHero graph={graphData} />)
      await Promise.resolve()
    })

    await waitFor(() => {
      expect(mockMeshStandardMaterials).toHaveLength(2)
      expect(mockLineBasicMaterials.length).toBeGreaterThanOrEqual(2)
    })

    act(() => {
      document.documentElement.dataset.theme = "light"
    })

    await waitFor(() => {
      expect(mockMeshStandardMaterials[0]?.color.set).toHaveBeenCalledWith(0x7b7166)
      expect(mockMeshStandardMaterials[0]?.emissive.set).toHaveBeenCalledWith(0x5d554b)
      expect(mockLineBasicMaterials.some((material) => material.color.set.mock.calls.flat().includes(0x7f735f))).toBe(
        true
      )
    })
  })

  it("keeps the hero graph in noticeable ambient motion", async () => {
    await act(async () => {
      render(<SkillGraphHero graph={graphData} />)
      await Promise.resolve()
    })

    await waitFor(() => {
      expect(animationCallbacks).toHaveLength(1)
      expect(mockGroups).toHaveLength(1)
    })

    ;(window.performance.now as jest.Mock).mockReturnValue(10_000)
    act(() => {
      animationCallbacks[0]?.(10_000)
    })

    expect(Math.abs(mockGroups[0]?.rotation.z ?? 0)).toBeGreaterThan(0.03)
    expect(Math.abs(mockGroups[0]?.position.x ?? 0)).toBeGreaterThan(0.04)
  })
})
