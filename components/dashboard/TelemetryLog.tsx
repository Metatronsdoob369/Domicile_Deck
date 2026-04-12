'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity } from 'lucide-react'

export function TelemetryLog() {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:3100/api/telemetry')
        const raw = await res.json()
        setData(raw.auditLog || [])
      } catch (e) {}
    }
    fetchData()
    const int = setInterval(fetchData, 2500)
    return () => clearInterval(int)
  }, [])

  return (
    <div className="bg-card border border-border h-full flex flex-col group overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-border bg-white/[0.02]">
        <div className="flex items-center gap-3 text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground group-hover:text-indigo-500 transition-colors duration-500">
          <Activity className="w-4 h-4" />
          Telemetry Logs
        </div>
        <div className="text-[8px] px-2 py-0.5 border border-border-bright text-muted-foreground tracking-widest font-bold uppercase hover:border-xenon hover:text-xenon transition-all duration-300">
          Encrypted
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
        <AnimatePresence initial={false}>
          {data.map((item, i) => (
            <motion.div
              key={item.time + i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-4 border-b border-border last:border-0 flex gap-4 text-xs font-mono group/item hover:bg-white/[0.01] transition-colors -mx-6 px-10"
            >
              <span className="w-20 text-muted-foreground group-hover/item:text-gold transition-colors">{new Date(item.time).toLocaleTimeString()}</span>
              <span className={`w-16 font-semibold tracking-wider ${item.type === 'Refiner' ? 'text-gold' : 'text-indigo'}`}>
                {item.type === 'Refiner' ? 'SIGN' : 'AUDIT'}
              </span>
              <span className="text-foreground group-hover/item:text-white transition-colors flex-1 truncate">
                {item.msg.replace('Instantiated Canonical Law:', 'Active:').replace('Rejected & Audited:', 'Filtered:')}
              </span>
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
