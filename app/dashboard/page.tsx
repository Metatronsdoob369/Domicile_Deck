'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { SpectraRadar } from '@/components/dashboard/SpectraRadar'
import { LegacyIngestion } from '@/components/dashboard/LegacyIngestion'
import { TelemetryLog } from '@/components/dashboard/TelemetryLog'
import { SpectralRepair } from '@/components/dashboard/SpectralRepair'
import { PluginGate } from '@/components/dashboard/PluginGate'
import { Shield, Zap, Activity, Cpu } from 'lucide-react'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    stability: '0.0%',
    performance: '0ms',
    signature: 'V(0,0,0)',
    active: false
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:3100/api/telemetry')
        const data = await res.json()
        setStats({
          stability: `${data.phaseGates?.gauges?.stability?.value || 0}%`,
          performance: `${data.phaseGates?.gauges?.performance?.value || 0}ms`,
          signature: data.safety?.intentSignature || 'V(0.0, 0.0, 0.0)',
          active: true
        })
      } catch (e) {
        setStats(s => ({ ...s, active: false }))
      }
    }
    fetchData()
    const int = setInterval(fetchData, 2500)
    return () => clearInterval(int)
  }, [])

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in duration-1000">
      
      {/* Dynamic Header Stats */}
      <div className="flex justify-between items-end border-b border-border pb-8">
        <div className="flex flex-col gap-1">
          <div className="text-[10px] text-muted-foreground tracking-[0.4em] uppercase font-mono">
            Deterministic Governance Interface v1.0
          </div>
          <h1 className="text-4xl font-light text-white tracking-[0.2em] uppercase">
            Protocol <span className="text-gold">Command</span>
          </h1>
        </div>
        
        <div className="flex gap-12 items-center">
          <PluginGate />
          
          <div className="h-8 w-[1px] bg-border mx-4" />

          <div className="flex gap-12 font-mono">
            <div className="text-right">
               <div className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">Stability</div>
               <div className="text-xl text-white font-light tracking-tighter">{stats.stability}</div>
            </div>
            <div className="text-right">
               <div className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">Latency</div>
               <div className="text-xl text-white font-light tracking-tighter">{stats.performance}</div>
            </div>
            <div className="text-right">
               <div className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">State</div>
               <div className={`text-xl font-bold tracking-tighter ${stats.active ? 'text-gold' : 'text-red-500'}`}>
                  {stats.active ? 'DIAMOND' : 'OFFLINE'}
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Command Grid */}
      <div className="flex-1 grid grid-cols-12 gap-8 min-h-0">
        
        {/* Left: Sovereign Toolkit */}
        <aside className="col-span-4 h-full flex flex-col space-y-8">
          <section className="flex-1 bg-card/40 border border-border overflow-hidden">
            <LegacyIngestion />
          </section>
          
          <section className="h-[45%] bg-card/20 border border-gold/10 p-6 overflow-hidden">
            <SpectralRepair />
          </section>
        </aside>

        {/* Center: Protocol Engine Radar */}
        <main className="col-span-5 h-full flex flex-col">
          <div className="flex-1">
             <SpectraRadar />
          </div>
          
          <div className="mt-8 p-6 border border-gold-dim/20 bg-gold/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Shield className="text-gold w-6 h-6" />
              <div>
                <div className="text-[10px] text-gold/60 uppercase tracking-widest font-bold">Intent Signature</div>
                <div className="text-sm font-light text-white tracking-widest uppercase">{stats.signature}</div>
              </div>
            </div>
            <div className="flex gap-4">
               <div className="px-3 py-1 border border-gold/40 text-[9px] text-gold uppercase tracking-[0.2em] font-medium transition-all hover:bg-gold hover:text-black cursor-default">Sovereign Node</div>
               <div className="px-3 py-1 border border-border-bright text-[9px] text-muted-foreground uppercase tracking-[0.2em]">Alpha Capture</div>
            </div>
          </div>
        </main>

        {/* Right: Telemetry Logs */}
        <aside className="col-span-3 h-full">
          <TelemetryLog />
        </aside>

      </div>

      {/* Persistence / Footer */}
      <footer className="pt-6 border-t border-border opacity-30">
        <div className="flex justify-between items-center text-[8px] uppercase tracking-[0.5em] font-mono">
          <span>Obsidian Node v1.0 {"//"} Auth: 127.0.0.1 {"//"} Protocol Enabled</span>
          <span>Target Acquisition: {stats.active ? 'ACTIVE' : 'IDLE'} {"//"} Resonance Strike: READY</span>
        </div>
      </footer>
    </div>
  )
}

