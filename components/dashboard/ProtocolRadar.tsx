'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TelemetryData {
  signature: string;
  stability: string;
  latency: string;
  vampireDrains: any[];
  auditLog: any[];
}

export function ProtocolRadar() {
  const [data, setData] = useState<TelemetryData | null>(null)
  const [pulse, setPulse] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:3100/api/telemetry')
        const raw = await res.json()
        setData({
          signature: raw.safety?.intentSignature || 'V(0.0, 0.0, 0.0)',
          stability: `${raw.phaseGates?.gauges?.stability?.value || 0}%`,
          latency: `${raw.phaseGates?.gauges?.performance?.value || 0}ms`,
          vampireDrains: raw.vampireDrains || [],
          auditLog: raw.auditLog || []
        })
      } catch (e) {
        console.warn('OMC Telemetry offline.')
      }
    }

    fetchData()
    const int = setInterval(fetchData, 2500)
    const pulseInt = setInterval(() => setPulse(p => (p + 1) % 100), 50)
    return () => { clearInterval(int); clearInterval(pulseInt); }
  }, [])

  return (
    <div className="relative w-full h-[500px] bg-black border border-border overflow-hidden group">
      {/* Dynamic Grid Background */}
      <div 
        className="absolute inset-0 opacity-10" 
        style={{ 
          backgroundImage: 'linear-gradient(to right, #14141d 1px, transparent 1px), linear-gradient(to bottom, #14141d 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} 
      />

      {/* Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(92,92,255,0.05)_0%,transparent_70%)]" />

      {/* Main Engine Visual (The "Dec") */}
      <div className="absolute inset-0 flex items-center justify-center p-12">
        <div className="relative w-full h-full flex items-center justify-center">
          
          {/* Thermal Feed Mock / Image */}
          <div 
            className="absolute w-[440px] h-[440px] border-radius-[50%] opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-700 blur-[2px] group-hover:blur-0"
            style={{
              background: 'url("http://localhost:3100/thermal_view.png") center/cover no-repeat',
              borderRadius: '50%',
              maskImage: 'radial-gradient(circle, black 40%, transparent 75%)',
              WebkitMaskImage: 'radial-gradient(circle, black 40%, transparent 75%)',
            }}
          />

          {/* Crosshairs & Scope */}
          <div className="absolute w-[500px] h-[500px] flex items-center justify-center pointer-events-none">
            <div className="absolute w-full h-[1px] bg-white/5" />
            <div className="absolute w-[1px] h-full bg-white/5" />
            
            {/* Brackets */}
            <div className="absolute top-[80px] left-[80px] w-12 h-12 border-t border-l border-gold-dim group-hover:border-gold transition-all duration-500" />
            <div className="absolute top-[80px] right-[80px] w-12 h-12 border-t border-r border-gold-dim group-hover:border-gold transition-all duration-500" />
            <div className="absolute bottom-[80px] left-[80px] w-12 h-12 border-b border-l border-gold-dim group-hover:border-gold transition-all duration-500" />
            <div className="absolute bottom-[80px] right-[80px] w-12 h-12 border-b border-r border-gold-dim group-hover:border-gold transition-all duration-500" />
          </div>

          {/* Acquisition HUD Overlay */}
          <div className="absolute inset-0 p-8 font-mono text-[9px] uppercase tracking-widest pointer-events-none">
             <div className="absolute top-8 left-8 text-gold">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-gold animate-pulse" />
                  <span>TRK_SYS: KITE-OPTIC_01</span>
                </div>
                <div>MODE: THERMAL / NIGHT</div>
                <div className="opacity-50">STATUS: ACQUIRING...</div>
             </div>
             
             <div className="absolute bottom-8 right-8 text-indigo text-right">
                <div className="mb-1">LOCK_SIG: {data?.signature || 'CALIBRATING'}</div>
                <div>LOCKED: {data ? 'TRUE' : 'FALSE'}</div>
                <div className="text-gold">CONTRACT: {data ? 'STABLE' : 'ARMED'}</div>
             </div>
          </div>

          {/* Center Protocol Command Hub */}
          <motion.div 
            initial={false}
            animate={{ scale: data ? 1 : 0.95 }}
            className="z-10 bg-black/80 backdrop-blur-xl border border-border-bright p-8 px-12 text-center shadow-[0_0_50px_rgba(0,0,0,0.5)] group-hover:border-gold transition-all duration-500"
          >
            <div className="font-mono text-[10px] text-gold mb-2 tracking-[0.4em]">
              {data?.signature || '0x000000'}
            </div>
            <h2 className="text-3xl font-light text-white uppercase tracking-[0.3em] mb-4">Protocol</h2>
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-gold/40 text-gold text-[8px] tracking-[0.2em] font-medium uppercase bg-gold/5">
              <span className="w-1.5 h-1.5 bg-gold rounded-full" />
              Active Governance
            </div>
          </motion.div>

        </div>
      </div>

      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
    </div>
  )
}
