"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrgStore } from "@/store/useOrgStore";
import { Building2, Users, Mail, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/shared/empty-state";

export default function OrgSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { currentOrg, setCurrentOrg } = useOrgStore();
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  // Fetch organization details
  const { data: org, isLoading } = useQuery({
    queryKey: ["organization", params.org_id],
    queryFn: async () => {
      const response = await api.get(`/organizations/${params.org_id}`);
      return response.data;
    },
  });

  // Update organization mutation
  const updateMutation = useMutation({
    mutationFn: async (data: { name?: string; description?: string }) => {
      const response = await api.put(`/organizations/${params.org_id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      setCurrentOrg(data);
      queryClient.invalidateQueries({
        queryKey: ["organization", params.org_id],
      });
      toast.success("Organization updated successfully");
    },
    onError: () => {
      toast.error("Failed to update organization");
    },
  });

  // Delete organization mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/organizations/${params.org_id}`);
    },
    onSuccess: () => {
      toast.success("Organization deleted successfully");
      router.push("/organizations");
      window.location.href = '/organizations';
    },
    onError: () => {
      toast.error("Failed to delete organization");
    },
  });

  const handleUpdateOrg = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateMutation.mutate({
      name: formData.get("name") as string,
      description: formData.get("description") as string,
    });
  };

  const handleDeleteOrg = () => {
    if (deleteConfirmation !== org?.name) {
      toast.error("Please type the organization name to confirm deletion");
      return;
    }
    deleteMutation.mutate();
  };

  if (!currentOrg) {
    return (
      <EmptyState
        icon={Building2}
        title="No Organization Selected"
        description="Please select an organization to manage its settings."
        action={{
          label: "View Organizations",
          onClick: () => router.push("/organizations"),
        }}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Organization Settings
        </h2>
        <p className="text-muted-foreground">
          Manage your organization's settings and preferences
        </p>
      </div>

      <Separator />

      <div className="grid gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Information</CardTitle>
            <CardDescription>
              Update your organization's basic information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              id="update-org-form"
              onSubmit={handleUpdateOrg}
              className="space-y-4"
            >
              <div className="grid gap-2">
                <Label htmlFor="name">Organization Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={org?.name}
                  placeholder="Enter organization name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={org?.description}
                  placeholder="Enter organization description"
                  rows={4}
                />
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              form="update-org-form"
              disabled={updateMutation.isPending}
            >
              Save Changes
            </Button>
          </CardFooter>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible and destructive actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-destructive/10 p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <div>
                  <h4 className="font-medium text-destructive">
                    Delete Organization
                  </h4>
                  <p className="text-sm text-destructive/80">
                    This action cannot be undone. This will permanently delete
                    the organization and remove all associated data.
                  </p>
                </div>
              </div>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete Organization
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the organization and remove all associated data.
                    <div className="mt-4">
                      <Label htmlFor="confirm">
                        Please type{" "}
                        <span className="font-medium">{org?.name}</span> to
                        confirm
                      </Label>
                      <Input
                        id="confirm"
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        placeholder="Enter organization name"
                        className="mt-2"
                      />
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteOrg}
                    disabled={deleteMutation.isPending}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
