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
  Search,
  MoreHorizontal,
  ShieldCheck,
  CalendarDays,
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
import { format, formatDistanceToNow } from "date-fns";
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
// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
// } from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuthStore } from "@/lib/store/auth";
import RoleSelector from "@/components/roles/RoleSelector";

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
  status: string;
}

interface Organization {
  id: number;
  name: string;
  description: string | null;
  industry: string;
  created_at: string;
  updated_at: string;
}

interface Invitation {
  id: number;
  email: string;
  status: string;
  created_at: string;
  expires_at: string;
}

interface MembersTableProps {
  members: Member[];
  selectedMembers: number[];
  onMemberSelection: (memberId: number) => void;
  onBulkAction: (action: string) => void;
  setSelectedMembers: (members: number[]) => void;
  org_id: string;
}

const MembersTable = ({
  members,
  selectedMembers,
  onMemberSelection,
  onBulkAction,
  setSelectedMembers,
  org_id,
}: MembersTableProps) => {
  const [editRolesDialogOpen, setEditRolesDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const queryClient = useQueryClient();
  const params = useRouter().params;

  const updateMemberRoles = useMutation({
    mutationFn: async ({ memberId, roleIds }) => {
      const response = await api.put(
        `/organizations/${org_id}/members/${memberId}/roles`,
        roleIds
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["members", org_id]);
      toast.success("Member roles updated successfully");
      setEditRolesDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update member roles");
    },
  });

  const removeMember = useMutation({
    mutationFn: async (memberId) => {
      const response = await api.delete(
        `/organizations/${org_id}/members/${memberId}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["members", org_id]);
      toast.success("Member removed successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || "Failed to remove member");
    },
  });

  const handleEditRoles = (member) => {
    setSelectedMember(member);
    setSelectedRoles(member.roles.map((role) => role.id));
    setEditRolesDialogOpen(true);
  };

  const handleRemoveMember = (memberId) => {
    if (window.confirm("Are you sure you want to remove this member?")) {
      removeMember.mutate(memberId);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={
                  members?.length > 0 &&
                  selectedMembers.length === members.length
                }
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedMembers(members.map((member) => member.id));
                  } else {
                    setSelectedMembers([]);
                  }
                }}
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Roles</TableHead>
            <TableHead>Last Active</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members?.map((member) => (
            <TableRow key={member.id}>
              <TableCell>
                <Checkbox
                  checked={selectedMembers.includes(member.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onMemberSelection([...selectedMembers, member.id]);
                    } else {
                      onMemberSelection(
                        selectedMembers.filter((id) => id !== member.id)
                      );
                    }
                  }}
                />
              </TableCell>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    {member.avatar_url ? (
                      <AvatarImage src={member.avatar_url} />
                    ) : (
                      <AvatarFallback>
                        {member.full_name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  {member.full_name}
                </div>
              </TableCell>
              <TableCell>{member.email}</TableCell>
              <TableCell>
                <Badge variant={member.is_active ? "success" : "secondary"}>
                  {member.is_active ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {member.roles.map((role) => (
                    <Badge key={role.id} variant="outline">
                      {role.name}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                {member.last_active
                  ? formatDistanceToNow(new Date(member.last_active * 1000), {
                      addSuffix: true,
                    })
                  : "Never"}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditRoles(member)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Roles
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={editRolesDialogOpen} onOpenChange={setEditRolesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Member Roles</DialogTitle>
            <DialogDescription>
              Update roles for {selectedMember?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {useQuery({
              queryKey: ["roles", org_id],
              queryFn: async () => {
                const response = await api.get(
                  `/organizations/${org_id}/roles`
                );
                return response.data;
              },
            }).data?.map((role) => (
              <div key={role.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`role-${role.id}`}
                  checked={selectedRoles.includes(role.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedRoles([...selectedRoles, role.id]);
                    } else {
                      setSelectedRoles(
                        selectedRoles.filter((id) => id !== role.id)
                      );
                    }
                  }}
                />
                <label
                  htmlFor={`role-${role.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {role.name}
                </label>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditRolesDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                updateMemberRoles.mutate({
                  memberId: selectedMember.id,
                  roleIds: selectedRoles,
                });
              }}
              disabled={updateMemberRoles.isPending}
            >
              {updateMemberRoles.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default function OrganizationPage({
  params,
}: {
  params: { org_id: string };
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("overview");
  const [memberTab, setMemberTab] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [permissionsViewMode, setPermissionsViewMode] = useState<
    "grid" | "list"
  >("grid");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [createRoleDialogOpen, setCreateRoleDialogOpen] = useState(false);
  const [editRoleDialogOpen, setEditRoleDialogOpen] = useState(false);
  const [editPermissionDialogOpen, setEditPermissionDialogOpen] =
    useState(false);
  const [createPermissionDialogOpen, setCreatePermissionDialogOpen] =
    useState(false);
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
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  // Helper function to safely format dates
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (error) {
      return "-";
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

  // Fetch members with status filter
  const fetchMembers = async () => {
    let statusFilter;
    switch (memberTab) {
      case "active":
        statusFilter = "active";
        break;
      case "inactive":
        statusFilter = "inactive";
        break;
      default:
        statusFilter = undefined;
    }

    const response = await api.get(`/organizations/${params.org_id}/members`, {
      params: {
        status: statusFilter,
        search: searchQuery || undefined,
        role: roleFilter !== "all" ? roleFilter : undefined,
      },
    });
    return response.data;
  };

  // Fetch members data with proper query key
  const { data: membersData, isLoading: isMembersLoading } = useQuery({
    queryKey: ["members", params.org_id, memberTab, searchQuery, roleFilter],
    queryFn: fetchMembers,
  });

  // Fetch roles
  const { data: roles = [], isLoading: isLoadingRoles } = useQuery<
    { id: number; name: string }[]
  >({
    queryKey: ["roles", params.org_id],
    queryFn: async () => {
      const response = await api.get(`/organizations/${params.org_id}/roles`);
      return response.data || []; // Ensure we return an empty array if data is undefined
    },
    enabled: !!params.org_id,
  });

  // Fetch invitations
  const { data: invitationsData, isLoading: isInvitationsLoading } = useQuery({
    queryKey: ["invitations", params.org_id],
    queryFn: async () => {
      const response = await api.get(
        `/organizations/${params.org_id}/invitations`
      );
      return response.data;
    },
    onSuccess: (data) => {
      // Removed unused variable
    },
  });

  // Fetch roles
  const fetchRoles = async () => {
    const response = await api.get(`/organizations/${params.org_id}/roles`);
    return response.data;
  };

  // Fetch permissions
  const { data: permissionsData, isLoading: permissionsLoading } = useQuery({
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
      const response = await api.post(
        `/organizations/${params.org_id}/members/invite`,
        {
          email: inviteEmail,
          role_id: selectedRoleId,
        }
      );
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
      if (
        error.response?.status === 400 &&
        error.response?.data?.detail?.includes("already a member")
      ) {
        toast.warning("This user is already a member of this organization");
      } else {
        toast.error(
          error.response?.data?.detail || "Failed to send invitation"
        );
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
      queryClient.invalidateQueries({
        queryKey: ["permissions", params.org_id],
      });
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
      queryClient.invalidateQueries({
        queryKey: ["permissions", params.org_id],
      });
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
      queryClient.invalidateQueries({
        queryKey: ["permissions", params.org_id],
      });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail || "Failed to delete permission"
      );
    },
  });

  // Mutations for invitation management
  const resendInvitation = useMutation({
    mutationFn: async (invitationId: number) => {
      const response = await api.post(
        `/organizations/${params.org_id}/invitations/${invitationId}/resend`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["invitations", params.org_id]);
      toast.success("Invitation resent successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail || "Failed to resend invitation"
      );
    },
  });

  const cancelInvitation = useMutation({
    mutationFn: async (invitationId: number) => {
      const response = await api.delete(
        `/organizations/${params.org_id}/invitations/${invitationId}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["invitations", params.org_id]);
      toast.success("Invitation cancelled successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail || "Failed to cancel invitation"
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

  const { data: rolesData, isLoading: isRolesLoading } = useQuery({
    queryKey: ["roles", params.org_id],
    queryFn: fetchRoles,
  });

  const handleMemberSelection = (memberId: number) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleBulkAction = async (action: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/organizations/${params.org_id}/members/bulk`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            member_ids: selectedMembers,
            action,
          }),
        }
      );
      if (!response.ok) throw new Error(`Failed to ${action} members`);

      toast({
        title: "Success",
        description: `Successfully ${action}ed selected members`,
      });

      // Removed duplicate membersData query
      queryClient.invalidateQueries({ queryKey: ["members", params.org_id] });
      setSelectedMembers([]);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${action} members`,
      });
    }
  };
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/organizations/${params.org_id}`);
    },
    onSuccess: () => {
      toast.success("Organization deleted successfully");
      router.push("/organizations");
      window.location.href = "/organizations";
    },
    onError: () => {
      toast.error("Failed to delete organization");
    },
  });

  const handleDeleteOrg = () => {
    if (deleteConfirmation !== organization?.name) {
      toast.error("Please type the organization name to confirm deletion");
      return;
    }
    deleteMutation.mutate();
  };

  // Get current user's member status and admin role
  const currentUserMember = membersData?.find(
    (member) => member.email === user?.email
  );

  const hasAdminRole = currentUserMember?.roles?.some(
    (role) => role.name.toLowerCase() === "admin"
  );

  const isAdmin = !!currentUserMember && !!hasAdminRole;

  // Filter members based on search query and role filter
  const filteredMembers = membersData?.filter((member) => {
    const matchesSearch =
      member.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      roleFilter === "all" ||
      member.roles.some((role) => role.id.toString() === roleFilter);

    return matchesSearch && matchesRole;
  });

  useEffect(() => {
    fetchRoles();
  }, [params.org_id]);

  // const handleDeleteOrganization = async () => {
  //   const confirmed = window.confirm(
  //     "Are you sure you want to delete this organization?"
  //   );
  //   if (confirmed) {
  //     try {
  //       await fetch(`/api/v1/organizations/${organization.id}`, {
  //         method: "DELETE",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       });
  //       // Redirect or update state after deletion
  //       window.location.href = "/organizations";
  //     } catch (error) {
  //       console.error("Error deleting organization:", error);
  //     }
  //   }
  // };

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
        <div className="flex items-center gap-4">
          <Button variant="outline" className="gap-2">
            <Settings2 className="w-4 h-4" />
            Settings
          </Button>
          {/* <Button variant="destructive" onClick={handleDeleteOrganization}>
            Delete Organization
          </Button> */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  organization and remove all associated data.
                  <div className="mt-4">
                    <Label htmlFor="confirm">
                      Please type{" "}
                      <span className="font-bold text-black">{organization?.name}</span>{" "}
                      to confirm
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
        </div>
      </div>

      {/* Stats */}
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Total Members Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isMembersLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                membersData?.length || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Active team members</p>
          </CardContent>
        </Card>

        {/* Total Roles Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Roles</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingRoles ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                roles?.length || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Total roles created</p>
          </CardContent>
        </Card>

        {/* Created Date Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Created</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingOrg ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                formatDate(organization?.created_at)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Organization created date
            </p>
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
          <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Members</h1>
              <Button onClick={() => setInviteDialogOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Member
              </Button>
            </div>

            <Tabs defaultValue="all" onValueChange={setMemberTab}>
              <TabsList>
                <TabsTrigger value="all">
                  {isAdmin ? "All Members" : "Members"}
                </TabsTrigger>
                {isAdmin && <TabsTrigger value="active">Active</TabsTrigger>}
                {/* {isAdmin && (
                  <TabsTrigger value="inactive">Inactive</TabsTrigger>
                )} */}
                {isAdmin && (
                  <TabsTrigger value="invitations">Invitations</TabsTrigger>
                )}
              </TabsList>

              <div className="my-4 flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search members..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {rolesData?.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedMembers.length > 0 && (
                <div className="my-2 p-2 bg-muted rounded-md flex items-center justify-between">
                  <span>{selectedMembers.length} members selected</span>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedMembers([])}
                    >
                      Clear Selection
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleBulkAction("remove")}
                    >
                      Remove Selected
                    </Button>
                  </div>
                </div>
              )}

              <TabsContent value="all">
                {isMembersLoading ? (
                  <div className="text-center py-4">Loading members...</div>
                ) : !filteredMembers?.length ? (
                  <div className="text-center py-4">No members found</div>
                ) : (
                  <MembersTable
                    members={filteredMembers}
                    selectedMembers={selectedMembers}
                    onMemberSelection={handleMemberSelection}
                    onBulkAction={handleBulkAction}
                    setSelectedMembers={setSelectedMembers}
                    org_id={params.org_id}
                  />
                )}
              </TabsContent>

              <TabsContent value="active">
                {isMembersLoading ? (
                  <div className="text-center py-4">Loading members...</div>
                ) : !filteredMembers?.length ? (
                  <div className="text-center py-4">
                    No active members found
                  </div>
                ) : (
                  <MembersTable
                    members={
                      filteredMembers?.filter(
                        (member) => member.status === "active"
                      ) || []
                    }
                    selectedMembers={selectedMembers}
                    onMemberSelection={handleMemberSelection}
                    onBulkAction={handleBulkAction}
                    setSelectedMembers={setSelectedMembers}
                    org_id={params.org_id}
                  />
                )}
              </TabsContent>

              <TabsContent value="invitations">
                {isInvitationsLoading ? (
                  <div className="text-center py-4">Loading invitations...</div>
                ) : !invitationsData?.length ? (
                  <div className="text-center py-4">No invitations found</div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Sent</TableHead>
                          <TableHead>Expires</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invitationsData?.map((invitation) => (
                          <TableRow key={invitation.id}>
                            <TableCell>{invitation.email}</TableCell>
                            <TableCell>{invitation.status}</TableCell>
                            <TableCell>
                              {formatDate(invitation.created_at)}
                            </TableCell>
                            <TableCell>
                              {formatDate(invitation.expires_at)}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleResendInvitation(invitation.id)
                                }
                              >
                                Resend
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
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
                            className="w-full rounded-md border p-2 bg-red-500"
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
                isRolesLoading ? (
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
                    {rolesData?.map((role) => (
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
                      {permissionsData?.map((permission) => (
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
            <DialogTitle>Edit RoleXX</DialogTitle>
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
                  {permissionsData?.map((permission) => (
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

      {/* invite member dialogue */}
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
              ) : ( */}
              {/* <Command className="rounded-lg border shadow-md">
                <CommandInput placeholder="Search roles..." />
                <CommandEmpty>No roles found.</CommandEmpty>
                <CommandGroup>
                  {roles.length > 0 ? (
                    roles.map((role) => (
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
                    ))
                  ) : (
                    <CommandEmpty>No roles available</CommandEmpty>
                  )}
                </CommandGroup>
              </Command> */}
              {/* // )} */}
              {/* <RoleSelector
                selectedRoleId={selectedRoleId}
                setSelectedRoleId={setSelectedRoleId}
              /> */}
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
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      ◌
                    </motion.div>
                    Sending...
                  </>
                ) : (
                  "Send Invitation"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
