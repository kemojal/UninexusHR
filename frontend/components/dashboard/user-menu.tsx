"use client"

import { useAuthStore } from '@/store/useAuthStore'
import { LogOut, User } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export function UserMenu() {
  const { user, logout } = useAuthStore()

  if (!user) return null

  // Get user's initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <div className="flex items-center gap-2 rounded-full bg-gray-100 p-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {user.full_name ? getInitials(user.full_name) : 'U'}
            </AvatarFallback>
          </Avatar>
          <span>{user.full_name}</span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.full_name}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => logout()}
          className="text-red-600 focus:bg-red-50 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
