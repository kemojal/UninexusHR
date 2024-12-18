"use client"

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { UserPlus, CheckIcon, XIcon } from 'lucide-react'
import { useOrgStore } from '@/store/useOrgStore'
import { EmptyState } from '@/components/shared/empty-state'
import { useRouter } from 'next/navigation'

interface JoinRequest {
  id: number
  user: {
    id: number
    email: string
    full_name: string
  }
  organization: {
    id: number
    name: string
  }
  status: 'pending' | 'approved' | 'rejected'
  message: string
}

export default function JoinRequestsPage() {
  const { currentOrg } = useOrgStore()
  const router = useRouter()

  if (!currentOrg) {
    return (
      <EmptyState
        icon={UserPlus}
        title="No Organization Selected"
        description="You need to create or join an organization before you can manage join requests."
        action={{
          label: 'Create Organization',
          onClick: () => router.push('/onboarding')
        }}
      />
    )
  }

  const { data: requests, isLoading, error } = useQuery<JoinRequest[]>({
    queryKey: ['joinRequests'],
    queryFn: async () => {
      const response = await api.get('/join-requests/')
      return response.data
    }
  })

  const handleApprove = async (requestId: number) => {
    try {
      await api.post(`/join-requests/${requestId}/approve`)
      // Refetch the requests
      // queryClient.invalidateQueries(['joinRequests'])
    } catch (error) {
      console.error('Error approving request:', error)
    }
  }

  const handleReject = async (requestId: number) => {
    try {
      await api.post(`/join-requests/${requestId}/reject`)
      // Refetch the requests
      // queryClient.invalidateQueries(['joinRequests'])
    } catch (error) {
      console.error('Error rejecting request:', error)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error loading join requests</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Join Requests</h1>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Organization
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Message
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests?.map((request) => (
              <tr key={request.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <UserPlus className="h-10 w-10 rounded-full bg-gray-100 p-2" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {request.user.full_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {request.user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{request.organization.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{request.message}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    request.status === 'approved' 
                      ? 'bg-green-100 text-green-800'
                      : request.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {request.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(request.id)}
                        className="text-green-600 hover:text-green-900 mr-4"
                      >
                        <CheckIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <XIcon className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
