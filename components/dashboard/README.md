# Spectral Radar — Governed 3D Topological Audit Engine

**Author:** NodeOut × Antigravity  
**Classification:** Sovereign Dashboard Component  
**Last Updated:** April 2026

---

## Overview

The `SpectraRadar` is a real-time 3D particle visualization of the 3072-D spectral embedding space. It renders shatter maps, heat signatures, and canonical resonance data pulled from the local telemetry engine (`localhost:3100`). It is the primary visual interface for the Metropolis Intelligence Hub.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  ⚡ SPECTRAL GOVERNANCE (lil-gui panel)                 │
│                                                         │
│  ⚡ Preset: [LEAN | BALANCED | PERFORMANCE]  ← 1-click │
│                                                         │
│  ⚙ RESOURCE GOVERNOR                                   │
│    Max Shards ████████████░░░░░░░░  2000                │
│    Poll Rate  ████████░░░░░░░░░░░░  3000ms              │
│                                                         │
│  👁 VISUAL TUNING (collapsed)                           │
│  🔬 EVE SPECTRAL (collapsed)                            │
└─────────────────────────────────────────────────────────┘

HUD (top-left):                    HUD (bottom-left):
┌──────────────────────┐           ┌───────────────────────┐
│ ● SPECTRAL_CORE      │           │ SYSTEM HEALTH         │
│ MODE: TOPOLOGICAL    │           │  54  FPS              │
│ STATUS: REAL-TIME    │           │ ████████████████░░░░  │
│ HW: MID (12C/Apple)  │           │ NOMINAL               │
└──────────────────────┘           └───────────────────────┘
```

## Five-Layer Governance Stack

| Layer | Component | Trigger | Action |
|---|---|---|---|
| **1. Hardware Auto-Detect** | `detectHardware()` | First load or machine change | Probes CPU cores, RAM, GPU via WebGL. Computes capability class (`HIGH`/`MID`/`LOW`) and auto-selects the safe preset. |
| **2. Safe Presets** | lil-gui dropdown | Manual, anytime | One-click switch between `LEAN` (500 shards, 5s poll), `BALANCED` (2000, 3s), `PERFORMANCE` (5000, 2s). All sliders update atomically. |
| **3. FPS Gauge** | `AutoGovernor` → HUD | Always visible, updates 2×/sec | Color-coded: 🟢 Emerald (45+ FPS, NOMINAL), 🟡 Amber (28–44, ELEVATED — CONSIDER LEAN), 🔴 Red (<28, CRITICAL). |
| **4. Auto-Governor** | `AutoGovernor` component | FPS avg < 28 for 30+ frames | Autonomously reduces `maxPoints` by 30%. Cooldown: 3 seconds. Floor: 300 shards. Flashes `🛡 AUTO-THROTTLE` alert. |
| **5. Persistence** | `localStorage` | Every parameter change | Settings saved per-machine via hardware hash. Different machine = fresh calibration, not inherited settings. |

## Preset Configurations

```
LEAN         →  500 shards,  5000ms poll,  0.10 particle size
BALANCED     → 2000 shards,  3000ms poll,  0.15 particle size
PERFORMANCE  → 5000 shards,  2000ms poll,  0.15 particle size
```

## Hardware Detection Logic

On mount, the radar probes the host environment:

```
CPU Cores    →  navigator.hardwareConcurrency
Device RAM   →  navigator.deviceMemory (Chrome-only, conservative if unavailable)
GPU Model    →  WebGL UNMASKED_RENDERER_WEBGL extension

Scoring:
  cores ≥ 8    → +2    |  cores ≥ 4   → +1
  memory ≥ 8GB → +2    |  memory ≥ 4  → +1
  discrete GPU → +2    |  integrated  → +1

  Score ≥ 5  →  HIGH  →  PERFORMANCE preset
  Score ≥ 3  →  MID   →  BALANCED preset
  Score < 3  →  LOW   →  LEAN preset
```

A hardware hash (`cores-memory-gpuSlice`) is stored alongside settings. If the hash changes (different machine), saved settings are discarded and the radar re-calibrates from scratch.

## Cross-Machine Behavior

When your partner opens the dashboard on a different machine:

1. `detectHardware()` runs → different CPU/GPU/RAM → new hash
2. Hash mismatch → **ignores your workstation settings**
3. Auto-selects the safe preset for *their* hardware
4. Flashes `AUTO-CALIBRATED → LEAN (4 cores, Intel UHD Graphics)` in the HUD
5. Their settings persist independently going forward

## File Index

| File | Purpose |
|---|---|
| `SpectraRadar.tsx` | Main governed 3D radar component |
| `SpectralRepair.tsx` | Code repair engine UI (paste broken Luau → get spectral-augmented fix) |
| `ProtocolRadar.tsx` | Protocol-level audit visualization |
| `ProtocolAuditEngine.tsx` | Audit engine logic |
| `PluginGate.tsx` | Plugin governance gate |
| `TelemetryLog.tsx` | Telemetry event log |
| `LegacyIngestion.tsx` | Legacy data ingestion interface |

## Dependencies

- `three` — WebGL 3D rendering
- `@react-three/fiber` — React reconciler for Three.js
- `@react-three/drei` — Three.js helpers (Points, OrbitControls)
- `lil-gui` — Lightweight parameter control panel (successor to dat.gui)

---

*This component is part of the Domicile Deck sovereign dashboard. All telemetry is local-only.*
