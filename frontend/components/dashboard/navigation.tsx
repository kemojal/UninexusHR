"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Users, 
  Building2, 
  ShieldCheck, 
  UserPlus, 
  Settings,
  LayoutDashboard
} from 'lucide-react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Members',
    href: '/members',
    icon: Users,
  },
  {
    name: 'Organizations',
    href: '/organizations',
    icon: Building2,
  },
  {
    name: 'Roles & Permissions',
    href: '/roles',
    icon: ShieldCheck,
  },
  {
    name: 'Join Requests',
    href: '/requests',
    icon: UserPlus,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center space-x-4">
      {navigation.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-gray-100 ${
              isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-500'
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.name}
          </Link>
        )
      })}
    </nav>
  )
}
