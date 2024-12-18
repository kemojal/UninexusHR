'use client'

import { ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { motion } from 'framer-motion'
import { Building2, Users2, Shield, Sparkles } from 'lucide-react'

interface AuthLayoutProps {
  children: ReactNode
}

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
    description: "Efficiently manage your entire workforce with powerful tools and insights"
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-grade security to protect your organization's sensitive data"
  },
  {
    icon: Sparkles,
    title: "Smart Automation",
    description: "Automate repetitive HR tasks and focus on what matters most"
  }
]

export default function AuthLayout({ children }: AuthLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (isAuthenticated()) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-b from-primary-600 to-primary-900"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
        <motion.div 
          className="relative z-20 flex items-center text-lg font-medium"
          variants={item}
          initial="hidden"
          animate="show"
        >
          <Building2 className="mr-2 h-6 w-6" />
          {pathname === '/register' ? 'Why Choose UninexusHR?' : 'Welcome Back'}
        </motion.div>
        <motion.div 
          className="relative z-20 mt-auto space-y-8"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {pathname === '/register' ? (
            <>
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  variants={item}
                  className="flex items-start gap-4"
                  style={{ 
                    transitionDelay: `${index * 100}ms` 
                  }}
                >
                  <div className="rounded-lg bg-white/10 p-2">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="text-sm text-white/70">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
              <motion.div 
                variants={item} 
                className="pt-8"
              >
                <blockquote className="space-y-2 border-l-2 pl-6">
                  <p className="text-lg">
                    "The most comprehensive HR platform we've used. It has everything we need to manage our growing team effectively."
                  </p>
                  <footer className="text-sm">
                    Alex Chen, CEO at InnovateTech
                  </footer>
                </blockquote>
              </motion.div>
            </>
          ) : (
            <motion.div variants={item}>
              <blockquote className="space-y-2">
                <motion.p variants={item} className="text-lg">
                  "UninexusHR has transformed how we manage our organization. The platform is intuitive, powerful, and a joy to use."
                </motion.p>
                <motion.footer variants={item} className="text-sm">
                  Sofia Davis, Head of HR at TechCorp
                </motion.footer>
              </blockquote>
            </motion.div>
          )}
        </motion.div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          {children}
        </div>
      </div>
    </div>
  )
}
