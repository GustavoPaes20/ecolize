import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import {
  getSession,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
} from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [isBootstrapping, setIsBootstrapping] = useState(true)

  useEffect(() => {
    async function bootstrap() {
      try {
        const session = await getSession()

        if (session) {
          setUser(session.user)
          setToken(session.token)
        }
      } finally {
        setIsBootstrapping(false)
      }
    }

    bootstrap()
  }, [])

  async function login(credentials) {
    const session = await loginRequest(credentials)
    setUser(session.user)
    setToken(session.token)
    return session
  }

  async function register(payload) {
    const session = await registerRequest(payload)
    setUser(session.user)
    setToken(session.token)
    return session
  }

  async function logout() {
    await logoutRequest()
    setUser(null)
    setToken(null)
  }

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isBootstrapping,
      setUser,
      login,
      register,
      logout,
    }),
    [user, token, isBootstrapping]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider.')
  }

  return context
}
