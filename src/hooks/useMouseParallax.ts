import { useState, useEffect, useCallback } from 'react'

interface ParallaxValues {
  x: number
  y: number
  rotateX: number
  rotateY: number
}

export function useMouseParallax(intensity: number = 15): ParallaxValues {
  const [values, setValues] = useState<ParallaxValues>({ x: 0, y: 0, rotateX: 0, rotateY: 0 })

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2
    const y = (e.clientY / window.innerHeight - 0.5) * 2
    setValues({
      x,
      y,
      rotateY: x * intensity,
      rotateX: -y * intensity,
    })
  }, [intensity])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

  return values
}
