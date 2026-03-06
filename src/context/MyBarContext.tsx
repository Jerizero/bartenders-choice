import { createContext, useContext, type ReactNode } from 'react'
import useMyBar from '../hooks/useMyBar'

type MyBarCtx = ReturnType<typeof useMyBar>

const MyBarContext = createContext<MyBarCtx | null>(null)

export function MyBarProvider({ children }: { children: ReactNode }) {
  const bar = useMyBar()
  return <MyBarContext.Provider value={bar}>{children}</MyBarContext.Provider>
}

export function useMyBarContext() {
  const ctx = useContext(MyBarContext)
  if (!ctx) throw new Error('useMyBarContext must be used within MyBarProvider')
  return ctx
}
