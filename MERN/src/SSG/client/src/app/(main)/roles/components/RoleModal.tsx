"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea
} from "@heroui/react";
import { Role } from "@/types/rbac.types";
import { RoleService } from "@/services/role.service";
import { addToast } from "@heroui/react";
import { Search } from "lucide-react";
import { PERMISSION_GROUPS, ALL_PERMISSION_KEYS } from "@/config/permissions.config";

interface RoleModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  role: Role | null; // null means Create mode
  onRefresh: () => void;
}

export function RoleModal({ isOpen, onOpenChange, role, onRefresh }: RoleModalProps) {
  const isEditing = !!role;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [] as string[]
  });

  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (role) {
        setFormData({
          name: role.name,
          description: role.description || "",
          permissions: role.permissions || []
        });
      } else {
        setFormData({ name: "", description: "", permissions: [] });
      }
      setSearchTerm("");
    }
  }, [isOpen, role]);

  const handleSubmit = async (onClose: () => void) => {
    try {
      setIsLoading(true);
      const payload = {
        name: formData.name,
        description: formData.description,
        permissions: formData.permissions
      };

      if (isEditing) {
        await RoleService.updateRole(role._id, payload);
        addToast({ title: "Role updated", color: "success" });
      } else {
        await RoleService.createRole(payload);
        addToast({ title: "Role created", color: "success" });
      }

      onRefresh();
      onClose();
    } catch (error: any) {
      addToast({
        title: "Action failed",
        description: error.response?.data?.message || error.message,
        color: "danger"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredGroups = useMemo(() => {
    if (!searchTerm.trim()) return PERMISSION_GROUPS;
    const lowerSearch = searchTerm.toLowerCase();
    
    return PERMISSION_GROUPS.map(group => {
      const filteredPerms = group.permissions.filter(p => 
        p.label.toLowerCase().includes(lowerSearch) || 
        p.key.toLowerCase().includes(lowerSearch)
      );
      return { ...group, permissions: filteredPerms };
    }).filter(group => group.permissions.length > 0);
  }, [searchTerm]);

  const togglePermission = (key: string) => {
    setFormData(prev => {
      if (prev.permissions.includes(key)) {
        return { ...prev, permissions: prev.permissions.filter(p => p !== key) };
      } else {
        return { ...prev, permissions: [...prev.permissions, key] };
      }
    });
  };

  const toggleGroup = (groupKeys: string[], isAllSelected: boolean) => {
    setFormData(prev => {
      if (isAllSelected) {
        // Deselect all in group
        return { ...prev, permissions: prev.permissions.filter(p => !groupKeys.includes(p)) };
      } else {
        // Select all in group
        const newPerms = new Set([...prev.permissions, ...groupKeys]);
        return { ...prev, permissions: Array.from(newPerms) };
      }
    });
  };

  const toggleAll = (isAllSelected: boolean) => {
    if (isAllSelected) {
      setFormData(prev => ({ ...prev, permissions: [] }));
    } else {
      setFormData(prev => ({ ...prev, permissions: [...ALL_PERMISSION_KEYS] }));
    }
  };

  const allSelectedGlobally = ALL_PERMISSION_KEYS.length > 0 && ALL_PERMISSION_KEYS.every(key => formData.permissions.includes(key));

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="3xl"
      scrollBehavior="inside"
      classNames={{
        base: "rounded-none border-4 border-black dark:border-white shadow-pixel dark:shadow-pixel-dark bg-retro-bg dark:bg-retro-bg-dark font-jersey10 tracking-wide overflow-hidden min-h-[80vh]",
        header: "border-b-4 border-black dark:border-white bg-retro-orange text-black font-bold text-3xl uppercase shrink-0",
        footer: "border-t-4 border-black dark:border-white bg-white dark:bg-black shrink-0",
        closeButton: "hover:bg-black/20 text-black text-xl z-50",
        body: "p-0"
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>{isEditing ? "Edit Role" : "Create New Role"}</ModalHeader>
            <ModalBody className="flex flex-col">
              <div className="p-6 shrink-0 flex flex-col gap-6 bg-white dark:bg-black border-b-4 border-black dark:border-white">
                <Input
                  label="Role Name"
                  placeholder="e.g. Manager"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  isRequired
                  isDisabled={isEditing && role?.isSystem}
                  classNames={{
                    inputWrapper: "rounded-none border-4 border-black dark:border-white shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff] bg-white dark:bg-black text-xl hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] dark:hover:shadow-[2px_2px_0px_#fff] transition-all",
                    label: "font-jersey10 text-lg",
                  }}
                />

                <Textarea
                  label="Description"
                  placeholder="Brief description of this role"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  classNames={{
                    inputWrapper: "rounded-none border-4 border-black dark:border-white shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff] bg-white dark:bg-black text-xl hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] dark:hover:shadow-[2px_2px_0px_#fff] transition-all",
                    label: "font-jersey10 text-lg",
                  }}
                />
              </div>

              <div className="p-6 flex-1 overflow-y-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                  <p className="font-jersey10 text-2xl font-bold uppercase text-retro-orange drop-shadow-[2px_2px_0px_#000] dark:drop-shadow-[2px_2px_0px_#fff]">Assign Permissions</p>
                  
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Input
                      placeholder="Search permissions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      startContent={<Search size={18} className="text-black/50" />}
                      className="w-full sm:w-64"
                      classNames={{
                        inputWrapper: "h-10 rounded-none border-4 border-black dark:border-white bg-white text-black font-bold",
                      }}
                    />
                    <Button
                      size="sm"
                      className="h-10 rounded-none border-4 border-black dark:border-white bg-[#55efc4] text-black font-bold text-lg uppercase shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] shrink-0"
                      onPress={() => toggleAll(allSelectedGlobally)}
                    >
                      {allSelectedGlobally ? "Deselect All" : "Select All"}
                    </Button>
                  </div>
                </div>

                {filteredGroups.length === 0 ? (
                  <div className="text-center py-10 font-bold text-xl text-gray-500">No permissions found matching your search.</div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {filteredGroups.map(group => {
                      const groupKeys = group.permissions.map(p => p.key);
                      const isAllGroupSelected = groupKeys.every(k => formData.permissions.includes(k));
                      const isSomeSelected = groupKeys.some(k => formData.permissions.includes(k));

                      return (
                        <div key={group.group} className="border-4 border-black dark:border-white bg-white dark:bg-black shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff] p-4">
                          <div className="flex justify-between items-center mb-4 pb-2 border-b-4 border-black/10 dark:border-white/10">
                            <h3 className="font-bold text-xl uppercase text-retro-purple dark:text-[#a29bfe]">{group.group}</h3>
                            <Button
                              size="sm"
                              variant="flat"
                              className={`rounded-none border-2 border-black dark:border-white font-bold text-md ${isAllGroupSelected ? 'bg-[#ff7675] text-black' : 'bg-retro-orange text-black'}`}
                              onPress={() => toggleGroup(groupKeys, isAllGroupSelected)}
                            >
                              {isAllGroupSelected ? "Deselect Group" : "Select Group"}
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {group.permissions.map(p => {
                              const isSelected = formData.permissions.includes(p.key);
                              return (
                                <div
                                  key={p.key}
                                  onClick={() => togglePermission(p.key)}
                                  className={`cursor-pointer border-4 p-3 transition-all flex flex-col justify-center ${isSelected
                                    ? 'border-black dark:border-white bg-retro-orange text-black shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff] translate-y-[-2px]'
                                    : 'border-black/30 dark:border-white/30 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-black dark:hover:border-white shadow-none'}`}
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className={`w-5 h-5 flex flex-shrink-0 items-center justify-center border-2 border-black dark:border-white bg-white ${isSelected ? 'bg-black dark:bg-white text-white dark:text-black' : ''}`}>
                                      {isSelected && <div className="w-2.5 h-2.5 bg-[#55efc4]"></div>}
                                    </div>
                                    <span className="font-bold text-lg leading-tight uppercase tracking-tight">{p.label}</span>
                                  </div>
                                  <span className="text-sm font-sans font-medium opacity-80 pl-7">{p.description}</span>
                                  <span className="text-xs font-mono opacity-60 pl-7 mt-1">{p.key}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                variant="flat"
                onPress={onClose}
                className="rounded-none border-2 border-black font-bold uppercase shadow-[2px_2px_0px_#000] hover:translate-y-[2px] hover:shadow-none text-xl"
              >
                Cancel
              </Button>
              <Button
                color="primary"
                isLoading={isLoading}
                onPress={() => handleSubmit(onClose)}
                className="rounded-none border-2 border-black font-bold uppercase shadow-[2px_2px_0px_#000] hover:translate-y-[2px] hover:shadow-none text-xl bg-[#55efc4] text-black"
              >
                {isEditing ? "Save Changes" : "Create Role"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

