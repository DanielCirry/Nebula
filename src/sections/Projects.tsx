import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ProjectEntry } from '../../shared/types'

function ProjectItem({ project, index }: { project: ProjectEntry; index: number }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      className="glass-subtle rounded-xl overflow-hidden transition-all duration-300"
      style={{
        borderColor: expanded ? 'rgba(0,212,255,0.15)' : undefined,
        boxShadow: expanded ? '0 0 40px rgba(0,212,255,0.04)' : undefined,
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <button
        className="w-full text-left cursor-pointer group p-5"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-lg font-semibold text-text-primary group-hover:text-accent transition-colors duration-300">
              {project.name}
            </h3>
            {project.company && (
              <p className="text-xs text-accent-secondary/40">{project.company}</p>
            )}
          </div>
          <motion.span
            className="text-text-muted/30 text-xs mt-1.5"
            animate={{ rotate: expanded ? 180 : 0 }}
          >
            ▾
          </motion.span>
        </div>
        <p className="text-sm text-text-secondary/60">{project.description}</p>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">
              <div className="h-px bg-white/[0.04] mb-4" />
              {project.role && (
                <p className="text-xs text-text-muted mb-3">Role: {project.role}</p>
              )}
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tech.map((t) => (
                  <motion.span
                    key={t}
                    className="px-2.5 py-1 text-[10px] text-accent/60 rounded-md transition-all duration-300"
                    style={{
                      background: 'rgba(0,212,255,0.04)',
                      border: '1px solid rgba(0,212,255,0.12)',
                    }}
                    whileHover={{
                      borderColor: 'rgba(0,212,255,0.4)',
                      boxShadow: '0 0 12px rgba(0,212,255,0.1)',
                      color: '#00d4ff',
                    }}
                  >
                    {t}
                  </motion.span>
                ))}
              </div>
              {(project.highlights?.length ?? 0) > 0 && (
                <ul className="space-y-1.5">
                  {project.highlights!.map((h, j) => (
                    <li key={j} className="text-xs text-text-secondary flex gap-2">
                      <span className="text-accent/30 shrink-0">›</span>
                      {h}
                    </li>
                  ))}
                </ul>
              )}
              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 text-xs text-accent hover:text-accent-warm transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  View project →
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function Projects({ projects }: { projects: ProjectEntry[] }) {
  return (
    <div className="space-y-4">
      {projects.map((p, i) => (
        <ProjectItem key={p.name} project={p} index={i} />
      ))}
    </div>
  )
}
