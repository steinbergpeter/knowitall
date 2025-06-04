'use client'

import type { ReactNode } from 'react'
import ThemeProvider from './theme-provider'

type ProviderProps = {
  children: ReactNode
}
function Providers({ children }: ProviderProps) {
  return <ThemeProvider>{children}</ThemeProvider>
}

export default Providers
