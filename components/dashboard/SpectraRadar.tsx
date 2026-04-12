'use client'

import React, { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial, OrbitControls, Float } from '@react-three/drei'
import * as THREE from 'three'

const ParticleField = ({ points }: { points: any[] }) => {
  const ref = useRef<any>()
  
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(points.length * 3)
    const cols = new Float32Array(points.length * 3)
    
    points.forEach((p, i) => {
      // Use spatial coordinates if available, else random
      const coords = p.spatial?.layoutVectors || [0,0,0]
      // Project 3072D to 3D roughly for visualization if needed, 
      // but here we take the first 3 dimensions for the "Radar" feel
      pos[i * 3] = (coords[0] || (Math.random() - 0.5)) * 10
      pos[i * 3 + 1] = (coords[1] || (Math.random() - 0.5)) * 10
      pos[i * 3 + 2] = (coords[2] || (Math.random() - 0.5)) * 10
      
      const color = new THREE.Color()
      // Heat based on overallShatter or a heat metric
      const heat = p.overallShatter || 0
      color.setHSL(0.6 - heat * 0.4, 1, 0.5) 
      cols[i * 3] = color.r
      cols[i * 3 + 1] = color.g
      cols[i * 3 + 2] = color.b
    })
    
    return [pos, cols]
  }, [points])

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.001
    }
  })

  return (
    <group ref={ref}>
      <Points positions={positions} colors={colors}>
        <PointMaterial
          transparent
          vertexColors
          size={0.15}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
      
      <mesh>
        <sphereGeometry args={[0.1, 32, 32]} />
        <meshBasicMaterial color="#FFD700" transparent opacity={0.3} />
      </mesh>
    </group>
  )
}

export function SpectraRadar() {
  const MAX_POINTS = 5000; // Plugin Allowance: Stabilize GPU/RAM during high-volume un-mocking
  const [points, setPoints] = useState<any[]>([])
  const [stats, setStats] = useState({
    signature: 'CALIBRATING',
    points: 0
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:3100/api/telemetry')
        const data = await res.json()
        if (data.spectralReport) {
           // Enforce Allowance
           const limitedReport = data.spectralReport.slice(0, MAX_POINTS)
           setPoints(limitedReport)
           setStats({
             signature: data.safety?.intentSignature || 'ARMED',
             points: data.spectralReport.length // Show true count in HUD, but render limited
           })
        }
      } catch (e) {
        // Fallback to mock if offline
      }
    }
    
    fetchData()
    const int = setInterval(fetchData, 3000)
    return () => clearInterval(int)
  }, [])

  return (
    <div className="relative w-full h-[500px] bg-black border border-border overflow-hidden group">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.05)_0%,transparent_70%)]" />
      
      <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
        <color attach="background" args={['#000']} />
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        {points.length > 0 && <ParticleField points={points} />}
        
        <OrbitControls enableZoom={true} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>

      {/* HUD Layers */}
      <div className="absolute inset-0 p-8 font-mono text-[9px] uppercase tracking-widest pointer-events-none">
         <div className="absolute top-8 left-8 text-gold">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-gold animate-pulse" />
              <span>SPECTRAL_CORE: A-MEM_3072D</span>
            </div>
            <div>MODE: TOPOLOGICAL AUDIT</div>
            <div className="opacity-50">STATUS: {points.length > 0 ? 'REAL-TIME SYNC' : 'SIMULATING...'}</div>
         </div>
         
         <div className="absolute bottom-8 right-8 text-white/40 text-right">
            <div className="mb-1">SIG: {stats.signature}</div>
            <div>SHARDS: {stats.points}</div>
         </div>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
         <div className="px-6 py-3 bg-black/80 backdrop-blur-md border border-gold/20 text-center">
            <div className="text-[10px] text-gold/60 mb-1 tracking-[0.3em]">REFRAG RESONANCE</div>
            <div className="text-xl font-light text-white tracking-[0.2em] uppercase">Spectral Radar</div>
         </div>
      </div>

      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,215,0,0.03),transparent,rgba(255,215,0,0.03))] bg-[length:100%_2px,3px_100%]" />
    </div>
  )
}
