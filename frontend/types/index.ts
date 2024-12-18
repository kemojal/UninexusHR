export interface User {
  id: number
  email: string
  fullName: string
  isActive: boolean
  isSuperuser: boolean
  status: 'pending' | 'active' | 'rejected' | 'invited'
  roles: Role[]
  organizationId: number
}

export interface Role {
  id: number
  name: string
  description: string
  permissions: Permission[]
  organizationId: number
}

export interface Permission {
  id: number
  name: string
  description: string
}

export interface Organization {
  id: number
  name: string
  description: string
  users: User[]
  roles: Role[]
}

export interface JoinRequest {
  id: number
  userId: number
  organizationId: number
  status: 'pending' | 'active' | 'rejected'
  message: string
  user: User
  organization: Organization
}
