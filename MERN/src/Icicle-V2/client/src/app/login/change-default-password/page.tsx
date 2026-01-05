// client/src/app/(auth)/change-password/page.tsx
"use client";

import React, { useMemo, useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Form, Input, Button, Link } from "@heroui/react";
import { VALIDATION_MESSAGES } from "@/config/validation-messages.config";
import { useDebounce } from "@/hooks/generals/useDebounce";
import { useChangePassword } from "@/hooks/auth/useChangePassword";
import { PASSWORD_REGEX } from "@/utils/regex.utils";

function ChangePasswordForm() {
  const searchParams = useSearchParams();
  const initialUsername = searchParams.get("username") || "";

  const { handleChangePassword, isLoading } = useChangePassword();

  const [isVisible, setIsVisible] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const [username, setUsername] = useState(initialUsername);
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const debouncedNewPassword = useDebounce(newPassword);
  const debouncedConfirmPassword = useDebounce(confirmPassword);

  useEffect(() => {
    if (initialUsername) {
      setUsername(initialUsername);
    }
  }, [initialUsername]);

  const newPasswordErrors = useMemo(() => {
    const errors = [];
    if (debouncedNewPassword.length > 0) {
      if (debouncedNewPassword.length < 8) errors.push(VALIDATION_MESSAGES.MIN_8_CHARS);
      if (debouncedNewPassword.length > 25) errors.push(VALIDATION_MESSAGES.MAX_25_CHARS);
      if (!PASSWORD_REGEX.test(debouncedNewPassword)) errors.push(VALIDATION_MESSAGES.FORMAT);
      if (currentPassword && debouncedNewPassword === currentPassword) errors.push(VALIDATION_MESSAGES.PASSWORD_SAME);
    }
    return errors;
  }, [debouncedNewPassword, currentPassword]);

  const confirmPasswordErrors = useMemo(() => {
    const errors = [];
    if (debouncedConfirmPassword.length > 0 && debouncedConfirmPassword !== newPassword) {
      errors.push(VALIDATION_MESSAGES.PASSWORD_MISMATCH);
    }
    return errors;
  }, [debouncedConfirmPassword, newPassword]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Client-side guard clauses (extra safety before calling hook)
    if (!username || !currentPassword || !newPassword || !confirmPassword) return;
    if (newPassword.length < 8 || newPassword.length > 25 || !PASSWORD_REGEX.test(newPassword)) return;
    if (newPassword !== confirmPassword) return;

    // Call the hook
    await handleChangePassword({
      username,
      currentPassword,
      newPassword,
      confirmPassword,
    });
  };

  const isSubmitDisabled = 
    !username || !currentPassword || !newPassword || !confirmPassword || 
    newPassword.length < 8 || newPassword.length > 25 || !PASSWORD_REGEX.test(newPassword) || 
    newPassword !== confirmPassword;

  return (
    <>
      <h1 className="font-medium font-roboto text-[41px] leading-14 tracking-[-0.0075em] mb-10">
        Đổi mật khẩu
      </h1>

      <section>
        <Form className="space-y-6" onSubmit={onSubmit}>
          <Input
            isRequired
            errorMessage={VALIDATION_MESSAGES.REQUIRED}
            label="Tên đăng nhập"
            labelPlacement="outside"
            variant="bordered"
            name="username"
            placeholder="Nhập tên đăng nhập"
            value={username}
            onValueChange={setUsername}
          />
          
          <Input
            isRequired
            errorMessage={VALIDATION_MESSAGES.REQUIRED}
            label="Mật khẩu hiện tại"
            labelPlacement="outside"
            variant="bordered"
            name="password"
            placeholder="Nhập mật khẩu hiện tại"
            value={currentPassword}
            onValueChange={setCurrentPassword}
            type={isVisible ? "text" : "password"}
            endContent={
              <button
                type="button"
                onClick={() => setIsVisible(!isVisible)}
                className="cursor-pointer text-[#71717a] transition-transform active:scale-90 duration-200"
                tabIndex={-1}
              >
                {isVisible ? <Eye size={22} /> : <EyeOff size={22} />}
              </button>
            }
          />

          <Input
            isRequired
            label="Mật khẩu mới"
            labelPlacement="outside"
            variant="bordered"
            name="new-password"
            placeholder="Nhập mật khẩu mới"
            value={newPassword}
            onValueChange={setNewPassword}
            type={isPasswordVisible ? "text" : "password"}
            isInvalid={newPasswordErrors.length > 0}
            errorMessage={
              newPasswordErrors.length > 0 ? (
                <ul className="list-disc list-inside text-tiny text-danger">
                  {newPasswordErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              ) : null
            }
            endContent={
              <button
                type="button"
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                className="cursor-pointer text-[#71717a] transition-transform active:scale-90 duration-200"
                tabIndex={-1}
              >
                {isPasswordVisible ? <Eye size={22} /> : <EyeOff size={22} />}
              </button>
            }
          />

          <Input
            isRequired
            label="Nhập lại mật khẩu mới"
            labelPlacement="outside"
            variant="bordered"
            name="confirm-password"
            placeholder="Nhập lại mật khẩu mới"
            value={confirmPassword}
            onValueChange={setConfirmPassword}
            type={isConfirmPasswordVisible ? "text" : "password"}
            isInvalid={confirmPasswordErrors.length > 0}
            errorMessage={confirmPasswordErrors.length > 0 ? confirmPasswordErrors[0] : null}
            endContent={
              <button
                type="button"
                onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                className="cursor-pointer text-[#71717a] transition-transform active:scale-90 duration-200"
                tabIndex={-1}
              >
                {isConfirmPasswordVisible ? <Eye size={22} /> : <EyeOff size={22} />}
              </button>
            }
          />

          <div className="flex flex-col gap-2 w-full">
            <div className="flex justify-end mr-1">
              <Link
                href="/login"
                size="sm"
                className="font-medium font-roboto text-sm leading-5 tracking-normal text-right align-middle dark:text-[#7e7e7e]"
                tabIndex={-1}
              >
                Quay lại đăng nhập
              </Link>
            </div>
          </div>
          
          <Button 
            fullWidth 
            type="submit" 
            color="primary" 
            isDisabled={isSubmitDisabled || isLoading}
            isLoading={isLoading}
          >
            Đổi mật khẩu
          </Button>
        </Form>
      </section>
    </>
  );
}

export default function ChangePasswordPage() {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <ChangePasswordForm />
    </Suspense>
  );
}