'use client'

import { useEffect } from 'react'

export function useKeyboard(key: string, handler: () => void, deps: React.DependencyList = []) {
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.key === key) {
        handler()
      }
    }

    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
