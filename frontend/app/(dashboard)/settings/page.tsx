"use client"

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/store/useAuthStore'
import api from '@/lib/api'
import { 
  Settings, 
  User, 
  Lock, 
  Bell, 
  Shield, 
  Smartphone, 
  Globe, 
  HelpCircle,
  Check,
  X
} from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface UserProfile {
  id: number
  email: string
  full_name: string
  avatar_url?: string
  phone?: string
  timezone?: string
  language?: string
  two_factor_enabled?: boolean
  notification_settings?: {
    email_notifications: boolean
    push_notifications: boolean
    desktop_notifications: boolean
  }
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

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const { user } = useAuthStore()
  
  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const response = await api.get('/users/me')
      return response.data
    }
  })

  const updateProfile = useMutation({
    mutationFn: async (data: Partial<UserProfile>) => {
      const response = await api.put('/users/me', data)
      return response.data
    },
    onSuccess: () => {
      toast.success('Profile updated successfully')
    },
    onError: () => {
      toast.error('Failed to update profile')
    }
  })

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User, description: 'Manage your personal information' },
    { id: 'security', name: 'Security', icon: Lock, description: 'Secure your account' },
    { id: 'notifications', name: 'Notifications', icon: Bell, description: 'Control your notification preferences' },
    { id: 'privacy', name: 'Privacy', icon: Shield, description: 'Manage your privacy settings' },
    { id: 'devices', name: 'Devices', icon: Smartphone, description: 'View connected devices' },
    { id: 'help', name: 'Help & Support', icon: HelpCircle, description: 'Get help with your account' }
  ]

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <motion.div 
      className="p-6 space-y-6"
      initial="hidden"
      animate="show"
      variants={container}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <motion.div 
          className="lg:w-64 flex-shrink-0 space-y-2"
          variants={item}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <div>
                <div className="font-medium">{tab.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {tab.description}
                </div>
              </div>
            </button>
          ))}
        </motion.div>

        {/* Content */}
        <motion.div className="flex-1 space-y-6" variants={item}>
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={profile?.avatar_url} />
                        <AvatarFallback>{profile?.full_name?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <Button>Change Avatar</Button>
                    </div>
                    <Separator />
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input
                          id="full_name"
                          defaultValue={profile?.full_name}
                          onChange={(e) => updateProfile.mutate({ full_name: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          defaultValue={profile?.email}
                          disabled
                        />
                        <p className="text-sm text-gray-500">
                          Your email is used for sign-in and notifications
                        </p>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          defaultValue={profile?.phone}
                          onChange={(e) => updateProfile.mutate({ phone: e.target.value })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Preferences</CardTitle>
                    <CardDescription>Customize your account preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Language</Label>
                        <p className="text-sm text-gray-500">
                          Select your preferred language
                        </p>
                      </div>
                      <Button variant="outline">
                        <Globe className="mr-2 h-4 w-4" />
                        {profile?.language || 'English'}
                      </Button>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Timezone</Label>
                        <p className="text-sm text-gray-500">
                          Set your local timezone
                        </p>
                      </div>
                      <Button variant="outline">
                        {profile?.timezone || 'UTC'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Two-Factor Authentication</CardTitle>
                    <CardDescription>Add an extra layer of security to your account</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="font-medium">Two-Factor Authentication</div>
                        <p className="text-sm text-gray-500">
                          Protect your account with 2FA
                        </p>
                      </div>
                      <Switch
                        checked={profile?.two_factor_enabled}
                        onCheckedChange={(checked) => 
                          updateProfile.mutate({ two_factor_enabled: checked })
                        }
                      />
                    </div>
                    {profile?.two_factor_enabled && (
                      <div className="rounded-lg border border-gray-100 dark:border-gray-800 p-4">
                        <div className="font-medium">Recovery Codes</div>
                        <p className="text-sm text-gray-500 mt-1">
                          Keep these backup codes in a safe place
                        </p>
                        <div className="mt-4 grid grid-cols-2 gap-4">
                          {Array(8).fill(0).map((_, i) => (
                            <code key={i} className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                              XXXX-XXXX-XXXX
                            </code>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Password</CardTitle>
                    <CardDescription>Change your password</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="current_password">Current Password</Label>
                      <Input id="current_password" type="password" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="new_password">New Password</Label>
                      <Input id="new_password" type="password" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="confirm_password">Confirm New Password</Label>
                      <Input id="confirm_password" type="password" />
                    </div>
                    <Button className="w-full">Update Password</Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>Choose how you want to be notified</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="font-medium">Email Notifications</div>
                        <p className="text-sm text-gray-500">
                          Receive notifications via email
                        </p>
                      </div>
                      <Switch
                        checked={profile?.notification_settings?.email_notifications}
                        onCheckedChange={(checked) => 
                          updateProfile.mutate({
                            notification_settings: {
                              ...profile?.notification_settings,
                              email_notifications: checked
                            }
                          })
                        }
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="font-medium">Push Notifications</div>
                        <p className="text-sm text-gray-500">
                          Receive push notifications on your devices
                        </p>
                      </div>
                      <Switch
                        checked={profile?.notification_settings?.push_notifications}
                        onCheckedChange={(checked) => 
                          updateProfile.mutate({
                            notification_settings: {
                              ...profile?.notification_settings,
                              push_notifications: checked
                            }
                          })
                        }
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="font-medium">Desktop Notifications</div>
                        <p className="text-sm text-gray-500">
                          Show notifications on your desktop
                        </p>
                      </div>
                      <Switch
                        checked={profile?.notification_settings?.desktop_notifications}
                        onCheckedChange={(checked) => 
                          updateProfile.mutate({
                            notification_settings: {
                              ...profile?.notification_settings,
                              desktop_notifications: checked
                            }
                          })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  )
}
