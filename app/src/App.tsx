import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowDown, ArrowUpRight, X, Copy, Check, Plus, MapPin, Terminal, Sparkles, Search, Github, Phone, Mail } from 'lucide-react'
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

const stats = [
  { n: 30, pre: '−', suf: '%', label: 'average page load time', where: 'GeoCelestials' },
  { n: 15, pre: '+', suf: '%', label: 'user session duration', where: 'New dashboard' },
  { n: 3, pre: '', suf: '', label: 'disciplines, one workflow', where: 'Code · Search · Space' }
]

const stack = ['REACT', 'NODE.JS', 'POSTGIS', 'TECH SEO', 'DOCKER', 'PYTHON', 'MAPBOX']

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
            <circle cx="200" cy="150" r="30" />
            <circle cx="600" cy="150" r="30" />
            <circle cx="200" cy="450" r="30" />
            <circle cx="600" cy="450" r="30" />
            <circle cx="400" cy="500" r="30" />
          </g>
          
          <g fill="#f3f3f3" fontSize="9" fontFamily="IBM Plex Mono" textAnchor="middle">
            <text x="200" y="153">CATALOG</text>
            <text x="600" y="153">SEARCH</text>
            <text x="200" y="453">INVENTORY</text>
            <text x="600" y="453">ROUTING</text>
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

// Isolated Clock
function Clock() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Africa/Nairobi' })
    const tick = () => setTime(fmt.format(new Date()))
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id)
  }, [])
  return <span>{time} EAT</span>
}

// Live Typing Ticker Component
function TypingTicker() {
  const [index, setIndex] = useState(0)
  const [text, setText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [blink, setBlink] = useState(true)

  useEffect(() => {
    const currentWord = stack[index]
    let timeout: NodeJS.Timeout

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
      <span className="tick-prefix">[</span>
      {text}
      <span className="tick-cursor" style={{ opacity: blink ? 1 : 0 }}>|</span>
      <span className="tick-suffix">]</span>
    </span>
  )
}

const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const finePointer = () => window.matchMedia('(pointer: fine)').matches

function App() {
  const root = useRef<HTMLDivElement>(null)
  const lenisRef = useRef<Lenis | null>(null)
  const readout = useRef<HTMLSpanElement>(null)
  const bar = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  
  const [selected, setSelected] = useState<Project | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [copiedPhone, setCopiedPhone] = useState(false)
  
  const paletteListRef = useRef<HTMLUListElement>(null)

  // Motion + smooth scroll
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

  // Person structured data
  useEffect(() => {
    const el = document.createElement('script')
    el.type = 'application/ld+json'
    el.text = JSON.stringify({
      '@context': 'https://schema.org', '@type': 'Person', name: 'Ben Moseti', url: SITE_URL,
      jobTitle: 'Full-stack developer, technical SEO specialist and GIS developer',
      telephone: PHONE,
      sameAs: [GITHUB_URL],
      address: { '@type': 'PostalAddress', addressLocality: 'Nairobi', addressCountry: 'KE' },
      alumniOf: { '@type': 'CollegeOrUniversity', name: 'Dedan Kimathi University of Technology' },
      knowsAbout: ['Technical SEO', 'React', 'Node.js', 'PostGIS', 'Geospatial analysis', 'Remote sensing', 'Docker']
    })
    document.head.appendChild(el)
    return () => { el.remove() }
  }, [])

  // Overlay behaviour
  const overlayOpen = !!selected || menuOpen || paletteOpen
  useEffect(() => {
    document.body.style.overflow = overlayOpen ? 'hidden' : ''
    if (overlayOpen) lenisRef.current?.stop(); else lenisRef.current?.start()
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setQuery(''); setActiveIndex(0); setPaletteOpen(o => !o); return }
      if (e.key === 'Escape') { setSelected(null); setMenuOpen(false); setPaletteOpen(false) }
    }
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [overlayOpen])

  useEffect(() => {
    if (selected) closeBtn.current?.focus()
    else if (returnFocus.current) { returnFocus.current.focus({ preventScroll: true }); returnFocus.current = null }
  }, [selected])

  // Reset activeIndex when query changes
  useEffect(() => { setActiveIndex(0) }, [query])

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

  const copyEmail = async () => {
    try { await navigator.clipboard.writeText(EMAIL) } catch { window.location.href = `mailto:${EMAIL}`; return }
    setCopiedEmail(true); setPaletteOpen(false); setTimeout(() => setCopiedEmail(false), 2200)
  }

  const copyPhone = async () => {
    try { await navigator.clipboard.writeText(PHONE) } catch { return }
    setCopiedPhone(true); setPaletteOpen(false); setTimeout(() => setCopiedPhone(false), 2200)
  }

  const onProjectsMove = (e: React.MouseEvent) => {
    const card = (e.target as HTMLElement).closest('.project-card') as HTMLElement | null
    if (!card) return
    const r = card.getBoundingClientRect()
    card.style.setProperty('--mx', `${e.clientX - r.left}px`)
    card.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  const commands = useMemo(() => [
    ...['expertise', 'work', 'timeline', 'contact'].map(id => ({ label: `Go to ${id}`, hint: 'Section', run: () => scrollTo(id) })),
    ...projects.map(p => ({ label: `Open ${p.title}`, hint: p.kind, run: () => openProject(p) })),
    { label: 'Copy email address', hint: 'Action', run: copyEmail },
    { label: 'Copy phone number', hint: 'Action', run: copyPhone },
    { label: 'Open GitHub Profile', hint: 'External Link', run: () => { window.open(GITHUB_URL, '_blank') } },
    { label: 'Send an email', hint: 'Action', run: () => { window.location.href = `mailto:${EMAIL}` } }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [scrollTo])

  const matches = commands.filter(c => (c.label + c.hint).toLowerCase().includes(query.toLowerCase()))

  // Keyboard navigation for command palette
  const handlePaletteKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(prev => (prev + 1) % (matches.length || 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(prev => (prev - 1 + matches.length) % (matches.length || 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (matches[activeIndex]) matches[activeIndex].run()
    }
  }

  // Scroll active item into view
  useEffect(() => {
    if (paletteOpen && paletteListRef.current) {
      const activeEl = paletteListRef.current.children[activeIndex] as HTMLElement
      if (activeEl) activeEl.scrollIntoView({ block: 'nearest' })
    }
  }, [activeIndex, paletteOpen])

  return (
    <div className="site" ref={root}>
      <div className="noise-overlay" aria-hidden="true" />
      <a className="skip-link" href="#work">Skip to selected work</a>
      <div className="progress-bar" ref={bar} aria-hidden="true" />

      <header className="topbar">
        <button className="brand" onClick={() => scrollTo('top')} aria-label="Back to top">B/M<span>®</span></button>
        <div className="topbar-center"><span className="status-dot"/>AVAILABLE FOR SELECT PROJECTS</div>
        <nav className="desktop-nav" aria-label="Main navigation">
          <button onClick={() => scrollTo('expertise')}>EXPERTISE</button>
          <button onClick={() => scrollTo('work')}>WORK</button>
          <button onClick={() => scrollTo('contact')}>CONTACT <ArrowUpRight size={14}/></button>
          <button className="palette-trigger" onClick={() => { setQuery(''); setActiveIndex(0); setPaletteOpen(true) }} aria-label="Open command menu"><Search size={13}/> <kbd>⌘K</kbd></button>
        </nav>
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label="Toggle menu">{menuOpen ? <X/> : <Plus/>}</button>
      </header>

      <div className={`mobile-menu ${menuOpen ? 'is-open' : ''}`} aria-hidden={!menuOpen}>
        {['expertise','work','contact'].map((item,i)=><button key={item} onClick={()=>scrollTo(item)} tabIndex={menuOpen ? 0 : -1}><span>0{i+1}</span>{item.toUpperCase()}</button>)}
      </div>

      <main>
        <section className="hero" id="top">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-side hero-fade">
            <MapPin size={12}/> NAIROBI, KE<br/>
            PORTFOLIO / 2026<br/>
            MULTIDISCIPLINARY PRACTICE
          </div>
          <div className="hero-orbit"><Globe/><div className="orbit-caption hero-fade"><span>LIVE SYSTEM</span><span>01°17′S / 36°49′E</span></div></div>
          <div className="hero-copy">
            <p className="hero-kicker hero-fade">
              FULL-STACK <i/> TECHNICAL SEO <i/> GEOSPATIAL 
              <span className="hero-ticker-wrap"><TypingTicker /></span>
            </p>
            <h1 aria-label="I build digital territories">
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

        <section className="work section-pad" id="work">
          <div className="work-head reveal"><div className="section-tag"><span>03</span> SELECTED WORK</div><p>Engineering, discoverability, and geography — three threads pulled through real projects and real roles.</p></div>
          <div className="projects" onMouseMove={onProjectsMove}>
            {projects.map((project) => <button className="project-card reveal" key={project.id} data-project={project.id} onClick={(e)=>openProject(project,e)} aria-label={`Open ${project.title} case study`}>
              <ProjectVisual project={project}/>
              <div className="project-meta"><div><span>{project.index} / {project.kind}</span><h3>{project.title}</h3></div><div className="project-year">{project.year}<ArrowUpRight/></div></div>
            </button>)}
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

        <section className="approach section-pad">
          <div className="section-tag reveal"><span>05</span> OPERATING PRINCIPLES</div>
          <div className="approach-grid">
            <h2 className="reveal">PRECISION<br/>OVER <span>NOISE.</span></h2>
            <div className="principles">
              {[['01','Start with the terrain','Before choosing tools, understand the landscape: users, data, constraints, and the actual problem.'],['02','Make complexity legible','The best systems do not show off their complexity. They turn it into clarity, momentum, and confident action.'],['03','Performance is design','Speed, accessibility, search visibility, and motion are not finishing touches. They shape the experience from day one.']].map(([n,t,d])=><article key={n} className="principle reveal"><span>{n}</span><div><h3>{t}</h3><p>{d}</p></div></article>)}
            </div>
          </div>
        </section>

        <section className="contact" id="contact">
          <div className="contact-grid" aria-hidden="true"/>
          <div className="section-tag reveal"><span>06</span> OPEN A CHANNEL</div>
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
            <div>NAIROBI, KE <Clock/></div>
            <button onClick={()=>scrollTo('top')}>BACK TO ORIGIN ↑</button>
          </footer>
        </section>
      </main>

      {selected && <div className="case-overlay" data-lenis-prevent role="dialog" aria-modal="true" aria-label={`${selected.title} case study`}>
        <button className="case-close" ref={closeBtn} onClick={closeProject} aria-label="Close case study"><X/> CLOSE</button>
        <div className="case-hero"><ProjectVisual project={selected} large/></div>
        <div className="case-content">
          <div className="case-heading"><span>{selected.index} / {selected.kind} / {selected.year}</span><h2>{selected.title}</h2><p>{selected.summary}</p></div>
          <div className="case-body"><div className="case-stat"><strong>{selected.stat}</strong><span>{selected.statLabel}</span></div><div><p>{selected.description}</p><div className="case-tags">{selected.tags.map(t=><span key={t}>{t}</span>)}</div></div></div>
          <div className="case-note">SELECTED WORK — BUILT FROM REAL EXPERIENCE</div>
          <button className="case-next" onClick={closeProject}>RETURN TO ALL PROJECTS <ArrowUpRight/></button>
        </div>
      </div>}

      {paletteOpen && <div className="palette-backdrop" onMouseDown={() => setPaletteOpen(false)}>
        <div className="palette" role="dialog" aria-modal="true" aria-label="Command menu" onMouseDown={e => e.stopPropagation()}>
          <input 
            autoFocus 
            value={query} 
            onChange={e => setQuery(e.target.value)} 
            placeholder="Jump to a section, open a project, copy contact…"
            onKeyDown={handlePaletteKeyDown} 
            aria-label="Search commands" 
          />
          <ul ref={paletteListRef}>
            {matches.length === 0 && <li className="palette-empty">No match. Try “work” or “email”.</li>}
            {matches.map((c, i) => (
              <li key={c.label}>
                <button 
                  className={i === activeIndex ? 'is-active' : ''} 
                  onClick={c.run}
                  onMouseEnter={() => setActiveIndex(i)}
                >
                  <span>{c.label}</span><em>{c.hint}</em>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>}

      <div className={`toast ${(copiedEmail || copiedPhone) ? 'show' : ''}`} role="status">
        {copiedEmail ? 'EMAIL COPIED — CHANNEL READY' : 'PHONE COPIED — CHANNEL READY'}
      </div>
    </div>
  )
}

export default App