'use client'

import { useOrgStore } from '@/store/useOrgStore'
import { EmptyState } from '@/components/shared/empty-state'
import { Users, Search, Filter, MoreVertical, ChevronDown, Plus, Activity, Shield, Mail, X, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useCallback, useTransition } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { format, formatDistanceToNow } from 'date-fns'

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

interface Invitation {
  id: number
  email: string
  role_id: number
  is_accepted: boolean
  expires_at: string
  created_at: string
  invited_by: {
    id: number
    full_name: string
  }
}

export default function MembersPage() {
  const { currentOrg } = useOrgStore()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [selectedMembers, setSelectedMembers] = useState<number[]>([])
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [selectedTab, setSelectedTab] = useState('all')
  const [inviteEmail, setInviteEmail] = useState('')
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()

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
  const { data: roles = [], isLoading: isLoadingRoles } = useQuery<{ id: number; name: string }[]>({
    queryKey: ['roles', currentOrg?.id],
    queryFn: async () => {
      const response = await api.get(`/organizations/${currentOrg?.id}/roles`)
      return response.data || []
    },
    enabled: !!currentOrg
  })

  // Fetch invitations
  const { data: invitations = [], isLoading: isLoadingInvitations } = useQuery<Invitation[]>({
    queryKey: ['invitations', currentOrg?.id],
    queryFn: async () => {
      const response = await api.get(`/organizations/${currentOrg?.id}/invitations`)
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
      queryClient.invalidateQueries(['invitations'])
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to send invitation')
    }
  })

  // Cancel invitation mutation
  const cancelInvitationMutation = useMutation({
    mutationFn: async (invitationId: number) => {
      return api.delete(`/organizations/${currentOrg?.id}/invitations/${invitationId}`)
    },
    onSuccess: () => {
      toast.success('Invitation cancelled')
      queryClient.invalidateQueries(['invitations'])
    }
  })

  // Resend invitation mutation
  const resendInvitationMutation = useMutation({
    mutationFn: async (invitationId: number) => {
      return api.post(`/organizations/${currentOrg?.id}/invitations/${invitationId}/resend`)
    },
    onSuccess: () => {
      toast.success('Invitation resent successfully')
    }
  })

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault()
    inviteMutation.mutate()
  }

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRoles = selectedRoles.length === 0 || 
                        member.roles.some(role => selectedRoles.includes(role.name))
    const matchesTab = selectedTab === 'all' || 
                      (selectedTab === 'active' && member.is_active) ||
                      (selectedTab === 'inactive' && !member.is_active)
    return matchesSearch && matchesRoles && matchesTab
  })

  const filteredInvitations = invitations.filter(invitation => 
    invitation.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter
              {selectedRoles.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {selectedRoles.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Roles</h4>
                <div className="space-y-2">
                  {roles.map((role) => (
                    <div key={role.id} className="flex items-center space-x-2">
                      <Checkbox
                        checked={selectedRoles.includes(role.name)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedRoles([...selectedRoles, role.name])
                          } else {
                            setSelectedRoles(selectedRoles.filter(r => r !== role.name))
                          }
                        }}
                      />
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {role.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Members</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
          <TabsTrigger value="invitations">
            Invitations
            {invitations.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {invitations.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="invitations" className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Invited By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filteredInvitations.map((invitation) => (
                    <motion.tr
                      key={invitation.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          {invitation.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        {roles.find(r => r.id === invitation.role_id)?.name}
                      </TableCell>
                      <TableCell>{invitation.invited_by.full_name}</TableCell>
                      <TableCell>
                        <Badge variant={invitation.is_accepted ? "success" : "secondary"}>
                          {invitation.is_accepted ? "Accepted" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {formatDistanceToNow(new Date(invitation.expires_at), { addSuffix: true })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {!invitation.is_accepted && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => resendInvitationMutation.mutate(invitation.id)}
                                disabled={resendInvitationMutation.isPending}
                              >
                                Resend
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => cancelInvitationMutation.mutate(invitation.id)}
                                disabled={cancelInvitationMutation.isPending}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedMembers.length === filteredMembers.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedMembers(filteredMembers.map(m => m.id))
                        } else {
                          setSelectedMembers([])
                        }
                      }}
                    />
                  </TableHead>
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
                      className="group"
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedMembers.includes(member.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedMembers([...selectedMembers, member.id])
                            } else {
                              setSelectedMembers(selectedMembers.filter(id => id !== member.id))
                            }
                          }}
                        />
                      </TableCell>
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
                            <DropdownMenuGroup>
                              <DropdownMenuItem>
                                <Shield className="mr-2 h-4 w-4" />
                                Manage Roles
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Activity className="mr-2 h-4 w-4" />
                                View Activity
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
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
        </TabsContent>
      </Tabs>

      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleInvite} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              {/* {isLoadingRoles ? (
                <div className="h-[200px] flex items-center justify-center">
                  <div className="animate-spin">◌</div>
                </div>
              ) : (
                <Command className="rounded-lg border shadow-md">
                  <CommandInput placeholder="Search roles..." />
                  <CommandEmpty>No roles found.</CommandEmpty>
                  <CommandGroup>
                    {roles.map((role) => (
                      <CommandItem
                        key={role.id}
                        onSelect={() => setSelectedRoleId(role.id)}
                        className={cn(
                          "cursor-pointer",
                          selectedRoleId === role.id && "bg-primary/5"
                        )}
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        {role.name}
                        {selectedRoleId === role.id && (
                          <span className="ml-auto">✓</span>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              )} */}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setInviteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={inviteMutation.isPending || !selectedRoleId}
              >
                {inviteMutation.isPending ? (
                  <>
                    <motion.div
                      className="mr-2 h-4 w-4 animate-spin"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      ◌
                    </motion.div>
                    Sending...
                  </>
                ) : (
                  'Send Invitation'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {selectedMembers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-4 right-4 p-4 bg-background border rounded-lg shadow-lg"
        >
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              {selectedMembers.length} member{selectedMembers.length === 1 ? '' : 's'} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedMembers([])}
            >
              Clear
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                // Handle bulk delete
              }}
            >
              Remove
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
