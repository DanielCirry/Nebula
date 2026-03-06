import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber'
import { OrbitControls, Html, shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'

interface Section { id: string; label: string }
interface SceneProps {
  sections: Section[]
  activeSection: string | null
  onSelect: (id: string) => void
  onDismiss?: () => void
}

const HOTSPOT_ANGLES_BASE = [
  { theta: 0.3, phi: 0.7 },
  { theta: 1.8, phi: 1.1 },
  { theta: -1.3, phi: 0.8 },
  { theta: 2.6, phi: 1.9 },
  { theta: -2.4, phi: 1.7 },
  { theta: 3.14, phi: 2.3 },
]

function getHotspotAngles(count: number) {
  if (count <= HOTSPOT_ANGLES_BASE.length) return HOTSPOT_ANGLES_BASE.slice(0, count)
  // Generate extra positions evenly distributed
  const angles = [...HOTSPOT_ANGLES_BASE]
  for (let i = HOTSPOT_ANGLES_BASE.length; i < count; i++) {
    const goldenAngle = 2.399963 // radians
    const theta = goldenAngle * i
    const phi = Math.acos(1 - (2 * (i + 0.5)) / (count + 2))
    angles.push({ theta, phi })
  }
  return angles
}

function toXYZ(theta: number, phi: number, r: number): [number, number, number] {
  return [
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  ]
}

// ─── Simplex noise (GLSL) ───
const NOISE_GLSL = /* glsl */ `
  vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 1.0/7.0;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
`

// ─────────────────────────────────────────────
// COSMIC NEBULA — FBM domain-warped gas planet
// Original purple/starry look, no post-processing bloom
// ─────────────────────────────────────────────
const CosmicNebulaMaterial = shaderMaterial(
  {
    uTime: 0,
    uDistort: 0.2,
    uColor1: new THREE.Color('#7c3aed'),
    uColor2: new THREE.Color('#ec4899'),
    uColor3: new THREE.Color('#06b6d4'),
    uBrightness: 0.7,
  },
  // Vertex — gentle undulating surface
  /* glsl */ `
    uniform float uTime;
    uniform float uDistort;

    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vObjectPos;

    ${NOISE_GLSL}

    void main() {
      vObjectPos = position;

      float n1 = snoise(position * 0.4 + uTime * 0.08);
      float n2 = snoise(position * 0.7 - vec3(uTime * 0.05, 0.0, uTime * 0.03));
      float displacement = (n1 * 0.7 + n2 * 0.3) * uDistort;

      vec3 newPos = position + normal * displacement;
      vPosition = (modelMatrix * vec4(newPos, 1.0)).xyz;
      vNormal = normalize(normalMatrix * normal);

      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
    }
  `,
  // Fragment — FBM domain-warped nebula with sparkles
  /* glsl */ `
    uniform float uTime;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    uniform float uBrightness;

    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vObjectPos;

    ${NOISE_GLSL}

    // FBM — unrolled, no loop (avoids driver flicker on some GPUs)
    float fbm(vec3 p) {
      float v = 0.0;
      v += 0.5000 * snoise(p * 1.0);
      v += 0.2500 * snoise(p * 2.0);
      v += 0.1250 * snoise(p * 4.0);
      return v;
    }

    void main() {
      vec3 N = normalize(vNormal);
      vec3 V = normalize(cameraPosition - vPosition);
      float t = uTime * 0.04;

      // Domain warping — swirling gaseous flow
      vec3 q = vObjectPos * 0.8;
      float f1 = fbm(q + vec3(t, 0.0, t * 0.7));
      float f2 = fbm(q + vec3(f1 * 1.5, t * 0.5, f1));
      float f3 = fbm(q + vec3(f2 * 1.2, f1 * 0.8, t * 0.3));

      // Layer colors — purple-heavy nebula palette
      vec3 color = mix(uColor1 * 0.3, uColor1, smoothstep(-0.4, 0.3, f2));
      color = mix(color, uColor2, smoothstep(-0.1, 0.5, f3));
      color = mix(color, uColor3 * 1.2, smoothstep(0.1, 0.6, f1 * f3));

      // Dark void regions
      float voidMask = smoothstep(-0.3, 0.1, fbm(vObjectPos * 1.2 - vec3(0.0, t * 0.3, 0.0)));
      color *= 0.08 + voidMask * 0.92;

      // Core emission glow
      float coreDist = length(vObjectPos);
      color += mix(uColor2, uColor3, 0.5) * exp(-coreDist * 1.5) * 0.3;

      // Bright filaments
      float filament = smoothstep(0.3, 0.7, fbm(vObjectPos * 3.0 + vec3(t * 0.6)));
      color += filament * filament * uColor3 * 0.6;

      // Star sparkles — multiple layers for dense starfield
      float s1 = smoothstep(0.72, 0.92, snoise(vObjectPos * 12.0 + vec3(0.0, t * 0.1, 0.0)));
      float s2 = smoothstep(0.68, 0.88, snoise(vObjectPos * 20.0 - vec3(t * 0.08, 0.0, t * 0.05)));
      float s3 = smoothstep(0.78, 0.95, snoise(vObjectPos * 35.0 + vec3(t * 0.03, t * 0.06, 0.0)));
      // Faint dim stars everywhere
      float sDim = smoothstep(0.4, 0.7, snoise(vObjectPos * 50.0)) * 0.12;
      float sparkle = s1 + s2 * 0.7 + s3 * 0.5 + sDim;
      // Tint some stars warm, keep most white
      vec3 starColor = mix(vec3(1.0, 0.95, 0.85), vec3(0.85, 0.9, 1.0), step(0.5, s2));
      color += sparkle * starColor * 0.6;

      // Fresnel atmospheric glow
      float fresnel = 1.0 - max(dot(N, V), 0.0);
      fresnel = fresnel * fresnel * fresnel;
      vec3 atmosColor = mix(uColor1, uColor3, 0.6);
      color += fresnel * atmosColor * 0.5;

      color *= uBrightness;
      gl_FragColor = vec4(color, 1.0);
    }
  `
)

extend({ CosmicNebulaMaterial })

declare global {
  namespace JSX {
    interface IntrinsicElements {
      cosmicNebulaMaterial: any
    }
  }
}

// Per-section blob personality
const SECTION_PROFILES: Record<string, {
  distort: number; speed: number; brightness: number
  color1: string; color2: string; color3: string
}> = {
  skills:     { distort: 0.35, speed: 1.2, brightness: 0.9, color1: '#8b5cf6', color2: '#c084fc', color3: '#06b6d4' },
  projects:   { distort: 0.15, speed: 0.5, brightness: 0.8, color1: '#06b6d4', color2: '#22d3ee', color3: '#3b82f6' },
  experience: { distort: 0.25, speed: 0.8, brightness: 0.85, color1: '#ec4899', color2: '#f472b6', color3: '#a855f7' },
  about:      { distort: 0.12, speed: 0.3, brightness: 0.7, color1: '#3b82f6', color2: '#60a5fa', color3: '#8b5cf6' },
  'ai-log':   { distort: 0.45, speed: 1.8, brightness: 1.0, color1: '#f97316', color2: '#fbbf24', color3: '#ec4899' },
  contact:    { distort: 0.18, speed: 0.6, brightness: 0.75, color1: '#10b981', color2: '#34d399', color3: '#06b6d4' },
}

const SECTION_ACCENTS: Record<string, string> = {
  skills: '#a855f7', projects: '#06b6d4', experience: '#ec4899',
  about: '#3b82f6', 'ai-log': '#f97316', contact: '#10b981',
}

const noRaycast = () => null

function AtmosphereHalo({ color, opacity = 0.25 }: { color: THREE.Color; opacity?: number }) {
  const matRef = useRef<THREE.ShaderMaterial>(null!)

  const uniforms = useMemo(() => ({
    uColor: { value: color },
    uOpacity: { value: opacity },
  }), [])

  useFrame(() => {
    if (matRef.current) {
      matRef.current.uniforms.uColor.value.lerp(color, 0.03)
      matRef.current.uniforms.uOpacity.value = THREE.MathUtils.lerp(
        matRef.current.uniforms.uOpacity.value, opacity, 0.03
      )
    }
  })

  return (
    <mesh raycast={noRaycast} scale={[1.15, 1.15, 1.15]}>
      <sphereGeometry args={[1.5, 64, 64]} />
      <shaderMaterial
        ref={matRef}
        transparent
        depthWrite={false}
        side={THREE.BackSide}
        uniforms={uniforms}
        vertexShader={/* glsl */ `
          varying vec3 vNormal;
          varying vec3 vViewDir;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vViewDir = normalize(cameraPosition - worldPos.xyz);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={/* glsl */ `
          uniform vec3 uColor;
          uniform float uOpacity;
          varying vec3 vNormal;
          varying vec3 vViewDir;
          void main() {
            float rim = 1.0 - max(dot(vNormal, vViewDir), 0.0);
            float glow = pow(rim, 2.5) * uOpacity;
            gl_FragColor = vec4(uColor, glow);
          }
        `}
      />
    </mesh>
  )
}

function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return mobile
}

function BlobScene({ sections, activeSection, onSelect }: SceneProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const matRef = useRef<any>(null!)
  const [hovered, setHovered] = useState<string | null>(null)
  const isMobile = useIsMobile()
  const { camera } = useThree()

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera
    cam.fov = isMobile ? 75 : 45
    cam.updateProjectionMatrix()
  }, [isMobile, camera])

  const targetPos = useMemo(
    () => (activeSection ? new THREE.Vector3(isMobile ? -1.2 : -3.0, isMobile ? -1.5 : 0, 0) : new THREE.Vector3(0, 0, 0)),
    [activeSection, isMobile]
  )
  const targetScale = activeSection ? (isMobile ? 0.35 : 0.55) : 1

  const defaultProfile = { distort: 0.2, speed: 0.7, brightness: 0.8, color1: '#6366f1', color2: '#a78bfa', color3: '#06b6d4' }
  const profile = activeSection ? (SECTION_PROFILES[activeSection] || defaultProfile) : null
  const targetDistort = profile ? profile.distort : hovered ? 0.2 : 0.15
  const targetBrightness = profile ? profile.brightness : 0.7
  const targetColor1 = useMemo(() => new THREE.Color(profile?.color1 || '#7c3aed'), [activeSection])
  const targetColor2 = useMemo(() => new THREE.Color(profile?.color2 || '#ec4899'), [activeSection])
  const targetColor3 = useMemo(() => new THREE.Color(profile?.color3 || '#06b6d4'), [activeSection])

  const distortRef = useRef(0.15)
  const brightnessRef = useRef(0.7)
  const color1Ref = useRef(new THREE.Color('#7c3aed'))
  const color2Ref = useRef(new THREE.Color('#ec4899'))
  const color3Ref = useRef(new THREE.Color('#06b6d4'))
  const timeRef = useRef(0)
  const speedRef = useRef(1.0)
  const targetSpeed = profile ? profile.speed : 1.0

  const haloColor = useMemo(() => {
    const c = new THREE.Color()
    c.copy(targetColor1).lerp(targetColor3, 0.5)
    return c
  }, [activeSection])

  useFrame((_, delta) => {
    groupRef.current.position.lerp(targetPos, 0.03)
    const s = THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.03)
    groupRef.current.scale.setScalar(s)

    distortRef.current = THREE.MathUtils.lerp(distortRef.current, targetDistort, 0.035)
    speedRef.current = THREE.MathUtils.lerp(speedRef.current, targetSpeed, 0.035)
    brightnessRef.current = THREE.MathUtils.lerp(brightnessRef.current, targetBrightness, 0.03)
    color1Ref.current.lerp(targetColor1, 0.03)
    color2Ref.current.lerp(targetColor2, 0.03)
    color3Ref.current.lerp(targetColor3, 0.03)

    timeRef.current += delta * speedRef.current

    if (matRef.current) {
      matRef.current.uTime = timeRef.current
      matRef.current.uDistort = distortRef.current
      matRef.current.uBrightness = brightnessRef.current
      matRef.current.uColor1 = color1Ref.current
      matRef.current.uColor2 = color2Ref.current
      matRef.current.uColor3 = color3Ref.current
    }
  })

  return (
    <group ref={groupRef}>
      <mesh raycast={noRaycast}>
        <sphereGeometry args={[1.5, 128, 128]} />
        <cosmicNebulaMaterial ref={matRef} />
      </mesh>

      <AtmosphereHalo color={haloColor} />

      {(() => {
        const angles = getHotspotAngles(sections.length)
        const dynColors = ['#f59e0b', '#14b8a6', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899']
        const hotspotRadius = isMobile ? 1.7 : 2.3
        return sections.map((section, i) => {
        const pos = toXYZ(angles[i].theta, angles[i].phi, hotspotRadius)
        const isHot = hovered === section.id
        const isActive = activeSection === section.id
        const accent = SECTION_ACCENTS[section.id] || dynColors[i % dynColors.length]
        return (
          <group key={section.id} position={pos}>
            <mesh
              onClick={(e) => { e.stopPropagation(); onSelect(section.id) }}
              onPointerEnter={() => { setHovered(section.id); document.body.style.cursor = 'pointer' }}
              onPointerLeave={() => { setHovered(null); document.body.style.cursor = '' }}
            >
              <sphereGeometry args={[0.25, 8, 8]} />
              <meshBasicMaterial transparent opacity={0} />
            </mesh>
            <mesh raycast={noRaycast}>
              <sphereGeometry args={[isHot ? 0.18 : 0.11, 16, 16]} />
              <meshBasicMaterial color={isActive ? '#ffffff' : accent} transparent opacity={isHot ? 0.45 : 0.12} />
            </mesh>
            <mesh raycast={noRaycast}>
              <sphereGeometry args={[isHot ? 0.07 : 0.045, 16, 16]} />
              <meshBasicMaterial color={isHot || isActive ? '#ffffff' : accent} />
            </mesh>
            <Html
              center
              distanceFactor={isMobile ? 8 : 10}
              zIndexRange={[50, 40]}
              style={{ pointerEvents: 'auto', transform: `translateY(${isMobile ? '-14px' : '-20px'})` }}
            >
              <div
                onClick={(e) => { e.stopPropagation(); onSelect(section.id) }}
                onMouseEnter={() => { setHovered(section.id); document.body.style.cursor = 'pointer' }}
                onMouseLeave={() => { setHovered(null); document.body.style.cursor = '' }}
                style={{
                  color: 'white',
                  fontSize: isMobile ? 10 : 12,
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  opacity: isActive ? 1 : isHot ? 1 : 0.6,
                  textShadow: isHot || isActive ? `0 0 16px ${accent}` : '0 0 8px rgba(0,0,0,0.9)',
                  transition: 'all 0.3s ease',
                  userSelect: 'none',
                  padding: '6px 10px',
                }}
              >
                {section.label}
              </div>
            </Html>
          </group>
        )
      })
      })()}
    </group>
  )
}

export default function Scene3D({ sections, activeSection, onSelect, onDismiss }: SceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      style={{ position: 'absolute', inset: 0, zIndex: 10 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onPointerMissed={() => { if (activeSection && onDismiss) onDismiss() }}
    >
      <BlobScene sections={sections} activeSection={activeSection} onSelect={onSelect} />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate={!activeSection}
        autoRotateSpeed={0.2}
        enabled={!activeSection}
        minPolarAngle={Math.PI * 0.25}
        maxPolarAngle={Math.PI * 0.75}
      />
    </Canvas>
  )
}
