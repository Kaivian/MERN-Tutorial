// client/src/app/auth/register/page.tsx
"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Eye, EyeOff, Box } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { Form, Input, Button } from "@heroui/react";
import { VALIDATION_MESSAGES } from "@/config/validation-messages.config";
import { useDebounce } from "@/hooks/generals/useDebounce";
import { PASSWORD_REGEX, EMAIL_REGEX } from "@/utils/regex.utils";
import { useRegister } from "@/hooks/auth/useRegister"; // [NEW IMPORT]

// Regex đơn giản cho username: Chỉ chữ và số, không khoảng trắng, không ký tự đặc biệt
const USERNAME_REGEX = /^[a-zA-Z0-9]+$/;

export default function RegisterPage() {
  // --- HOOK INTEGRATION ---
  const { handleRegister, isLoading } = useRegister();

  const [isVisible, setIsVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  
  // State for form fields
  // Đổi 'name' thành 'username' để rõ nghĩa hơn với backend
  const [username, setUsername] = useState(""); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // --- VALIDATION LOGIC ---
  const debouncedUsername = useDebounce(username);
  const debouncedEmail = useDebounce(email);
  const debouncedPassword = useDebounce(password);
  const debouncedConfirmPassword = useDebounce(confirmPassword);

  // 1. Validate Username (Player Name)
  const usernameErrors = useMemo(() => {
    const errors = [];
    if (debouncedUsername.length > 0) {
      if (debouncedUsername.length < 3) errors.push("Username must be at least 3 characters");
      if (debouncedUsername.length > 30) errors.push("Username must be less than 30 characters");
      if (!USERNAME_REGEX.test(debouncedUsername)) errors.push("Username allows only letters and numbers");
    }
    return errors;
  }, [debouncedUsername]);

  // 2. Validate Email
  const emailErrors = useMemo(() => {
    const errors = [];
    if (debouncedEmail.length > 0) {
        if (!EMAIL_REGEX.test(debouncedEmail)) errors.push(VALIDATION_MESSAGES.EMAIL_FORMAT || "Invalid email format");
    }
    return errors;
  }, [debouncedEmail]);

  // 3. Validate Password
  const passwordErrors = useMemo(() => {
    const errors = [];
    if (debouncedPassword.length > 0) {
      if (debouncedPassword.length < 8) errors.push(VALIDATION_MESSAGES.MIN_8_CHARS);
      if (debouncedPassword.length > 25) errors.push(VALIDATION_MESSAGES.MAX_25_CHARS);
      if (!PASSWORD_REGEX.test(debouncedPassword)) errors.push(VALIDATION_MESSAGES.FORMAT);
    }
    return errors;
  }, [debouncedPassword]);

  // 4. Validate Confirm Password
  const confirmPasswordErrors = useMemo(() => {
    const errors = [];
    if (debouncedConfirmPassword.length > 0 && debouncedConfirmPassword !== password) {
      errors.push(VALIDATION_MESSAGES.PASSWORD_MISMATCH);
    }
    return errors;
  }, [debouncedConfirmPassword, password]);

  // Check valid to disable button
  const isSubmitDisabled = 
    !username || 
    !email || 
    !password || 
    !confirmPassword || 
    usernameErrors.length > 0 ||
    emailErrors.length > 0 ||
    passwordErrors.length > 0 || 
    confirmPasswordErrors.length > 0;

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitDisabled || isLoading) return;

    // Call the Hook
    await handleRegister({
        username,
        email,
        password,
        confirmPassword,
        // Backend yêu cầu fullName, ta map tạm username vào đây
        // vì UI đã bỏ trường nhập Full Name
        fullName: username 
    });
  };

  // --- RETRO STYLE CONFIGURATION ---
  const inputStyles = {
    inputWrapper: [
      "bg-white",
      "border-4",             
      "border-black",
      "rounded-none",         
      "shadow-none",
      "h-14",                 
      "data-[hover=true]:border-black",
      "group-data-[focus=true]:border-black",
      "group-data-[focus=true]:shadow-pixel", 
      "group-data-[focus=true]:bg-orange-50",
      "transition-all",
      "duration-200"
    ],
    label: "text-black font-bold uppercase tracking-wider text-xs md:text-sm font-display mb-1",
    input: "text-base font-medium text-black placeholder:text-gray-400 font-sans",
    errorMessage: "font-mono text-xs text-red-600 mt-1",
  };

  return (
    <>
      {/* HEADER SECTION */}
      <div className="relative mb-8">
        <div className="absolute -top-4 -right-2 opacity-20 text-retro-orange hidden sm:block">
            <Box size={48} strokeWidth={1} />
        </div>

        <div className="border-l-8 border-retro-orange pl-4 py-1">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-black uppercase leading-tight tracking-tight">
                FPT Unimate - Personal Management Solution
            </h1>
        </div>
        
        <p className="mt-3 text-gray-600 font-mono text-sm">
            {">"} Press Start to Join...
        </p>
      </div>

      {/* FORM SECTION */}
      <section>
        <Form className="flex flex-col gap-5" onSubmit={onSubmit}>
            
          {/* 1. Player Name (Username) */}
          <Input
            isRequired
            errorMessage={usernameErrors.length > 0 ? usernameErrors[0] : null}
            isInvalid={usernameErrors.length > 0}
            label="Player Name (Username)" // Updated label for clarity
            labelPlacement="outside"
            name="username"
            placeholder="Enter your username (e.g. kaivian)"
            value={username}
            onValueChange={setUsername}
            isDisabled={isLoading}
            classNames={inputStyles}
          />

          {/* 2. Email Address */}
          <Input
            isRequired
            type="email"
            label="Email Address"
            labelPlacement="outside"
            name="email"
            placeholder="Address your email"
            value={email}
            onValueChange={setEmail}
            isDisabled={isLoading}
            classNames={inputStyles}
            isInvalid={emailErrors.length > 0}
            errorMessage={emailErrors.length > 0 ? emailErrors[0] : null}
          />

          {/* 3. Password */}
          <Input
            isRequired
            label="Password"
            labelPlacement="outside"
            name="password"
            placeholder="Create a secret key"
            value={password}
            onValueChange={setPassword}
            type={isVisible ? "text" : "password"}
            isDisabled={isLoading}
            classNames={inputStyles}
            isInvalid={passwordErrors.length > 0}
            errorMessage={
                passwordErrors.length > 0 ? (
                  <ul className="list-disc list-inside text-tiny text-danger font-mono">
                    {passwordErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                ) : null
            }
            endContent={
              <button
                aria-label="toggle password visibility"
                className="focus:outline-none cursor-pointer text-black hover:text-retro-orange transition-colors"
                type="button"
                onClick={() => setIsVisible(!isVisible)}
                tabIndex={-1}
              >
                {isVisible ? <Eye size={22} /> : <EyeOff size={22} />}
              </button>
            }
          />

          {/* 4. Confirm Password */}
          <Input
            isRequired
            label="Confirm Password"
            labelPlacement="outside"
            name="confirmPassword"
            placeholder="Verify secret key"
            value={confirmPassword}
            onValueChange={setConfirmPassword}
            type={isConfirmVisible ? "text" : "password"}
            isDisabled={isLoading}
            classNames={inputStyles}
            isInvalid={confirmPasswordErrors.length > 0}
            errorMessage={confirmPasswordErrors.length > 0 ? confirmPasswordErrors[0] : null}
            endContent={
              <button
                aria-label="toggle password visibility"
                className="focus:outline-none cursor-pointer text-black hover:text-retro-orange transition-colors"
                type="button"
                onClick={() => setIsConfirmVisible(!isConfirmVisible)}
                tabIndex={-1}
              >
                {isConfirmVisible ? <Eye size={22} /> : <EyeOff size={22} />}
              </button>
            }
          />

          {/* Submit Button */}
          <Button
            fullWidth
            type="submit"
            isLoading={isLoading}
            isDisabled={isSubmitDisabled || isLoading}
            className="h-14 mt-2 rounded-none border-4 border-black bg-retro-orange text-white text-xl font-bold uppercase tracking-widest shadow-pixel hover:translate-y-1 hover:shadow-pixel-hover active:translate-y-1 active:shadow-none transition-all duration-150 font-display disabled:opacity-50 disabled:shadow-none disabled:translate-y-1"
          >
            {isLoading ? "LOADING..." : "CREATE ACCOUNT"}
          </Button>
        </Form>
      </section>

      {/* SOCIAL LOGIN SECTION */}
      <section>
        <div className="flex items-center gap-4 py-6">
          <div className="h-1 flex-1 border-t-4 border-dashed border-black/30"></div>
          <span className="text-xs text-gray-500 uppercase font-bold tracking-widest bg-white px-2 font-display">
            Or continue with
          </span>
          <div className="h-1 flex-1 border-t-4 border-dashed border-black/30"></div>
        </div>
        
        <div className="grid grid-cols-1">
          <Button
            isDisabled={isLoading}
            className="h-12 rounded-none border-4 border-black bg-white text-black font-bold hover:bg-gray-50 shadow-pixel hover:translate-y-1 hover:shadow-pixel-hover active:translate-y-1 active:shadow-none transition-all duration-150 group font-display"
          >
            <FcGoogle size={22} className="group-hover:scale-110 transition-transform" />
            <span className="uppercase text-xs sm:text-sm ml-2">Google</span>
          </Button>
        </div>
        
        <div className="text-center mt-8 pb-2">
             <p className="text-sm text-gray-600 font-mono">
                Already have an account?{" "}
                <Link href="/login" className="font-bold text-retro-orange hover:text-retro-dark hover:underline decoration-4 underline-offset-4 uppercase transition-colors">
                    Log in
                </Link>
             </p>
        </div>
      </section>
    </>
  );
}