import { useEffect, useRef } from 'react'

export default function AuroraBackground() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onMove = (e: MouseEvent) => {
      el.style.setProperty('--mx', `${e.clientX / window.innerWidth}`)
      el.style.setProperty('--my', `${e.clientY / window.innerHeight}`)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <div
      ref={ref}
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none"
      style={{ '--mx': '0.5', '--my': '0.5' } as React.CSSProperties}
    >
      {/* Base gradient — deep navy to purple */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #070714 0%, #0d0d2b 40%, #1a0a2e 70%, #0a0a1a 100%)',
        }}
      />

      {/* Vibrant mesh blobs */}
      <div
        className="absolute"
        style={{
          width: '55vw',
          height: '55vh',
          left: '-5%',
          top: '-10%',
          background: 'radial-gradient(circle, rgba(0,212,255,0.12) 0%, transparent 65%)',
          filter: 'blur(80px)',
          animation: 'mesh-drift-1 20s ease-in-out infinite',
          willChange: 'transform',
        }}
      />
      <div
        className="absolute"
        style={{
          width: '50vw',
          height: '50vh',
          right: '-10%',
          top: '15%',
          background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 65%)',
          filter: 'blur(80px)',
          animation: 'mesh-drift-2 25s ease-in-out infinite',
          willChange: 'transform',
        }}
      />
      <div
        className="absolute"
        style={{
          width: '50vw',
          height: '45vh',
          left: '25%',
          bottom: '-10%',
          background: 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 65%)',
          filter: 'blur(80px)',
          animation: 'mesh-drift-3 22s ease-in-out infinite',
          willChange: 'transform',
        }}
      />
      <div
        className="absolute"
        style={{
          width: '40vw',
          height: '40vh',
          left: '10%',
          top: '40%',
          background: 'radial-gradient(circle, rgba(129,140,248,0.07) 0%, transparent 65%)',
          filter: 'blur(80px)',
          animation: 'mesh-drift-4 28s ease-in-out infinite',
          willChange: 'transform',
        }}
      />

      {/* Cursor-reactive glow — cyan tinted */}
      <div
        className="absolute"
        style={{
          width: '40vw',
          height: '40vh',
          left: 'calc(var(--mx) * 100% - 20vw)',
          top: 'calc(var(--my) * 100% - 20vh)',
          background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, rgba(168,85,247,0.03) 40%, transparent 60%)',
          filter: 'blur(60px)',
          transition: 'left 0.6s ease-out, top 0.6s ease-out',
        }}
      />

      {/* Noise grain */}
      <svg className="fixed inset-0 w-full h-full" style={{ opacity: 0.025, mixBlendMode: 'overlay' as const }}>
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>

      {/* Vignette */}
      <div
        className="fixed inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 40%, transparent 30%, rgba(7,7,20,0.5) 100%)',
        }}
      />
    </div>
  )
}
