declare module "three" {
  export class Vector2 {
    constructor(x?: number, y?: number)
    x: number
    y: number
    set(x: number, y: number): this
  }

  export class Vector3 {
    x: number
    y: number
    z: number
    set(x: number, y: number, z: number): this
    setScalar(value: number): this
  }

  export class Euler {
    x: number
    y: number
    z: number
  }

  export class Object3D {
    position: Vector3
    rotation: Euler
    userData: Record<string, unknown>
    add(...objects: Object3D[]): this
    traverse(callback: (object: Object3D) => void): void
  }

  export class Scene extends Object3D {}
  export class Group extends Object3D {}

  export class PerspectiveCamera extends Object3D {
    constructor(fov?: number, aspect?: number, near?: number, far?: number)
    aspect: number
    updateProjectionMatrix(): void
  }

  export class AmbientLight extends Object3D {
    constructor(color?: number | string, intensity?: number)
  }

  export class DirectionalLight extends Object3D {
    constructor(color?: number | string, intensity?: number)
  }

  export class BufferGeometry {
    setFromPoints(points: Vector3[]): this
    dispose(): void
  }

  export class SphereGeometry extends BufferGeometry {
    constructor(radius?: number, widthSegments?: number, heightSegments?: number)
  }

  export class Material {
    dispose(): void
  }

  export class MeshStandardMaterial extends Material {
    constructor(parameters?: Record<string, unknown>)
  }

  export class LineBasicMaterial extends Material {
    constructor(parameters?: Record<string, unknown>)
  }

  export class Mesh extends Object3D {
    constructor(geometry?: BufferGeometry, material?: Material)
    geometry: BufferGeometry
    material: Material
    scale: Vector3
  }

  export class Line extends Object3D {
    constructor(geometry?: BufferGeometry, material?: Material)
    geometry: BufferGeometry
  }

  export class Raycaster {
    setFromCamera(pointer: Vector2, camera: PerspectiveCamera): void
    intersectObjects(objects: Object3D[], recursive?: boolean): Array<{ object: Object3D }>
  }

  export class WebGLRenderer {
    constructor(parameters?: {
      canvas?: HTMLCanvasElement
      antialias?: boolean
      alpha?: boolean
      powerPreference?: WebGLPowerPreference
    })
    setClearAlpha(alpha: number): void
    setPixelRatio(value: number): void
    setSize(width: number, height: number, updateStyle?: boolean): void
    render(scene: Scene, camera: PerspectiveCamera): void
    dispose(): void
  }
}
