import { motion } from 'framer-motion'

export default function About({ summary }: { summary: string }) {
  return (
    <motion.div
      className="relative pl-6 max-w-3xl"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Vertical gradient accent */}
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

      <p className="text-lg md:text-xl lg:text-2xl text-text-secondary leading-relaxed font-light">
        {summary}
      </p>
    </motion.div>
  )
}
