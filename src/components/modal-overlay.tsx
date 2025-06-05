'use client'

import type { ReactNode } from 'react'

export function ModalOverlay({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      {children}
    </div>
  )
}
