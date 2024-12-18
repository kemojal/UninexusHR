'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import { Sidebar } from '@/components/dashboard/sidebar'
import { UserMenu } from '@/components/dashboard/user-menu'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated, user, checkAuth } = useAuthStore()

  useEffect(() => {
    const initAuth = async () => {
      if (!isAuthenticated()) {
        router.push('/login')
        return
      }

      // If authenticated but no user data, fetch it
      if (!user) {
        try {
          await checkAuth()
        } catch (error) {
          console.error('Failed to fetch user data:', error)
          router.push('/login')
        }
      }
    }

    initAuth()
  }, [isAuthenticated, user, checkAuth, router])

  // Show loading state while checking authentication
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm">
          <div className="h-full px-4 flex items-center justify-end">
            <UserMenu />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  )
}
