import { useEffect, useRef } from 'react'
import * as THREE from 'three'

type GeoJSONFeature = {
  geometry: {
    type: 'Polygon' | 'MultiPolygon'
    coordinates: number[][][] | number[][][][]
  }
}
type GeoJSONData = {
  features: GeoJSONFeature[]
}

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

    const globe = new THREE.Group()
    globe.rotation.set(-0.18, -0.5, -0.08)
    scene.add(globe)

    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.75, 48, 32),
      new THREE.MeshBasicMaterial({ color: 0x58634f, wireframe: true, transparent: true, opacity: 0.34 })
    )
    globe.add(sphere)

    const inner = new THREE.Mesh(
      new THREE.SphereGeometry(1.72, 48, 32),
      new THREE.MeshBasicMaterial({ color: 0x0a0a0b, transparent: true, opacity: 0.84 })
    )
    globe.add(inner)

    const count = 1500
    const positions = new Float32Array(count * 3)
    const phi = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2
      const radius = Math.sqrt(1 - y * y)
      const theta = phi * i
      positions[i * 3] = Math.cos(theta) * radius * 1.77
      positions[i * 3 + 1] = y * 1.77
      positions[i * 3 + 2] = Math.sin(theta) * radius * 1.77
    }
    const pointGeo = new THREE.BufferGeometry()
    pointGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const points = new THREE.Points(pointGeo, new THREE.PointsMaterial({ color: 0xc9fe6e, size: 0.024, transparent: true, opacity: 0.9 }))
    globe.add(points)

    const ringMaterial = new THREE.LineBasicMaterial({ color: 0xc9fe6e, transparent: true, opacity: 0.25 })
    ;[-0.9, 0, 0.9].forEach((y) => {
      const r = Math.sqrt(1.79 * 1.79 - y * y)
      const curve = new THREE.EllipseCurve(0, 0, r, r, 0, Math.PI * 2)
      const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(120))
      const line = new THREE.LineLoop(geo, ringMaterial)
      line.rotation.x = Math.PI / 2
      line.position.y = y
      globe.add(line)
    })

    const orbit = new THREE.Mesh(
      new THREE.TorusGeometry(2.35, 0.004, 4, 180),
      new THREE.MeshBasicMaterial({ color: 0xc9fe6e, transparent: true, opacity: 0.35 })
    )
    orbit.rotation.set(1.18, 0.18, 0.45)
    scene.add(orbit)

    const satellite = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), new THREE.MeshBasicMaterial({ color: 0xc9fe6e }))
    scene.add(satellite)

    // --- NEW: Fetch and draw continental boundaries ---
    let isMounted = true
    fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json')
      .then(res => res.json())
      .then((data: GeoJSONData) => {
        if (!isMounted) return
        
        const vertices: number[] = []
        const r = 1.78 // Placed just above the wireframe to prevent z-fighting
        
        const processPolygon = (polygon: number[][][]) => {
          polygon.forEach((ring) => {
            for (let i = 0; i < ring.length - 1; i++) {
              const [lon1, lat1] = ring[i]
              const [lon2, lat2] = ring[i + 1]

              // Convert Lat/Lon to 3D Cartesian coordinates
              const phi1 = (90 - lat1) * (Math.PI / 180)
              const theta1 = (lon1 + 180) * (Math.PI / 180)
              vertices.push(
                -(r * Math.sin(phi1) * Math.cos(theta1)),
                r * Math.cos(phi1),
                r * Math.sin(phi1) * Math.sin(theta1)
              )

              const phi2 = (90 - lat2) * (Math.PI / 180)
              const theta2 = (lon2 + 180) * (Math.PI / 180)
              vertices.push(
                -(r * Math.sin(phi2) * Math.cos(theta2)),
                r * Math.cos(phi2),
                r * Math.sin(phi2) * Math.sin(theta2)
              )
            }
          })
        }

        data.features.forEach((feature) => {
          if (feature.geometry.type === 'Polygon') {
            processPolygon(feature.geometry.coordinates as number[][][])
          } else if (feature.geometry.type === 'MultiPolygon') {
            (feature.geometry.coordinates as number[][][][]).forEach((poly) => processPolygon(poly))
          }
        })

        const boundaryGeo = new THREE.BufferGeometry()
        boundaryGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
        const boundaryMat = new THREE.LineBasicMaterial({ 
          color: 0xc9fe6e, 
          transparent: true, 
          opacity: 0.35 
        })
        const boundaries = new THREE.LineSegments(boundaryGeo, boundaryMat)
        globe.add(boundaries)
      })
      .catch((err) => console.warn('Could not load continent boundaries:', err))
    // --------------------------------------------------

    let pointerX = 0
    let pointerY = 0
    const onPointer = (e: PointerEvent) => {
      pointerX = (e.clientX / window.innerWidth - 0.5) * 0.35
      pointerY = (e.clientY / window.innerHeight - 0.5) * 0.25
    }
    window.addEventListener('pointermove', onPointer, { passive: true })

    const resize = () => {
      const { width, height } = mount.getBoundingClientRect()
      renderer.setSize(width, height)
      camera.aspect = width / Math.max(height, 1)
      camera.updateProjectionMatrix()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(mount)
    resize()

    const clock = new THREE.Clock()
    let frame = 0
    const render = () => {
      const t = clock.getElapsedTime()
      if (!reduced) {
        globe.rotation.y += 0.0015
        globe.rotation.x += (pointerY - globe.rotation.x - 0.18) * 0.025
        globe.rotation.z += (pointerX - globe.rotation.z) * 0.025
        orbit.rotation.z = t * 0.055
        satellite.position.set(Math.cos(t * 0.42) * 2.35, Math.sin(t * 0.42) * 1.25, Math.sin(t * 0.42) * 1.85)
      }
      renderer.render(scene, camera)
      frame = requestAnimationFrame(render)
    }
    render()

    return () => {
      isMounted = false
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('pointermove', onPointer)
      renderer.dispose()
      sphere.geometry.dispose()
      inner.geometry.dispose()
      pointGeo.dispose()
      orbit.geometry.dispose()
      satellite.geometry.dispose()
      mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div className="globe-mount" ref={mountRef} aria-hidden="true" />
}