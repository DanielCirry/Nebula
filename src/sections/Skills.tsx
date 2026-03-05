import { motion } from 'framer-motion'
import type { SkillCategory } from '../../shared/types'

export default function Skills({ skills }: { skills: SkillCategory[] }) {
  return (
    <div className="space-y-8">
      {skills.map((cat, i) => (
        <motion.div
          key={cat.category}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.5 }}
        >
          <h3 className="text-xs font-medium text-accent/70 mb-3 tracking-[0.3em] uppercase">
            {cat.category}
          </h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {cat.items.map((item, j) => (
              <motion.span
                key={item}
                className="inline-block px-3 py-1.5 text-sm text-text-secondary/70 rounded-lg cursor-default transition-all duration-300"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 + j * 0.02 }}
                whileHover={{
                  borderColor: 'rgba(0,212,255,0.4)',
                  boxShadow: '0 0 20px rgba(0,212,255,0.1), inset 0 0 15px rgba(0,212,255,0.03)',
                  color: '#00d4ff',
                  background: 'rgba(0,212,255,0.04)',
                  scale: 1.05,
                }}
              >
                {item}
              </motion.span>
            ))}
          </div>
          {i < skills.length - 1 && (
            <motion.div
              className="neon-divider"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: i * 0.08 + 0.2, duration: 0.6 }}
              style={{ transformOrigin: 'left' }}
            />
          )}
        </motion.div>
      ))}
    </div>
  )
}
