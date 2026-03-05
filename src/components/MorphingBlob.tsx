import { useEffect, useState } from 'react'
import { motion, animate, useMotionValue, useTransform } from 'framer-motion'
import { interpolate } from 'flubber'

// Organic blob path shapes (viewBox 0 0 200 200)
const BLOB_PATHS = [
  'M 100,20 C 140,20 180,50 180,100 C 180,150 140,180 100,180 C 60,180 20,150 20,100 C 20,50 60,20 100,20 Z',
  'M 110,15 C 160,25 185,65 175,110 C 165,155 125,185 80,175 C 35,165 10,125 25,80 C 40,35 65,10 110,15 Z',
  'M 95,10 C 145,15 190,55 180,105 C 170,155 130,190 80,180 C 30,170 5,130 15,80 C 25,30 50,5 95,10 Z',
  'M 105,18 C 155,30 175,70 170,115 C 165,160 120,188 75,178 C 30,168 12,120 22,75 C 32,30 55,8 105,18 Z',
  'M 100,12 C 150,18 188,58 178,108 C 168,158 128,185 78,175 C 28,165 8,118 18,68 C 28,18 55,8 100,12 Z',
]

interface MorphingBlobProps {
  size?: number
  color?: string
  opacity?: number
  className?: string
  duration?: number
}

export default function MorphingBlob({
  size = 300,
  color = 'rgba(245, 158, 11, 0.12)',
  opacity = 1,
  className = '',
  duration = 4,
}: MorphingBlobProps) {
  const [pathIndex, setPathIndex] = useState(0)
  const progress = useMotionValue(pathIndex)

  const indices = BLOB_PATHS.map((_, i) => i)
  const path = useTransform(progress, indices, BLOB_PATHS, {
    mixer: (a, b) => interpolate(a, b, { maxSegmentLength: 2 }),
  })

  useEffect(() => {
    const anim = animate(progress, pathIndex, {
      duration,
      ease: 'easeInOut',
      onComplete: () => {
        setPathIndex((prev) => (prev + 1) % BLOB_PATHS.length)
      },
    })
    return () => anim.stop()
  }, [pathIndex, duration, progress])

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      style={{ opacity }}
    >
      <motion.path d={path} fill={color} />
    </svg>
  )
}
