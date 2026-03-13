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
    <div className="w-full h-[calc(100vh-100px)] flex flex-col font-jersey10 tracking-wide gap-4 pb-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-retro-bg dark:bg-retro-bg-dark p-4 border-4 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] relative overflow-hidden group shrink-0">
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-retro-orange opacity-20 transform rotate-12 group-hover:rotate-45 transition-transform duration-500"></div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-retro-purple dark:text-retro-orange uppercase drop-shadow-[2px_2px_0px_#000] dark:drop-shadow-[2px_2px_0px_#fff]">User Accounts</h1>
          <p className="text-lg md:text-xl text-default-800 dark:text-default-200 mt-1 font-bold p-1 bg-white/50 dark:bg-black/50 inline-block">Manage system users, roles, and access.</p>
        </div>
        {canCreate && (
          <Button
            className="rounded-none border-4 border-black dark:border-white bg-[#55efc4] text-black font-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all z-10 text-lg py-4 px-6 mt-4 md:mt-0"
            startContent={<Plus size={20} strokeWidth={3} />}
            onPress={() => { setSelectedUser(null); onOpen(); }}
          >
            New User
          </Button>
        )}
      </div>

      <div className="flex gap-4 shrink-0">
        <Input
          isClearable
          className="w-full md:max-w-[40%] font-jersey10 text-xl"
          classNames={{
            inputWrapper: "rounded-none border-4 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] bg-white dark:bg-black h-12 transition-all focus-within:shadow-[4px_4px_0px_0px_var(--hero-primary)] focus-within:-translate-y-1 focus-within:-translate-x-1",
            input: "text-xl font-bold text-black dark:text-white pt-1",
          }}
          placeholder="> SEARCH_USERS_"
          startContent={<span className="text-retro-purple dark:text-retro-orange font-bold mr-2 text-2xl animate-pulse">{'>'}</span>}
          value={search}
          onClear={() => setSearch("")}
          onValueChange={setSearch}
        />
      </div>

      <div className="border-4 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] bg-retro-bg dark:bg-retro-bg-dark p-1 flex-1 min-h-0 overflow-hidden flex flex-col">
        <Table
          aria-label="Users table"
          isHeaderSticky
          classNames={{
            base: "flex-1 overflow-hidden flex flex-col",
            wrapper: "flex-1 min-h-0 rounded-none bg-transparent p-0 overflow-auto shadow-none",
            th: "bg-retro-purple dark:bg-retro-purple text-white font-bold text-xl uppercase rounded-none border-b-4 border-black dark:border-white py-3 px-4 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] whitespace-nowrap sticky top-0 z-20",
            td: "text-lg border-b-4 border-black/10 dark:border-white/10 py-3 px-4 whitespace-nowrap",
            tr: "hover:bg-black/10 dark:hover:bg-white/10 transition-colors group cursor-pointer",
          }}
          bottomContent={
            totalPages > 0 ? (
              <div className="flex w-full justify-center p-3 shrink-0">
                <Pagination
                  isCompact
                  showControls
                  showShadow
                  color="secondary"
                  page={page}
                  total={totalPages}
                  onChange={(page) => setPage(page)}
                  classNames={{
                    cursor: "rounded-none border-4 border-black dark:border-white font-bold font-jersey10 text-xl text-white shadow-[2px_2px_0px_0px_#000]",
                    item: "rounded-none border-4 border-black dark:border-white font-jersey10 text-xl bg-white dark:bg-black font-bold shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#000]",
                    prev: "rounded-none border-4 border-black dark:border-white bg-white dark:bg-black shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#000]",
                    next: "rounded-none border-4 border-black dark:border-white bg-white dark:bg-black shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#000]",
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
            className="h-full"
          >
            {(item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white dark:bg-black border-4 border-black dark:border-white group-hover:scale-110 transition-transform shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] flex items-center justify-center overflow-hidden shrink-0">
                      <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${item.username}`} alt="avatar" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold capitalize text-retro-orange drop-shadow-[1px_1px_0px_rgba(0,0,0,0.5)] group-hover:text-retro-purple dark:group-hover:text-retro-orange transition-colors">{item.username}</span>
                      <span className="text-lg text-black dark:text-white font-bold bg-black/10 dark:bg-white/10 px-1.5 py-0 border-2 border-transparent w-max">{item.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1.5 flex-wrap max-w-xs">
                    {item.roles?.map((r: any) => (
                      <Chip key={r.slug || r} size="sm" variant="flat" className="rounded-none border-4 border-black dark:border-white bg-[#ffeaa7] dark:bg-[#fdcb6e] text-black font-jersey10 text-lg font-bold shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] group-hover:-translate-y-1 transition-transform">
                        {r.name || r}
                      </Chip>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Chip className={`capitalize rounded-none border-4 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] font-jersey10 text-lg font-bold text-black ${item.status === 'active' ? 'bg-[#55efc4]' : item.status === 'banned' ? 'bg-[#ff7675]' : 'bg-[#dfe6e9]'}`} size="sm" variant="flat">
                    {item.status}
                  </Chip>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end items-center gap-2">
                    <Button
                      size="sm"
                      className="bg-warning text-black rounded-none border-4 border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none hover:bg-[#ffeaa7] transition-all font-jersey10 text-lg uppercase font-bold hidden md:flex h-8 px-3"
                      startContent={<Edit2 size={16} strokeWidth={3} />}
                      onPress={() => { setSelectedUser(item); onOpen(); }}
                      isDisabled={!canEdit}
                    >
                      Edit
                    </Button>
                    <Button
                      isIconOnly
                      size="sm"
                      className="bg-warning text-black rounded-none border-4 border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all md:hidden h-8 w-8 min-w-8"
                      onPress={() => { setSelectedUser(item); onOpen(); }}
                      isDisabled={!canEdit}
                    >
                      <Edit2 size={16} strokeWidth={3} />
                    </Button>

                    <Button
                      size="sm"
                      className={`${item.status === 'banned' ? 'bg-[#55efc4]' : 'bg-[#ff7675]'} text-black rounded-none border-4 border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all font-jersey10 text-lg uppercase font-bold hidden md:flex h-8 px-3`}
                      startContent={item.status === 'banned' ? <Unlock size={16} strokeWidth={3} /> : <Lock size={16} strokeWidth={3} />}
                      onPress={() => handleStatusChange(item)}
                      isDisabled={!canEdit}
                    >
                      {item.status === 'banned' ? 'Unlock' : 'Lock'}
                    </Button>
                    <Button
                      isIconOnly
                      size="sm"
                      className={`${item.status === 'banned' ? 'bg-[#55efc4]' : 'bg-[#ff7675]'} text-black rounded-none border-4 border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all md:hidden h-8 w-8 min-w-8`}
                      onPress={() => handleStatusChange(item)}
                      isDisabled={!canEdit}
                    >
                      {item.status === 'banned' ? <Unlock size={16} strokeWidth={3} /> : <Lock size={16} strokeWidth={3} />}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <UserModal isOpen={isOpen} onOpenChange={onOpenChange} user={selectedUser} onRefresh={fetchUsers} />
    </div>
  );
}
