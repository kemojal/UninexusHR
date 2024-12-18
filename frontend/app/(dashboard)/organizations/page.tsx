'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Building2, Plus, Search, Settings2, Users2, ArrowRight, MoreVertical } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Organization {
  id: number
  name: string
  description: string
  member_count: number
  created_at: string
  industry?: string
  logo_url?: string
}

export default function OrganizationsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const { data: organizations = [], isLoading } = useQuery<Organization[]>({
    queryKey: ['organizations'],
    queryFn: async () => {
      const response = await api.get('/organizations')
      return response.data
    }
  })

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      const response = await api.post('/organizations', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      setIsCreateDialogOpen(false)
    }
  })

  const handleCreateOrganization = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    createMutation.mutate({
      name: formData.get('name') as string,
      description: formData.get('description') as string,
    })
  }

  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <motion.div 
      className="p-6 space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Organizations
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your organizations and their settings
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Organization
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
        <Input
          placeholder="Search organizations..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Organizations Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {filteredOrganizations.map((org, index) => (
            <motion.div
              key={org.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, delay: index * 0.1 }}
            >
              <Card className="group overflow-hidden">
                <CardHeader className="relative border-b border-gray-100 dark:border-gray-800">
                  <div className="absolute right-6 top-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/organizations/${org.id}/settings`)}>
                          <Settings2 className="mr-2 h-4 w-4" />
                          Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/organizations/${org.id}/members`)}>
                          <Users2 className="mr-2 h-4 w-4" />
                          Members
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={org.logo_url} />
                      <AvatarFallback>
                        {org.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-xl">{org.name}</CardTitle>
                      <CardDescription className="mt-1">
                        Created {new Date(org.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {org.description}
                  </p>
                  <div className="mt-4 flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Users2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {org.member_count} members
                      </span>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 dark:bg-gray-800/50 p-6">
                  <Button 
                    variant="ghost" 
                    className="ml-auto gap-2 group-hover:translate-x-1 transition-transform"
                    onClick={() => router.push(`/organizations/${org.id}`)}
                  >
                    View Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Create Organization Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Organization</DialogTitle>
            <DialogDescription>
              Add a new organization to manage your team and resources.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateOrganization}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Organization Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter organization name"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Brief description of your organization"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Organization</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
