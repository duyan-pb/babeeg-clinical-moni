import { createContext, useContext, type ReactNode } from 'react'

export type SparkMode = 'spark' | 'mock'

const SparkModeContext = createContext<SparkMode>('mock')

export function SparkModeProvider({ mode, children }: { mode: SparkMode, children: ReactNode }) {
  return (
    <SparkModeContext.Provider value={mode}>
      {children}
    </SparkModeContext.Provider>
  )
}

export function useSparkMode(): SparkMode {
  return useContext(SparkModeContext)
}
