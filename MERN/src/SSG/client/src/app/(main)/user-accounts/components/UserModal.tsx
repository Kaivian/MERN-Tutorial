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
  Select,
  SelectItem,
  CheckboxGroup,
  Checkbox
} from "@heroui/react";
import { User } from "@/types/auth.types";
import { Role } from "@/types/rbac.types";
import { UserService } from "@/services/user.service";
import { RoleService } from "@/services/role.service";
import { addToast } from "@heroui/react";

interface UserModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  user: User | null; // null means Create mode
  onRefresh: () => void;
}

export function UserModal({ isOpen, onOpenChange, user, onRefresh }: UserModalProps) {
  const isEditing = !!user;

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    roles: [] as string[]
  });

  const [availableRoles, setAvailableRoles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Fetch roles to populate checkbox group
      RoleService.getRoles(false).then(res => {
        if (res.status === 'success') setAvailableRoles(res.data.roles);
      });

      if (user) {
        setFormData({
          username: user.username,
          email: user.email,
          password: "",
          confirmPassword: "",
          fullName: user.fullName || "",
          roles: user.roles?.map((r: any) => typeof r === 'string' ? r : r.slug) || []
        });
      } else {
        setFormData({ username: "", email: "", password: "", confirmPassword: "", fullName: "", roles: [] });
      }
    }
  }, [isOpen, user]);

  const handleSubmit = async (onClose: () => void) => {
    try {
      setIsLoading(true);

      if (!isEditing && formData.password !== formData.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      const payload = {
        username: formData.username,
        email: formData.email,
        fullName: formData.fullName,
        roles: formData.roles,
        ...(!isEditing ? { password: formData.password } : {})
      };

      if (isEditing) {
        await UserService.updateUser(user.id, payload);
        addToast({ title: "User updated", color: "success" });
      } else {
        await UserService.createUser(payload);
        addToast({ title: "User created", color: "success" });
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
            <ModalHeader>{isEditing ? "Edit User" : "Create New User"}</ModalHeader>
            <ModalBody className="gap-6 pt-6">
              <div className="flex gap-4">
                <Input
                  label="Username"
                  placeholder="Enter username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  isRequired
                  isDisabled={isEditing}
                  classNames={{
                    inputWrapper: "rounded-none border-4 border-black dark:border-white shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff] bg-white dark:bg-black text-xl hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] dark:hover:shadow-[2px_2px_0px_#fff] transition-all",
                    label: "font-jersey10 text-lg",
                  }}
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  isRequired
                  classNames={{
                    inputWrapper: "rounded-none border-4 border-black dark:border-white shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff] bg-white dark:bg-black text-xl hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] dark:hover:shadow-[2px_2px_0px_#fff] transition-all",
                    label: "font-jersey10 text-lg",
                  }}
                />
              </div>

              {!isEditing && (
                <div className="flex gap-4">
                  <Input
                    label="Password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    isRequired
                    classNames={{
                      inputWrapper: "rounded-none border-4 border-black dark:border-white shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff] bg-white dark:bg-black text-xl hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] dark:hover:shadow-[2px_2px_0px_#fff] transition-all",
                      label: "font-jersey10 text-lg",
                    }}
                  />
                  <Input
                    label="Confirm Password"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    isRequired
                    classNames={{
                      inputWrapper: "rounded-none border-4 border-black dark:border-white shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff] bg-white dark:bg-black text-xl hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] dark:hover:shadow-[2px_2px_0px_#fff] transition-all",
                      label: "font-jersey10 text-lg",
                    }}
                  />
                </div>
              )}

              <Input
                label="Full Name"
                placeholder="Enter full name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                classNames={{
                  inputWrapper: "rounded-none border-4 border-black dark:border-white shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff] bg-white dark:bg-black text-xl hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] dark:hover:shadow-[2px_2px_0px_#fff] transition-all",
                  label: "font-jersey10 text-lg",
                }}
              />

              <div className="mt-2 bg-white dark:bg-black p-4 border-4 border-black dark:border-white shadow-pixel dark:shadow-pixel-dark">
                <CheckboxGroup
                  label="Assign Roles"
                  orientation="horizontal"
                  value={formData.roles}
                  onValueChange={(val) => setFormData({ ...formData, roles: val })}
                  classNames={{
                    label: "font-jersey10 text-xl text-black dark:text-white mb-2",
                  }}
                >
                  {availableRoles.map(r => (
                    <Checkbox
                      key={r.slug}
                      value={r.slug}
                      classNames={{
                        label: "font-jersey10 text-lg",
                        wrapper: "rounded-none border-2 border-black dark:border-white",
                      }}
                    >
                      {r.name}
                    </Checkbox>
                  ))}
                </CheckboxGroup>
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
                {isEditing ? "Save Changes" : "Create User"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
