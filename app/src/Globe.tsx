// Globe.tsx
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

type Ring = number[][]
type Poly = Ring[]
type Feature = { geometry: { type: 'Polygon' | 'MultiPolygon'; coordinates: Poly | Poly[] } | null }
type GeoJSONData = { features: Feature[] }

const SIGNAL = 0xc9fe6e
const R = 1.75
const HOME = { lat: -1.2921, lon: 36.8219 } // Nairobi

type City = { lat: number; lon: number; name: string }
const CITIES: City[] = [
  { lat: 51.50, lon: -0.13,   name: 'LONDON' },
  { lat: 6.52,  lon: 3.38,    name: 'LAGOS' },
  { lat: 25.20, lon: 55.30,   name: 'DUBAI' },
  { lat: 19.07, lon: 72.88,   name: 'MUMBAI' },
  { lat: 1.35,  lon: 103.82,  name: 'SINGAPORE' },
  { lat: 40.71, lon: -74.00,  name: 'NEW YORK' },
  { lat: -23.55, lon: -46.63, name: 'SÃO PAULO' },
  { lat: 35.68, lon: 139.69,  name: 'TOKYO' },
  { lat: -33.87, lon: 151.21, name: 'SYDNEY' },
  { lat: 30.04, lon: 31.24,   name: 'CAIRO' },
  { lat: -33.92, lon: 18.42,  name: 'CAPE TOWN' },
  { lat: 43.65, lon: -79.38,  name: 'TORONTO' }
]

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

// Subsolar point approximation — good enough for a decorative terminator.
function getSubsolarPoint(date = new Date()) {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0)
  const dayOfYear = Math.floor((date.getTime() - start) / 86400000)
  const decl = -23.44 * Math.cos((360 / 365) * (dayOfYear + 10) * DEG)
  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600
  const lon = -15 * (utcHours - 12)
  return { lat: decl, lon }
}

export default function Globe() {
  const mountRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let mounted = true

    // ——— Core scene ———
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100)
    camera.position.z = 6.8
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    const tilt = new THREE.Group()
    const globe = new THREE.Group()
    tilt.add(globe)
    scene.add(tilt)

    // ——— Starfield ———
    const STAR_COUNT = 600
    const starPos = new Float32Array(STAR_COUNT * 3)
    const starSize = new Float32Array(STAR_COUNT)
    for (let i = 0; i < STAR_COUNT; i++) {
      const r = 18 + Math.random() * 22
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      starPos[i * 3 + 1] = r * Math.cos(phi)
      starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
      starSize[i] = 0.5 + Math.random() * 2
    }
    const starGeo = new THREE.BufferGeometry()
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
    starGeo.setAttribute('size', new THREE.BufferAttribute(starSize, 1))
    const starMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uSignal: { value: new THREE.Color(SIGNAL) }
      },
      vertexShader: `
        attribute float size;
        varying float vTwinkle;
        uniform float uTime;
        void main() {
          vTwinkle = 0.5 + 0.5 * sin(uTime * 1.5 + position.x * 0.4 + position.y * 0.3);
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (0.6 + vTwinkle * 0.6) * (280.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        varying float vTwinkle;
        uniform vec3 uSignal;
        void main() {
          vec2 c = gl_PointCoord - 0.5;
          float d = length(c);
          if (d > 0.5) discard;
          float a = smoothstep(0.5, 0.0, d) * vTwinkle * 0.7;
          gl_FragColor = vec4(mix(vec3(1.0), uSignal, 0.3), a);
        }
      `
    })
    const stars = new THREE.Points(starGeo, starMat)
    stars.renderOrder = -3
    scene.add(stars)

    // ——— Sun direction ———
    const sun0 = getSubsolarPoint()
    const sunDir = toVec(sun0.lat, sun0.lon, 1).normalize()

    // ——— Atmosphere (sun-modulated) ———
    const atmosphereMat = new THREE.ShaderMaterial({
      transparent: true, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false,
      uniforms: {
        uSunDir: { value: sunDir.clone() },
        uSignal: { value: new THREE.Color(SIGNAL) }
      },
      vertexShader: `
        varying vec3 vN;
        varying vec3 vW;
        void main() {
          vN = normalize(normalMatrix * normal);
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vW = normalize(wp.xyz);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vN;
        varying vec3 vW;
        uniform vec3 uSunDir;
        uniform vec3 uSignal;
        void main() {
          float rim = pow(max(0.62 - dot(vN, vec3(0.0, 0.0, 1.0)), 0.0), 3.2);
          float sun = max(dot(vW, uSunDir), 0.0);
          float boost = 0.4 + sun * 0.85;
          float a = rim * boost * 0.55;
          gl_FragColor = vec4(uSignal * a, a);
        }
      `
    })
    const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(R * 1.2, 64, 48), atmosphereMat)
    atmosphere.renderOrder = -2
    scene.add(atmosphere)

    // ——— Occluder ———
    const inner = new THREE.Mesh(
      new THREE.SphereGeometry(R * 0.985, 48, 32),
      new THREE.MeshBasicMaterial({ color: 0x0a0a0b, transparent: true, opacity: 0.88 })
    )
    inner.renderOrder = -1
    globe.add(inner)

    // ——— Wireframe grid ———
    const grid = new THREE.Mesh(
      new THREE.SphereGeometry(R, 48, 32),
      new THREE.MeshBasicMaterial({ color: 0x58634f, wireframe: true, transparent: true, opacity: 0.24, depthWrite: false })
    )
    grid.renderOrder = 1
    globe.add(grid)

    // ——— Nairobi beacon ———
    const homeN = toVec(HOME.lat, HOME.lon, 1).normalize()
    const beacon = new THREE.Group()
    beacon.position.copy(homeN).multiplyScalar(R * 1.004)
    beacon.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), homeN)
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.034, 16, 16), new THREE.MeshBasicMaterial({ color: SIGNAL }))
    const beam = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, 0, 0.5)]),
      new THREE.LineBasicMaterial({ color: SIGNAL, transparent: true, opacity: 0.7 })
    )
    const pulses = [0, 0.33, 0.66].map((offset) => {
      const m = new THREE.Mesh(
        new THREE.RingGeometry(0.05, 0.06, 64),
        new THREE.MeshBasicMaterial({ color: SIGNAL, transparent: true, side: THREE.DoubleSide, depthWrite: false })
      )
      beacon.add(m)
      return { m, offset }
    })
    beacon.add(core, beam)
    beacon.renderOrder = 3
    beacon.traverse((o) => { o.renderOrder = 3 })
    globe.add(beacon)

    // ——— Arcs + comets ———
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

    // ——— Orbits ———
    const orbit = new THREE.Mesh(
      new THREE.TorusGeometry(2.35, 0.004, 4, 180),
      new THREE.MeshBasicMaterial({ color: SIGNAL, transparent: true, opacity: 0.35 })
    )
    orbit.rotation.set(1.18, 0.18, 0.45)
    scene.add(orbit)
    const satellite = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), new THREE.MeshBasicMaterial({ color: SIGNAL }))
    scene.add(satellite)

    const orbit2 = new THREE.Mesh(
      new THREE.TorusGeometry(2.7, 0.003, 4, 180),
      new THREE.MeshBasicMaterial({ color: SIGNAL, transparent: true, opacity: 0.15 })
    )
    orbit2.rotation.set(1.5, -0.4, 0.9)
    scene.add(orbit2)

    // ——— Orientation ———
    const faceY = Math.atan2(-homeN.x, homeN.z)
    globe.rotation.y = faceY
    tilt.rotation.x = 0.22

    // ——— Geodata ———
    const abort = new AbortController()

    const loadGeo = async (): Promise<GeoJSONData | null> => {
      for (const src of GEO_SOURCES) {
        try {
          if (mounted) setLoading(15)
          const res = await fetch(src, { signal: abort.signal })
          if (res.ok) { if (mounted) setLoading(40); return (await res.json()) as GeoJSONData }
        } catch { if (abort.signal.aborted) return null }
      }
      return null
    }

    loadGeo().then((data) => {
      if (!mounted || abort.signal.aborted) return
      if (!data) {
        console.warn('Globe: could not load country boundaries')
        setReady(true)
        return
      }
      setLoading(60)

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
      const borders = new THREE.LineSegments(bg, new THREE.LineBasicMaterial({ color: SIGNAL, transparent: true, opacity: 0.4, depthWrite: false }))
      borders.renderOrder = 2
      globe.add(borders)

      setLoading(80)
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
      const landDots = new THREE.Points(dg, new THREE.PointsMaterial({
        color: SIGNAL, size: 0.021, transparent: true, opacity: 0.85, depthWrite: false
      }))
      landDots.renderOrder = 2
      globe.add(landDots)

      setLoading(100)
      setTimeout(() => { if (mounted) setReady(true) }, 300)
      if (!running) renderer.render(scene, camera)
    })

    // ——— Drag + parallax pointer state ———
    let pointerX = 0, pointerY = 0
    let isDragging = false
    let dragStart = { x: 0, y: 0, rotY: 0, rotX: 0 }
    let userRotY = 0, userRotX = 0
    let velocityY = 0, velocityX = 0

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true
      dragStart = { x: e.clientX, y: e.clientY, rotY: userRotY, rotX: userRotX }
      velocityY = 0; velocityX = 0
      try { mount.setPointerCapture(e.pointerId) } catch { /* noop */ }
      mount.style.cursor = 'grabbing'
    }
    const onPointerMove = (e: PointerEvent) => {
      if (isDragging) {
        const dx = e.clientX - dragStart.x
        const dy = e.clientY - dragStart.y
        userRotY = dragStart.rotY + dx * 0.008
        userRotX = Math.max(-0.8, Math.min(0.8, dragStart.rotX + dy * 0.006))
        velocityY = dx * 0.008
        velocityX = dy * 0.006
      } else {
        pointerX = (e.clientX / window.innerWidth - 0.5) * 0.35
        pointerY = (e.clientY / window.innerHeight - 0.5) * 0.25
      }
    }
    const onPointerUp = (e: PointerEvent) => {
      if (!isDragging) return
      isDragging = false
      try { mount.releasePointerCapture(e.pointerId) } catch { /* noop */ }
      mount.style.cursor = 'grab'
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)
    mount.addEventListener('pointerdown', onPointerDown)
    mount.style.cursor = 'grab'
    mount.style.touchAction = 'pan-y'

    // ——— Update ———
    let lastSunUpdate = 0
    const update = (t: number) => {
      const intro = reduced ? 1 : easeOut(Math.min(t / 3.6, 1))
      const drift = reduced ? 0 : Math.sin(t * 0.14) * 0.36 * intro

      if (!isDragging) {
        velocityY *= 0.94
        velocityX *= 0.94
        userRotY += velocityY
        userRotX = Math.max(-0.8, Math.min(0.8, userRotX + velocityX))
      }

      globe.rotation.y = faceY + (1 - intro) * Math.PI * 1.9 + drift + userRotY
      tilt.rotation.x += ((0.22 + pointerY + userRotX) - tilt.rotation.x) * 0.04
      tilt.rotation.z += (pointerX - tilt.rotation.z) * 0.04

      const show = reduced ? 1 : smooth(2.0, 3.6, t)
      arcBase.opacity = 0.16 * show
      arcComet.opacity = 0.95 * show
      arcs.forEach((a) => {
        const head = ((t * a.speed + a.offset) % 1) * (ARC_N + TRAIL)
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
        orbit2.rotation.z = -t * 0.032
        satellite.position.set(Math.cos(t * 0.42) * 2.35, Math.sin(t * 0.42) * 1.25, Math.sin(t * 0.42) * 1.85)
        starMat.uniforms.uTime.value = t

        // Refresh sun direction once per minute — subtle terminator drift
        if (t - lastSunUpdate > 60) {
          const s = getSubsolarPoint()
          const d = toVec(s.lat, s.lon, 1).normalize()
          atmosphereMat.uniforms.uSunDir.value.copy(d)
          lastSunUpdate = t
        }
      }
    }

    // ——— Loop ———
    const clock = new THREE.Clock()
    let elapsed = 0, raf = 0, running = false, visible = true
    let frameCount = 0, fpsTimer = 0

    const resize = () => {
      const w = mount.clientWidth, h = mount.clientHeight
      if (!w || !h) return
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      if (!running) renderer.render(scene, camera)
    }

    const tick = () => {
      const dt = Math.min(clock.getDelta(), 0.05)
      elapsed += dt
      fpsTimer += dt
      frameCount++
      if (fpsTimer > 1.5) {
        const fps = frameCount / fpsTimer
        frameCount = 0
        fpsTimer = 0
        if (fps < 30 && renderer.getPixelRatio() > 1) {
          renderer.setPixelRatio(Math.max(1, renderer.getPixelRatio() - 0.25))
          resize()
        }
      }
      update(elapsed)
      renderer.render(scene, camera)
      raf = requestAnimationFrame(tick)
    }

    const sync = () => {
      const should = !reduced && visible && !document.hidden
      if (should && !running) { running = true; clock.getDelta(); raf = requestAnimationFrame(tick) }
      else if (!should && running) { running = false; cancelAnimationFrame(raf) }
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
      mounted = false
      abort.abort()
      cancelAnimationFrame(raf)
      running = false
      ro.disconnect(); io.disconnect()
      document.removeEventListener('visibilitychange', sync)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
      mount.removeEventListener('pointerdown', onPointerDown)
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

  return (
    <div className="globe-mount" ref={mountRef} aria-hidden="true">
      {!ready && (
        <div className="globe-loading">
          <div className="globe-loading-bar">
            <span style={{ transform: `scaleX(${loading / 100})` }} />
          </div>
          <span className="globe-loading-text">
            PLOTTING TERRAIN · {String(loading).padStart(3, '0')}%
          </span>
        </div>
      )}
    </div>
  )
}