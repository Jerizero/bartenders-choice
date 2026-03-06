import { createContext, useContext, type ReactNode } from 'react'
import useUserData from '../hooks/useUserData'

type UserDataCtx = ReturnType<typeof useUserData>

const UserDataContext = createContext<UserDataCtx | null>(null)

export function UserDataProvider({ children }: { children: ReactNode }) {
  const userData = useUserData()
  return <UserDataContext.Provider value={userData}>{children}</UserDataContext.Provider>
}

export function useUserDataContext() {
  const ctx = useContext(UserDataContext)
  if (!ctx) throw new Error('useUserDataContext must be used within UserDataProvider')
  return ctx
}
