'use client'

import Link from 'next/link'
import { LoginForm } from '@/components/auth/login-form'
import { motion } from 'framer-motion'
import { Building2, ArrowRight } from 'lucide-react'

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

export default function LoginPage() {
  return (
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
        <div className="flex flex-col space-y-2 text-center">
          <motion.h1 
            variants={item}
            className="text-2xl font-semibold tracking-tight"
          >
            Welcome back
          </motion.h1>
          <motion.p 
            variants={item}
            className="text-sm text-muted-foreground"
          >
            Enter your credentials to access your account
          </motion.p>
        </div>

        <motion.div variants={item}>
          <LoginForm />
        </motion.div>

        <motion.p 
          variants={item}
          className="px-8 text-center text-sm text-muted-foreground"
        >
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="inline-flex items-center text-primary hover:text-primary/90 underline-offset-4 gap-1 group"
          >
            Register
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.p>
      </motion.div>
    </motion.div>
  )
}
