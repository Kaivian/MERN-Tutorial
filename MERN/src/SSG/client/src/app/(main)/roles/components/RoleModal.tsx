"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  CheckboxGroup,
  Checkbox
} from "@heroui/react";
import { Role } from "@/types/rbac.types";
import { RoleService } from "@/services/role.service";
import { addToast } from "@heroui/react";

interface RoleModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  role: Role | null; // null means Create mode
  onRefresh: () => void;
}

// Hardcoded available permissions for simplicity (usually fetched dynamically or defined statically)
const AVAILABLE_PERMISSIONS = [
  "users:view", "users:create", "users:edit", "users:delete",
  "roles:view", "roles:create", "roles:edit", "roles:delete",
  "reports:view", "budgets:edit", "transactions:create"
];

export function RoleModal({ isOpen, onOpenChange, role, onRefresh }: RoleModalProps) {
  const isEditing = !!role;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [] as string[]
  });

  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="2xl"
      classNames={{
        base: "rounded-none border-4 border-black dark:border-white shadow-pixel dark:shadow-pixel-dark bg-retro-bg dark:bg-retro-bg-dark font-jersey10 tracking-wide overflow-visible",
        header: "border-b-4 border-black dark:border-white bg-retro-orange text-black font-bold text-3xl uppercase",
        footer: "border-t-4 border-black dark:border-white bg-white dark:bg-black",
        closeButton: "hover:bg-black/20 text-black text-xl"
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>{isEditing ? "Edit Role" : "Create New Role"}</ModalHeader>
            <ModalBody className="gap-6 pt-6">
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

              <div className="mt-2 bg-white dark:bg-black p-4 border-4 border-black dark:border-white shadow-pixel dark:shadow-pixel-dark">
                <p className="font-jersey10 text-xl text-black dark:text-white mb-4">Assign Permissions</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <CheckboxGroup
                    value={formData.permissions}
                    onValueChange={(val) => setFormData({ ...formData, permissions: val })}
                  >
                    {AVAILABLE_PERMISSIONS.map(p => (
                      <Checkbox
                        key={p}
                        value={p}
                        classNames={{
                          label: "font-jersey10 text-lg",
                          wrapper: "rounded-none border-2 border-black dark:border-white",
                        }}
                      >
                        {p}
                      </Checkbox>
                    ))}
                  </CheckboxGroup>
                </div>
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
                className="rounded-none border-2 border-black font-bold uppercase shadow-[2px_2px_0px_#000] hover:translate-y-[2px] hover:shadow-none text-xl bg-retro-orange text-black"
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
