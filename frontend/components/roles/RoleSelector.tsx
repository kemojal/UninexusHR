"use client";
import React from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";
const RoleSelector = ({
    selectedRoleId,
    setSelectedRoleId,
}: {
    selectedRoleId: number | null;
    setSelectedRoleId: (id: number | null) => void;
 
}) => {
  const roles = [
    {
      name: "employee",
      description: "",
      id: 1,
      organization_id: 2,
      permissions: [],
      created_at: "2024-12-13T12:35:02.246441",
      updated_at: "2024-12-13T12:35:02.246457",
    },
    {
      name: "Administrator",
      description: "Full system access with all permissions",
      id: 2,
      organization_id: 2,
      permissions: [],
      created_at: "2024-12-13T12:58:21.703181",
      updated_at: "2024-12-13T12:58:21.703195",
    },
    {
      name: "Team Lead",
      description: "",
      id: 5,
      organization_id: 2,
      permissions: [],
      created_at: "2024-12-13T12:58:59.672385",
      updated_at: "2024-12-13T12:58:59.672392",
    },
    {
      name: "HR Manager",
      description: " Manages all HR-related functions",
      id: 3,
      organization_id: 2,
      permissions: [],
      created_at: "2024-12-13T12:58:30.359778",
      updated_at: "2024-12-13T12:59:14.141936",
    },
    {
      name: "CEO",
      description: "",
      id: 7,
      organization_id: 2,
      permissions: [
        {
          name: "view_members",
          description: "View organization members",
          category: "other",
          id: 9,
          organization_id: 2,
          created_at: "2024-12-13T13:21:29.315616",
          updated_at: "2024-12-13T13:21:29.315621",
        },
        {
          name: "manage_billing",
          description: "Manage billing and subscriptions",
          category: "other",
          id: 16,
          organization_id: 2,
          created_at: "2024-12-13T13:21:29.329411",
          updated_at: "2024-12-13T13:21:29.329413",
        },
        {
          name: "invite_members",
          description: "Invite new members",
          category: "other",
          id: 10,
          organization_id: 2,
          created_at: "2024-12-13T13:21:29.320992",
          updated_at: "2024-12-13T13:21:29.320996",
        },
        {
          name: "manage_settings",
          description: "Manage organization settings",
          category: "other",
          id: 14,
          organization_id: 2,
          created_at: "2024-12-13T13:21:29.327210",
          updated_at: "2024-12-13T13:21:29.327213",
        },
        {
          name: "view_billing",
          description: "View billing information",
          category: "other",
          id: 15,
          organization_id: 2,
          created_at: "2024-12-13T13:21:29.328259",
          updated_at: "2024-12-13T13:21:29.328261",
        },
        {
          name: "manage_roles",
          description: "Manage roles and permissions",
          category: "other",
          id: 12,
          organization_id: 2,
          created_at: "2024-12-13T13:21:29.324468",
          updated_at: "2024-12-13T13:21:29.324470",
        },
      ],
      created_at: "2024-12-13T13:53:18.224641",
      updated_at: "2024-12-13T13:53:18.224645",
    },
    {
      name: "HR Assistant",
      description: "",
      id: 4,
      organization_id: 2,
      permissions: [],
      created_at: "2024-12-13T12:58:43.402115",
      updated_at: "2024-12-18T11:28:38.759141",
    },
  ];
  return (
    <div>
      RoleSelector
      <Command className="rounded-lg border shadow-md">
        <CommandInput placeholder="Search roles..." />
        <CommandEmpty>No roles found.</CommandEmpty>
        <CommandGroup>
          {roles && roles?.length > 0 ? (
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
      </Command>
    </div>
  );
};

export default RoleSelector;
