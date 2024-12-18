import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/store/useAuthStore'
import api from '@/lib/api'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const [error, setError] = useState('')
  const router = useRouter()
  const { setUser, setToken } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError('')
      // Login to get token
      const response = await api.post('/auth/login', {
        username: data.email,  // Backend expects 'username' instead of 'email'
        password: data.password
      })
      const { access_token } = response.data
      
      // Set token first to ensure it's available for the next request
      setToken(access_token)
      
      // Update API client with new token
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`

      // Fetch user data with the new token
      const userResponse = await api.get('/users/me')
      setUser(userResponse.data)
      
      // Navigate to dashboard
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to login')
      // Clear token and user on error
      setToken(null)
      setUser(null)
    }
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              {...register('email')}
              className="w-full p-2 border rounded"
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              {...register('password')}
              className="w-full p-2 border rounded"
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>
          {error && (
            <div className="text-sm text-red-500">{error}</div>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
      </form>
    </div>
  )
}
