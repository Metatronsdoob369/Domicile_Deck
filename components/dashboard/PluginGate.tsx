'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Cpu, Globe, ShieldCheck, ZapOff } from 'lucide-react'

interface PluginStatus {
  name: string;
  port: number;
  status: 'ONLINE' | 'OFFLINE' | 'ARMED';
}

export function PluginGate() {
  const [plugins, setPlugins] = useState<PluginStatus[]>([
    { name: 'Ollama (Embed)', port: 11434, status: 'OFFLINE' },
    { name: 'OMC Bridge', port: 8080, status: 'OFFLINE' },
    { name: 'Informant MCP', port: 3100, status: 'OFFLINE' }, // Assuming dashboard backend serves it or monitors it
  ])

  useEffect(() => {
    const checkPlugins = async () => {
      // Mocking check for now, in a real scenario this would fetch from a dashboard API that performs the health checks
      try {
        const res = await fetch('http://localhost:3100/api/health-check')
        const data = await res.json()
        setPlugins(data.plugins || plugins)
      } catch (e) {
        // Fallback to manual check or degraded state
      }
    }
    
    checkPlugins()
    const int = setInterval(checkPlugins, 5000)
    return () => clearInterval(int)
  }, [])

  return (
    <div className="flex gap-6 items-center">
      {plugins.map((plugin) => (
        <div key={plugin.name} className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
            plugin.status === 'ONLINE' ? 'bg-gold' : 
            plugin.status === 'ARMED' ? 'bg-indigo-500' : 'bg-red-500'
          }`} />
          <div className="flex flex-col">
            <span className="text-[8px] text-muted-foreground uppercase tracking-widest leading-none">
              {plugin.name}
            </span>
            <span className={`text-[10px] font-mono font-bold leading-tight ${
              plugin.status === 'ONLINE' ? 'text-white' : 
              plugin.status === 'ARMED' ? 'text-indigo-300' : 'text-red-400'
            }`}>
              {plugin.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
