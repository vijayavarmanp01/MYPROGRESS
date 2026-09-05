import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'

export interface AuthUser {
  id: string
  name: string
  username: string
  email: string
  avatarInitial: string
  avatarGradient?: string
  bio?: string
  githubUrl?: string
  linkedinUrl?: string
  leetcodeUrl?: string
  targetRole?: string
  targetCompanies?: string[]
  provider: 'email' | 'google' | 'github'
  createdAt?: string
  joinedAt?: string
  progress?: {
    currentStreak: number
    longestStreak: number
    totalProblemsSolved: number
    overallReadinessPct: number
  }
}

interface AuthState {
  user: AuthUser | null
  loading: boolean
}

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string) => Promise<void>
  signInWithOAuth: (provider: 'google' | 'github') => Promise<void>
  signOut: () => Promise<void>
  updateUser: (updates: Partial<AuthUser>) => void
}

const STORAGE_USER_KEY = 'myprogress-auth-user'
const STORAGE_TOKEN_KEY = 'myprogress-auth-token'

function enrichUserDefaults(user: AuthUser): AuthUser {
  const username = user.username || user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '')
  return {
    ...user,
    username: username || 'developer',
    bio: user.bio ?? 'Full-stack software engineer preparing for Tier-1 product interviews.',
    githubUrl: user.githubUrl ?? `https://github.com/${username}`,
    linkedinUrl: user.linkedinUrl ?? `https://linkedin.com/in/${username}`,
    leetcodeUrl: user.leetcodeUrl ?? `https://leetcode.com/u/${username}`,
    targetRole: user.targetRole ?? 'Software Development Engineer (SDE)',
    targetCompanies: user.targetCompanies ?? ['Google', 'Meta', 'Amazon', 'Microsoft'],
    avatarGradient: user.avatarGradient ?? 'from-[#5561f0] to-[#a78bfa]',
    avatarInitial: user.avatarInitial || (user.name ? user.name[0].toUpperCase() : 'U'),
    provider: user.provider || 'email',
  }
}

function loadSavedUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_USER_KEY)
    if (!raw) return null
    return enrichUserDefaults(JSON.parse(raw) as AuthUser)
  } catch {
    return null
  }
}

function saveUser(user: AuthUser | null) {
  if (user) {
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(STORAGE_USER_KEY)
    localStorage.removeItem(STORAGE_TOKEN_KEY)
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem(STORAGE_TOKEN_KEY)
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(() => ({
    user: loadSavedUser(),
    loading: false,
  }))

  // Synchronize authenticated state with backend on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAuthToken()
      if (!token) return

      try {
        const res = await fetch('/api/auth/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        })

        if (res.ok) {
          const data = await res.json()
          if (data.user) {
            const enriched = enrichUserDefaults(data.user)
            saveUser(enriched)
            setAuth({ user: enriched, loading: false })
          }
        } else if (res.status === 401) {
          // Token expired or invalid
          saveUser(null)
          setAuth({ user: null, loading: false })
        }
      } catch (err) {
        console.warn('Backend auth check skipped:', err)
      }
    }

    checkAuth()
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    setAuth(s => ({ ...s, loading: true }))

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Login failed. Please check your credentials.')
      }

      if (data.token) {
        localStorage.setItem(STORAGE_TOKEN_KEY, data.token)
      }

      const enriched = enrichUserDefaults(data.user)
      saveUser(enriched)
      setAuth({ user: enriched, loading: false })
    } catch (err) {
      setAuth(s => ({ ...s, loading: false }))
      throw err
    }
  }, [])

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    setAuth(s => ({ ...s, loading: true }))

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Failed to create account. Please try again.')
      }

      if (data.token) {
        localStorage.setItem(STORAGE_TOKEN_KEY, data.token)
      }

      const enriched = enrichUserDefaults(data.user)
      saveUser(enriched)
      setAuth({ user: enriched, loading: false })
    } catch (err) {
      setAuth(s => ({ ...s, loading: false }))
      throw err
    }
  }, [])

  const signInWithOAuth = useCallback(async (provider: 'google' | 'github') => {
    // OAuth placeholder for future step
    setAuth(s => ({ ...s, loading: true }))
    const names = { google: 'Google Developer', github: 'GitHub Developer' }
    const rawUser: AuthUser = {
      id: crypto.randomUUID(),
      name: names[provider],
      username: provider === 'google' ? 'googledev' : 'githubdev',
      email: provider === 'google' ? 'user@google.com' : 'user@github.com',
      avatarInitial: provider === 'google' ? 'G' : 'H',
      provider,
      joinedAt: new Date().toISOString(),
    }
    const enriched = enrichUserDefaults(rawUser)
    saveUser(enriched)
    setAuth({ user: enriched, loading: false })
  }, [])

  const signOut = useCallback(async () => {
    setAuth(s => ({ ...s, loading: true }))
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (err) {
      console.warn('Logout API error:', err)
    } finally {
      saveUser(null)
      setAuth({ user: null, loading: false })
    }
  }, [])

  const updateUser = useCallback(async (updates: Partial<AuthUser>) => {
    setAuth(s => {
      if (!s.user) return s
      const updated = enrichUserDefaults({ ...s.user, ...updates })
      saveUser(updated)
      return { ...s, user: updated }
    })

    const token = getAuthToken()
    if (!token) return

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(updates),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.user) {
          const enriched = enrichUserDefaults(data.user)
          saveUser(enriched)
          setAuth(s => ({ ...s, user: enriched }))
        }
      }
    } catch (err) {
      console.warn('Profile sync error:', err)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user: auth.user,
        isAuthenticated: !!auth.user,
        loading: auth.loading,
        signIn,
        signUp,
        signInWithOAuth,
        signOut,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
