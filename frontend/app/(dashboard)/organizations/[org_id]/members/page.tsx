'use client'

import { useOrgStore } from '@/store/useOrgStore'
import { EmptyState } from '@/components/shared/empty-state'
import { Users, Search, Filter, MoreVertical, Plus, Mail, X, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface Member {
  id: number
  email: string
  full_name: string
  is_active: boolean
  roles: Array<{
    id: number
    name: string
  }>
  last_active: string
  avatar_url?: string
}

export default function MembersPage() {
  const { currentOrg } = useOrgStore()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null)

  // Fetch members
  const { data: members = [], isLoading: isLoadingMembers } = useQuery<Member[]>({
    queryKey: ['members', currentOrg?.id],
    queryFn: async () => {
      const response = await api.get(`/organizations/${currentOrg?.id}/members`)
      return response.data
    },
    enabled: !!currentOrg
  })

  // Fetch roles
  const { data: roles = [], isLoading: isLoadingRoles } = useQuery({
    queryKey: ['roles', currentOrg?.id],
    queryFn: async () => {
      const response = await api.get(`/organizations/${currentOrg?.id}/roles`)
      return response.data
    },
    enabled: !!currentOrg
  })

  // Send invitation mutation
  const inviteMutation = useMutation({
    mutationFn: async () => {
      if (!selectedRoleId) throw new Error('Please select a role')
      return api.post(`/organizations/${currentOrg?.id}/invitations`, {
        email: inviteEmail,
        role_id: selectedRoleId
      })
    },
    onSuccess: () => {
      toast.success('Invitation sent successfully')
      setInviteDialogOpen(false)
      setInviteEmail('')
      setSelectedRoleId(null)
      queryClient.invalidateQueries(['members'])
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to send invitation')
    }
  })

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  if (!currentOrg) {
    return (
      <EmptyState
        icon={Users}
        title="No Organization Selected"
        description="You need to create or join an organization before you can manage members."
        action={{
          label: 'Create Organization',
          onClick: () => router.push('/organizations')
        }}
      />
    )
  }

  return (
    <motion.div
      className="p-6 space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Members</h2>
          <p className="text-sm text-muted-foreground">
            Manage your organization members, roles, and permissions.
          </p>
        </div>
        <Button onClick={() => setInviteDialogOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Invite Member
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search members..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {filteredMembers.map((member) => (
                <motion.tr
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={member.avatar_url} />
                        <AvatarFallback>{member.full_name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{member.full_name}</div>
                        <div className="text-sm text-muted-foreground">{member.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {member.roles.map(role => (
                        <Badge key={role.id} variant="outline" className="capitalize">
                          {role.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.is_active ? "success" : "secondary"}>
                      {member.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(member.last_active), 'MMM d, yyyy')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Shield className="mr-2 h-4 w-4" />
                          Manage Roles
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Activity className="mr-2 h-4 w-4" />
                          View Activity
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          Remove from Organization
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>
    </motion.div>
  )
}
