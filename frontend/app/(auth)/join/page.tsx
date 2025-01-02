'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

export default function JoinPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [invitation, setInvitation] = useState<{
    organization_name: string;
    email: string;
    token: string;
  } | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      toast({
        variant: "destructive",
        title: "Invalid Invitation",
        description: "No invitation token provided. Please check your invitation link.",
      });
      router.push('/');
      return;
    }

    // Fetch invitation details
    const fetchInvitation = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/invitations/${token}`);
        if (!response.ok) throw new Error('Invalid invitation');
        const data = await response.json();
        setInvitation(data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Invalid Invitation",
          description: "This invitation link is invalid or has expired.",
        });
        router.push('/');
      }
    };

    fetchInvitation();
  }, [searchParams, router, toast]);

  const handleJoin = async () => {
    if (!invitation) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/invitations/${invitation.token}/accept`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to accept invitation');

      toast({
        title: "Welcome aboard! 🎉",
        description: `You've successfully joined ${invitation.organization_name}`,
      });

      router.push('/dashboard');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to accept the invitation. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!invitation) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container flex min-h-screen flex-col items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-8">
            <Image
              src="/logo.png"
              alt="UninexusHR Logo"
              width={180}
              height={40}
              priority
            />
          </div>
          <CardTitle className="text-2xl font-bold">Join {invitation.organization_name}</CardTitle>
          <CardDescription>
            You've been invited to join {invitation.organization_name} on UninexusHR
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={invitation.email}
              disabled
              className="bg-muted"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={handleJoin}
            disabled={isLoading}
          >
            {isLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Accept Invitation
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}