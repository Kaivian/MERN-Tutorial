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
import { getPermissionLabel } from "@/config/permissions.config";

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
    <div className="w-full h-[calc(100vh-100px)] flex flex-col font-jersey10 tracking-wide gap-4 pb-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-retro-bg dark:bg-retro-bg-dark p-4 border-4 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] relative overflow-hidden group shrink-0">
        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-retro-purple opacity-20 transform -rotate-12 group-hover:-rotate-45 transition-transform duration-500"></div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-retro-orange uppercase drop-shadow-[2px_2px_0px_#000] dark:drop-shadow-[2px_2px_0px_#fff]">Role Management</h1>
          <p className="text-lg md:text-xl text-default-800 dark:text-default-200 mt-1 font-bold p-1 bg-white/50 dark:bg-black/50 inline-block">Configure system roles and permission sets.</p>
        </div>
        {canCreate && (
          <Button
            className="rounded-none border-4 border-black dark:border-white bg-[#55efc4] text-black font-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all z-10 text-lg py-4 px-6 mt-4 md:mt-0"
            startContent={<Plus size={20} strokeWidth={3} />}
            onPress={() => { setSelectedRole(null); onOpen(); }}
          >
            New Role
          </Button>
        )}
      </div>

      <div className="border-4 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] bg-retro-bg dark:bg-retro-bg-dark p-1 flex-1 min-h-0 overflow-hidden flex flex-col">
        <Table
          aria-label="Roles table"
          isHeaderSticky
          classNames={{
            base: "flex-1 overflow-hidden flex flex-col",
            wrapper: "flex-1 min-h-0 rounded-none bg-transparent p-0 overflow-auto shadow-none",
            th: "bg-retro-orange dark:bg-retro-orange text-black font-bold text-xl uppercase rounded-none border-b-4 border-black dark:border-white py-3 px-4 drop-shadow-[2px_2px_0px_rgba(255,255,255,1)] whitespace-nowrap",
            td: "text-lg border-b-4 border-black/10 dark:border-white/10 py-3 px-4 whitespace-nowrap",
            tr: "hover:bg-black/10 dark:hover:bg-white/10 transition-colors group cursor-pointer",
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
            className="h-full"
          >
            {(item) => (
              <TableRow key={item._id}>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="text-2xl font-bold uppercase text-retro-purple dark:text-retro-orange drop-shadow-[1px_1px_0px_rgba(0,0,0,0.5)] group-hover:text-retro-orange transition-colors">{item.name}</span>
                    <span className="text-lg text-black dark:text-white font-bold bg-black/10 dark:bg-white/10 px-2 py-0.5 w-max border-2 border-transparent">{item.description}</span>
                    {item.isSystem && <Chip size="sm" className="mt-1 w-max rounded-none border-4 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] bg-[#fdcb6e] text-black font-jersey10 text-lg font-bold">System Role</Chip>}
                  </div>
                </TableCell>
                <TableCell><code className="text-lg bg-black/10 dark:bg-white/10 p-1.5 border-4 border-black dark:border-white font-mono rounded-none font-bold">{item.slug}</code></TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2 max-w-xs">
                    {item.permissions.slice(0, 3).map((p: string) => (
                      <Chip key={p} size="sm" variant="flat" className="rounded-none border-4 border-black dark:border-white bg-[#74b9ff] dark:bg-[#0984e3] text-black dark:text-white font-jersey10 text-lg font-bold shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] group-hover:-translate-y-1 transition-transform uppercase">
                        {getPermissionLabel(p)}
                      </Chip>
                    ))}
                    {item.permissions.length > 3 && (
                      <Chip size="sm" variant="flat" className="rounded-none border-4 border-black dark:border-white bg-[#fab1a0] dark:bg-[#e17055] text-black dark:text-white font-jersey10 text-lg font-bold shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] group-hover:-translate-y-1 transition-transform">
                        +{item.permissions.length - 3} more
                      </Chip>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Chip className={`capitalize rounded-none border-4 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] font-jersey10 text-lg font-bold text-black ${item.status === 'active' ? 'bg-[#55efc4]' : 'bg-[#ff7675]'}`} size="sm" variant="flat">
                    {item.status}
                  </Chip>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end items-center gap-2 w-min ml-auto">
                    <Button
                      size="sm"
                      className="bg-warning text-black rounded-none border-4 border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none hover:bg-[#ffeaa7] transition-all font-jersey10 text-lg uppercase font-bold hidden xl:flex h-8 px-3"
                      startContent={<Edit2 size={16} strokeWidth={3} />}
                      onPress={() => { setSelectedRole(item); onOpen(); }}
                      isDisabled={!canEdit}
                    >
                      Edit
                    </Button>
                    <Button
                      isIconOnly
                      size="sm"
                      className="bg-warning text-black rounded-none border-4 border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all xl:hidden h-8 w-8 min-w-8"
                      onPress={() => { setSelectedRole(item); onOpen(); }}
                      isDisabled={!canEdit}
                    >
                      <Edit2 size={16} strokeWidth={3} />
                    </Button>

                    <Button
                      size="sm"
                      className={`${item.status === 'inactive' ? 'bg-[#55efc4]' : 'bg-[#a3a3a3]'} text-black rounded-none border-4 border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all font-jersey10 text-lg uppercase font-bold hidden xl:flex h-8 px-3`}
                      startContent={item.status === 'inactive' ? <Unlock size={16} strokeWidth={3} /> : <Lock size={16} strokeWidth={3} />}
                      onPress={() => !item.isSystem && handleStatusChange(item)}
                      isDisabled={item.isSystem || !canEdit}
                    >
                      {item.status === 'inactive' ? 'Activate' : 'Deactivate'}
                    </Button>
                    <Button
                      isIconOnly
                      size="sm"
                      className={`${item.status === 'inactive' ? 'bg-[#55efc4]' : 'bg-[#a3a3a3]'} text-black rounded-none border-4 border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all xl:hidden h-8 w-8 min-w-8`}
                      onPress={() => !item.isSystem && handleStatusChange(item)}
                      isDisabled={item.isSystem || !canEdit}
                    >
                      {item.status === 'inactive' ? <Unlock size={16} strokeWidth={3} /> : <Lock size={16} strokeWidth={3} />}
                    </Button>

                    <Button
                      size="sm"
                      className={`bg-[#ff7675] text-black rounded-none border-4 border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all font-jersey10 text-lg uppercase font-bold hidden xl:flex h-8 px-3`}
                      startContent={<Trash2 size={16} strokeWidth={3} />}
                      onPress={() => !item.isSystem && handleDelete(item)}
                      isDisabled={item.isSystem || !canDelete}
                    >
                      Delete
                    </Button>
                    <Button
                      isIconOnly
                      size="sm"
                      className={`bg-[#ff7675] text-black rounded-none border-4 border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all xl:hidden h-8 w-8 min-w-8`}
                      onPress={() => !item.isSystem && handleDelete(item)}
                      isDisabled={item.isSystem || !canDelete}
                    >
                      <Trash2 size={16} strokeWidth={3} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <RoleModal isOpen={isOpen} onOpenChange={onOpenChange} role={selectedRole} onRefresh={fetchRoles} />
    </div>
  );
}
