'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Building2,
  Settings,
  LogOut,
  ChevronRight,
  Bell,
  FileText,
  ChevronFirst,
  ChevronLast,
  ShieldCheck,
} from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { motion, AnimatePresence } from 'framer-motion'

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: LayoutDashboard,
    badge: '2 New',
    badgeColor: 'bg-primary-500'
  },
  { 
    name: 'Members', 
    href: '/members', 
    icon: Users,
    badge: '12',
    badgeColor: 'bg-primary-500'
  },
  { 
    name: 'Organizations', 
    href: '/organizations', 
    icon: Building2 
  },
  { 
    name: 'Roles & Permissions', 
    href: '/roles', 
    icon: ShieldCheck 
  },
  // { 
  //   name: 'Documents', 
  //   href: '/documents', 
  //   icon: FileText,
  //   badge: '3',
  //   badgeColor: 'bg-amber-500'
  // },
  // { 
  //   name: 'Notifications', 
  //   href: '/notifications', 
  //   icon: Bell,
  //   badge: '5',
  //   badgeColor: 'bg-rose-500'
  // },
  { 
    name: 'Settings', 
    href: '/settings', 
    icon: Settings 
  },
]

const sidebarVariants = {
  expanded: {
    width: "288px",
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 25,
    },
  },
  collapsed: {
    width: "88px",
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 25,
    },
  },
}

const contentVariants = {
  expanded: {
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
  collapsed: {
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
}

export function Sidebar() {
  const pathname = usePathname()
  const { logout, user } = useAuthStore()
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <motion.div
      initial="expanded"
      animate={isExpanded ? "expanded" : "collapsed"}
      variants={sidebarVariants}
      className="relative flex h-screen flex-none flex-col overflow-y-auto bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 shadow-xl"
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-4 top-8 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-200"
      >
        {isExpanded ? (
          <ChevronFirst className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        ) : (
          <ChevronLast className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        )}
      </button>

      {/* Logo Section */}
      <div className="flex h-16 shrink-0 items-center border-b border-gray-100 dark:border-gray-800 px-6">
        <div className="flex items-center gap-2">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg">
            <img 
              src="/logo.png" 
              alt="UninexusHR Logo" 
              className="h-6 w-6 text-white"
            />
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-success-500 dark:border-gray-900" />
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                variants={contentVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                className="flex flex-col"
              >
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  UninexusHR
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Enterprise
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* User Profile Section */}
      <div className="mt-4 px-4">
        <div className="group relative rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500/20 to-primary-600/20 flex items-center justify-center">
                <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                  {user?.full_name?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-gray-900 bg-success-500" />
            </div>
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  variants={contentVariants}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                  className="flex flex-col min-w-0"
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[160px]">
                    {user?.full_name || 'User'}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[160px]">
                    {user?.email || 'user@example.com'}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {isExpanded && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 mt-6">
        {navigation.map((item, index) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group relative flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                'hover:bg-gray-50 dark:hover:bg-gray-800',
                isActive
                  ? 'bg-primary-50 dark:bg-primary-900/10 text-primary-600 dark:text-primary-400'
                  : 'text-gray-700 dark:text-gray-300'
              )}
            >
              <motion.div
                initial={false}
                animate={isActive ? {
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, 0],
                } : {}}
                transition={{ duration: 0.2 }}
              >
                <Icon 
                  className={cn(
                    'h-5 w-5 flex-shrink-0 transition-colors duration-200',
                    isActive 
                      ? 'text-primary-600 dark:text-primary-400' 
                      : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-400'
                  )}
                />
              </motion.div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    variants={contentVariants}
                    initial="collapsed"
                    animate="expanded"
                    exit="collapsed"
                    className="flex flex-1 items-center justify-between min-w-0"
                  >
                    <span className="truncate">{item.name}</span>

                    {item.badge && (
                      <span className={cn(
                        'inline-flex h-5 items-center justify-center rounded-full px-2 text-xs font-medium',
                        item.badgeColor ? `${item.badgeColor} text-white` : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-primary-500"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer Actions */}
      <div className="mt-auto p-4">
        <button
          onClick={logout}
          className="group flex w-full items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
        >
          <LogOut
            className="h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-red-500 dark:text-gray-500 dark:group-hover:text-red-400 transition-colors duration-200"
          />
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                variants={contentVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
              >
                Sign out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.div>
  )
}
