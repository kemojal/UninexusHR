'use client'

import { useState, useEffect } from 'react'
import { Building2, Users, Mail } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useOrgStore } from '@/store/useOrgStore'
import { useAuthStore } from '@/store/useAuthStore' // Import useAuthStore
import api from '@/lib/api'
import { toast } from 'sonner'

interface InviteMember {
  email: string
  role: string
}

export default function OnboardingPage() {
  const [step, setStep] = useState<'choose' | 'create' | 'invite' | 'join'>('choose')
  const [orgData, setOrgData] = useState({
    name: '',
    industry: 'Technology',
  })
  const [invites, setInvites] = useState<InviteMember[]>([])
  const [currentInvite, setCurrentInvite] = useState({ email: '', role: 'member' })
  const router = useRouter()
  const { setCurrentOrg, setOrganizations } = useOrgStore()
  const { user, token } = useAuthStore() // Get user and token from useAuthStore

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!token) {
      router.push('/login')
    }
  }, [token, router])

  // If not authenticated, show loading state
  if (!token) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await api.post('/organizations', orgData)
      const newOrg = response.data
      setCurrentOrg(newOrg)
      setOrganizations([newOrg])
      setStep('invite')
      toast.success('Organization created successfully!')
    } catch (error) {
      toast.error('Failed to create organization')
    }
  }

  const addInvite = () => {
    if (!currentInvite.email) return
    setInvites([...invites, currentInvite])
    setCurrentInvite({ email: '', role: 'member' })
  }

  const handleInviteMembers = async () => {
    try {
      // Send invites to the backend
      await Promise.all(
        invites.map(invite => 
          api.post('/organizations/invite', {
            email: invite.email,
            role: invite.role,
            organization_id: orgData.id
          })
        )
      )
      toast.success('Invitations sent successfully!')
      router.push('/dashboard')
    } catch (error) {
      toast.error('Failed to send invitations')
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      {step === 'choose' && (
        <div className="space-y-6 text-center">
          <h1 className="text-3xl font-bold">Welcome to UninexusHR</h1>
          <p className="text-gray-500">Choose how you want to get started</p>
          
          <div className="mt-8 grid grid-cols-2 gap-4">
            <button
              onClick={() => setStep('create')}
              className="flex flex-col items-center space-y-4 rounded-lg border border-gray-200 p-6 hover:border-blue-500 hover:bg-blue-50"
            >
              <Building2 className="h-8 w-8 text-blue-500" />
              <div>
                <h3 className="font-medium">Create Organization</h3>
                <p className="mt-1 text-sm text-gray-500">Start from scratch and invite your team</p>
              </div>
            </button>
            
            <button
              onClick={() => setStep('join')}
              className="flex flex-col items-center space-y-4 rounded-lg border border-gray-200 p-6 hover:border-blue-500 hover:bg-blue-50"
            >
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <h3 className="font-medium">Join Organization</h3>
                <p className="mt-1 text-sm text-gray-500">Join an existing organization</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {step === 'create' && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Create Organization</h2>
            <p className="mt-2 text-gray-500">Set up your organization details</p>
          </div>

          <form onSubmit={handleCreateOrg} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Organization Name</label>
              <input
                type="text"
                value={orgData.name}
                onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="Enter organization name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Industry</label>
              <select
                value={orgData.industry}
                onChange={(e) => setOrgData({ ...orgData, industry: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                required
              >
                <option value="Technology">Technology</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Finance">Finance</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              Continue to Invite Members
            </button>
          </form>
        </div>
      )}

      {step === 'invite' && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Invite Team Members</h2>
            <p className="mt-2 text-gray-500">Add people to your organization</p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="email"
                  value={currentInvite.email}
                  onChange={(e) => setCurrentInvite({ ...currentInvite, email: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="Enter email address"
                />
              </div>
              <select
                value={currentInvite.role}
                onChange={(e) => setCurrentInvite({ ...currentInvite, role: e.target.value })}
                className="rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
              <button
                onClick={addInvite}
                className="rounded-md bg-gray-100 px-4 py-2 hover:bg-gray-200"
              >
                Add
              </button>
            </div>

            {invites.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium">Pending Invites</h3>
                {invites.map((invite, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-md border border-gray-200 p-2"
                  >
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{invite.email}</span>
                      <span className="text-sm text-gray-500">({invite.role})</span>
                    </div>
                    <button
                      onClick={() => setInvites(invites.filter((_, i) => i !== index))}
                      className="text-red-500 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex-1 rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50"
              >
                Skip for Now
              </button>
              <button
                onClick={handleInviteMembers}
                className="flex-1 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              >
                Send Invites & Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'join' && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Join Organization</h2>
            <p className="mt-2 text-gray-500">Enter your invitation code or organization ID</p>
          </div>

          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Invitation Code</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="Enter invitation code"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              Join Organization
            </button>
          </form>
        </div>
      )}

      {step !== 'choose' && (
        <button
          onClick={() => setStep('choose')}
          className="mt-4 text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back to options
        </button>
      )}
    </div>
  )
}
