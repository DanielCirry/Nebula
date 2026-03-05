import { motion } from 'framer-motion'
import type { ExperienceEntry } from '../../shared/types'

export default function Experience({ entries }: { entries: ExperienceEntry[] }) {
  return (
    <div className="space-y-8">
      {entries.map((entry, i) => (
        <motion.div
          key={`${entry.company}-${entry.role}`}
          className="glass-subtle rounded-xl p-5 md:p-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-start gap-3 mb-4">
            <div
              className="w-2 h-2 rounded-full mt-2 shrink-0"
              style={{
                background: '#00d4ff',
                boxShadow: '0 0 8px rgba(0,212,255,0.6), 0 0 16px rgba(0,212,255,0.3)',
              }}
            />
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-baseline md:justify-between">
                <div>
                  <h3 className="text-lg md:text-xl font-semibold text-text-primary">{entry.role}</h3>
                  <p className="text-sm text-accent/50">{entry.company}</p>
                </div>
                <span className="text-xs font-mono text-text-muted mt-1 md:mt-0 shrink-0 md:ml-4">{entry.period}</span>
              </div>
            </div>
          </div>

          <ul className="space-y-2 pl-5 ml-0.5 border-l border-white/[0.06]">
            {entry.highlights.map((h, j) => (
              <motion.li
                key={j}
                className="text-sm text-text-secondary flex gap-3 pl-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.12 + j * 0.04 }}
              >
                <span className="text-accent/40 shrink-0 mt-0.5">›</span>
                <span>{h}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      ))}
    </div>
  )
}
