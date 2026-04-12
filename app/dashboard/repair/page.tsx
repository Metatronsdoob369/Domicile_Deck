'use client'

import React, { useState } from 'react'
import { SpectralRepair } from '@/components/dashboard/SpectralRepair'

export default function RepairPage() {
  return (
    <div className="h-full flex flex-col p-8">
      <div className="flex-1">
        <SpectralRepair />
      </div>
    </div>
  )
}
