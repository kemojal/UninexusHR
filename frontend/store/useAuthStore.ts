import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import Cookies from 'js-cookie'
import api from '@/lib/api'

interface User {
  id: number
  email: string
  full_name: string
  is_active: boolean
  is_superuser: boolean
}

interface AuthState {
  token: string | null
  user: User | null
  setToken: (token: string) => void
  setUser: (user: User) => void
  logout: () => void
  isAuthenticated: () => boolean
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setToken: (token: string) => {
        set({ token })
        // Set token in cookie for middleware
        Cookies.set('token', token, { 
          expires: 7, // 7 days
          sameSite: 'strict',
          secure: process.env.NODE_ENV === 'production'
        })
        // Update API client authorization header
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        } else {
          delete api.defaults.headers.common['Authorization']
        }
      },
      setUser: (user: User) => set({ user }),
      logout: () => {
        set({ token: null, user: null })
        // Remove token from cookie
        Cookies.remove('token')
        // Clear any other auth-related state or cookies here
        delete api.defaults.headers.common['Authorization']
        // Redirect to login page
        window.location.href = '/login'
      },
      isAuthenticated: () => {
        const token = get().token || Cookies.get('token')
        return !!token
      },
      checkAuth: async () => {
        const token = get().token || Cookies.get('token')
        if (token) {
          try {
            // Set token in API client
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`
            // Verify token by fetching user data
            const response = await api.get('/users/me')
            set({ user: response.data })
          } catch (error) {
            // If token is invalid or expired, logout
            get().logout()
          }
        }
      }
    }),
    {
      name: 'auth-storage',
      // Only persist token and user
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    }
  )
)
