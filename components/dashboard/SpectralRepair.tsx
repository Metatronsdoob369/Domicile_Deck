'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Shield, AlertTriangle, CheckCircle, Loader2, Code, BarChart3 } from 'lucide-react'

interface SectorScore {
  name: string;
  score: number;
}

interface RepairResult {
  success: boolean;
  brokenCode: string;
  repairedCode: string;
  canonicalMatch: { file: string; similarity: number } | null;
  spectralContext: {
    shatterDistance: number;
    heat: number;
    weakSectors: SectorScore[];
    strongSectors: SectorScore[];
    genre: string;
  };
  verdict: {
    augmentedSimilarity: number;
    baselineSimilarity: number;
    winner: string;
  };
}

export function SpectralRepair() {
  const [code, setCode] = useState('')
  const [result, setResult] = useState<RepairResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showRepaired, setShowRepaired] = useState(false)

  const handleRepair = async () => {
    if (!code.trim()) return
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/spectral-repair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
    } catch (e: any) {
      setError(e.message || 'Repair failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Zap className="text-gold w-4 h-4" />
          <span className="text-[10px] text-gold/80 uppercase tracking-[0.3em] font-bold">
            Spectral Repair Engine
          </span>
        </div>
        <div className="text-[8px] text-muted-foreground uppercase tracking-widest font-mono">
          3072-D Sovereign Local
        </div>
      </div>

      {/* Input Area */}
      <div className="relative mb-3">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Paste broken Luau code here..."
          className="w-full h-32 bg-black/60 border border-border text-[11px] text-white/90 font-mono p-3 resize-none focus:outline-none focus:border-gold/40 placeholder:text-white/20"
          style={{ lineHeight: '1.5' }}
        />
        <button
          onClick={handleRepair}
          disabled={loading || !code.trim()}
          className="absolute bottom-2 right-2 px-4 py-1.5 bg-gold/10 border border-gold/30 text-gold text-[9px] uppercase tracking-[0.2em] font-bold hover:bg-gold/20 disabled:opacity-30 transition-all"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              Vectorizing...
            </span>
          ) : 'Repair'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-3 p-2 border border-red-500/30 bg-red-500/5 text-red-400 text-[10px] font-mono">
          ⚠ {error}
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 overflow-y-auto space-y-3"
          >
            {/* Verdict Banner */}
            <div className={`p-3 border ${result.verdict.winner === 'SPECTRAL_AUGMENTED' ? 'border-gold/40 bg-gold/5' : 'border-red-500/40 bg-red-500/5'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {result.verdict.winner === 'SPECTRAL_AUGMENTED' ? (
                    <CheckCircle className="w-4 h-4 text-gold" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  )}
                  <span className="text-[10px] text-white uppercase tracking-widest font-bold">
                    {result.verdict.winner === 'SPECTRAL_AUGMENTED' ? 'Spectral Augmented Wins' : 'Baseline Wins'}
                  </span>
                </div>
                <div className="text-[9px] font-mono text-muted-foreground">
                  +{((result.verdict.augmentedSimilarity - result.verdict.baselineSimilarity) * 100).toFixed(1)}% improvement
                </div>
              </div>
              <div className="mt-2 flex gap-6">
                <div>
                  <div className="text-[8px] text-muted-foreground uppercase tracking-widest">Augmented → Canonical</div>
                  <div className="text-lg font-light text-gold">{(result.verdict.augmentedSimilarity * 100).toFixed(1)}%</div>
                </div>
                <div>
                  <div className="text-[8px] text-muted-foreground uppercase tracking-widest">Baseline → Canonical</div>
                  <div className="text-lg font-light text-white/50">{(result.verdict.baselineSimilarity * 100).toFixed(1)}%</div>
                </div>
              </div>
            </div>

            {/* Spectral Context */}
            <div className="p-3 border border-border bg-black/40">
              <div className="text-[9px] text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
                <BarChart3 className="w-3 h-3" /> Spectral Context
              </div>
              <div className="grid grid-cols-4 gap-2 mb-3">
                <div>
                  <div className="text-[8px] text-muted-foreground">Match</div>
                  <div className="text-[11px] text-white font-mono truncate">{result.canonicalMatch?.file}</div>
                </div>
                <div>
                  <div className="text-[8px] text-muted-foreground">Similarity</div>
                  <div className="text-[11px] text-gold font-mono">{((result.canonicalMatch?.similarity || 0) * 100).toFixed(1)}%</div>
                </div>
                <div>
                  <div className="text-[8px] text-muted-foreground">Shatter</div>
                  <div className="text-[11px] text-white font-mono">{result.spectralContext.shatterDistance.toFixed(4)}</div>
                </div>
                <div>
                  <div className="text-[8px] text-muted-foreground">Genre</div>
                  <div className="text-[11px] text-white font-mono">{result.spectralContext.genre}</div>
                </div>
              </div>
              
              {/* Sector Bars */}
              <div className="space-y-1">
                <div className="text-[8px] text-red-400/70 uppercase tracking-widest">Weak Sectors</div>
                {result.spectralContext.weakSectors.map(s => (
                  <div key={s.name} className="flex items-center gap-2">
                    <span className="text-[9px] text-muted-foreground w-24 truncate font-mono">{s.name}</span>
                    <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500/60 rounded-full" style={{ width: `${s.score * 100}%` }} />
                    </div>
                    <span className="text-[9px] text-red-400 font-mono w-8">{(s.score * 100).toFixed(0)}%</span>
                  </div>
                ))}
                <div className="text-[8px] text-gold/70 uppercase tracking-widest mt-2">Strong Sectors</div>
                {result.spectralContext.strongSectors.map(s => (
                  <div key={s.name} className="flex items-center gap-2">
                    <span className="text-[9px] text-muted-foreground w-24 truncate font-mono">{s.name}</span>
                    <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-gold/60 rounded-full" style={{ width: `${s.score * 100}%` }} />
                    </div>
                    <span className="text-[9px] text-gold font-mono w-8">{(s.score * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Code Toggle */}
            <div className="p-3 border border-border bg-black/40">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Code className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[9px] text-muted-foreground uppercase tracking-widest">
                    {showRepaired ? 'Repaired Code' : 'Repaired Code (click to view)'}
                  </span>
                </div>
                <button
                  onClick={() => setShowRepaired(!showRepaired)}
                  className="text-[8px] text-gold/60 uppercase tracking-widest hover:text-gold transition-colors"
                >
                  {showRepaired ? 'Hide' : 'Show'} ({result.repairedCode.length} chars)
                </button>
              </div>
              {showRepaired && (
                <pre className="text-[10px] text-green-300/80 font-mono bg-black/60 p-2 max-h-48 overflow-y-auto whitespace-pre-wrap border border-green-900/20">
                  {result.repairedCode}
                </pre>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
