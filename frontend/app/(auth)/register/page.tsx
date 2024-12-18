"use client"

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'
import { RegisterForm } from '@/components/forms/register-form'
import { Building2, ArrowLeft, Users2, Shield, Sparkles } from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

const features = [
  {
    icon: Users2,
    title: "Team Management",
    description: "Efficiently manage your entire workforce in one place"
  },
  {
    icon: Shield,
    title: "Secure Platform",
    description: "Enterprise-grade security for your organization's data"
  },
  {
    icon: Sparkles,
    title: "Smart Automation",
    description: "Automate repetitive HR tasks and save time"
  }
]

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const invitationToken = searchParams.get('invitation')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: ''
  })

  const registerMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await api.post('/auth/register', data)
      if (invitationToken) {
        // If registering with an invitation, accept it automatically
        await api.post(`/accept-invitation/${invitationToken}`)
      }
      return response.data
    },
    onSuccess: () => {
      toast.success('Registration successful!')
      router.push(invitationToken ? '/dashboard' : '/login')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Registration failed')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    registerMutation.mutate(formData)
  }

  return (
    <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <Link
        href="/login"
        className="absolute left-4 top-4 md:left-8 md:top-8 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary gap-2 group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Back to login
      </Link>
      <motion.div 
        className="lg:p-8"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div 
          variants={item}
          className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]"
        >
          <motion.div variants={item} className="flex items-center gap-2 text-lg font-medium">
            <Building2 className="h-6 w-6 text-primary" />
            UninexusHR
          </motion.div>
          <div className="flex flex-col space-y-2">
            <motion.h1 
              variants={item}
              className="text-2xl font-semibold tracking-tight"
            >
              Create your account
            </motion.h1>
            <motion.p 
              variants={item}
              className="text-sm text-muted-foreground"
            >
              Join UninexusHR and streamline your HR operations
            </motion.p>
          </div>

          <motion.div variants={item}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  placeholder="Enter your full name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                Already have an account?{' '}
                <Link 
                  href={invitationToken ? `/login?invitation=${invitationToken}` : '/login'}
                  className="text-primary hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </form>
          </motion.div>

          <motion.p 
            variants={item}
            className="px-8 text-center text-sm text-muted-foreground"
          >
            By clicking continue, you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </Link>
            .
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  )
}
