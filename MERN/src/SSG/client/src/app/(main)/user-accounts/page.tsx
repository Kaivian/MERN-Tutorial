"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Pagination,
  Button,
  Input,
  Chip,
  useDisclosure,
  Spinner,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem
} from "@heroui/react";
import { UserService } from "@/services/user.service";
import { User } from "@/types/auth.types";
import { MoreVertical, Search, Plus, Lock, Unlock, Edit2 } from "lucide-react";
import { usePermission } from "@/providers/auth.provider";
import { addToast } from "@heroui/react";
import { UserModal } from "./components/UserModal";
import AccessDenied from "@/components/errors/AccessDenied";

export default function UserAccountsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const canEdit = usePermission("users:edit");
  const canCreate = usePermission("users:create");
  const canView = usePermission("users:view");

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await UserService.getUsers({ page, limit: 10, search });
      if (res.status === 'success') {
        setUsers(res.data.docs);
        setTotalPages(res.data.totalPages);
      }
    } catch (error: any) {
      addToast({
        title: "Error fetching users",
        description: error.response?.data?.message || "Something went wrong",
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
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [page, search, canView]);

  const handleStatusChange = async (user: User) => {
    try {
      const newStatus = user.status === 'banned' ? 'active' : 'banned';
      await UserService.updateUser(user.id, { status: newStatus as any });
      addToast({ title: `User ${user.username} is now ${newStatus}`, color: "success" });
      fetchUsers();
    } catch (error: any) {
      addToast({ title: "Action failed", description: error.message, color: "danger" });
    }
  };

  if (!canView) {
    return <AccessDenied />;
  }

  return (
    <div className="w-full p-6 space-y-6 font-jersey10 tracking-wide">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-retro-bg dark:bg-retro-bg-dark p-6 border-4 border-black dark:border-white shadow-pixel dark:shadow-pixel-dark mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-retro-orange uppercase drop-shadow-[2px_2px_0px_#000]">User Accounts</h1>
          <p className="text-xl text-default-500 dark:text-default-400 mt-2">Manage system users, roles, and access.</p>
        </div>
        {canCreate && (
          <Button
            color="primary"
            className="rounded-none border-2 border-black font-bold uppercase shadow-pixel dark:shadow-pixel-dark hover:translate-y-[2px] hover:shadow-pixel-hover dark:hover:shadow-pixel-dark-hover"
            startContent={<Plus size={18} />}
            onPress={() => { setSelectedUser(null); onOpen(); }}
          >
            New User
          </Button>
        )}
      </div>

      <div className="flex gap-4 mb-6">
        <Input
          isClearable
          className="w-full sm:max-w-[44%] font-jersey10 text-xl"
          classNames={{
            inputWrapper: "rounded-none border-4 border-black dark:border-white shadow-pixel dark:shadow-pixel-dark bg-white dark:bg-black h-12"
          }}
          placeholder="Search by username or email..."
          startContent={<Search size={18} className="text-default-400" />}
          value={search}
          onClear={() => setSearch("")}
          onValueChange={setSearch}
        />
      </div>

      <Table
        aria-label="Users table"
        classNames={{
          wrapper: "rounded-none border-4 border-black dark:border-white shadow-pixel dark:shadow-pixel-dark bg-retro-bg dark:bg-retro-bg-dark p-0 overflow-hidden",
          th: "bg-retro-orange text-black font-bold text-xl uppercase rounded-none border-b-4 border-black dark:border-white py-4",
          td: "text-lg border-b-2 border-black/10 dark:border-white/10 py-3",
        }}
        bottomContent={
          totalPages > 0 ? (
            <div className="flex w-full justify-center">
              <Pagination
                isCompact
                showControls
                showShadow
                color="primary"
                page={page}
                total={totalPages}
                onChange={(page) => setPage(page)}
                classNames={{
                  cursor: "rounded-none border-2 border-black font-bold font-jersey10 text-xl",
                  item: "rounded-none border-2 border-black font-jersey10 text-xl bg-white dark:bg-black",
                  prev: "rounded-none border-2 border-black bg-white dark:bg-black",
                  next: "rounded-none border-2 border-black bg-white dark:bg-black",
                }}
              />
            </div>
          ) : null
        }
      >
        <TableHeader>
          <TableColumn>USER</TableColumn>
          <TableColumn>ROLES</TableColumn>
          <TableColumn>STATUS</TableColumn>
          <TableColumn align="center">ACTIONS</TableColumn>
        </TableHeader>
        <TableBody
          items={users}
          isLoading={isLoading}
          loadingContent={<Spinner label="Loading..." />}
          emptyContent={"No users found"}
        >
          {(item) => (
            <TableRow key={item.id}>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <span className="text-xl font-bold capitalize text-retro-purple dark:text-retro-orange">{item.username}</span>
                  <span className="text-base text-default-500">{item.email}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-2 flex-wrap">
                  {item.roles?.map((r: any) => (
                    <Chip key={r.slug || r} size="md" variant="flat" className="rounded-none border-2 border-black font-jersey10 text-lg shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]">
                      {r.name || r}
                    </Chip>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <Chip className="capitalize rounded-none border-2 border-black shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] font-jersey10 text-lg" color={item.status === "active" ? "success" : item.status === "banned" ? "danger" : "default"} size="md" variant="flat">
                  {item.status}
                </Chip>
              </TableCell>
              <TableCell>
                <div className="relative flex justify-end items-center gap-2">
                  <Dropdown classNames={{ content: "rounded-none border-4 border-black shadow-pixel bg-retro-bg dark:bg-retro-bg-dark font-jersey10 text-xl" }}>
                    <DropdownTrigger>
                      <Button isIconOnly size="sm" className="bg-transparent rounded-none hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                        <MoreVertical className="text-default-600 dark:text-default-300" />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu disabledKeys={!canEdit ? ["edit", "toggle-status"] : []} itemClasses={{ base: "rounded-none data-[hover=true]:bg-black/10 dark:data-[hover=true]:bg-white/10" }}>
                      <DropdownItem key="edit" startContent={<Edit2 size={16} />} onPress={() => { setSelectedUser(item); onOpen(); }}>
                        Edit Roles
                      </DropdownItem>
                      <DropdownItem
                        key="toggle-status"
                        color={item.status === 'banned' ? "success" : "danger"}
                        className={item.status === 'banned' ? "text-success" : "text-danger"}
                        startContent={item.status === 'banned' ? <Unlock size={16} /> : <Lock size={16} />}
                        onPress={() => handleStatusChange(item)}
                      >
                        {item.status === 'banned' ? 'Unlock Account' : 'Lock Account'}
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <UserModal isOpen={isOpen} onOpenChange={onOpenChange} user={selectedUser} onRefresh={fetchUsers} />
    </div>
  );
}
