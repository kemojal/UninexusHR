"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Users,
  Settings2,
  Shield,
  Building2,
  Activity,
  ChevronRight,
  Mail,
  Calendar,
  Clock,
  Plus,
  Trash,
  Edit,
  LayoutGrid,
  List,
  UserPlus,
  Users2,
  Key,
} from "lucide-react";
import { format } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

interface Permission {
  id: number;
  name: string;
  description: string | null;
  category: string;
  organization_id: number;
  created_at: string;
  updated_at: string;
}

interface Role {
  id: number;
  name: string;
  description: string | null;
  organization_id: number;
  permissions: Permission[];
  created_at: string;
  updated_at: string;
  member_count?: number;
}

interface Member {
  id: number;
  email: string;
  full_name: string;
  avatar_url?: string;
  roles: Role[];
  last_active: string;
}

interface Organization {
  id: number;
  name: string;
  description: string | null;
  industry: string;
  created_at: string;
  updated_at: string;
}

export default function OrganizationPage({
  params,
}: {
  params: { org_id: string };
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [permissionsViewMode, setPermissionsViewMode] = useState<
    "grid" | "list"
  >("grid");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [createRoleDialogOpen, setCreateRoleDialogOpen] = useState(false);
  const [editRoleDialogOpen, setEditRoleDialogOpen] = useState(false);
  const [editPermissionDialogOpen, setEditPermissionDialogOpen] = useState(
    false
  );
  const [createPermissionDialogOpen, setCreatePermissionDialogOpen] = useState(
    false
  );
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
    permissions: [],
  });
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(
    null
  );
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
  const [editingPermissionId, setEditingPermissionId] = useState<number | null>(
    null
  );
  const [rolesPermissionsTab, setRolesPermissionsTab] = useState<
    "roles" | "permissions"
  >("roles");
  const [newPermission, setNewPermission] = useState({
    name: "",
    description: "",
    category: "",
  });

  // Helper function to safely format dates
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  // Fetch organization details
  const { data: organization, isLoading: isLoadingOrg } = useQuery({
    queryKey: ["organization", params.org_id],
    queryFn: async () => {
      const response = await api.get(`/organizations/${params.org_id}`);
      return response.data;
    },
  });

  // Fetch members
  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ["members", params.org_id],
    queryFn: async () => {
      const response = await api.get(
        `/organizations/${params.org_id}/members`
      );
      return response.data;
    },
    enabled: activeTab === "members",
  });

  // Fetch roles
  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ["roles", params.org_id],
    queryFn: async () => {
      const response = await api.get(`/organizations/${params.org_id}/roles`);
      return response.data;
    },
    enabled: activeTab === "roles" && rolesPermissionsTab === "roles",
  });

  // Fetch permissions
  const { data: permissions = [], isLoading: permissionsLoading } = useQuery({
    queryKey: ["permissions", params.org_id],
    queryFn: async () => {
      const response = await api.get(
        `/organizations/${params.org_id}/permissions`
      );
      return response.data;
    },
    enabled: activeTab === "roles" && rolesPermissionsTab === "permissions",
  });

  // Invite member mutation
  const inviteMutation = useMutation({
    mutationKey: ["invite-member", params.org_id],
    mutationFn: async () => {
      if (!selectedRoleId) throw new Error("Please select a role");
      const response = await api.post(`/organizations/${params.org_id}/members/invite`, {
        email: inviteEmail,
        role_id: selectedRoleId,
      });
      return response;
    },
    onSuccess: () => {
      toast.success("Invitation sent successfully");
      setInviteDialogOpen(false);
      setInviteEmail("");
      setSelectedRoleId(null);
      queryClient.invalidateQueries({ queryKey: ["members", params.org_id] });
    },
    onError: (error: any) => {
      // Check if it's a known error case
      if (error.response?.status === 400 && error.response?.data?.detail?.includes("already a member")) {
        toast.warning("This user is already a member of this organization");
      } else {
        toast.error(error.response?.data?.detail || "Failed to send invitation");
      }
      // Keep the dialog open for 400 errors so user can correct the input
      if (error.response?.status !== 400) {
        setInviteDialogOpen(false);
      }
    },
  });

  // Create role mutation
  const createRoleMutation = useMutation({
    mutationKey: ["create-role", params.org_id],
    mutationFn: async () => {
      return api.post(`/organizations/${params.org_id}/roles`, newRole);
    },
    onSuccess: () => {
      toast.success("Role created successfully");
      setCreateRoleDialogOpen(false);
      setNewRole({ name: "", description: "", permissions: [] });
      queryClient.invalidateQueries({ queryKey: ["roles", params.org_id] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to create role");
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationKey: ["update-role", params.org_id],
    mutationFn: async () => {
      if (!editingRole) throw new Error("No role selected");
      return api.put(
        `/organizations/${params.org_id}/roles/${editingRole.id}`,
        {
          name: editingRole.name,
          description: editingRole.description,
          permissions: editingRole.permissions.map((p) => p.id),
        }
      );
    },
    onSuccess: () => {
      toast.success("Role updated successfully");
      setEditRoleDialogOpen(false);
      setEditingRole(null);
      queryClient.invalidateQueries({ queryKey: ["roles", params.org_id] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to update role");
    },
  });

  // Delete role mutation
  const deleteRoleMutation = useMutation({
    mutationKey: ["delete-role", params.org_id],
    mutationFn: async (roleId: number) => {
      const response = await api.delete(
        `/organizations/${params.org_id}/roles/${roleId}`
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Role deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["roles", params.org_id] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to delete role");
    },
  });

  // Create permission mutation
  const createPermissionMutation = useMutation({
    mutationKey: ["create-permission", params.org_id],
    mutationFn: async () => {
      return api.post(
        `/organizations/${params.org_id}/permissions`,
        newPermission
      );
    },
    onSuccess: () => {
      toast.success("Permission created successfully");
      setCreatePermissionDialogOpen(false);
      setNewPermission({ name: "", description: "", category: "" });
      queryClient.invalidateQueries({ queryKey: ["permissions", params.org_id] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail || "Failed to create permission"
      );
    },
  });

  // Update permission mutation
  const updatePermissionMutation = useMutation({
    mutationKey: ["update-permission", params.org_id],
    mutationFn: async () => {
      if (!editingPermission) throw new Error("No permission selected");
      return api.put(
        `/organizations/${params.org_id}/permissions/${editingPermission.id}`,
        {
          name: editingPermission.name,
          description: editingPermission.description,
          category: editingPermission.category,
        }
      );
    },
    onSuccess: () => {
      toast.success("Permission updated successfully");
      setEditPermissionDialogOpen(false);
      setEditingPermission(null);
      queryClient.invalidateQueries({ queryKey: ["permissions", params.org_id] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail || "Failed to update permission"
      );
    },
  });

  // Delete permission mutation
  const deletePermissionMutation = useMutation({
    mutationKey: ["delete-permission", params.org_id],
    mutationFn: async (permissionId: number) => {
      const response = await api.delete(
        `/organizations/${params.org_id}/permissions/${permissionId}`
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Permission deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["permissions", params.org_id] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail || "Failed to delete permission"
      );
    },
  });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    inviteMutation.mutate();
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    createRoleMutation.mutate();
  };

  const handleCreatePermission = (e: React.FormEvent) => {
    e.preventDefault();
    createPermissionMutation.mutate();
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setEditRoleDialogOpen(true);
  };

  const handleEditPermission = (permission: Permission) => {
    setEditingPermission(permission);
    setEditPermissionDialogOpen(true);
  };

  const handleEditRoleClose = () => {
    setEditingRole(null);
    setEditRoleDialogOpen(false);
  };

  const handleEditPermissionClose = () => {
    setEditingPermission(null);
    setEditPermissionDialogOpen(false);
  };

  const handleUpdateRole = (e: React.FormEvent) => {
    e.preventDefault();
    updateRoleMutation.mutate();
  };

  const handleUpdatePermission = (e: React.FormEvent) => {
    e.preventDefault();
    updatePermissionMutation.mutate();
  };

  const handleDeleteRole = async (roleId: number) => {
    if (
      window.confirm(
        "Are you sure you want to delete this role? This action cannot be undone."
      )
    ) {
      deleteRoleMutation.mutate(roleId);
    }
  };

  const handleDeletePermission = async (permissionId: number) => {
    if (
      window.confirm(
        "Are you sure you want to delete this permission? This action cannot be undone."
      )
    ) {
      deletePermissionMutation.mutate(permissionId);
    }
  };

  if (isLoadingOrg) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-10 w-1/4" />
          <Skeleton className="h-4 w-2/4" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Organization not found</AlertDescription>
      </Alert>
    );
  }

  return (
    <motion.div
      className="p-6 space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={organization.logo_url} />
            <AvatarFallback>
              {organization.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{organization.name}</h1>
            <p className="text-sm text-muted-foreground">
              {organization.industry}
            </p>
          </div>
        </div>
        <Button variant="outline" className="gap-2">
          <Settings2 className="w-4 h-4" />
          Settings
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Members
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organization.member_count}
            </div>
            <p className="text-xs text-muted-foreground">Active team members</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Roles
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organization.role_count}</div>
            <p className="text-xs text-muted-foreground">
              Custom roles defined
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Created
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organization.created_at
                ? formatDate(organization.created_at)
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">Organization age</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
              <CardDescription>
                Organization details and information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">Description</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {organization.description}
                </p>
              </div>
              <div>
                <h3 className="font-medium">Industry</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {organization.industry}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Members</CardTitle>
                <CardDescription>
                  Manage organization members and their roles
                </CardDescription>
              </div>
              <Dialog
                open={inviteDialogOpen}
                onOpenChange={setInviteDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Mail className="w-4 h-4" />
                    Invite Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Member</DialogTitle>
                    <DialogDescription>
                      Send an invitation to join the organization
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleInvite} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="Enter email address"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <select
                        className="w-full rounded-md border p-2"
                        value={selectedRoleId || ""}
                        onChange={(e) =>
                          setSelectedRoleId(Number(e.target.value))
                        }
                        required
                      >
                        <option value="">Select a role</option>
                        {roles?.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </select>
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
                        {inviteMutation.isPending
                          ? "Sending..."
                          : "Send Invitation"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {membersLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                </div>
              ) : (
                <div className="space-y-4">
                  {members?.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={member.avatar_url} />
                          <AvatarFallback>
                            {member.full_name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{member.full_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {member.email}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex gap-2">
                          {member.roles?.map((role) => (
                            <Badge key={role.id} variant="secondary">
                              {role.name}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {member.last_active
                            ? formatDate(member.last_active)
                            : "Never"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <CardTitle>Roles & Permissions</CardTitle>
                  <CardDescription>
                    Manage roles and their associated permissions
                  </CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border rounded-lg">
                    <Button
                      variant={
                        rolesPermissionsTab === "roles" ? "secondary" : "ghost"
                      }
                      size="sm"
                      className="gap-2"
                      onClick={() => setRolesPermissionsTab("roles")}
                    >
                      <Shield className="w-4 h-4" />
                      Roles
                    </Button>
                    <Button
                      variant={
                        rolesPermissionsTab === "permissions"
                          ? "secondary"
                          : "ghost"
                      }
                      size="sm"
                      className="gap-2"
                      onClick={() => setRolesPermissionsTab("permissions")}
                    >
                      <Key className="w-4 h-4" />
                      Permissions
                    </Button>
                  </div>
                </div>
              </div>
              {rolesPermissionsTab === "roles" ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border rounded-lg">
                      <Button
                        variant={viewMode === "grid" ? "secondary" : "ghost"}
                        size="sm"
                        className="gap-2"
                        onClick={() => setViewMode("grid")}
                      >
                        <LayoutGrid className="w-4 h-4" />
                        Grid
                      </Button>
                      <Button
                        variant={viewMode === "list" ? "secondary" : "ghost"}
                        size="sm"
                        className="gap-2"
                        onClick={() => setViewMode("list")}
                      >
                        <List className="w-4 h-4" />
                        List
                      </Button>
                    </div>
                  </div>
                  <Dialog
                    open={createRoleDialogOpen}
                    onOpenChange={setCreateRoleDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="w-4 h-4" />
                        Create Role
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Role</DialogTitle>
                        <DialogDescription>
                          Create a new role with specific permissions
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCreateRole} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Role Name</Label>
                          <Input
                            id="name"
                            value={newRole.name}
                            onChange={(e) =>
                              setNewRole({ ...newRole, name: e.target.value })
                            }
                            placeholder="Enter role name"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={newRole.description}
                            onChange={(e) =>
                              setNewRole({
                                ...newRole,
                                description: e.target.value,
                              })
                            }
                            placeholder="Enter role description"
                            required
                          />
                        </div>
                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setCreateRoleDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={createRoleMutation.isPending}
                          >
                            {createRoleMutation.isPending
                              ? "Creating..."
                              : "Create Role"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border rounded-lg">
                      <Button
                        variant={
                          permissionsViewMode === "grid" ? "secondary" : "ghost"
                        }
                        size="sm"
                        className="gap-2"
                        onClick={() => setPermissionsViewMode("grid")}
                      >
                        <LayoutGrid className="w-4 h-4" />
                        Grid
                      </Button>
                      <Button
                        variant={
                          permissionsViewMode === "list" ? "secondary" : "ghost"
                        }
                        size="sm"
                        className="gap-2"
                        onClick={() => setPermissionsViewMode("list")}
                      >
                        <List className="w-4 h-4" />
                        List
                      </Button>
                    </div>
                  </div>
                  <Dialog
                    open={createPermissionDialogOpen}
                    onOpenChange={setCreatePermissionDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="w-4 h-4" />
                        Create Permission
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Permission</DialogTitle>
                        <DialogDescription>
                          Create a new permission for your organization
                        </DialogDescription>
                      </DialogHeader>
                      <form
                        onSubmit={handleCreatePermission}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <Label htmlFor="name">Permission Name</Label>
                          <Input
                            id="name"
                            value={newPermission.name}
                            onChange={(e) =>
                              setNewPermission({
                                ...newPermission,
                                name: e.target.value,
                              })
                            }
                            placeholder="Enter permission name"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={newPermission.description}
                            onChange={(e) =>
                              setNewPermission({
                                ...newPermission,
                                description: e.target.value,
                              })
                            }
                            placeholder="Enter permission description"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <select
                            id="category"
                            className="w-full rounded-md border p-2"
                            value={newPermission.category}
                            onChange={(e) =>
                              setNewPermission({
                                ...newPermission,
                                category: e.target.value,
                              })
                            }
                            required
                          >
                            <option value="">Select a category</option>
                            <option value="members">Members</option>
                            <option value="roles">Roles</option>
                            <option value="analytics">Analytics</option>
                            <option value="settings">Settings</option>
                            <option value="billing">Billing</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setCreatePermissionDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={createPermissionMutation.isPending}
                          >
                            {createPermissionMutation.isPending
                              ? "Creating..."
                              : "Create Permission"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {rolesPermissionsTab === "roles" ? (
                rolesLoading ? (
                  <div
                    className={cn(
                      "space-y-4",
                      viewMode === "grid" &&
                        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    )}
                  >
                    {[1, 2, 3].map((i) => (
                      <Skeleton
                        key={i}
                        className={cn(
                          viewMode === "list" ? "h-24" : "h-[200px]"
                        )}
                      />
                    ))}
                  </div>
                ) : (
                  <div
                    className={cn(
                      viewMode === "grid" &&
                        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    )}
                  >
                    {roles?.map((role) => (
                      <div
                        key={role.id}
                        className={cn(
                          "group relative border rounded-lg overflow-hidden transition-all",
                          viewMode === "list" ? "mb-4 p-4" : "p-6"
                        )}
                      >
                        <div
                          className={cn(
                            "flex",
                            viewMode === "list"
                              ? "flex-row items-center justify-between"
                              : "flex-col space-y-4"
                          )}
                        >
                          <div
                            className={cn(viewMode === "list" ? "flex-1" : "")}
                          >
                            <div className="flex items-center justify-between">
                              <div className="font-medium text-lg">
                                {role.name}
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <ChevronRight className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => handleEditRole(role)}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Role
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => handleDeleteRole(role.id)}
                                  >
                                    <Trash className="mr-2 h-4 w-4" />
                                    Delete Role
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {role.description || "No description"}
                            </p>
                          </div>
                          <div
                            className={cn(
                              "space-y-4",
                              viewMode === "list"
                                ? "flex items-center gap-4 space-y-0"
                                : ""
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <Users2 className="w-4 h-4 text-muted-foreground" />
                              <Badge variant="secondary">
                                {role.member_count || 0} members
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {role.permissions?.map((permission) => (
                                <Badge key={permission.id} variant="outline">
                                  {permission.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <>
                  {permissionsLoading ? (
                    <div
                      className={cn(
                        "space-y-4",
                        permissionsViewMode === "grid" &&
                          "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                      )}
                    >
                      {[1, 2, 3].map((i) => (
                        <Skeleton
                          key={i}
                          className={cn(
                            permissionsViewMode === "list"
                              ? "h-24"
                              : "h-[200px]"
                          )}
                        />
                      ))}
                    </div>
                  ) : (
                    <div
                      className={cn(
                        permissionsViewMode === "grid" &&
                          "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                      )}
                    >
                      {permissions?.map((permission) => (
                        <div
                          key={permission.id}
                          className={cn(
                            "group relative border rounded-lg overflow-hidden transition-all",
                            permissionsViewMode === "list" ? "mb-4 p-4" : "p-6"
                          )}
                        >
                          <div
                            className={cn(
                              "flex",
                              permissionsViewMode === "list"
                                ? "flex-row items-center justify-between"
                                : "flex-col space-y-4"
                            )}
                          >
                            <div
                              className={cn(
                                permissionsViewMode === "list" ? "flex-1" : ""
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <div className="font-medium text-lg">
                                  {permission.name}
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <ChevronRight className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleEditPermission(permission)
                                      }
                                    >
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit Permission
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={() =>
                                        handleDeletePermission(permission.id)
                                      }
                                    >
                                      <Trash className="mr-2 h-4 w-4" />
                                      Delete Permission
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {permission.description || "No description"}
                              </p>
                            </div>
                            <div
                              className={cn(
                                "space-y-4",
                                permissionsViewMode === "list"
                                  ? "flex items-center gap-4 space-y-0"
                                  : ""
                              )}
                            >
                              <Badge variant="secondary" className="capitalize">
                                {permission.category}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Settings</CardTitle>
              <CardDescription>
                Manage your organization's settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="org-name">Organization Name</Label>
                  <Input
                    id="org-name"
                    defaultValue={organization?.name}
                    placeholder="Enter organization name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-description">Description</Label>
                  <Textarea
                    id="org-description"
                    defaultValue={organization?.description}
                    placeholder="Enter organization description"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-industry">Industry</Label>
                  <Input
                    id="org-industry"
                    defaultValue={organization?.industry}
                    placeholder="Enter industry"
                  />
                </div>
                <Button type="submit">Save Changes</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {/* Edit Role Dialog */}
      <Dialog open={editRoleDialogOpen} onOpenChange={handleEditRoleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Update role details and permissions
            </DialogDescription>
          </DialogHeader>
          {editingRole && (
            <form onSubmit={handleUpdateRole} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-role-name">Role Name</Label>
                <Input
                  id="edit-role-name"
                  value={editingRole.name}
                  onChange={(e) =>
                    setEditingRole({ ...editingRole, name: e.target.value })
                  }
                  placeholder="Enter role name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role-description">Description</Label>
                <Textarea
                  id="edit-role-description"
                  value={editingRole.description || ""}
                  onChange={(e) =>
                    setEditingRole({
                      ...editingRole,
                      description: e.target.value,
                    })
                  }
                  placeholder="Enter role description"
                />
              </div>
              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="space-y-2">
                  {permissions?.map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="checkbox"
                        id={`permission-${permission.id}`}
                        checked={editingRole.permissions.some(
                          (p) => p.id === permission.id
                        )}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditingRole({
                              ...editingRole,
                              permissions: [
                                ...editingRole.permissions,
                                permission,
                              ],
                            });
                          } else {
                            setEditingRole({
                              ...editingRole,
                              permissions: editingRole.permissions.filter(
                                (p) => p.id !== permission.id
                              ),
                            });
                          }
                        }}
                      />
                      <label
                        htmlFor={`permission-${permission.id}`}
                        className="text-sm"
                      >
                        {permission.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleEditRoleClose}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateRoleMutation.isPending}>
                  {updateRoleMutation.isPending ? "Updating..." : "Update Role"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Permission Dialog */}
      <Dialog
        open={editPermissionDialogOpen}
        onOpenChange={handleEditPermissionClose}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Permission</DialogTitle>
            <DialogDescription>Update permission details</DialogDescription>
          </DialogHeader>
          {editingPermission && (
            <form onSubmit={handleUpdatePermission} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-permission-name">Permission Name</Label>
                <Input
                  id="edit-permission-name"
                  value={editingPermission.name}
                  onChange={(e) =>
                    setEditingPermission({
                      ...editingPermission,
                      name: e.target.value,
                    })
                  }
                  placeholder="Enter permission name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-permission-description">Description</Label>
                <Textarea
                  id="edit-permission-description"
                  value={editingPermission.description || ""}
                  onChange={(e) =>
                    setEditingPermission({
                      ...editingPermission,
                      description: e.target.value,
                    })
                  }
                  placeholder="Enter permission description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-permission-category">Category</Label>
                <select
                  id="edit-permission-category"
                  className="w-full rounded-md border p-2"
                  value={editingPermission.category}
                  onChange={(e) =>
                    setEditingPermission({
                      ...editingPermission,
                      category: e.target.value,
                    })
                  }
                  required
                >
                  <option value="members">Members</option>
                  <option value="roles">Roles</option>
                  <option value="analytics">Analytics</option>
                  <option value="settings">Settings</option>
                  <option value="billing">Billing</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleEditPermissionClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updatePermissionMutation.isPending}
                >
                  {updatePermissionMutation.isPending
                    ? "Updating..."
                    : "Update Permission"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
