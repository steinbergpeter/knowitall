'use client'

import type { ReactNode } from 'react'
import ThemeProvider from './theme-provider'
import TanstackQueryProvider from './tanstack-query-provider'

type ProviderProps = {
  children: ReactNode
}
function Providers({ children }: ProviderProps) {
  return (
    <ThemeProvider>
      <TanstackQueryProvider>{children}</TanstackQueryProvider>
    </ThemeProvider>
  )
}

export default Providers
