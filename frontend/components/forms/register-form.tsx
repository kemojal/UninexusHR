import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import api from '@/lib/api'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type RegisterFormData = z.infer<typeof registerSchema>

export function RegisterForm() {
  const [error, setError] = useState('')
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError('')
      const response = await api.post('/auth/register', {
        email: data.email,
        password: data.password,
        full_name: data.fullName,
      })

      if (response.status === 200) {
        router.push('/login?registered=true')
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to register')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <div className="space-y-2">
        <label htmlFor="fullName" className="text-sm font-medium">
          Full Name
        </label>
        <input
          {...register('fullName')}
          type="text"
          className="w-full p-2 border rounded-md"
          placeholder="John Doe"
        />
        {errors.fullName && (
          <p className="text-sm text-red-500">{errors.fullName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          {...register('email')}
          type="email"
          className="w-full p-2 border rounded-md"
          placeholder="john@example.com"
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          {...register('password')}
          type="password"
          className="w-full p-2 border rounded-md"
        />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="text-sm font-medium">
          Confirm Password
        </label>
        <input
          {...register('confirmPassword')}
          type="password"
          className="w-full p-2 border rounded-md"
        />
        {errors.confirmPassword && (
          <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-2 rounded-md"
      >
        {isSubmitting ? 'Creating account...' : 'Create account'}
      </button>
    </form>
  )
}
