'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { useEffect, useState, type ReactNode } from 'react'

function ThemeProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Optionally, return a loading spinner or null
    return null
  }

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}

export default ThemeProvider
