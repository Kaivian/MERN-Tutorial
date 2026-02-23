"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { Form, Input, Button, Link } from "@heroui/react";
import { VALIDATION_MESSAGES } from "@/config/validation-messages.config";
import { useLogin } from "@/hooks/auth/useLogin";

export default function LoginPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { handleLogin, isLoading } = useLogin();

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!username || !password) return;
    await handleLogin({ username, password });
  };

  // Style chung cho Input để tái sử dụng
  const inputStyles = {
    inputWrapper: [
      "bg-white",
      "border-4",             // Viền dày
      "border-black",
      "rounded-none",         // Bỏ bo góc -> Vuông
      "shadow-none",
      "h-12",                 // Cao hơn chút cho dễ bấm
      // Trạng thái hover/focus
      "data-[hover=true]:border-black",
      "group-data-[focus=true]:border-black",
      "group-data-[focus=true]:shadow-pixel", // Bóng đổ pixel khi focus
      "group-data-[focus=true]:bg-orange-50",
      "transition-all",
      "duration-200"
    ],
    label: "text-black font-bold uppercase tracking-wider text-sm font-display",
    input: "text-lg font-medium text-black placeholder:text-gray-400 font-display",
  };

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl font-bold text-black uppercase tracking-tight drop-shadow-[2px_2px_0_rgba(0,0,0,0.1)]">
          Hey, Welcome Back!
        </h1>
        <p className="text-gray-500 font-display text-lg">Player 1, Start Game!</p>
      </div>

      {/* Form Section */}
      <section>
        <Form className="space-y-2" onSubmit={onSubmit}>
          <Input
            isRequired
            errorMessage={VALIDATION_MESSAGES.REQUIRED}
            label="Username"
            labelPlacement="outside"
            name="username"
            placeholder="Enter your username"
            value={username}
            onValueChange={setUsername}
            isDisabled={isLoading}
            classNames={inputStyles}
          />

          <Input
            isRequired
            errorMessage={VALIDATION_MESSAGES.REQUIRED}
            label="Password"
            labelPlacement="outside"
            name="password"
            placeholder="Enter your password"
            value={password}
            onValueChange={setPassword}
            type={isVisible ? "text" : "password"}
            isDisabled={isLoading}
            classNames={inputStyles}
            endContent={
              <button
                aria-label="toggle password visibility"
                className="cursor-pointer text-black hover:text-retro-orange transition-colors active:scale-90 duration-200"
                type="button"
                onClick={() => setIsVisible(!isVisible)}
                tabIndex={-1}
                disabled={isLoading}
              >
                {isVisible ? <Eye size={24} strokeWidth={2.5} /> : <EyeOff size={24} strokeWidth={2.5} />}
              </button>
            }
          />
          <div className="w-full flex justify-end mb-4">
            <Link href="#" className="text-sm text-gray-500 font-display hover:underline decoration-2" tabIndex={-1}>
              Forgot password?{" "}
            </Link>
          </div>
          <Button
            fullWidth
            type="submit"
            isLoading={isLoading}
            className="h-12 rounded-none border-4 border-black bg-retro-orange text-black text-xl font-bold uppercase tracking-widest shadow-pixel hover:translate-y-1 hover:shadow-pixel-hover active:translate-y-1 active:shadow-none transition-all duration-150 font-display"
          >
            Login
          </Button>
        </Form>
      </section>

      {/* Social Login */}
      <section>
        <div className="flex items-center gap-4 py-6">
          <div className="h-1 flex-1 border-t-4 border-dotted border-black"></div>
          <span className="text-xs text-black uppercase font-bold tracking-widest bg-white px-2 font-display">
            Or
          </span>
          <div className="h-1 flex-1 border-t-4 border-dotted border-black"></div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Button
            fullWidth
            isDisabled={isLoading}
            className="h-12 rounded-none border-4 border-black bg-white text-black font-bold hover:bg-gray-50 shadow-pixel hover:translate-y-1 hover:shadow-pixel-hover active:translate-y-1 active:shadow-none transition-all duration-150 group font-display"
          >
            <FcGoogle size={24} className="mr-2 group-hover:scale-110 transition-transform" />
            <span className="uppercase text-sm">Google</span>
          </Button>
        </div>
        <div className="text-center mt-8 pb-2">
          <p className="text-sm text-gray-600 font-mono">
            New player?{" "}
            <Link href="/register" className="font-bold text-retro-orange hover:text-retro-dark hover:underline decoration-4 underline-offset-4 uppercase transition-colors">
              Sign up now.
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}