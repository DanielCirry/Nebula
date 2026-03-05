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
          This portfolio was generated from a CV document using AI-assisted development.
          The system parses DOCX files, intelligently detects and normalizes sections,
          and renders them into this interactive site. Built with React, TypeScript,
          Tailwind CSS, and Azure serverless functions.
        </p>
      </div>
    </motion.div>
  )
}
