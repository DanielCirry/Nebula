import { useState, useEffect, useRef, useMemo } from 'react'
import { motion } from 'framer-motion'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*<>[]{}~/\\|'

interface ScrambleTitleProps {
  text: string
  color: string
}

export default function ScrambleTitle({ text, color }: ScrambleTitleProps) {
  const [display, setDisplay] = useState(text)
  const rafRef = useRef<number>(0)
  const startRef = useRef(0)

  // Pick ~30% of non-space character indices to scramble
  const scrambleIndices = useMemo(() => {
    const indices: number[] = []
    for (let i = 0; i < text.length; i++) {
      if (text[i] !== ' ') indices.push(i)
    }
    // Shuffle and take ~30%
    const shuffled = [...indices].sort(() => Math.random() - 0.5)
    return new Set(shuffled.slice(0, Math.max(2, Math.ceil(indices.length * 0.3))))
  }, [text])

  useEffect(() => {
    const duration = 600
    const staggerPerChar = 50
    startRef.current = performance.now()

    const animate = (now: number) => {
      const elapsed = now - startRef.current
      let result = ''

      for (let i = 0; i < text.length; i++) {
        if (text[i] === ' ') {
          result += ' '
          continue
        }

        if (!scrambleIndices.has(i)) {
          // Non-scrambled chars fade in immediately
          result += text[i]
          continue
        }

        const charDelay = i * staggerPerChar
        const charElapsed = elapsed - charDelay

        if (charElapsed >= duration) {
          result += text[i]
        } else if (charElapsed > 0) {
          result += CHARS[Math.floor(Math.random() * CHARS.length)]
        } else {
          result += CHARS[Math.floor(Math.random() * CHARS.length)]
        }
      }

      setDisplay(result)

      if (elapsed < duration + text.length * staggerPerChar) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        setDisplay(text)
      }
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [text, scrambleIndices])

  // Split by words for proper spacing
  const words = text.split(' ')
  let charIndex = 0

  return (
    <motion.h1
      className="text-4xl md:text-6xl font-bold mb-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
    >
      {words.map((word, wi) => {
        const startIdx = charIndex
        charIndex += word.length + 1 // +1 for the space

        return (
          <span key={wi}>
            {wi > 0 && <span style={{ display: 'inline-block', width: '0.35em' }}>{' '}</span>}
            <span
              style={{
                color,
                textShadow: `0 0 30px ${color}44, 0 0 60px ${color}22`,
              }}
            >
              {word.split('').map((_, ci) => {
                const globalIdx = startIdx + ci
                const displayChar = display[globalIdx] || text[globalIdx]
                const isResolved = displayChar === text[globalIdx]
                const isScrambled = scrambleIndices.has(globalIdx)

                return (
                  <span
                    key={ci}
                    style={{
                      display: 'inline-block',
                      opacity: isResolved ? 1 : 0.4,
                      transform: !isResolved && isScrambled ? `translateY(${Math.random() > 0.5 ? -1 : 1}px)` : 'none',
                      transition: 'opacity 0.15s',
                    }}
                  >
                    {displayChar}
                  </span>
                )
              })}
            </span>
          </span>
        )
      })}
    </motion.h1>
  )
}
