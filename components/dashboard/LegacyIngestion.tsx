'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, ChevronRight } from 'lucide-react'

export function LegacyIngestion() {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:3100/api/telemetry')
        const raw = await res.json()
        setData(raw.vampireDrains || [])
      } catch (e) {}
    }
    fetchData()
    const int = setInterval(fetchData, 2500)
    return () => clearInterval(int)
  }, [])

  return (
    <div className="bg-card border border-border h-full flex flex-col group overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-border bg-white/[0.02]">
        <div className="flex items-center gap-3 text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground group-hover:text-gold transition-colors duration-500">
          <Download className="w-4 h-4" />
          Legacy Ingestion
        </div>
        <div className="text-[8px] px-2 py-0.5 border border-xenon text-xenon tracking-widest font-bold uppercase animate-pulse shadow-[0_0_10px_rgba(240,240,255,0.1)]">
          Receiving
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
        <AnimatePresence initial={false}>
          {data.map((item, i) => (
            <motion.div
              key={item.time + i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-5 bg-black border border-border hover:border-gold-dim transition-all duration-300 relative group/item"
            >
              <div className="flex justify-between font-mono text-[9px] text-muted-foreground mb-2">
                <span className="group-hover/item:text-gold transition-colors">TRACE_ID: {Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
                <span>{new Date(item.time).toLocaleTimeString()}</span>
              </div>
              <div className="text-sm font-light tracking-wide text-foreground mb-1 group-hover/item:text-white transition-colors">{item.name}</div>
              <div className="text-[10px] text-muted-foreground">
                <span className="text-xenon-dim">Nodes:</span> {item.nodes} | <span className="text-xenon-dim">Comp:</span> {item.composition}
              </div>
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-border group-hover/item:text-gold group-hover/item:translate-x-1 transition-all duration-300" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 2px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #242436; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #c9a84c; }
      `}</style>
    </div>
  )
}
