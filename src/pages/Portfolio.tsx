import { useState, useEffect, useCallback, useMemo, lazy, Suspense, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import type { PortfolioData, OtherSection } from '../../shared/types'
import { sampleData } from '../lib/sampleData'
import AuroraBackground from '../components/AuroraBackground'
const Scene3D = lazy(() => import('../components/Scene3D'))
import ScrambleTitle from '../components/ScrambleTitle'
import About from '../sections/About'
import Skills from '../sections/Skills'
import Experience from '../sections/Experience'
import Projects from '../sections/Projects'
import AIBuildLog from '../sections/AIBuildLog'
import Contact from '../sections/Contact'

interface SectionDef {
  id: string
  label: string
  color: string
  content: (data: PortfolioData) => ReactNode
}

// Color palette for dynamic sections
const DYNAMIC_COLORS = ['#f59e0b', '#14b8a6', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899']

function OtherContent({ section }: { section: OtherSection }) {
  return (
    <motion.div
      className="relative pl-6 max-w-3xl"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="absolute left-0 top-0 bottom-0 w-[2px]"
        style={{
          background: 'linear-gradient(180deg, #00d4ff, #a855f7, transparent)',
          boxShadow: '0 0 8px rgba(0,212,255,0.3)',
          transformOrigin: 'top',
        }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      />
      <p className="text-lg text-text-secondary leading-relaxed whitespace-pre-line">{section.content}</p>
    </motion.div>
  )
}

function buildSections(data: PortfolioData): SectionDef[] {
  const sections: SectionDef[] = []
  const h = data.meta.sectionHeadings || {}

  sections.push({ id: 'about', label: h.profile || 'About', color: '#3b82f6', content: (d) => <About summary={d.profile.summary} /> })

  if (data.skills.length > 0) {
    sections.push({ id: 'skills', label: h.skills || 'Skills', color: '#a855f7', content: (d) => <Skills skills={d.skills} /> })
  }

  if (data.experience.length > 0) {
    sections.push({ id: 'experience', label: h.experience || 'Experience', color: '#ec4899', content: (d) => <Experience entries={d.experience} /> })
  }

  if (data.projects.length > 0) {
    sections.push({ id: 'projects', label: h.projects || 'Projects', color: '#06b6d4', content: (d) => <Projects projects={d.projects} /> })
  }

  if (data.education.length > 0) {
    sections.push({
      id: 'education',
      label: h.education || 'Education',
      color: '#f59e0b',
      content: (d) => (
        <div className="space-y-6">
          {d.education.map((e, i) => (
            <motion.div
              key={i}
              className="glass-subtle rounded-xl p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <h3 className="text-lg font-semibold text-text-primary">{e.degree}</h3>
              <p className="text-text-muted text-sm">{e.institution}</p>
              {e.year && <p className="text-text-muted text-xs mt-1">{e.year}</p>}
            </motion.div>
          ))}
        </div>
      ),
    })
  }

  // Dynamic "other" sections from the CV
  data.other.forEach((section, i) => {
    const id = `other-${i}`
    const color = DYNAMIC_COLORS[i % DYNAMIC_COLORS.length]
    sections.push({
      id,
      label: section.heading,
      color,
      content: () => <OtherContent section={section} />,
    })
  })

  sections.push({ id: 'ai-log', label: 'AI Build Log', color: '#f97316', content: () => <AIBuildLog /> })
  sections.push({ id: 'contact', label: 'Personal Information', color: '#10b981', content: (d) => <Contact contact={d.contact} /> })

  return sections
}

const ease = [0.16, 1, 0.3, 1] as const

export default function Portfolio() {
  const [data, setData] = useState<PortfolioData>(sampleData)
  const [activeSection, setActiveSection] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/data')
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (json) setData(json)
      })
      .catch(() => {})
  }, [])

  const sections = useMemo(() => buildSections(data), [data])
  const goBack = useCallback(() => setActiveSection(null), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeSection) { e.preventDefault(); goBack() }

      if (sections.length === 0) return

      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        if (!activeSection) { setActiveSection(sections[sections.length - 1].id); return }
        const idx = sections.findIndex((s) => s.id === activeSection)
        const prev = (idx - 1 + sections.length) % sections.length
        setActiveSection(sections[prev].id)
      }

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        if (!activeSection) { setActiveSection(sections[0].id); return }
        const idx = sections.findIndex((s) => s.id === activeSection)
        const next = (idx + 1) % sections.length
        setActiveSection(sections[next].id)
      }

      if ((e.key === 'Enter' || e.key === ' ') && !activeSection) {
        e.preventDefault()
        setActiveSection(sections[0].id)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeSection, goBack, sections])

  const current = activeSection ? sections.find((s) => s.id === activeSection) : null

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: '#070714' }}>
      <AuroraBackground />

      <Suspense fallback={null}>
        <Scene3D
          sections={sections.map((s) => ({ id: s.id, label: s.label }))}
          activeSection={activeSection}
          onSelect={setActiveSection}
          onDismiss={goBack}
        />
      </Suspense>

      {/* Hero overlay */}
      <AnimatePresence>
        {!activeSection && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h1
              className="stellar-text text-[6rem] md:text-[8rem] lg:text-[10rem] font-black leading-[0.85] tracking-tighter"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 0.85, y: 0 }}
              transition={{ duration: 1, ease }}
            >
              {data.meta.initials}
            </motion.h1>
            <motion.p
              className="mt-4 text-sm text-text-muted tracking-[0.4em] uppercase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              {data.meta.title}
            </motion.p>
            <motion.p
              className="mt-10 text-[11px] text-text-secondary/80 tracking-wider"
              style={{ textShadow: '0 1px 6px rgba(0,0,0,0.7)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 1 }}
            >
              drag to rotate · click a marker to explore
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content panel — slides in from right */}
      <AnimatePresence mode="wait">
        {activeSection && current && (
          <motion.div
            key={activeSection}
            className="absolute right-0 top-0 bottom-0 z-20 w-full md:w-[55%] md:min-w-[420px] overflow-y-auto pointer-events-auto"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ duration: 0.6, ease }}
          >
            <div
              className="min-h-full"
              style={{
                background: 'rgba(7,7,20,0.88)',
                backdropFilter: 'blur(40px) saturate(1.3)',
                WebkitBackdropFilter: 'blur(40px) saturate(1.3)',
                borderLeft: `1px solid ${current.color}18`,
              }}
            >
              <div className="sticky top-0 z-30 p-4" style={{ background: 'rgba(7,7,20,0.6)' }}>
                <button
                  onClick={goBack}
                  className="glass inline-flex items-center gap-2 px-4 py-2 text-text-muted hover:text-accent transition-colors text-xs rounded-full cursor-pointer"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  Back
                  <span className="text-[8px] text-text-muted/30 border border-text-muted/10 rounded px-1 py-px ml-1">ESC</span>
                </button>
              </div>

              <div className="px-8 md:px-12 pt-2 pb-20">
                <motion.div
                  className="mb-10"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.6, ease }}
                >
                  <ScrambleTitle text={current.label} color={current.color} />
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.4, duration: 0.7, ease }}
                    style={{
                      transformOrigin: 'left',
                      height: 2,
                      background: `linear-gradient(90deg, transparent 0%, ${current.color} 15%, ${current.color}88 50%, transparent 100%)`,
                      boxShadow: `0 0 12px ${current.color}33, 0 0 30px ${current.color}18`,
                    }}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6, ease }}
                >
                  {current.content(data)}
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload/settings link */}
      <Link
        to="/upload"
        className="fixed bottom-4 right-4 z-30 p-2.5 text-text-muted hover:text-accent transition-colors rounded-full hover:bg-white/5"
        title="Upload CV"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </Link>
    </div>
  )
}
