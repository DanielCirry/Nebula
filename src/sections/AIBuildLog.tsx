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
          This portfolio was built with AI-assisted development. The design, code, CV parsing
          logic, and 3D scene were all produced through a collaborative process between a
          developer and AI. Powered by React, Three.js, TypeScript, Tailwind CSS, and Azure
          serverless functions.
        </p>
      </div>
    </motion.div>
  )
}
