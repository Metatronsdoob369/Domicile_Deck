'use client'

import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

// ── Governance Parameters ───────────────────────────────────
interface RadarParams {
  maxPoints: number
  pollInterval: number
  particleSize: number
  rotationSpeed: number
  autoRotateSpeed: number
  autoRotate: boolean
  heatRange: number
  heatBase: number
  coreOpacity: number
}

const DEFAULT_PARAMS: RadarParams = {
  maxPoints: 2000,
  pollInterval: 3000,
  particleSize: 0.15,
  rotationSpeed: 0.001,
  autoRotateSpeed: 0.5,
  autoRotate: true,
  heatRange: 0.4,
  heatBase: 0.6,
  coreOpacity: 0.3,
}

// ── Safe Presets (pre-tested configurations) ────────────────
const PRESETS: Record<string, Partial<RadarParams>> = {
  LEAN: {
    maxPoints: 500,
    pollInterval: 5000,
    particleSize: 0.1,
    rotationSpeed: 0.0005,
    autoRotateSpeed: 0.3,
  },
  BALANCED: {
    maxPoints: 2000,
    pollInterval: 3000,
    particleSize: 0.15,
    rotationSpeed: 0.001,
    autoRotateSpeed: 0.5,
  },
  PERFORMANCE: {
    maxPoints: 5000,
    pollInterval: 2000,
    particleSize: 0.15,
    rotationSpeed: 0.001,
    autoRotateSpeed: 0.5,
  },
}

const STORAGE_KEY = 'spectra-radar-params'
const HW_HASH_KEY = 'spectra-radar-hw-hash'

// ── Hardware Detection ──────────────────────────────────────
type HardwareClass = 'HIGH' | 'MID' | 'LOW'

interface HardwareProfile {
  cores: number
  memory: number  // GB (0 if unavailable)
  gpu: string
  hwClass: HardwareClass
  hash: string
}

function detectHardware(): HardwareProfile {
  if (typeof window === 'undefined') {
    return { cores: 4, memory: 4, gpu: 'unknown', hwClass: 'MID', hash: 'ssr' }
  }

  const cores = navigator.hardwareConcurrency || 4
  const memory = (navigator as any).deviceMemory || 0 // Chrome-only, 0 = unknown

  // Probe GPU via throwaway WebGL context
  let gpu = 'unknown'
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (gl) {
      const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info')
      if (debugInfo) {
        gpu = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'unknown'
      }
    }
  } catch {}

  // Capability scoring
  let score = 0
  score += cores >= 8 ? 2 : cores >= 4 ? 1 : 0
  score += memory >= 8 ? 2 : memory >= 4 ? 1 : 0 // 0 if unknown = conservative
  const gpuLower = gpu.toLowerCase()
  const isDiscrete = /nvidia|radeon|geforce|rtx|gtx|rx\s/i.test(gpuLower)
  score += isDiscrete ? 2 : /intel|apple|mesa|swiftshader/i.test(gpuLower) ? 1 : 0

  const hwClass: HardwareClass = score >= 5 ? 'HIGH' : score >= 3 ? 'MID' : 'LOW'
  const hash = `${cores}-${memory}-${gpu.slice(0, 30)}`

  return { cores, memory, gpu, hwClass, hash }
}

function presetForHardware(hwClass: HardwareClass): string {
  switch (hwClass) {
    case 'HIGH': return 'PERFORMANCE'
    case 'MID':  return 'BALANCED'
    case 'LOW':  return 'LEAN'
  }
}

// ── Persist / Restore from localStorage ─────────────────────
function loadParams(hw: HardwareProfile): { params: RadarParams; wasCalibrated: boolean } {
  if (typeof window === 'undefined') return { params: { ...DEFAULT_PARAMS }, wasCalibrated: false }

  try {
    const savedHash = localStorage.getItem(HW_HASH_KEY)
    const saved = localStorage.getItem(STORAGE_KEY)

    // If same machine and we have saved settings, restore them
    if (savedHash === hw.hash && saved) {
      return { params: { ...DEFAULT_PARAMS, ...JSON.parse(saved) }, wasCalibrated: false }
    }

    // Different machine or first load → auto-calibrate
    const preset = presetForHardware(hw.hwClass)
    const calibrated = { ...DEFAULT_PARAMS, ...PRESETS[preset] }
    localStorage.setItem(HW_HASH_KEY, hw.hash)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(calibrated))
    return { params: calibrated, wasCalibrated: true }
  } catch {}

  return { params: { ...DEFAULT_PARAMS }, wasCalibrated: false }
}

function saveParams(params: RadarParams) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(params))
  } catch {}
}

// ── Auto-Governor (runs inside Canvas, monitors FPS) ────────
const AutoGovernor = ({
  paramsRef,
  onThrottle,
  onFpsUpdate,
}: {
  paramsRef: React.MutableRefObject<RadarParams>
  onThrottle: (fps: number, newMax: number) => void
  onFpsUpdate: (fps: number) => void
}) => {
  const fpsHistory = useRef<number[]>([])
  const lastThrottle = useRef(0)
  const lastReport = useRef(0)

  useFrame((_, delta) => {
    const fps = 1 / Math.max(delta, 0.001)
    fpsHistory.current.push(fps)

    // Keep a rolling window of 90 frames (~1.5s at 60fps)
    if (fpsHistory.current.length > 90) fpsHistory.current.shift()

    // Only evaluate after we have enough samples
    if (fpsHistory.current.length < 30) return

    const avgFps =
      fpsHistory.current.reduce((a, b) => a + b) / fpsHistory.current.length
    const now = performance.now()

    // Report FPS to HUD gauge every ~500ms
    if (now - lastReport.current > 500) {
      onFpsUpdate(Math.round(avgFps))
      lastReport.current = now
    }

    // Throttle: if average FPS drops below 28, reduce maxPoints
    // Cooldown: only intervene once every 3 seconds
    if (avgFps < 28 && now - lastThrottle.current > 3000) {
      const currentMax = paramsRef.current.maxPoints
      if (currentMax > 300) {
        const newMax = Math.max(300, Math.round(currentMax * 0.7))
        paramsRef.current.maxPoints = newMax
        lastThrottle.current = now
        onThrottle(Math.round(avgFps), newMax)
      }
    }
  })

  return null
}

// ── Particle Field (Three.js inner component) ───────────────
const ParticleField = ({
  points,
  paramsRef,
}: {
  points: any[]
  paramsRef: React.MutableRefObject<RadarParams>
}) => {
  const groupRef = useRef<THREE.Group>(null!)

  const [positions, colors] = useMemo(() => {
    const params = paramsRef.current
    const pos = new Float32Array(points.length * 3)
    const cols = new Float32Array(points.length * 3)

    points.forEach((p, i) => {
      const coords = p.spatial?.layoutVectors || [0, 0, 0]
      pos[i * 3] = (coords[0] || (Math.random() - 0.5)) * 10
      pos[i * 3 + 1] = (coords[1] || (Math.random() - 0.5)) * 10
      pos[i * 3 + 2] = (coords[2] || (Math.random() - 0.5)) * 10

      const color = new THREE.Color()
      const heat = p.overallShatter || 0
      color.setHSL(params.heatBase - heat * params.heatRange, 1, 0.5)
      cols[i * 3] = color.r
      cols[i * 3 + 1] = color.g
      cols[i * 3 + 2] = color.b
    })

    return [pos, cols]
  }, [points, paramsRef])

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += paramsRef.current.rotationSpeed
    }
  })

  return (
    <group ref={groupRef}>
      <Points positions={positions} colors={colors}>
        <PointMaterial
          transparent
          vertexColors
          size={paramsRef.current.particleSize}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>

      <mesh>
        <sphereGeometry args={[0.1, 32, 32]} />
        <meshBasicMaterial
          color="#FFD700"
          transparent
          opacity={paramsRef.current.coreOpacity}
        />
      </mesh>
    </group>
  )
}

// ── Main Component ──────────────────────────────────────────
export function SpectraRadar() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hwProfile] = useState(() => detectHardware())
  const [initState] = useState(() => loadParams(hwProfile))
  const paramsRef = useRef<RadarParams>(initState.params)
  const guiRef = useRef<any>(null)

  const [tick, setTick] = useState(0)
  const [points, setPoints] = useState<any[]>([])
  const [stats, setStats] = useState({
    signature: 'CALIBRATING',
    points: 0,
  })
  const [governorStatus, setGovernorStatus] = useState(
    initState.wasCalibrated
      ? `AUTO-CALIBRATED → ${presetForHardware(hwProfile.hwClass)} (${hwProfile.cores} cores, ${hwProfile.gpu.slice(0, 24)})`
      : ''
  )
  const [currentFps, setCurrentFps] = useState(60)

  // FPS gauge callback (fires ~2x/sec from AutoGovernor)
  const handleFpsUpdate = useCallback((fps: number) => {
    setCurrentFps(fps)
  }, [])

  // Bump: triggers React re-render + persists settings
  const bump = useCallback(() => {
    saveParams(paramsRef.current)
    setTick((t) => t + 1)
  }, [])

  // Auto-Governor callback: fires when FPS triggers a throttle
  const handleThrottle = useCallback((fps: number, newMax: number) => {
    setGovernorStatus(`AUTO-THROTTLE: FPS ${fps} → shards capped at ${newMax}`)
    // Update GUI display to reflect the auto-change
    if (guiRef.current) {
      guiRef.current.controllersRecursive().forEach((c: any) => c.updateDisplay())
    }
    saveParams(paramsRef.current)
    setTick((t) => t + 1)

    // Clear status after 5 seconds
    setTimeout(() => setGovernorStatus(''), 5000)
  }, [])

  // ── lil-gui Initialization ────────────────────────────────
  useEffect(() => {
    let gui: any = null

    import('lil-gui').then((mod) => {
      const GUI = mod.default
      gui = new GUI({
        title: '⚡ SPECTRAL GOVERNANCE',
        container: containerRef.current || undefined,
      })
      guiRef.current = gui

      // Metropolis styling
      Object.assign(gui.domElement.style, {
        position: 'absolute',
        top: '8px',
        right: '8px',
        zIndex: '100',
        '--background-color': 'rgba(0, 0, 0, 0.92)',
        '--text-color': '#999',
        '--title-background-color': 'rgba(255, 215, 0, 0.08)',
        '--title-text-color': '#FFD700',
        '--widget-color': '#1a1a2e',
        '--hover-color': 'rgba(255, 215, 0, 0.12)',
        '--focus-color': '#FFD700',
        '--number-color': '#FFD700',
        '--string-color': '#FFD700',
        '--font-family': "'Courier New', monospace",
        '--font-size': '10px',
      })

      // ── Presets (top-level, always visible) ─────────────
      const presetState = { active: 'BALANCED' }
      gui
        .add(presetState, 'active', Object.keys(PRESETS))
        .name('⚡ Preset')
        .onChange((v: string) => {
          Object.assign(paramsRef.current, PRESETS[v])
          gui.controllersRecursive().forEach((c: any) => c.updateDisplay())
          bump()
        })

      // ── ⚙ Resource Governor ─────────────────────────────
      const perf = gui.addFolder('⚙ RESOURCE GOVERNOR')
      perf
        .add(paramsRef.current, 'maxPoints', 100, 10000, 100)
        .name('Max Shards')
        .onChange(bump)
      perf
        .add(paramsRef.current, 'pollInterval', 1000, 10000, 500)
        .name('Poll Rate (ms)')
        .onChange(bump)
      perf.open()

      // ── 👁 Visual Tuning ────────────────────────────────
      const visual = gui.addFolder('👁 VISUAL TUNING')
      visual
        .add(paramsRef.current, 'particleSize', 0.01, 0.5, 0.01)
        .name('Shard Size')
        .onChange(bump)
      visual
        .add(paramsRef.current, 'rotationSpeed', 0, 0.01, 0.0005)
        .name('Field Drift')
        .onChange(bump)
      visual
        .add(paramsRef.current, 'autoRotate')
        .name('Auto Orbit')
        .onChange(bump)
      visual
        .add(paramsRef.current, 'autoRotateSpeed', 0, 2, 0.1)
        .name('Orbit Speed')
        .onChange(bump)
      visual
        .add(paramsRef.current, 'coreOpacity', 0, 1, 0.05)
        .name('Core Glow')
        .onChange(bump)
      visual.close()

      // ── 🔬 Eve Spectral Config ──────────────────────────
      const spectral = gui.addFolder('🔬 EVE SPECTRAL')
      spectral
        .add(paramsRef.current, 'heatBase', 0, 1, 0.01)
        .name('Heat Base λ')
        .onChange(bump)
      spectral
        .add(paramsRef.current, 'heatRange', 0, 1, 0.01)
        .name('Heat Δ Range')
        .onChange(bump)
      spectral.close()
    })

    return () => {
      if (gui) gui.destroy()
      guiRef.current = null
    }
  }, [bump])

  // ── Telemetry Data Fetching ───────────────────────────────
  useEffect(() => {
    const maxPts = paramsRef.current.maxPoints
    const interval = paramsRef.current.pollInterval

    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:3100/api/telemetry')
        const data = await res.json()
        if (data.spectralReport) {
          const limitedReport = data.spectralReport.slice(0, maxPts)
          setPoints(limitedReport)
          setStats({
            signature: data.safety?.intentSignature || 'ARMED',
            points: data.spectralReport.length,
          })
        }
      } catch (e) {
        // Fallback if telemetry engine is offline
      }
    }

    fetchData()
    const int = setInterval(fetchData, interval)
    return () => clearInterval(int)
  }, [tick])

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[500px] bg-black border border-border overflow-hidden group"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.05)_0%,transparent_70%)]" />

      <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
        <color attach="background" args={['#000']} />
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />

        {points.length > 0 && (
          <ParticleField points={points} paramsRef={paramsRef} />
        )}

        {/* Auto-Governor: monitors FPS, reports gauge, auto-throttles */}
        <AutoGovernor
          paramsRef={paramsRef}
          onThrottle={handleThrottle}
          onFpsUpdate={handleFpsUpdate}
        />

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          autoRotate={paramsRef.current.autoRotate}
          autoRotateSpeed={paramsRef.current.autoRotateSpeed}
        />
      </Canvas>

      {/* HUD Layers */}
      <div className="absolute inset-0 p-8 font-mono text-[9px] uppercase tracking-widest pointer-events-none">
        <div className="absolute top-8 left-8 text-gold">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-gold animate-pulse" />
            <span>SPECTRAL_CORE: A-MEM_3072D</span>
          </div>
          <div>MODE: TOPOLOGICAL AUDIT</div>
          <div className="opacity-50">
            STATUS:{' '}
            {points.length > 0 ? 'REAL-TIME SYNC' : 'SIMULATING...'}
          </div>
          <div className={`mt-1 text-[8px] tracking-[0.15em] ${
            hwProfile.hwClass === 'HIGH' ? 'text-emerald-400/50'
              : hwProfile.hwClass === 'MID' ? 'text-amber-400/50'
              : 'text-red-400/50'
          }`}>
            HW: {hwProfile.hwClass} ({hwProfile.cores}C{hwProfile.memory ? ` / ${hwProfile.memory}GB` : ''} / {hwProfile.gpu.slice(0, 20)})
          </div>
        </div>

        <div className="absolute bottom-8 right-8 text-white/40 text-right">
          <div className="mb-1">SIG: {stats.signature}</div>
          <div>SHARDS: {stats.points}</div>
          <div className="mt-1 text-gold/30">
            RENDER: {points.length} / {paramsRef.current.maxPoints}
          </div>
          <div className="mt-0.5 text-gold/20">
            POLL: {paramsRef.current.pollInterval}ms
          </div>
        </div>

        {/* ── FPS Gauge ──────────────────────────────────── */}
        <div className="absolute bottom-8 left-8">
          <div className="text-[8px] text-white/30 tracking-[0.2em] mb-1">SYSTEM HEALTH</div>
          <div className="flex items-center gap-2">
            <span
              className={`text-[14px] font-bold font-mono ${
                currentFps >= 45
                  ? 'text-emerald-400'
                  : currentFps >= 28
                  ? 'text-amber-400'
                  : 'text-red-400'
              }`}
            >
              {currentFps}
            </span>
            <span className="text-[8px] text-white/20">FPS</span>
          </div>
          {/* Gauge bar */}
          <div className="w-24 h-1.5 bg-white/5 mt-1 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                currentFps >= 45
                  ? 'bg-emerald-400/70'
                  : currentFps >= 28
                  ? 'bg-amber-400/70'
                  : 'bg-red-400/70'
              }`}
              style={{ width: `${Math.min(100, (currentFps / 60) * 100)}%` }}
            />
          </div>
          <div className="text-[7px] text-white/15 mt-0.5">
            {currentFps >= 45
              ? 'NOMINAL'
              : currentFps >= 28
              ? 'ELEVATED — CONSIDER LEAN'
              : 'CRITICAL — AUTO-GOV ACTIVE'}
          </div>

          {/* Auto-Governor Alert */}
          {governorStatus && (
            <div className="mt-2 px-3 py-1.5 bg-red-900/40 border border-red-500/30 text-red-400 text-[9px] tracking-wider animate-pulse">
              🛡 {governorStatus}
            </div>
          )}
        </div>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
        <div className="px-6 py-3 bg-black/80 backdrop-blur-md border border-gold/20 text-center">
          <div className="text-[10px] text-gold/60 mb-1 tracking-[0.3em]">
            REFRAG RESONANCE
          </div>
          <div className="text-xl font-light text-white tracking-[0.2em] uppercase">
            Spectral Radar
          </div>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,215,0,0.03),transparent,rgba(255,215,0,0.03))] bg-[length:100%_2px,3px_100%]" />
    </div>
  )
}
