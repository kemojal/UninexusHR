'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Mail, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function AcceptInvitationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Verify the token and get invitation details
  const { data: invitation, isLoading, isError } = useQuery({
    queryKey: ['invitation', token],
    queryFn: async () => {
      const response = await api.get(`/invitations/verify/${token}`)
      return response.data
    },
    enabled: !!token
  })

  // Accept invitation mutation
  const acceptMutation = useMutation({
    mutationFn: async () => {
      return api.post(`/accept-invitation/${token}`)
    },
    onSuccess: () => {
      toast.success('Successfully joined the organization!')
      router.push('/dashboard')
    },
    onError: () => {
      toast.error('Failed to accept invitation')
    }
  })

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await api.get('/auth/me')
        setIsAuthenticated(true)
      } catch {
        setIsAuthenticated(false)
      }
    }
    checkAuth()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2 text-muted-foreground">Verifying invitation...</p>
        </motion.div>
      </div>
    )
  }

  if (isError || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <Card>
            <CardHeader>
              <CardTitle>Invalid Invitation</CardTitle>
              <CardDescription>
                This invitation link is invalid or has expired.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/">Return Home</Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <Card>
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-center">Organization Invitation</CardTitle>
            <CardDescription className="text-center">
              You've been invited to join {invitation.organization_name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Invited By</Label>
              <div className="text-sm text-muted-foreground">
                {invitation.inviter_name}
              </div>
            </div>
            <div className="space-y-1">
              <Label>Role</Label>
              <div className="text-sm text-muted-foreground capitalize">
                {invitation.role_name}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            {isAuthenticated ? (
              <Button 
                className="w-full" 
                onClick={() => acceptMutation.mutate()}
                disabled={acceptMutation.isPending}
              >
                {acceptMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Accepting Invitation...
                  </>
                ) : (
                  'Accept Invitation'
                )}
              </Button>
            ) : (
              <>
                <Button asChild variant="default" className="w-full">
                  <Link href={`/register?invitation=${token}`}>
                    Create Account
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/login?invitation=${token}`}>
                    Sign In
                  </Link>
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
