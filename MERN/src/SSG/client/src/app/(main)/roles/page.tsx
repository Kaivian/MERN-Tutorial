"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Button,
  Chip,
  useDisclosure,
  Spinner,
} from "@heroui/react";
import { RoleService } from "@/services/role.service";
import { Role } from "@/types/rbac.types";
import { MoreVertical, Plus, Edit2, Lock, Unlock, Trash2 } from "lucide-react";
import { usePermission } from "@/providers/auth.provider";
import { addToast } from "@heroui/react";
import { RoleModal } from "./components/RoleModal";
import AccessDenied from "@/components/errors/AccessDenied";

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const canEdit = usePermission("roles:edit");
  const canCreate = usePermission("roles:create");
  const canDelete = usePermission("roles:delete");
  const canView = usePermission("roles:view");

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      const res = await RoleService.getRoles(true); // Include inactive
      if (res.status === 'success') {
        setRoles(res.data.roles);
      }
    } catch (error: any) {
      addToast({
        title: "Error fetching roles",
        description: error.message,
        color: "danger"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!canView) {
      setIsLoading(false);
      return;
    }
    fetchRoles();
  }, [canView]);

  const handleStatusChange = async (role: Role) => {
    try {
      const newStatus = role.status === 'inactive' ? 'active' : 'inactive';
      await RoleService.updateRole(role._id, { status: newStatus as any });
      addToast({ title: `Role ${role.name} marked as ${newStatus}`, color: "success" });
      fetchRoles();
    } catch (error: any) {
      addToast({ title: "Action failed", description: error.message, color: "danger" });
    }
  };

  const handleDelete = async (role: Role) => {
    if (confirm(`Are you sure you want to delete the role "${role.name}"? This cannot be undone.`)) {
      try {
        await RoleService.deleteRole(role._id);
        addToast({ title: `Role deleted successfully`, color: "success" });
        fetchRoles();
      } catch (error: any) {
        addToast({ title: "Delete failed", description: error.response?.data?.message || error.message, color: "danger" });
      }
    }
  };

  if (!canView) {
    return <AccessDenied />;
  }

  return (
    <div className="w-full space-y-6 font-jersey10 tracking-wide">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-retro-bg dark:bg-retro-bg-dark p-6 border-4 border-black dark:border-white shadow-pixel dark:shadow-pixel-dark mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-retro-orange uppercase drop-shadow-[2px_2px_0px_#000]">Role Management</h1>
          <p className="text-xl text-default-500 dark:text-default-400 mt-2">Configure system roles and permission sets.</p>
        </div>
        {canCreate && (
          <Button
            color="primary"
            className="rounded-none border-2 border-black font-bold uppercase shadow-pixel dark:shadow-pixel-dark hover:translate-y-[2px] hover:shadow-pixel-hover dark:hover:shadow-pixel-dark-hover"
            startContent={<Plus size={18} />}
            onPress={() => { setSelectedRole(null); onOpen(); }}
          >
            New Role
          </Button>
        )}
      </div>

      <Table
        aria-label="Roles table"
        classNames={{
          wrapper: "rounded-none border-4 border-black dark:border-white shadow-pixel dark:shadow-pixel-dark bg-retro-bg dark:bg-retro-bg-dark p-0 overflow-hidden",
          th: "bg-retro-orange text-black font-bold text-xl uppercase rounded-none border-b-4 border-black dark:border-white py-4 px-6",
          td: "text-lg border-b-2 border-black/10 dark:border-white/10 py-4 px-6",
          tr: "hover:bg-black/5 dark:hover:bg-white/5 transition-colors group",
        }}
      >
        <TableHeader>
          <TableColumn>ROLE NAME</TableColumn>
          <TableColumn>SLUG</TableColumn>
          <TableColumn>PERMISSIONS</TableColumn>
          <TableColumn>STATUS</TableColumn>
          <TableColumn align="center">ACTIONS</TableColumn>
        </TableHeader>
        <TableBody
          items={roles}
          isLoading={isLoading}
          loadingContent={<Spinner label="Loading..." />}
          emptyContent={"No roles found"}
        >
          {(item) => (
            <TableRow key={item._id}>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <span className="text-xl font-bold uppercase text-retro-purple dark:text-retro-orange">{item.name}</span>
                  <span className="text-base text-default-500">{item.description}</span>
                  {item.isSystem && <Chip size="md" color="warning" variant="flat" className="mt-2 w-max rounded-none border-2 border-black shadow-[2px_2px_0px_0px_#000] font-jersey10">System Role</Chip>}
                </div>
              </TableCell>
              <TableCell><code className="text-base bg-default-100 dark:bg-black p-1 border-2 border-black dark:border-white font-mono rounded-none">{item.slug}</code></TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-2 max-w-[300px]">
                  {item.permissions.slice(0, 3).map((p: string) => (
                    <Chip key={p} size="md" variant="faded" className="rounded-none border-2 border-black font-jersey10 text-lg shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]">
                      {p}
                    </Chip>
                  ))}
                  {item.permissions.length > 3 && (
                    <Chip size="md" variant="faded" className="rounded-none border-2 border-black font-jersey10 text-lg shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] bg-retro-orange/20 dark:bg-retro-orange/40 text-black dark:text-white">
                      +{item.permissions.length - 3} more
                    </Chip>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Chip className="capitalize rounded-none border-2 border-black shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] font-jersey10 text-lg" color={item.status === "active" ? "success" : "danger"} size="md" variant="flat">
                  {item.status}
                </Chip>
              </TableCell>
              <TableCell>
                <div className="flex justify-end items-center gap-3 w-min ml-auto">
                  <Button
                    size="sm"
                    className="bg-warning text-black rounded-none border-2 border-transparent group-hover:border-black dark:group-hover:border-white shadow-none group-hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:group-hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all font-jersey10 text-lg uppercase hidden xl:flex"
                    startContent={<Edit2 size={16} />}
                    onPress={() => { setSelectedRole(item); onOpen(); }}
                    isDisabled={!canEdit}
                  >
                    Edit
                  </Button>
                  <Button
                    isIconOnly
                    size="sm"
                    className="bg-warning text-black rounded-none border-2 border-transparent group-hover:border-black dark:group-hover:border-white shadow-none group-hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:group-hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all xl:hidden"
                    onPress={() => { setSelectedRole(item); onOpen(); }}
                    isDisabled={!canEdit}
                  >
                    <Edit2 size={16} />
                  </Button>

                  <Button
                    size="sm"
                    className={`${item.status === 'inactive' ? 'bg-success' : 'bg-[#a3a3a3]'} text-black rounded-none border-2 border-transparent group-hover:border-black dark:group-hover:border-white shadow-none group-hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:group-hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all font-jersey10 text-lg uppercase hidden xl:flex`}
                    startContent={item.status === 'inactive' ? <Unlock size={16} /> : <Lock size={16} />}
                    onPress={() => !item.isSystem && handleStatusChange(item)}
                    isDisabled={item.isSystem || !canEdit}
                  >
                    {item.status === 'inactive' ? 'Activate' : 'Deactivate'}
                  </Button>
                  <Button
                    isIconOnly
                    size="sm"
                    className={`${item.status === 'inactive' ? 'bg-success' : 'bg-[#a3a3a3]'} text-black rounded-none border-2 border-transparent group-hover:border-black dark:group-hover:border-white shadow-none group-hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:group-hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all xl:hidden`}
                    onPress={() => !item.isSystem && handleStatusChange(item)}
                    isDisabled={item.isSystem || !canEdit}
                  >
                    {item.status === 'inactive' ? <Unlock size={16} /> : <Lock size={16} />}
                  </Button>

                  <Button
                    size="sm"
                    className={`bg-danger text-black rounded-none border-2 border-transparent group-hover:border-black dark:group-hover:border-white shadow-none group-hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:group-hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all font-jersey10 text-lg uppercase hidden xl:flex`}
                    startContent={<Trash2 size={16} />}
                    onPress={() => !item.isSystem && handleDelete(item)}
                    isDisabled={item.isSystem || !canDelete}
                  >
                    Delete
                  </Button>
                  <Button
                    isIconOnly
                    size="sm"
                    className={`bg-danger text-black rounded-none border-2 border-transparent group-hover:border-black dark:group-hover:border-white shadow-none group-hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:group-hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all xl:hidden`}
                    onPress={() => !item.isSystem && handleDelete(item)}
                    isDisabled={item.isSystem || !canDelete}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <RoleModal isOpen={isOpen} onOpenChange={onOpenChange} role={selectedRole} onRefresh={fetchRoles} />
    </div>
  );
}
