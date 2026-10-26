import { useEffect, useRef } from 'react'
import * as THREE from 'three'

type Ring = number[][]
type Poly = Ring[]
type Feature = { geometry: { type: 'Polygon' | 'MultiPolygon'; coordinates: Poly | Poly[] } | null }
type GeoJSONData = { features: Feature[] }

const SIGNAL = 0xc9fe6e
const R = 1.75
const HOME = { lat: -1.2921, lon: 36.8219 } // Nairobi
// Decorative network nodes. Edit freely.
const CITIES = [
  { lat: 51.5, lon: -0.13 },   // London
  { lat: 6.52, lon: 3.38 },    // Lagos
  { lat: 25.2, lon: 55.3 },    // Dubai
  { lat: 19.07, lon: 72.88 },  // Mumbai
  { lat: 1.35, lon: 103.82 },  // Singapore
  { lat: 40.71, lon: -74.0 }   // New York
]
// Put countries.geo.json in /public so the globe doesn't depend on GitHub being up.
const GEO_SOURCES = [
  '/countries.geo.json',
  'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json'
]

const DEG = Math.PI / 180
const toVec = (lat: number, lon: number, r: number) => {
  const phi = (90 - lat) * DEG, theta = (lon + 180) * DEG
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta))
}

function inRing(ring: Ring, lon: number, lat: number) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j]
    if ((yi > lat) !== (yj > lat) && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}
const inPoly = (poly: Poly, lon: number, lat: number) => inRing(poly[0], lon, lat) && !poly.slice(1).some((h) => inRing(h, lon, lat))

const easeOut = (t: number) => 1 - Math.pow(1 - t, 4)
const smooth = (a: number, b: number, x: number) => { const t = Math.min(Math.max((x - a) / (b - a), 0), 1); return t * t * (3 - 2 * t) }

export default function Globe() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100)
    camera.position.z = 6.8
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    // tilt = pointer parallax, globe = spin. Separate groups keep the two rotations from fighting.
    const tilt = new THREE.Group()
    const globe = new THREE.Group()
    tilt.add(globe)
    scene.add(tilt)

    // Atmosphere rim glow
    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.2, 64, 48),
      new THREE.ShaderMaterial({
        transparent: true, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false,
        vertexShader: 'varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader: 'varying vec3 vN; void main(){ float i = pow(max(0.62 - dot(vN, vec3(0.0,0.0,1.0)), 0.0), 3.2); gl_FragColor = vec4(0.79, 0.996, 0.43, 1.0) * i * 0.55; }'
      })
    )
    atmosphere.renderOrder = -2
    scene.add(atmosphere)

    // Occluder: draws first and writes depth, so the far side of the planet never bleeds through.
    const inner = new THREE.Mesh(new THREE.SphereGeometry(R * 0.985, 48, 32), new THREE.MeshBasicMaterial({ color: 0x0a0a0b, transparent: true, opacity: 0.88 }))
    inner.renderOrder = -1
    globe.add(inner)

    const grid = new THREE.Mesh(new THREE.SphereGeometry(R, 48, 32), new THREE.MeshBasicMaterial({ color: 0x58634f, wireframe: true, transparent: true, opacity: 0.24, depthWrite: false }))
    grid.renderOrder = 1
    globe.add(grid)

    // Nairobi beacon: surface dot, beam, two staggered pulse rings
    const homeN = toVec(HOME.lat, HOME.lon, 1).normalize()
    const beacon = new THREE.Group()
    beacon.position.copy(homeN).multiplyScalar(R * 1.004)
    beacon.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), homeN)
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.034, 16, 16), new THREE.MeshBasicMaterial({ color: SIGNAL }))
    const beam = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, 0, 0.5)]), new THREE.LineBasicMaterial({ color: SIGNAL, transparent: true, opacity: 0.7 }))
    const pulses = [0, 0.5].map((offset) => {
      const m = new THREE.Mesh(new THREE.RingGeometry(0.05, 0.06, 64), new THREE.MeshBasicMaterial({ color: SIGNAL, transparent: true, side: THREE.DoubleSide, depthWrite: false }))
      beacon.add(m)
      return { m, offset }
    })
    beacon.add(core, beam)
    beacon.renderOrder = 3
    beacon.traverse((o) => { o.renderOrder = 3 })
    globe.add(beacon)

    // Great-circle arcs from Nairobi, each with a comet travelling along it
    const ARC_N = 96, TRAIL = 34
    const arcBase = new THREE.LineBasicMaterial({ color: SIGNAL, transparent: true, opacity: 0, depthWrite: false })
    const arcComet = new THREE.LineBasicMaterial({ color: SIGNAL, transparent: true, opacity: 0, depthWrite: false })
    const arcs = CITIES.map((c, i) => {
      const a = homeN.clone().multiplyScalar(R)
      const b = toVec(c.lat, c.lon, R)
      const angle = a.angleTo(b)
      const mid = a.clone().add(b).normalize().multiplyScalar(R * (1 + 2 * (0.08 + 0.3 * (angle / Math.PI))))
      const pts = new THREE.QuadraticBezierCurve3(a, mid, b).getPoints(ARC_N - 1)
      const base = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), arcBase)
      const cometGeo = new THREE.BufferGeometry().setFromPoints(pts)
      const comet = new THREE.Line(cometGeo, arcComet)
      const node = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 10), new THREE.MeshBasicMaterial({ color: SIGNAL }))
      node.position.copy(b)
      ;[base, comet, node].forEach((o) => { o.renderOrder = 2; globe.add(o) })
      return { cometGeo, offset: i / CITIES.length, speed: 0.11 + (i % 3) * 0.02 }
    })

    // Orbit ring + satellite (kept from your original)
    const orbit = new THREE.Mesh(new THREE.TorusGeometry(2.35, 0.004, 4, 180), new THREE.MeshBasicMaterial({ color: SIGNAL, transparent: true, opacity: 0.35 }))
    orbit.rotation.set(1.18, 0.18, 0.45)
    scene.add(orbit)
    const satellite = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), new THREE.MeshBasicMaterial({ color: SIGNAL }))
    scene.add(satellite)

    // Orientation: face Nairobi to camera. Rotation about Y that sends the home vector to +z.
    const faceY = Math.atan2(-homeN.x, homeN.z)
    globe.rotation.y = faceY
    tilt.rotation.x = 0.22

    // --- Geodata: boundaries + land-only dot matrix ---
    const abort = new AbortController()
    let landDots: THREE.Points | null = null
    let borders: THREE.LineSegments | null = null
    const loadGeo = async (): Promise<GeoJSONData | null> => {
      for (const src of GEO_SOURCES) {
        try { const res = await fetch(src, { signal: abort.signal }); if (res.ok) return (await res.json()) as GeoJSONData } catch { if (abort.signal.aborted) return null }
      }
      return null
    }
    loadGeo().then((data) => {
      if (!data || abort.signal.aborted) { if (!data) console.warn('Globe: could not load country boundaries'); return }
      const polys: Poly[] = []
      data.features.forEach((f) => {
        if (!f.geometry) return
        if (f.geometry.type === 'Polygon') polys.push(f.geometry.coordinates as Poly)
        else (f.geometry.coordinates as Poly[]).forEach((p) => polys.push(p))
      })

      // Borders
      const verts: number[] = []
      const rb = R * 1.004
      polys.forEach((poly) => poly.forEach((ring) => {
        for (let i = 0; i < ring.length - 1; i++) {
          const a = toVec(ring[i][1], ring[i][0], rb), b = toVec(ring[i + 1][1], ring[i + 1][0], rb)
          verts.push(a.x, a.y, a.z, b.x, b.y, b.z)
        }
      }))
      const bg = new THREE.BufferGeometry()
      bg.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
      borders = new THREE.LineSegments(bg, new THREE.LineBasicMaterial({ color: SIGNAL, transparent: true, opacity: 0.4, depthWrite: false }))
      borders.renderOrder = 2
      globe.add(borders)

      // Land dots: fibonacci sphere, kept only where the point lands inside a country polygon
      const boxes = polys.map((p) => {
        let minX = 180, maxX = -180, minY = 90, maxY = -90
        p[0].forEach(([x, y]) => { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y })
        return { poly: p, minX, maxX, minY, maxY }
      })
      const N = 14000, golden = Math.PI * (3 - Math.sqrt(5))
      const dots: number[] = []
      for (let i = 0; i < N; i++) {
        const lat = Math.asin(1 - (2 * (i + 0.5)) / N) / DEG
        let lon = ((i * golden) / DEG) % 360
        if (lon > 180) lon -= 360
        if (boxes.some((b) => lon >= b.minX && lon <= b.maxX && lat >= b.minY && lat <= b.maxY && inPoly(b.poly, lon, lat))) {
          const v = toVec(lat, lon, R * 1.002)
          dots.push(v.x, v.y, v.z)
        }
      }
      const dg = new THREE.BufferGeometry()
      dg.setAttribute('position', new THREE.Float32BufferAttribute(dots, 3))
      landDots = new THREE.Points(dg, new THREE.PointsMaterial({ color: SIGNAL, size: 0.021, transparent: true, opacity: 0.85, depthWrite: false }))
      landDots.renderOrder = 2
      globe.add(landDots)
      if (!running) renderer.render(scene, camera)
    })

    // --- Pointer parallax ---
    let pointerX = 0, pointerY = 0
    const onPointer = (e: PointerEvent) => {
      pointerX = (e.clientX / window.innerWidth - 0.5) * 0.35
      pointerY = (e.clientY / window.innerHeight - 0.5) * 0.25
    }
    window.addEventListener('pointermove', onPointer, { passive: true })

    // --- Update + loop ---
    const update = (t: number) => {
      const intro = reduced ? 1 : easeOut(Math.min(t / 3.6, 1))
      const drift = reduced ? 0 : Math.sin(t * 0.14) * 0.36 * intro // hovers around Nairobi instead of spinning it away
      globe.rotation.y = faceY + (1 - intro) * Math.PI * 1.9 + drift
      tilt.rotation.x += (0.22 + pointerY - tilt.rotation.x) * 0.04
      tilt.rotation.z += (pointerX - tilt.rotation.z) * 0.04

      const show = reduced ? 1 : smooth(2.0, 3.6, t)
      arcBase.opacity = 0.16 * show
      arcComet.opacity = 0.95 * show
      arcs.forEach((a) => {
        const head = (((t * a.speed + a.offset) % 1) * (ARC_N + TRAIL))
        const start = Math.max(0, Math.floor(head - TRAIL)), end = Math.min(ARC_N, Math.floor(head))
        a.cometGeo.setDrawRange(start, Math.max(0, end - start))
      })
      pulses.forEach(({ m, offset }) => {
        const p = (t * 0.5 + offset) % 1
        m.scale.setScalar(1 + p * 5.5)
        ;(m.material as THREE.MeshBasicMaterial).opacity = (1 - p) * 0.8 * smooth(1.2, 2.4, reduced ? 9 : t)
      })
      if (!reduced) {
        orbit.rotation.z = t * 0.055
        satellite.position.set(Math.cos(t * 0.42) * 2.35, Math.sin(t * 0.42) * 1.25, Math.sin(t * 0.42) * 1.85)
      }
    }

    const clock = new THREE.Clock()
    let elapsed = 0, raf = 0, running = false, visible = true
    const tick = () => {
      elapsed += Math.min(clock.getDelta(), 0.05)
      update(elapsed)
      renderer.render(scene, camera)
      raf = requestAnimationFrame(tick)
    }
    const sync = () => {
      const should = !reduced && visible && !document.hidden
      if (should && !running) { running = true; clock.getDelta(); raf = requestAnimationFrame(tick) }
      else if (!should && running) { running = false; cancelAnimationFrame(raf) }
    }

    const resize = () => {
      const w = mount.clientWidth, h = mount.clientHeight
      if (!w || !h) return
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      if (!running) renderer.render(scene, camera)
    }
    const ro = new ResizeObserver(resize)
    ro.observe(mount)
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync() })
    io.observe(mount)
    document.addEventListener('visibilitychange', sync)

    resize()
    update(reduced ? 9 : 0)
    renderer.render(scene, camera)
    sync()

    return () => {
      abort.abort()
      cancelAnimationFrame(raf)
      running = false
      ro.disconnect(); io.disconnect()
      document.removeEventListener('visibilitychange', sync)
      window.removeEventListener('pointermove', onPointer)
      const mats = new Set<THREE.Material>()
      scene.traverse((o) => {
        const obj = o as THREE.Mesh
        obj.geometry?.dispose()
        const m = obj.material as THREE.Material | THREE.Material[] | undefined
        if (Array.isArray(m)) m.forEach((x) => mats.add(x)); else if (m) mats.add(m)
      })
      mats.forEach((m) => m.dispose())
      renderer.dispose()
      renderer.forceContextLoss()
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div className="globe-mount" ref={mountRef} aria-hidden="true" />
}