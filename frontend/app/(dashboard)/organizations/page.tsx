"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Building2,
  Plus,
  Search,
  Settings2,
  Users2,
  ArrowRight,
  MoreVertical,
  Trash2,
} from "lucide-react";

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
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

interface Organization {
  id: number;
  name: string;
  description: string;
  member_count: number;
  created_at: string;
  industry?: string;
  logo_url?: string;
}

export default function OrganizationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [organization, setOrganization] = useState({ id: '', name: '', description: '' });

  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const { data: organizations = [], isLoading } = useQuery<Organization[]>({
    queryKey: ["organizations"],
    queryFn: async () => {
      const response = await api.get("/organizations");
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      const response = await api.post("/organizations", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      setIsCreateDialogOpen(false);
    },
  });

  const handleCreateOrganization = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      name: formData.get("name") as string,
      description: formData.get("description") as string,
    });
  };

  const filteredOrganizations = organizations.filter(
    (org) =>
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const deleteMutation = useMutation({
    mutationFn: async (orgId: number) => {
      await api.delete(`/organizations/${orgId}`);
    },
    onSuccess: () => {
      toast.success("Organization deleted successfully");
      router.push("/organizations");
      setDeleteConfirmation("");
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
    onError: () => {
      toast.error("Failed to delete organization");
    },
  });

  const handleDeleteOrg = (organization: Organization) => {
    // console.log("Attempting to delete organization:", organization);
    // console.log("Delete confirmation input:", deleteConfirmation);
    if (deleteConfirmation !== organization?.name) {
      toast.error("Please type the organization name to confirm deletion");
      return;
    }
    deleteMutation.mutate(organization.id);
  };

  const editMutation = useMutation({
    mutationFn: async (data: { id: number; name: string; description: string }) => {
      const response = await api.put(`/organizations/${data.id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      setIsEditDialogOpen(false);
      // Re-fetch organizations and sort them
      queryClient.setQueryData("organizations", (oldData) => {
        return oldData.sort((a, b) => a.name.localeCompare(b.name));
      });
    },
  });

  const handleEdit = async (event) => {
    event.preventDefault();
    editMutation.mutate(organization);
  };

  const handleEditOrg = (organization: Organization) => {
    setOrganization(organization);
    setIsEditDialogOpen(true);
  };

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
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/organizations/${org.id}/settings`)
                          }
                        >
                          <Settings2 className="mr-2 h-4 w-4" />
                          Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/organizations/${org.id}/members`)
                          }
                        >
                          <Users2 className="mr-2 h-4 w-4" />
                          Members
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditOrg(org)}>
                          <Settings2 className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              className="gap-2 bg-transparent text-red-500 hover:bg-red-500/90 hover:text-white h-8 gap-4 w-full align-start justify-start px-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Are you absolutely sure?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete the organization and remove
                                all associated data.
                                <div className="mt-4">
                                  <Label htmlFor="confirm">
                                    Please type{" "}
                                    <span className="font-bold text-black">
                                      {org?.name}
                                    </span>{" "}
                                    to confirm
                                  </Label>
                                  <Input
                                    id="confirm"
                                    value={deleteConfirmation}
                                    onChange={(e) =>
                                      setDeleteConfirmation(e.target.value)
                                    }
                                    placeholder="Enter organization name"
                                    className="mt-2"
                                  />
                                </div>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteOrg(org)}
                                disabled={deleteMutation.isPending}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={org.logo_url} />
                      <AvatarFallback>
                        {org.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
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
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Organization</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Organization Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Organization</DialogTitle>
            <DialogDescription>
              Edit your organization details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Organization Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={organization.name}
                  onChange={(e) => setOrganization({ ...organization, name: e.target.value })}
                  placeholder="Enter organization name"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  value={organization.description}
                  onChange={(e) => setOrganization({ ...organization, description: e.target.value })}
                  placeholder="Brief description of your organization"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Edit Organization</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
