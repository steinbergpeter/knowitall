'use client'

import type { ReactNode } from 'react'
import ThemeProvider from './theme-provider'
import TanstackQueryProvider from './tanstack-query-provider'
import { SessionProvider } from 'next-auth/react'

type ProviderProps = {
  children: ReactNode
}

function Providers({ children }: ProviderProps) {
  return (
    <ThemeProvider>
      <SessionProvider>
        <TanstackQueryProvider>{children}</TanstackQueryProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}

export default Providers
