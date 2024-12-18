'use client'

import { useState } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Bell, 
  Settings, 
  User, 
  LogOut, 
  Search,
  HelpCircle,
  MessageSquare,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function Header() {
  const { user, logout } = useAuthStore()
  const [showSearch, setShowSearch] = useState(false)
  const [hasNotifications] = useState(true)

  // Get user's initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left side - Search */}
        <div className="flex items-center flex-1 max-w-2xl">
          <AnimatePresence>
            {showSearch ? (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "100%" }}
                exit={{ opacity: 0, width: 0 }}
                className="w-full max-w-lg"
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search..."
                    className="w-full bg-gray-50 dark:bg-gray-800 pl-10 pr-4 h-9 text-sm focus:ring-2 ring-primary-500/20"
                  />
                </div>
              </motion.div>
            ) : (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowSearch(true)}
                className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Search className="h-4 w-4" />
                <span>Quick search...</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Help */}
          <Button variant="ghost" size="icon" className="rounded-full">
            <HelpCircle className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </Button>

          {/* Messages */}
          <Button variant="ghost" size="icon" className="rounded-full">
            <MessageSquare className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </Button>

          {/* Notifications */}
          <div className="relative">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              {hasNotifications && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary-500 ring-2 ring-white dark:ring-gray-900" />
              )}
            </Button>
          </div>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-9 w-9 rounded-full"
              >
                <Avatar className="h-9 w-9 transition-transform hover:scale-105">
                  <AvatarImage src={user?.avatar_url} />
                  <AvatarFallback className="bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300">
                    {user?.full_name ? getInitials(user.full_name) : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 mt-2 p-2">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-2 p-2">
                  <p className="text-sm font-medium leading-none text-gray-900 dark:text-gray-100">
                    {user?.full_name}
                  </p>
                  <p className="text-xs leading-none text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="flex items-center gap-2 text-red-600 dark:text-red-400 cursor-pointer"
                onClick={logout}
              >
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
