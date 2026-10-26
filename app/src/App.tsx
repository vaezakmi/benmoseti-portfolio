// App.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowDown, ArrowUp, ArrowUpRight, ArrowLeft, ArrowRight,
  X, Check, Plus, MapPin, Terminal, Sparkles, Search, Github,
  Phone, Mail, Volume2, VolumeX
} from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import Globe from './Globe'
import './App.css'

gsap.registerPlugin(ScrollTrigger)

const EMAIL = 'kegokoramoseti192@gmail.com'
const PHONE = '+254718381630'
const GITHUB_URL = 'https://github.com/vaezakmi'
const SITE_URL = 'https://moseti.dev'

// ————————————————————————————————————————————————
// DATA
// ————————————————————————————————————————————————

type Project = {
  id: string; index: string; title: string; kind: string; year: string
  summary: string; description: string; tags: string[]; stat: string; statLabel: string; className: string
}

const projects: Project[] = [
  {
    id: 'atlas', index: '01', title: 'Web GIS Analytics', kind: 'Full-stack geospatial', year: '2024',
    summary: 'Upload, visualize, and analyze spatial data — right in the browser.',
    description: 'A full-stack application built with React, Leaflet, Mapbox, Node.js, Express, and PostgreSQL + PostGIS. Users authenticate, manage their own data layers, and run buffer analysis and point-in-polygon queries without leaving the map. The geography is never hidden behind the UI.',
    tags: ['React', 'Leaflet', 'Mapbox', 'PostGIS', 'Express'], stat: '3 ops', statLabel: 'spatial queries in-browser', className: 'visual-atlas'
  },
  {
    id: 'northstar', index: '02', title: 'LuckPesa SEO Ops', kind: 'Technical SEO', year: '2025',
    summary: 'Search strategy treated as a living technical system — not a monthly report.',
    description: 'At LuckPesa I owned the technical SEO surface end-to-end: crawl health, structured data, site speed, indexation, and content-demand mapping. Turned hundreds of isolated signals into prioritized engineering tickets, working alongside devs to ship fixes rather than file them. All-round SEO — technical, on-page, and analytics.',
    tags: ['Technical SEO', 'Crawl health', 'Structured data', 'Analytics', 'GA4'], stat: 'Jul–Oct', statLabel: '2025 · full ownership', className: 'visual-northstar'
  },
  {
    id: 'commerce', index: '03', title: 'Spatial Commerce Engine', kind: 'Geospatial Architecture', year: '2024',
    summary: 'A distributed e-commerce platform bridging real-time inventory, technical SEO, and spatial routing.',
    description: 'A deep dive into domain-driven microservices. The architecture splits the Catalog, Search/SEO, and Geospatial Inventory into independent Node.js services backed by Postgres/PostGIS. When an order is placed, a message broker triggers a cascade: it decrements stock in the spatial layer, calculates the nearest dispatch node, and dynamically invalidates the SEO cache for that SKU. Containerized with Docker and orchestrated for high throughput.',
    tags: ['Node.js', 'PostGIS', 'RabbitMQ', 'Docker', 'Redis', 'Technical SEO'], stat: '5×', statLabel: 'distributed services communicating async', className: 'visual-commerce'
  }
]

type Role = { company: string; title: string; period: string; location: string; bullets: string[]; highlight?: boolean }

const roles: Role[] = [
  {
    company: 'LuckPesa', title: 'SEO Specialist — Technical & All-Round', period: 'Jul 15 → Oct 15, 2025', location: 'Remote',
    bullets: [
      'Owned the technical SEO surface: crawl health, indexation, structured data, and site speed.',
      'Ran on-page and content work alongside engineering to ship fixes, not just file them.',
      'Connected search intent, analytics, and product priorities into one prioritized backlog.'
    ],
    highlight: true
  },
  {
    company: 'Solventa Enterprises', title: 'Software Developer & Data Analyst', period: 'Apr 2025 → May 2026', location: 'Kenya',
    bullets: [
      'Built internal tools and dashboards that improved speed and accuracy of data validation.',
      'Automated extraction, cleaning, matching, and reconciliation in Python.',
      'Implemented data-quality checks and validation rules to harden reporting reliability.'
    ]
  },
  {
    company: 'GeoCelestials Limited', title: 'GIS Developer', period: 'May 2021 → Apr 2023', location: 'Nyeri, Kenya',
    bullets: [
      'Built and maintained full-stack features with React (front) and Node.js/Express (back).',
      'Shipped a new user dashboard — +15% user session duration.',
      'Optimized queries and API endpoints — −30% average page load time.',
      'Containerized with Docker to simplify dev environments and deployment.'
    ]
  }
]

type Testimonial = { quote: string; author: string; company: string; metric: string; tag: string }

const testimonials: Testimonial[] = [
  {
    quote: "Ben read a SERP report and a PostGIS query with the same fluency. That's a rare cross-section of skills.",
    author: 'Product Lead', company: 'GeoCelestials', metric: '+15% session duration', tag: 'GIS Developer'
  },
  {
    quote: 'He turned hundreds of isolated SEO signals into a prioritized engineering backlog our devs actually shipped.',
    author: 'Head of Growth', company: 'LuckPesa', metric: 'Full technical SEO ownership', tag: 'SEO Specialist'
  },
  {
    quote: 'The internal dashboard he built is now the tool the ops team opens every morning before their coffee.',
    author: 'Operations Manager', company: 'Solventa Enterprises', metric: '−50% validation time', tag: 'Software Developer'
  }
]

const stats = [
  { n: 30, pre: '−', suf: '%', label: 'average page load time', where: 'GeoCelestials' },
  { n: 15, pre: '+', suf: '%', label: 'user session duration', where: 'New dashboard' },
  { n: 3, pre: '', suf: '', label: 'disciplines, one workflow', where: 'Code · Search · Space' }
]

const stack = ['REACT', 'NODE.JS', 'POSTGIS', 'TECH SEO', 'DOCKER', 'PYTHON', 'MAPBOX']

// ————————————————————————————————————————————————
// UTILITIES
// ————————————————————————————————————————————————

const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const finePointer = () => window.matchMedia('(pointer: fine)').matches

const HOME = { lat: -1.2921, lon: 36.8219 }
const SCALES = ['1 : 25 000', '1 : 10 000', '1 : 5 000', '1 : ∞']
const lat = (v: number) => `${Math.abs(v).toFixed(4)}° ${v < 0 ? 'S' : 'N'}`
const lon = (v: number) => `${Math.abs(v).toFixed(4)}° ${v < 0 ? 'W' : 'E'}`
const pad = (n: number) => String(n).padStart(2, '0')

function getGreeting() {
  const h = new Date().getHours()
  if (h < 5) return 'STILL AWAKE'
  if (h < 12) return 'GOOD MORNING'
  if (h < 18) return 'GOOD AFTERNOON'
  return 'GOOD EVENING'
}

// ————————————————————————————————————————————————
// ATOMS
// ————————————————————————————————————————————————

function ProjectVisual({ project, large = false }: { project: Project; large?: boolean }) {
  return (
    <div className={`project-visual ${project.className} ${large ? 'is-large' : ''}`} aria-hidden="true">
      <div className="visual-grid" />

      {project.id === 'atlas' && <>
        <svg className="contours" viewBox="0 0 800 600" fill="none">
          {[0,1,2,3,4,5,6].map(i => <path key={i} d={`M${-60+i*8} ${390-i*32}C${90+i*18} ${220-i*8} ${180+i*22} ${490-i*38} ${350+i*15} ${310-i*23}S${650-i*8} ${150+i*12} ${870-i*4} ${250-i*10}`} />)}
        </svg>
        <div className="map-pin pin-a"><span />NAIROBI · 01</div>
        <div className="map-pin pin-b"><span />LAYER · GIS</div>
        <div className="visual-coords">1.2921° S<br/>36.8219° E</div>
      </>}

      {project.id === 'northstar' && <>
        <div className="search-radar"><i/><i/><i/><b/></div>
        <div className="rank-line"><span>INDEX HEALTH</span><strong>094.2</strong><svg viewBox="0 0 300 90"><path d="M0 80 C40 76 48 60 78 64 S120 70 145 45 S190 58 216 26 S265 30 300 4"/></svg></div>
        <div className="query-tag">CRAWL → INDEX → INTENT → GROWTH</div>
      </>}

      {project.id === 'commerce' && <>
        <svg className="commerce-graph" viewBox="0 0 800 600">
          <g stroke="#c9fe6e" strokeWidth="1.5" opacity="0.3" strokeDasharray="4 6">
            <line x1="400" y1="300" x2="200" y2="150" className="data-line" />
            <line x1="400" y1="300" x2="600" y2="150" className="data-line" />
            <line x1="400" y1="300" x2="200" y2="450" className="data-line" />
            <line x1="400" y1="300" x2="600" y2="450" className="data-line" />
            <line x1="400" y1="300" x2="400" y2="500" className="data-line" />
          </g>
          <circle cx="400" cy="300" r="40" fill="#151b16" stroke="#c9fe6e" strokeWidth="2" />
          <text x="400" y="305" fill="#c9fe6e" fontSize="10" fontFamily="IBM Plex Mono" textAnchor="middle">BROKER</text>
          <g fill="#171815" stroke="#c9fe6e" strokeWidth="1.5">
            <circle cx="200" cy="150" r="30" /><circle cx="600" cy="150" r="30" />
            <circle cx="200" cy="450" r="30" /><circle cx="600" cy="450" r="30" />
            <circle cx="400" cy="500" r="30" />
          </g>
          <g fill="#f3f3f3" fontSize="9" fontFamily="IBM Plex Mono" textAnchor="middle">
            <text x="200" y="153">CATALOG</text><text x="600" y="153">SEARCH</text>
            <text x="200" y="453">INVENTORY</text><text x="600" y="453">ROUTING</text>
            <text x="400" y="503">CART</text>
          </g>
          <circle r="3" fill="#c9fe6e" className="pulse-dot" />
          <circle r="3" fill="#c9fe6e" className="pulse-dot delay-1" />
        </svg>
        <div className="commerce-label">ASYNC EVENTS<br/><strong>ACTIVE</strong></div>
        <div className="commerce-cross">+</div>
      </>}
      <div className="visual-corners"><i/><i/><i/><i/></div>
    </div>
  )
}

function Clock() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Africa/Nairobi' })
    const tick = () => setTime(fmt.format(new Date()))
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id)
  }, [])
  return <span>{time} EAT</span>
}

function WeatherWidget() {
  const [data, setData] = useState<{ temp: number; code: number } | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const cached = sessionStorage.getItem('nbo-weather')
    if (cached) {
      try {
        const { d, ts } = JSON.parse(cached)
        if (Date.now() - ts < 10 * 60 * 1000) { setData(d); return }
      } catch { /* ignore */ }
    }
    fetch('https://api.open-meteo.com/v1/forecast?latitude=-1.2921&longitude=36.8219&current=temperature_2m,weather_code')
      .then(r => r.json())
      .then(j => {
        const d = { temp: Math.round(j.current.temperature_2m), code: j.current.weather_code }
        setData(d)
        sessionStorage.setItem('nbo-weather', JSON.stringify({ d, ts: Date.now() }))
      })
      .catch(() => setFailed(true))
  }, [])

  const label = (c: number) => {
    if (c === 0) return 'CLEAR'
    if (c <= 3) return 'CLOUDY'
    if (c === 45 || c === 48) return 'FOG'
    if (c <= 67) return 'RAIN'
    if (c >= 95) return 'STORM'
    return 'MIXED'
  }

  if (failed) return <span>NBO · OFFLINE</span>
  if (!data) return <span>NBO · ···</span>
  return <span>NBO · {data.temp}°C · {label(data.code)}</span>
}

function TypingTicker() {
  const [index, setIndex] = useState(0)
  const [text, setText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [blink, setBlink] = useState(true)

  useEffect(() => {
    const currentWord = stack[index]
    let timeout: ReturnType<typeof setTimeout>
    if (!isDeleting && text === currentWord) {
      timeout = setTimeout(() => setIsDeleting(true), 2000)
    } else if (isDeleting && text === '') {
      setIsDeleting(false)
      setIndex((prev) => (prev + 1) % stack.length)
    } else {
      const nextChar = isDeleting ? currentWord.slice(0, text.length - 1) : currentWord.slice(0, text.length + 1)
      timeout = setTimeout(() => setText(nextChar), isDeleting ? 40 : 100)
    }
    return () => clearTimeout(timeout)
  }, [text, isDeleting, index])

  useEffect(() => {
    const interval = setInterval(() => setBlink(b => !b), 500)
    return () => clearInterval(interval)
  }, [])

  return (
    <span className="typing-ticker">
      <span className="tick-prefix">[</span>{text}
      <span className="tick-cursor" style={{ opacity: blink ? 1 : 0 }}>|</span>
      <span className="tick-suffix">]</span>
    </span>
  )
}

// ————————————————————————————————————————————————
// PRELOADER
// ————————————————————————————————————————————————

function Preloader({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const start = performance.now()
    const duration = 1600
    let raf = 0
    const tick = () => {
      const p = Math.min((performance.now() - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setProgress(Math.floor(eased * 100))
      if (p < 1) raf = requestAnimationFrame(tick)
      else {
        setTimeout(() => { setDone(true); setTimeout(onDone, 500) }, 200)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [onDone])

  return (
    <div className={`preloader ${done ? 'is-done' : ''}`} aria-hidden="true">
      <div className="preloader-scan" />
      <div className="preloader-inner">
        <div className="preloader-tag">B/M® — DIGITAL TERRITORIES</div>
        <div className="preloader-counter">
          {String(progress).padStart(3, '0')}<span>%</span>
        </div>
        <div className="preloader-bar"><span style={{ transform: `scaleX(${progress / 100})` }} /></div>
        <div className="preloader-status">BOOTING TERRAIN · NAIROBI · 2026</div>
      </div>
    </div>
  )
}

// ————————————————————————————————————————————————
// CURSOR
// ————————————————————————————————————————————————

function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!finePointer() || prefersReduced()) return
    const dot = dotRef.current!, ring = ringRef.current!
    if (!dot || !ring) return

    let mx = window.innerWidth / 2, my = window.innerHeight / 2
    let rx = mx, ry = my
    let raf = 0

    const onMove = (e: PointerEvent) => { mx = e.clientX; my = e.clientY }
    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      ring.classList.toggle('is-hover', !!t.closest('a, button, input, textarea, [role="button"]'))
    }
    const loop = () => {
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`
      rx += (mx - rx) * 0.18
      ry += (my - ry) * 0.18
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`
      raf = requestAnimationFrame(loop)
    }
    window.addEventListener('pointermove', onMove)
    document.addEventListener('mouseover', onOver)
    raf = requestAnimationFrame(loop)
    document.body.classList.add('has-custom-cursor')
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('mouseover', onOver)
      cancelAnimationFrame(raf)
      document.body.classList.remove('has-custom-cursor')
    }
  }, [])

  return (
    <>
      <div className="cursor-dot" ref={dotRef} aria-hidden="true" />
      <div className="cursor-ring" ref={ringRef} aria-hidden="true" />
    </>
  )
}

// ————————————————————————————————————————————————
// FLOATING CONTROLS
// ————————————————————————————————————————————————

function FixedControls({
  soundOn, onToggleSound, onScrollTop, showTop
}: { soundOn: boolean; onToggleSound: () => void; onScrollTop: () => void; showTop: boolean }) {
  return (
    <div className="fixed-controls" aria-hidden="false">
      <button className="sound-btn" onClick={onToggleSound} aria-label={soundOn ? 'Mute UI sounds' : 'Enable UI sounds'} aria-pressed={soundOn}>
        {soundOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
        <span>{soundOn ? 'SOUND ON' : 'SOUND OFF'}</span>
      </button>
      <button className={`back-to-top ${showTop ? 'is-visible' : ''}`} onClick={onScrollTop} aria-label="Back to top" tabIndex={showTop ? 0 : -1}>
        <ArrowUp size={14} />
        <span>ORIGIN</span>
      </button>
    </div>
  )
}

// ————————————————————————————————————————————————
// TESTIMONIALS
// ————————————————————————————————————————————————

function Testimonials() {
  const [active, setActive] = useState(0)
  const t = testimonials[active]
  return (
    <section className="testimonials section-pad" id="testimonials" aria-label="Field notes">
      <div className="section-tag reveal"><span>05</span> FIELD NOTES</div>
      <div className="testimonials-grid">
        <div className="testimonials-list reveal" role="tablist" aria-label="Testimonials">
          {testimonials.map((tt, i) => (
            <button
              key={i}
              className={`testimonial-tab ${i === active ? 'is-active' : ''}`}
              onClick={() => setActive(i)}
              role="tab"
              aria-selected={i === active}
              tabIndex={i === active ? 0 : -1}
            >
              <span>0{i + 1}</span>
              <div>
                <strong>{tt.company}</strong>
                <em>{tt.tag}</em>
              </div>
            </button>
          ))}
        </div>
        <div className="testimonial-view reveal" key={active} role="tabpanel" aria-live="polite">
          <div className="testimonial-quote">“{t.quote}”</div>
          <div className="testimonial-meta">
            <span>{t.author} · {t.company}</span>
            <strong>{t.metric}</strong>
          </div>
        </div>
      </div>
    </section>
  )
}

// ————————————————————————————————————————————————
// APP
// ————————————————————————————————————————————————

export default function App() {
  const root = useRef<HTMLDivElement>(null)
  const lenisRef = useRef<Lenis | null>(null)
  const readout = useRef<HTMLSpanElement>(null)
  const bar = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  const caseOverlayRef = useRef<HTMLDivElement>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)

  const [selected, setSelected] = useState<Project | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  const [copiedEmail, setCopiedEmail] = useState(false)
  const [copiedPhone, setCopiedPhone] = useState(false)

  const [booting, setBooting] = useState(() => {
    if (typeof window === 'undefined') return false
    if (prefersReduced()) return false
    return !sessionStorage.getItem('booted')
  })
  const [showTop, setShowTop] = useState(false)
  const [soundOn, setSoundOn] = useState(() => localStorage.getItem('ui-sound') === '1')
  const [caseProgress, setCaseProgress] = useState(0)
  const [easterEgg, setEasterEgg] = useState(false)

  const paletteListRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    if (!booting) sessionStorage.setItem('booted', '1')
  }, [booting])

  // ——— Global motion & scroll ———
  useEffect(() => {
    const reduced = prefersReduced()
    const lenis = reduced ? null : new Lenis({ autoRaf: true, lerp: 0.09 })
    lenisRef.current = lenis
    lenis?.on('scroll', ScrollTrigger.update)

    const progress = ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: (s) => {
        if (readout.current) readout.current.textContent = String(Math.round(s.progress * 100)).padStart(3, '0')
        if (bar.current) bar.current.style.transform = `scaleX(${s.progress})`
      }
    })

    const cleanups: Array<() => void> = []
    const ctx = reduced ? null : gsap.context(() => {
      gsap.from('.hero-line > span', { yPercent: 110, duration: 1.15, stagger: 0.1, ease: 'power4.out', delay: 0.15 })
      gsap.from('.hero-fade', { opacity: 0, y: 24, duration: 0.9, stagger: 0.08, ease: 'power3.out', delay: 0.6 })
      gsap.to('.hero-orbit', { yPercent: 24, scale: 1.16, rotate: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } })
      gsap.to('.hero-copy', { yPercent: -16, opacity: 0.18, ease: 'none', scrollTrigger: { trigger: '.hero', start: '20% top', end: 'bottom top', scrub: 1 } })

      gsap.utils.toArray<HTMLElement>('.reveal').forEach((el) => {
        gsap.from(el, { y: 70, opacity: 0, duration: 1.15, ease: 'power4.out', scrollTrigger: { trigger: el, start: 'top 86%', once: true } })
      })
      gsap.to('.marquee-track', { xPercent: -28, ease: 'none', scrollTrigger: { trigger: '.marquee', start: 'top bottom', end: 'bottom top', scrub: 0.6 } })
      gsap.to('.manifesto-word', { color: '#0e0f0c', stagger: 0.08, scrollTrigger: { trigger: '.manifesto', start: 'top 70%', end: 'bottom 60%', scrub: 1 } })
      gsap.to('.timeline-line', { scaleY: 1, transformOrigin: 'top', ease: 'none', scrollTrigger: { trigger: '.timeline', start: 'top 70%', end: 'bottom 70%', scrub: 1 } })

      gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
        const end = Number(el.dataset.count); const o = { v: 0 }
        el.textContent = '0'
        gsap.to(o, { v: end, duration: 1.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true }, onUpdate: () => { el.textContent = String(Math.round(o.v)) } })
      })

      if (finePointer()) {
        gsap.utils.toArray<HTMLElement>('.round-link, .email-link, .action-btn').forEach((el) => {
          const x = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' })
          const y = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' })
          const move = (e: MouseEvent) => { const r = el.getBoundingClientRect(); x((e.clientX - r.left - r.width / 2) * 0.28); y((e.clientY - r.top - r.height / 2) * 0.28) }
          const leave = () => { x(0); y(0) }
          el.addEventListener('mousemove', move); el.addEventListener('mouseleave', leave)
          cleanups.push(() => { el.removeEventListener('mousemove', move); el.removeEventListener('mouseleave', leave) })
        })
      }
    }, root)

    return () => { cleanups.forEach(fn => fn()); ctx?.revert(); progress.kill(); lenis?.destroy(); lenisRef.current = null }
  }, [])

  // ——— Track scroll for back-to-top ———
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 800)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // ——— UI sounds (opt-in) ———
  useEffect(() => {
    localStorage.setItem('ui-sound', soundOn ? '1' : '0')
    if (!soundOn) return
    const playTick = () => {
      try {
        if (!audioCtxRef.current) audioCtxRef.current = new AudioContext()
        const ctx = audioCtxRef.current
        if (ctx.state === 'suspended') ctx.resume()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.value = 880
        gain.gain.setValueAtTime(0.04, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.07)
        osc.connect(gain); gain.connect(ctx.destination)
        osc.start(); osc.stop(ctx.currentTime + 0.08)
      } catch { /* ignore */ }
    }
    const onClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('button, a')) playTick()
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [soundOn])

  // ——— Konami code → developer mode ———
  useEffect(() => {
    const code = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']
    let i = 0
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.matches('input, textarea')) return
      if (e.key === code[i]) {
        i++
        if (i === code.length) {
          setEasterEgg(true)
          setTimeout(() => setEasterEgg(false), 5000)
          i = 0
        }
      } else {
        i = e.key === code[0] ? 1 : 0
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // ——— Field survey ———
  const surveyStage = useRef<HTMLDivElement>(null)
  const surveyTrack = useRef<HTMLDivElement>(null)
  const surveyFill = useRef<HTMLDivElement>(null)
  const sheetNo = useRef<HTMLElement>(null)
  const sheetName = useRef<HTMLSpanElement>(null)
  const crosshair = useRef<HTMLDivElement>(null)
  const coords = useRef<HTMLSpanElement>(null)
  const goToRef = useRef<(i: number) => void>(() => {})

  const totalSheets = projects.length + 1
  const sheetNames = useMemo(() => [...projects.map((p) => p.title), 'Unsurveyed territory'], [])

  useEffect(() => {
    const mm = gsap.matchMedia()
    mm.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', () => {
      const st = surveyStage.current!, tr = surveyTrack.current!
      if (!st || !tr) return

      const plates = gsap.utils.toArray<HTMLElement>('.plate', tr)
      const nodes = gsap.utils.toArray<HTMLElement>('.mini-node', st)
      const dist = () => Math.max(tr.scrollWidth - window.innerWidth, 0)
      let active = -1

      const setActive = (i: number) => {
        if (i === active) return
        active = i
        plates.forEach((p, k) => p.classList.toggle('is-active', k === i))
        nodes.forEach((n, k) => n.classList.toggle('is-active', k === i))
        if (sheetNo.current) sheetNo.current.textContent = pad(i + 1)
        if (sheetName.current) sheetName.current.textContent = sheetNames[i]
      }
      setActive(0)

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: st, start: 'top top', end: () => `+=${dist()}`,
          pin: true, scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true,
          onUpdate: (self) => {
            setActive(Math.min(totalSheets - 1, Math.round(self.progress * (totalSheets - 1))))
            if (surveyFill.current) surveyFill.current.style.transform = `scaleX(${self.progress})`
          }
        }
      })
      tl.to(tr, { x: () => -dist() }, 0)
      tl.to(gsap.utils.toArray('.plate-title', tr), { xPercent: -16 }, 0)
      tl.fromTo(gsap.utils.toArray('.plate-media', tr), { xPercent: 4 }, { xPercent: -4 }, 0)

      const goTo = (i: number) => {
        const t = tl.scrollTrigger
        if (!t) return
        const y = t.start + (i / (totalSheets - 1)) * (t.end - t.start)
        if (lenisRef.current) lenisRef.current.scrollTo(y, { duration: 1.6 })
        else window.scrollTo({ top: y, behavior: 'smooth' })
      }
      goToRef.current = goTo

      const onFocus = (e: FocusEvent) => {
        st.scrollLeft = 0
        const i = plates.indexOf((e.target as HTMLElement).closest('.plate') as HTMLElement)
        if (i >= 0 && i !== active) goTo(i)
      }
      st.addEventListener('focusin', onFocus)

      const cleanups: Array<() => void> = []
      if (finePointer() && crosshair.current) {
        const c = crosshair.current
        const qx = gsap.quickTo(c, 'x', { duration: 0.35, ease: 'power3' })
        const qy = gsap.quickTo(c, 'y', { duration: 0.35, ease: 'power3' })
        const move = (e: PointerEvent) => {
          const r = st.getBoundingClientRect()
          const x = e.clientX - r.left, y = e.clientY - r.top
          qx(x); qy(y)
          if (coords.current) coords.current.textContent = `${lat(HOME.lat - (y / r.height - 0.5) * 0.3)}  ${lon(HOME.lon + (x / r.width - 0.5) * 0.5)}`
          const vis = (e.target as HTMLElement).closest('.plate')?.querySelector('.project-visual') as HTMLElement | null
          if (vis) { const vr = vis.getBoundingClientRect(); vis.style.setProperty('--mx', `${e.clientX - vr.left}px`); vis.style.setProperty('--my', `${e.clientY - vr.top}px`) }
        }
        const on = () => c.classList.add('is-on'), off = () => c.classList.remove('is-on')
        st.addEventListener('pointermove', move); st.addEventListener('pointerenter', on); st.addEventListener('pointerleave', off)
        cleanups.push(() => { st.removeEventListener('pointermove', move); st.removeEventListener('pointerenter', on); st.removeEventListener('pointerleave', off) })
      }

      return () => { st.removeEventListener('focusin', onFocus); cleanups.forEach((fn) => fn()); goToRef.current = () => {} }
    })

    const refresh = setTimeout(() => ScrollTrigger.refresh(), 150)
    return () => { clearTimeout(refresh); mm.revert() }
  }, [totalSheets, sheetNames])

  // ——— SEO ———
  useEffect(() => {
    const el = document.createElement('script')
    el.type = 'application/ld+json'
    el.text = JSON.stringify({
      '@context': 'https://schema.org', '@type': 'Person', name: 'Ben Moseti', url: SITE_URL,
      jobTitle: 'Full-stack developer, technical SEO specialist and GIS developer',
      telephone: PHONE, sameAs: [GITHUB_URL],
      address: { '@type': 'PostalAddress', addressLocality: 'Nairobi', addressCountry: 'KE' },
      alumniOf: { '@type': 'CollegeOrUniversity', name: 'Dedan Kimathi University of Technology' },
      knowsAbout: ['Technical SEO', 'React', 'Node.js', 'PostGIS', 'Geospatial analysis', 'Remote sensing', 'Docker']
    })
    document.head.appendChild(el)
    return () => { el.remove() }
  }, [])

  // ——— Overlay locking + shortcuts ———
  const overlayOpen = !!selected || menuOpen || paletteOpen
  useEffect(() => {
    document.body.style.overflow = (overlayOpen || booting) ? 'hidden' : ''
    if (overlayOpen || booting) lenisRef.current?.stop(); else lenisRef.current?.start()
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault(); setQuery(''); setActiveIndex(0); setPaletteOpen(o => !o); return
      }
      if (e.key === 'Escape') { setSelected(null); setMenuOpen(false); setPaletteOpen(false) }
    }
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [overlayOpen, booting])

  // ——— Focus management ———
  useEffect(() => {
    if (selected) closeBtn.current?.focus()
    else if (returnFocus.current) { returnFocus.current.focus({ preventScroll: true }); returnFocus.current = null }
  }, [selected])

  // ——— Reset case progress on project change ———
  useEffect(() => {
    if (selected && caseOverlayRef.current) {
      caseOverlayRef.current.scrollTop = 0
      setCaseProgress(0)
    }
  }, [selected])

  // ——— Arrow keys in case study ———
  const selectedIndex = selected ? projects.findIndex(p => p.id === selected.id) : -1

  const navigateProject = useCallback((dir: 1 | -1) => {
    if (selectedIndex < 0) return
    const nextIdx = (selectedIndex + dir + projects.length) % projects.length
    setSelected(projects[nextIdx])
  }, [selectedIndex])

  useEffect(() => {
    if (!selected) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); navigateProject(-1) }
      if (e.key === 'ArrowRight') { e.preventDefault(); navigateProject(1) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selected, navigateProject])

  // ——— Scroll ———
  const scrollTo = useCallback((id: string) => {
    setMenuOpen(false); setPaletteOpen(false)
    const target = id === 'top' ? 0 : document.getElementById(id)
    if (target === null) return
    setTimeout(() => {
      if (lenisRef.current) lenisRef.current.scrollTo(target as number | HTMLElement, { duration: 1.4 })
      else if (target === 0) window.scrollTo({ top: 0, behavior: 'smooth' })
      else (target as HTMLElement).scrollIntoView({ behavior: 'smooth' })
    }, 0)
  }, [])

  // ——— Project modal ———
  const openProject = (project: Project, e?: React.MouseEvent<HTMLButtonElement>) => {
    returnFocus.current = (e?.currentTarget ?? document.activeElement) as HTMLElement | null
    const source = e?.currentTarget.querySelector('.project-visual') as HTMLElement | null
    if (!e || !source || prefersReduced()) { setPaletteOpen(false); setSelected(project); return }
    const rect = source.getBoundingClientRect()
    const clone = source.cloneNode(true) as HTMLElement
    Object.assign(clone.style, { position: 'fixed', left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px`, margin: '0', zIndex: '80', pointerEvents: 'none' })
    document.body.appendChild(clone)
    setSelected(project)
    gsap.to(clone, { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight, duration: 0.52, ease: 'power3.inOut', onComplete: () => clone.remove() })
  }

  const closeProject = () => {
    if (!selected) return
    const target = document.querySelector(`[data-project="${selected.id}"] .project-visual`) as HTMLElement | null
    const clone = document.querySelector('.case-hero .project-visual')?.cloneNode(true) as HTMLElement | undefined
    if (!target || !clone || prefersReduced()) { setSelected(null); return }
    const rect = target.getBoundingClientRect()
    Object.assign(clone.style, { position: 'fixed', left: '0', top: '0', width: '100vw', height: '100vh', zIndex: '90', pointerEvents: 'none' })
    document.body.appendChild(clone)
    setSelected(null)
    gsap.to(clone, { left: rect.left, top: rect.top, width: rect.width, height: rect.height, duration: 0.48, ease: 'power3.inOut', onComplete: () => clone.remove() })
  }

  // ——— Copy ———
  const copyEmail = async () => {
    try { await navigator.clipboard.writeText(EMAIL) } catch { window.location.href = `mailto:${EMAIL}`; return }
    setCopiedEmail(true); setPaletteOpen(false); setTimeout(() => setCopiedEmail(false), 2200)
  }
  const copyPhone = async () => {
    try { await navigator.clipboard.writeText(PHONE) } catch { return }
    setCopiedPhone(true); setPaletteOpen(false); setTimeout(() => setCopiedPhone(false), 2200)
  }

  // ——— Command palette ———
  const commands = useMemo(() => [
    { group: 'Navigate', items: ['expertise', 'work', 'timeline', 'testimonials', 'contact'].map(id => ({
      label: `Go to ${id}`, hint: 'Section', run: () => scrollTo(id)
    })) },
    { group: 'Projects', items: projects.map(p => ({
      label: `Open ${p.title}`, hint: p.kind, run: () => openProject(p)
    })) },
    { group: 'Contact', items: [
      { label: 'Copy email address', hint: 'Action', run: copyEmail },
      { label: 'Copy phone number', hint: 'Action', run: copyPhone },
      { label: 'Open GitHub Profile', hint: 'External', run: () => { window.open(GITHUB_URL, '_blank') } },
      { label: 'Send an email', hint: 'Action', run: () => { window.location.href = `mailto:${EMAIL}` } }
    ] }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [scrollTo])

  const flatCommands = useMemo(() => commands.flatMap(g => g.items), [commands])
  const filteredGroups = useMemo(() => {
    const q = query.toLowerCase()
    return commands
      .map(g => ({ ...g, items: g.items.filter(c => (c.label + c.hint).toLowerCase().includes(q)) }))
      .filter(g => g.items.length > 0)
  }, [commands, query])
  const matches = useMemo(() => filteredGroups.flatMap(g => g.items), [filteredGroups])

  const handlePaletteKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(prev => (prev + 1) % (matches.length || 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(prev => (prev - 1 + matches.length) % (matches.length || 1)) }
    else if (e.key === 'Enter') { e.preventDefault(); if (matches[activeIndex]) matches[activeIndex].run() }
  }

  useEffect(() => {
    if (paletteOpen && paletteListRef.current) {
      const activeEl = paletteListRef.current.querySelector('[data-active="true"]') as HTMLElement
      if (activeEl) activeEl.scrollIntoView({ block: 'nearest' })
    }
  }, [activeIndex, paletteOpen, matches.length])

  // ——— Render ———
  return (
    <div className="site" ref={root}>
      {booting && <Preloader onDone={() => setBooting(false)} />}
      <CustomCursor />

      <div className="noise-overlay" aria-hidden="true" />
      <a className="skip-link" href="#work">Skip to selected work</a>
      <div className="progress-bar" ref={bar} aria-hidden="true" />

      <header className="topbar">
        <button className="brand" onClick={() => scrollTo('top')} aria-label="Back to top">B/M<span>®</span></button>
        <div className="topbar-center"><span className="status-dot pulse"/>AVAILABLE FOR SELECT PROJECTS</div>
        <nav className="desktop-nav" aria-label="Main navigation">
          <button onClick={() => scrollTo('expertise')}>EXPERTISE</button>
          <button onClick={() => scrollTo('work')}>WORK</button>
          <button onClick={() => scrollTo('contact')}>CONTACT <ArrowUpRight size={14}/></button>
          <button className="palette-trigger" onClick={() => { setQuery(''); setActiveIndex(0); setPaletteOpen(true) }} aria-label="Open command menu"><Search size={13}/> <kbd>⌘K</kbd></button>
        </nav>
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label="Toggle menu">{menuOpen ? <X/> : <Plus/>}</button>
      </header>

      <div className={`mobile-menu ${menuOpen ? 'is-open' : ''}`} aria-hidden={!menuOpen}>
        {['expertise','work','timeline','testimonials','contact'].map((item,i)=><button key={item} onClick={()=>scrollTo(item)} tabIndex={menuOpen ? 0 : -1}><span>0{i+1}</span>{item.toUpperCase()}</button>)}
      </div>

      <main>
        <section className="hero" id="top">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-side hero-fade">
            <MapPin size={12}/> NAIROBI, KE<br/>
            {getGreeting()}<br/>
            PORTFOLIO / 2026<br/>
            MULTIDISCIPLINARY PRACTICE
          </div>
          <div className="hero-orbit"><Globe/><div className="orbit-caption hero-fade"><span>LIVE SYSTEM</span><span>01°17′S / 36°49′E</span></div></div>
          <div className="hero-copy">
            <p className="hero-kicker hero-fade">
              FULL-STACK <i/> TECHNICAL SEO <i/> GEOSPATIAL
              <span className="hero-ticker-wrap"><TypingTicker /></span>
            </p>
            <h1 className="glitch-text" data-text="I BUILD DIGITAL TERRITORIES." aria-label="I build digital territories">
              <span className="hero-line"><span>I BUILD</span></span>
              <span className="hero-line hero-outline"><span>DIGITAL</span></span>
              <span className="hero-line"><span>TERRITORIES<span className="title-dot">.</span></span></span>
            </h1>
            <p className="hero-sub hero-fade">Ben Moseti — I map complex, data-driven problems into products that perform, get discovered, and understand the world around them.</p>
          </div>
          <div className="hero-bottom hero-fade">
            <p>Code, search, and spatial intelligence—<br/>engineered as one connected discipline.</p>
            <button className="round-link" onClick={() => scrollTo('work')} aria-label="Explore selected work"><ArrowDown/></button>
            <div className="scroll-readout">SCROLL<br/><span><b ref={readout}>000</b>%</span></div>
          </div>
        </section>

        <section className="manifesto section-pad">
          <div className="section-tag reveal"><span>01</span> THE INTERSECTION</div>
          <p className="manifesto-copy">I work where <span className="manifesto-word">software</span> meets <span className="manifesto-word">visibility</span> and <span className="manifesto-word">place.</span> Three years of full-stack delivery, a technical SEO chapter at LuckPesa, and a geospatial foundation from Dedan Kimathi — one connected way of thinking about the web.</p>
          <div className="manifesto-foot reveal"><span>NOT THREE SEPARATE SERVICES.</span><strong>ONE CONNECTED WAY OF THINKING.</strong></div>
        </section>

        <section className="stats section-pad" aria-label="Measured results">
          {stats.map(s => (
            <div className="stat reveal" key={s.label}>
              <strong><em>{s.pre}</em><b data-count={s.n}>{s.n}</b><em>{s.suf}</em></strong>
              <p>{s.label}</p>
              <span>{s.where}</span>
            </div>
          ))}
        </section>

        <section className="expertise section-pad" id="expertise">
          <div className="section-tag reveal"><span>02</span> CAPABILITIES</div>
          <div className="expertise-list">
            {[
              ['01','DEVELOPMENT','Full-stack products with a strong technical core — React on the front, Node & Postgres on the back.','React / TypeScript / Node.js / Express / PostgreSQL / Docker'],
              ['02','SEARCH','Technical SEO precision meets human intent. Built to be crawled, understood, and chosen.','Technical SEO / Crawl health / Structured data / GA4'],
              ['03','GEOSPATIAL','Making location data legible, interactive, and useful for real-world decisions.','PostGIS / Python (GDAL, GeoPandas) / Leaflet / Mapbox / Remote sensing']
            ].map(([n,title,desc,tools]) => <article className="expertise-row reveal" key={title}>
              <span className="expertise-num">{n}</span><h2>{title}</h2><p>{desc}</p><div className="expertise-tools">{tools}</div><ArrowUpRight className="expertise-arrow" aria-hidden="true"/>
            </article>)}
          </div>
        </section>

        <div className="marquee" aria-hidden="true"><div className="marquee-track">CODE <i/> SEARCH <i/> SPACE <i/> CODE <i/> SEARCH <i/> SPACE <i/></div></div>

        <section className="work" id="work">
          <div className="work-intro section-pad">
            <div className="work-head reveal">
              <div className="section-tag"><span>03</span> SELECTED WORK</div>
              <p>Engineering, discoverability, and geography — surveyed as map sheets. Scroll to move across the terrain, open a sheet for the full case study.</p>
            </div>
          </div>

          <div className="survey" ref={surveyStage}>
            <div className="survey-hud hud-top" aria-hidden="true">
              <span>FIELD SURVEY / SHEET <b ref={sheetNo}>01</b> OF {pad(totalSheets)}</span>
              <span ref={sheetName}>{sheetNames[0]}</span>
              <span>EPOCH 2024 → 2025</span>
            </div>

            <div className="survey-track" ref={surveyTrack}>
              {projects.map((p, i) => (
                <article className="plate" key={p.id} data-project={p.id}>
                  <div className="plate-bar"><span>SHEET {p.index} / {pad(totalSheets)} · {p.kind}</span><span>EPOCH {p.year} · SCALE {SCALES[i]}</span></div>

                  <button className="plate-open" onClick={(e) => openProject(p, e)} aria-label={`Open ${p.title} case study`}>
                    <span className="plate-frame">
                      <span className="plate-media"><ProjectVisual project={p} /></span>
                      <svg className="north" viewBox="0 0 24 34" aria-hidden="true">
                        <path d="M12 2 L20 26 L12 20 L4 26 Z" strokeWidth="1" />
                        <text x="12" y="34" textAnchor="middle" fontSize="8" fontFamily="IBM Plex Mono" fill="currentColor" stroke="none">N</text>
                      </svg>
                    </span>
                  </button>

                  <h3 className="plate-title">{p.title}</h3>

                  <div className="plate-panel">
                    <p className="plate-summary">{p.summary}</p>
                    <ul className="legend" aria-label="Technologies">
                      {p.tags.map((t, k) => <li key={t}><i className={`sym sym-${k % 3}`} />{t}</li>)}
                    </ul>
                    <div className="key"><strong>{p.stat}</strong><span>{p.statLabel}</span></div>
                    <div className="scalebar" aria-hidden="true"><i /><i /><i /><i /></div>
                    <button className="plate-cta" onClick={(e) => (e.currentTarget.closest('.plate')?.querySelector('.plate-open') as HTMLButtonElement | null)?.click()}>
                      OPEN SHEET <ArrowUpRight size={16} />
                    </button>
                  </div>
                </article>
              ))}

              <article className="plate plate-end">
                <div className="plate-bar"><span>SHEET {pad(totalSheets)} / {pad(totalSheets)} · UNSURVEYED</span><span>SCALE {SCALES[3]}</span></div>
                <div className="end-inner">
                  <h3 className="plate-title">YOUR PROBLEM IS THE NEXT SHEET.</h3>
                  <p className="plate-summary">Search, software, or spatial data — bring the coordinate, I’ll map the rest.</p>
                  <button className="plate-cta" onClick={() => scrollTo('contact')}>OPEN A CHANNEL <ArrowUpRight size={16} /></button>
                </div>
              </article>
            </div>

            <div className="survey-hud hud-bottom">
              <div className="minimap">
                <span className="mini-label" aria-hidden="true">SHEET INDEX</span>
                <div className="mini-rail">
                  <div className="mini-fill" ref={surveyFill} />
                  {Array.from({ length: totalSheets }, (_, i) => (
                    <button key={i} className="mini-node" style={{ left: `${(i / (totalSheets - 1)) * 100}%` }} onClick={() => goToRef.current(i)} aria-label={`Go to sheet ${i + 1}: ${sheetNames[i]}`} />
                  ))}
                </div>
              </div>
              <span className="hud-coords" aria-hidden="true">CURSOR <span ref={coords}>{lat(HOME.lat)}  {lon(HOME.lon)}</span></span>
            </div>

            <div className="crosshair" ref={crosshair} aria-hidden="true"><i /></div>
          </div>
        </section>

        <section className="timeline section-pad" id="timeline">
          <div className="section-tag reveal"><span>04</span> THE TERRAIN OF MY WORK</div>
          <div className="timeline-head reveal">
            <h2>EVERY ROLE<br/>ADDED A <span>CONTOUR.</span></h2>
            <p>Read top to bottom like a topographic map — each role a new elevation, each skill a new line.</p>
          </div>
          <div className="timeline-body">
            <div className="timeline-rail"><div className="timeline-line"/></div>
            {roles.map((role) => (
              <article className={`timeline-item reveal ${role.highlight ? 'is-highlight' : ''}`} key={role.company}>
                <div className="timeline-node"><span className="node-dot">{role.highlight ? <Sparkles size={14}/> : <Terminal size={12}/>}</span></div>
                <div className="timeline-card">
                  <div className="timeline-meta"><span>{role.period}</span><span><MapPin size={11}/> {role.location}</span></div>
                  <h3>{role.company}</h3>
                  <p className="timeline-role">{role.title}</p>
                  <ul>{role.bullets.map(b => <li key={b}>{b}</li>)}</ul>
                </div>
              </article>
            ))}
          </div>
          <div className="timeline-foot reveal">
            <span>EDUCATION — B.Sc. GEOSPATIAL INFORMATION SYSTEMS & REMOTE SENSING</span>
            <strong>DEDAN KIMATHI UNIVERSITY OF TECHNOLOGY · 2020 → 2024</strong>
          </div>
        </section>

        <Testimonials />

        <section className="approach section-pad">
          <div className="section-tag reveal"><span>06</span> OPERATING PRINCIPLES</div>
          <div className="approach-grid">
            <h2 className="reveal">PRECISION<br/>OVER <span>NOISE.</span></h2>
            <div className="principles">
              {[['01','Start with the terrain','Before choosing tools, understand the landscape: users, data, constraints, and the actual problem.'],['02','Make complexity legible','The best systems do not show off their complexity. They turn it into clarity, momentum, and confident action.'],['03','Performance is design','Speed, accessibility, search visibility, and motion are not finishing touches. They shape the experience from day one.']].map(([n,t,d])=><article key={n} className="principle reveal"><span>{n}</span><div><h3>{t}</h3><p>{d}</p></div></article>)}
            </div>
          </div>
        </section>

        <section className="contact" id="contact">
          <div className="contact-grid" aria-hidden="true"/>
          <div className="section-tag reveal"><span>07</span> OPEN A CHANNEL</div>
          <div className="contact-main reveal"><p>HAVE A COORDINATE IN MIND?</p><h2>LET’S MAP<br/>WHAT’S <span>NEXT.</span></h2></div>

          <div className="contact-actions reveal">
            <a className="email-link" href={`mailto:${EMAIL}`}>BEN MOSETI <ArrowUpRight/></a>

            <div className="action-group">
              <button className="action-btn" onClick={copyEmail}>
                {copiedEmail ? <Check size={16}/> : <Mail size={16}/>}
                <span>{copiedEmail ? 'COPIED' : 'EMAIL'}</span>
              </button>
              <button className="action-btn" onClick={copyPhone}>
                {copiedPhone ? <Check size={16}/> : <Phone size={16}/>}
                <span>{copiedPhone ? 'COPIED' : 'CALL'}</span>
              </button>
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="action-btn github-btn">
                <Github size={16}/> <span>GITHUB</span>
              </a>
            </div>
          </div>

          <footer>
            <div>B/M® — DIGITAL TERRITORIES</div>
            <div className="footer-center">
              <span>NAIROBI, KE</span>
              <WeatherWidget />
              <Clock/>
            </div>
            <button onClick={()=>scrollTo('top')}>BACK TO ORIGIN ↑</button>
          </footer>
        </section>
      </main>

      {selected && (
        <div
          className="case-overlay"
          data-lenis-prevent
          role="dialog"
          aria-modal="true"
          aria-label={`${selected.title} case study`}
          ref={caseOverlayRef}
          onScroll={(e) => {
            const el = e.currentTarget
            setCaseProgress(el.scrollTop / Math.max(el.scrollHeight - el.clientHeight, 1))
          }}
        >
          <div className="case-progress" style={{ transform: `scaleX(${caseProgress})` }} aria-hidden="true" />
          <button className="case-close" ref={closeBtn} onClick={closeProject} aria-label="Close case study"><X/> CLOSE</button>
          <div className="case-hero"><ProjectVisual project={selected} large/></div>
          <div className="case-content">
            <div className="case-heading">
              <span>{selected.index} / {selected.kind} / {selected.year}</span>
              <h2>{selected.title}</h2>
              <p>{selected.summary}</p>
            </div>
            <div className="case-body">
              <div className="case-stat"><strong>{selected.stat}</strong><span>{selected.statLabel}</span></div>
              <div>
                <p>{selected.description}</p>
                <div className="case-tags">{selected.tags.map(t=><span key={t}>{t}</span>)}</div>
              </div>
            </div>
            <div className="case-note">SELECTED WORK — BUILT FROM REAL EXPERIENCE</div>
            <button className="case-next" onClick={closeProject}>RETURN TO ALL PROJECTS <ArrowUpRight/></button>
          </div>

          <div className="case-nav" role="navigation" aria-label="Case study navigation">
            <button onClick={() => navigateProject(-1)} aria-label="Previous project"><ArrowLeft size={14}/></button>
            <span className="case-nav-info">
              {pad(selectedIndex + 1)} / {pad(projects.length)} — {selected.title}
            </span>
            <button onClick={() => navigateProject(1)} aria-label="Next project"><ArrowRight size={14}/></button>
          </div>
        </div>
      )}

      {paletteOpen && (
        <div className="palette-backdrop" onMouseDown={() => setPaletteOpen(false)}>
          <div className="palette" role="dialog" aria-modal="true" aria-label="Command menu" onMouseDown={e => e.stopPropagation()}>
            <input
              autoFocus
              value={query}
              onChange={e => { setQuery(e.target.value); setActiveIndex(0) }}
              placeholder="Jump to a section, open a project, copy contact…"
              onKeyDown={handlePaletteKeyDown}
              aria-label="Search commands"
            />
            <ul ref={paletteListRef}>
              {matches.length === 0 && <li className="palette-empty">No match. Try “work” or “email”.</li>}
              {filteredGroups.map(group => (
                <li key={group.group} className="palette-group">
                  <div className="palette-group-label">{group.group}</div>
                  {group.items.map(item => {
                    const idx = flatCommands.indexOf(item)
                    return (
                      <button
                        key={item.label}
                        className={idx === activeIndex ? 'is-active' : ''}
                        onClick={item.run}
                        onMouseEnter={() => setActiveIndex(idx)}
                        data-active={idx === activeIndex}
                      >
                        <span>{item.label}</span><em>{item.hint}</em>
                      </button>
                    )
                  })}
                </li>
              ))}
            </ul>
            <div className="palette-foot">
              <span><kbd>↑↓</kbd> navigate</span>
              <span><kbd>↵</kbd> select</span>
              <span><kbd>esc</kbd> close</span>
            </div>
          </div>
        </div>
      )}

      <div className={`toast ${(copiedEmail || copiedPhone) ? 'show' : ''}`} role="status">
        {copiedEmail ? 'EMAIL COPIED — CHANNEL READY' : 'PHONE COPIED — CHANNEL READY'}
      </div>

      {easterEgg && (
        <div className="easter-egg is-active" aria-hidden="true">
          <div className="easter-inner">
            <div className="easter-tag">DEVELOPER MODE</div>
            <h3>TERRAIN<br/>UNLOCKED.</h3>
            <p>You found the coordinate. Good eye.</p>
            <span className="easter-coords">{lat(HOME.lat)} · {lon(HOME.lon)}</span>
          </div>
        </div>
      )}

      <FixedControls
        soundOn={soundOn}
        onToggleSound={() => setSoundOn(s => !s)}
        onScrollTop={() => scrollTo('top')}
        showTop={showTop}
      />
    </div>
  )
}