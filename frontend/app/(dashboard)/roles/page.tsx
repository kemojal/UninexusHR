"use client";

import { useOrgStore } from "@/store/useOrgStore";
import { EmptyState } from "@/components/shared/empty-state";
import {
  ShieldCheck,
  PencilIcon,
  TrashIcon,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Shield,
  Building2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Organization {
  id: number;
  name: string;
  industry: string;
}

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
}

interface RoleFormData {
  name: string;
  description?: string;
  permission_ids: number[];
}

interface PermissionFormData {
  name: string;
  description?: string;
  category: string;
}

const PERMISSION_CATEGORIES = [
  "Member Management",
  "Employee Management",
  "Role Management",
  "Permission Management",
  "Organization Management",
  "System Settings",
  "Reports",
  "Other",
];

export default function RolesPage() {
  const { currentOrg, organizations, setCurrentOrg } = useOrgStore();
  const router = useRouter();
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isCreatePermissionOpen, setIsCreatePermissionOpen] = useState(false);
  const [isEditPermissionOpen, setIsEditPermissionOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] =
    useState<Permission | null>(null);
  const [selectedCategory, setSelectedCategory] =
    useState<string>("Member Management");
  const [isOrgSelectOpen, setIsOrgSelectOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch organizations if not available
  const { data: fetchedOrgs } = useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const response = await api.get("/organizations");
      return response.data;
    },
    enabled: organizations.length === 0,
  });

  useEffect(() => {
    if (fetchedOrgs && organizations.length === 0) {
      useOrgStore.setState({ organizations: fetchedOrgs });
    }
  }, [fetchedOrgs, organizations.length]);

  if (!currentOrg) {
    return (
      <div className="container mx-auto py-6">
        <EmptyState
          icon={Building2}
          title="No Organization Selected"
          description="Please select an organization to manage roles and permissions"
          action={{
            label: "Select Organization",
            onClick: () => setIsOrgSelectOpen(true),
          }}
        />

        <Dialog open={isOrgSelectOpen} onOpenChange={setIsOrgSelectOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select Organization</DialogTitle>
              <DialogDescription>
                Choose an organization to manage its roles and permissions.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Organization</Label>
                <Select
                  onValueChange={(value) => {
                    const org = organizations.find(
                      (o) => o.id === parseInt(value)
                    );
                    if (org) {
                      setCurrentOrg(org);
                      setIsOrgSelectOpen(false);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an organization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id.toString()}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  const { data: roles = [], isLoading: isLoadingRoles } = useQuery({
    queryKey: ["roles", currentOrg.id],
    queryFn: async () => {
      const response = await api.get(`/organizations/${currentOrg.id}/roles`);
      return response.data;
    },
    enabled: !!currentOrg.id,
  });

  const { data: permissions = [], isLoading: isLoadingPermissions } = useQuery({
    queryKey: ["permissions", currentOrg.id],
    queryFn: async () => {
      const response = await api.get(
        `/organizations/${currentOrg.id}/permissions`
      );
      return response.data;
    },
    enabled: !!currentOrg.id,
  });

  // Group permissions by category
  const permissionsByCategory = permissions.reduce(
    (acc: { [key: string]: Permission[] }, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    },
    {}
  );

  const createRole = useMutation({
    mutationFn: async (data: RoleFormData) => {
      const response = await api.post(
        `/organizations/${currentOrg.id}/roles`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["roles"]);
      setIsCreateRoleOpen(false);
      toast.success("Role created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to create role");
    },
  });

  const updateRole = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: RoleFormData }) => {
      const response = await api.put(
        `/organizations/${currentOrg.id}/roles/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["roles"]);
      setIsEditRoleOpen(false);
      toast.success("Role updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to update role");
    },
  });

  const deleteRole = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(
        `/organizations/${currentOrg.id}/roles/${id}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["roles"]);
      toast.success("Role deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to delete role");
    },
  });

  const createPermission = useMutation({
    mutationFn: async (data: PermissionFormData) => {
      const response = await api.post(
        `/organizations/${currentOrg.id}/permissions`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["permissions"]);
      setIsCreatePermissionOpen(false);
      toast.success("Permission created successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail || "Failed to create permission"
      );
    },
  });

  const updatePermission = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: PermissionFormData;
    }) => {
      const response = await api.put(
        `/organizations/${currentOrg.id}/permissions/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["permissions"]);
      setIsEditPermissionOpen(false);
      toast.success("Permission updated successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail || "Failed to update permission"
      );
    },
  });

  const deletePermission = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(
        `/organizations/${currentOrg.id}/permissions/${id}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["permissions"]);
      toast.success("Permission deleted successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail || "Failed to delete permission"
      );
    },
  });

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">Roles & Permissions</h1>
          <span className="text-muted-foreground">|</span>
          <Select
            value={currentOrg.id.toString()}
            onValueChange={(value) => {
              const org = organizations.find((o) => o.id === parseInt(value));
              if (org) setCurrentOrg(org);
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue>{currentOrg.name}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id.toString()}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="roles" className="w-full">
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button onClick={() => setIsCreateRoleOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Role
            </Button>
            <Button
              onClick={() => setIsCreatePermissionOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Permission
            </Button>
          </div>
        </div>

        <TabsContent value="roles">
          {isLoadingRoles ? (
            <div>Loading...</div>
          ) : roles.length === 0 ? (
            <EmptyState
              icon={ShieldCheck}
              title="No roles found"
              description="Create your first role to get started"
              action={{
                label: "Create Role",
                onClick: () => setIsCreateRoleOpen(true),
              }}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {roles.map((role: Role) => (
                <Card key={role.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{role.name}</span>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedRole(role);
                            setIsEditRoleOpen(true);
                          }}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteRole.mutate(role.id)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                    <CardDescription>{role.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Permissions</h4>
                      <div className="flex flex-wrap gap-2">
                        {role.permissions.map((permission) => (
                          <div
                            key={permission.id}
                            className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
                          >
                            {permission.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="permissions">
          {isLoadingPermissions ? (
            <div>Loading...</div>
          ) : permissions.length === 0 ? (
            <EmptyState
              icon={Shield}
              title="No permissions found"
              description="Create your first permission to get started"
              action={{
                label: "Create Permission",
                onClick: () => setIsCreatePermissionOpen(true),
              }}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {permissions.map((permission: Permission) => (
                <Card key={permission.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{permission.name}</span>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedPermission(permission);
                            setIsEditPermissionOpen(true);
                          }}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deletePermission.mutate(permission.id)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                    <CardDescription>{permission.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Category</h4>
                      <div className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm inline-block">
                        {permission.category}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Role Dialog */}
      <Dialog open={isCreateRoleOpen} onOpenChange={setIsCreateRoleOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>
              Create a new role and assign permissions to it.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data: RoleFormData = {
                name: formData.get("name") as string,
                description: formData.get("description") as string,
                permission_ids: Array.from(formData.getAll("permissions")).map(
                  Number
                ),
              };
              createRole.mutate(data);
            }}
          >
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" />
              </div>
              <div>
                <Label>Permissions by Category</Label>
                <div className="space-y-4 mt-2">
                  {Object.entries(permissionsByCategory).map(
                    ([category, categoryPermissions]) => (
                      <div key={category} className="space-y-2">
                        <h4 className="text-sm font-medium">{category}</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {categoryPermissions.map((permission) => (
                            <div
                              key={permission.id}
                              className="flex items-center gap-2"
                            >
                              <input
                                type="checkbox"
                                id={`permission-${permission.id}`}
                                name="permissions"
                                value={permission.id}
                                className="h-4 w-4 rounded border-gray-300"
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
                    )
                  )}
                </div>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="submit">Create Role</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={isEditRoleOpen} onOpenChange={setIsEditRoleOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Modify the role's details and permissions.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!selectedRole) return;
              const formData = new FormData(e.currentTarget);
              const data: RoleFormData = {
                name: formData.get("name") as string,
                description: formData.get("description") as string,
                permission_ids: Array.from(formData.getAll("permissions")).map(
                  Number
                ),
              };
              updateRole.mutate({ id: selectedRole.id, data });
            }}
          >
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={selectedRole?.name}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  defaultValue={selectedRole?.description || ""}
                />
              </div>
              <div>
                <Label>Permissions by Category</Label>
                <div className="space-y-4 mt-2">
                  {Object.entries(permissionsByCategory).map(
                    ([category, categoryPermissions]) => (
                      <div key={category} className="space-y-2">
                        <h4 className="text-sm font-medium">{category}</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {categoryPermissions.map((permission) => (
                            <div
                              key={permission.id}
                              className="flex items-center gap-2"
                            >
                              <input
                                type="checkbox"
                                id={`edit-permission-${permission.id}`}
                                name="permissions"
                                value={permission.id}
                                defaultChecked={selectedRole?.permissions.some(
                                  (p) => p.id === permission.id
                                )}
                                className="h-4 w-4 rounded border-gray-300"
                              />
                              <label
                                htmlFor={`edit-permission-${permission.id}`}
                                className="text-sm"
                              >
                                {permission.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="submit">Update Role</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Permission Dialog */}
      <Dialog
        open={isCreatePermissionOpen}
        onOpenChange={setIsCreatePermissionOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Permission</DialogTitle>
            <DialogDescription>
              Create a new permission for your organization.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data: PermissionFormData = {
                name: formData.get("name") as string,
                description: formData.get("description") as string,
                category: selectedCategory,
              };
              createPermission.mutate(data);
            }}
          >
            <div className="space-y-4">
              <div>
                <Label htmlFor="permission-name">Name</Label>
                <Input id="permission-name" name="name" required />
              </div>
              <div>
                <Label htmlFor="permission-description">Description</Label>
                <Textarea id="permission-description" name="description" />
              </div>
              <div>
                <Label htmlFor="permission-category">Category</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {PERMISSION_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="submit">Create Permission</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Permission Dialog */}
      <Dialog
        open={isEditPermissionOpen}
        onOpenChange={setIsEditPermissionOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Permission</DialogTitle>
            <DialogDescription>
              Modify the permission's details.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!selectedPermission) return;
              const formData = new FormData(e.currentTarget);
              const data: PermissionFormData = {
                name: formData.get("name") as string,
                description: formData.get("description") as string,
                category: selectedCategory,
              };
              updatePermission.mutate({ id: selectedPermission.id, data });
            }}
          >
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-permission-name">Name</Label>
                <Input
                  id="edit-permission-name"
                  name="name"
                  defaultValue={selectedPermission?.name}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-permission-description">Description</Label>
                <Textarea
                  id="edit-permission-description"
                  name="description"
                  defaultValue={selectedPermission?.description || ""}
                />
              </div>
              <div>
                <Label htmlFor="edit-permission-category">Category</Label>
                <Select
                  value={selectedPermission?.category || selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {PERMISSION_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="submit">Update Permission</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
