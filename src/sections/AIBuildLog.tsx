import { motion } from 'framer-motion'

export default function AIBuildLog() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="font-mono text-sm leading-relaxed max-w-2xl">
        <p className="text-accent/50 mb-2 text-xs tracking-wider">{'>'} system.log</p>
        <p className="text-text-secondary">
          This site was built by parsing a CV document, pulling out each section automatically,
          and turning it all into the interactive portfolio you're looking at now.
          Powered by React, TypeScript, Tailwind CSS, and Azure.
        </p>
      </div>
    </motion.div>
  )
}
