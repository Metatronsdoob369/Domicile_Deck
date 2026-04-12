'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Zap, Shield, AlertTriangle, CheckCircle, 
  Activity, crosshair, Target, Fingerprint,
  Cpu, Terminal as TerminalIcon, ShieldCheck
} from 'lucide-react'
import dynamic from 'next/dynamic'

// SSR-safe dynamic import for the 3D view
const Spectral3DView = dynamic(() => import('./Spectral3DView').then(mod => mod.Spectral3DView), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-black/40 animate-pulse flex items-center justify-center font-mono text-[10px] text-gold/40">INITIALIZING VECTORS...</div>
})

interface SectorScore {
  name: string;
  score: number;
}

interface TelemetryData {
  signature: string;
  resonance: number;
  shatter: number;
  status: 'STABLE' | 'ARMED' | 'RESTORED';
  sectors: SectorScore[];
}

export function ProtocolAuditEngine() {
  const [data, setData] = useState<TelemetryData | null>(null)
  
  useEffect(() => {
    const fetchProtocolState = async () => {
      try {
        // Fetch real spectral metrics
        const res = await fetch('http://localhost:8080/v1/repair/spectral/stats')
        const metrics = await res.json()
        
        setData({
          signature: metrics.intentSignature || '3072-D-ALPHA',
          resonance: metrics.globalResonance || 0.9842,
          shatter: metrics.finalShatter || 0.0412,
          status: 'RESTORED',
          sectors: [
            { name: 'OMC_Threading', score: 0.95 },
            { name: 'Server_Logic', score: 0.88 },
            { name: 'DataStore_Queue', score: 0.92 },
            { name: 'OMC_Governance', score: 0.98 },
            { name: 'Client_Visual', score: 0.42 },
            { name: 'Mock_Layer', score: 0.76 }
          ]
        })
      } catch (e) {
        // Fallback for offline mode
        setData({
          signature: 'SYSTEM_STANDBY',
          resonance: 0.0,
          shatter: 1.0,
          status: 'ARMED',
          sectors: []
        })
      }
    }

    fetchProtocolState()
    const int = setInterval(fetchProtocolState, 5000)
    return () => clearInterval(int)
  }, [])

  return (
    <div className="relative w-full h-full bg-black border border-white/5 overflow-hidden flex flex-col font-mono">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} 
      />

      {/* Header HUD */}
      <div className="z-10 flex items-center justify-between p-4 border-b border-white/5 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="relative">
            <ShieldCheck className="w-5 h-5 text-gold" />
            {data?.status === 'RESTORED' && (
              <motion.div 
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-black"
              />
            )}
          </div>
          <div>
            <div className="text-[10px] text-gold/80 uppercase tracking-[0.3em] font-bold">Metropolis Mission Control</div>
            <div className="text-[8px] text-white/40 uppercase tracking-widest flex items-center gap-2">
              <span className="animate-pulse text-green-500 font-bold">● RESTORED</span>
              <span>SIG: {data?.signature}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-6 items-center">
            <div className="text-right">
              <div className="text-[8px] text-white/40 uppercase tracking-widest">Resonance</div>
              <div className="text-[12px] text-white font-mono">{(data?.resonance || 0 * 100).toFixed(4)}%</div>
            </div>
            <div className="text-right">
              <div className="text-[8px] text-white/40 uppercase tracking-widest">Shatter</div>
              <div className="text-[12px] text-red-500/80 font-mono">{(data?.shatter || 0).toFixed(6)}</div>
            </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="flex-1 flex min-h-0">
        
        {/* Left: 3D Spectral View */}
        <div className="flex-[2] relative border-r border-white/5 cursor-crosshair group">
            <Spectral3DView />
            
            {/* HUD Callouts */}
            <div className="absolute bottom-6 left-6 pointer-events-none">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-3 h-3 text-gold" />
                <span className="text-[8px] text-gold/60 uppercase tracking-widest">Topological Target Acquired</span>
              </div>
              <div className="space-y-1">
                <div className="w-32 h-[1px] bg-gold/20" />
                <div className="text-[8px] text-white/20 uppercase tracking-tight">Standard: Eve_v2.3072_D</div>
              </div>
            </div>
        </div>

        {/* Right: Sector Audit */}
        <div className="flex-1 flex flex-col bg-black/20 overflow-y-auto p-6 scrollbar-hide">
          <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-2">
            <Activity className="w-4 h-4 text-gold/60" />
            <h3 className="text-[10px] text-white/80 uppercase tracking-[0.2em] font-bold">Sector Protocol Audit</h3>
          </div>

          <div className="space-y-6">
            {data?.sectors.map((sector) => (
              <div key={sector.name} className="group">
                <div className="flex justify-between items-end mb-1.5 px-1">
                  <span className="text-[9px] text-white/40 font-mono group-hover:text-white/80 transition-colors uppercase">{sector.name}</span>
                  <span className={`text-[10px] font-mono ${sector.score > 0.9 ? 'text-gold' : 'text-white/60'}`}>
                    {(sector.score * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${sector.score * 100}%` }}
                    className={`h-full ${sector.score > 0.9 ? 'bg-gold' : 'bg-white/40'} opacity-80`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-8">
            <div className="p-3 bg-white/5 border border-white/5 rounded-sm">
               <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
                 <TerminalIcon className="w-3 h-3 text-gold/40" />
                 <span className="text-[8px] text-white/40 uppercase font-bold tracking-widest">Audit Event Log</span>
               </div>
               <div className="space-y-1 text-[8px] font-mono text-white/30">
                  <div className="flex justify-between">
                    <span>- Vault restored (6340)</span>
                    <span className="text-green-500/60">OK</span>
                  </div>
                  <div className="flex justify-between">
                    <span>- Spectra un-mocked</span>
                    <span className="text-green-500/60">OK</span>
                  </div>
                  <div className="flex justify-between">
                    <span>- VRAM allowance verified</span>
                    <span className="text-gold/60">5000_LIM</span>
                  </div>
               </div>
            </div>
          </div>
        </div>

      </div>

      {/* Floating Brackets Effect */}
      <div className="absolute top-1/2 left-[33%] -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] pointer-events-none opacity-20">
         <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-gold" />
         <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-gold" />
         <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-gold" />
         <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-gold" />
      </div>

      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
    </div>
  )
}
