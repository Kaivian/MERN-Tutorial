// client/src/app/login/page.tsx
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

  return (
    <>
      <h1 className="font-medium font-roboto text-[41px] leading-14 tracking-[-0.0075em] mb-10">
        Đăng nhập
      </h1>

      {/* Form Section */}
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
            isDisabled={isLoading} 
          />

          <Input
            isRequired
            errorMessage={VALIDATION_MESSAGES.REQUIRED}
            label="Mật khẩu"
            labelPlacement="outside"
            variant="bordered"
            name="password"
            placeholder="Nhập mật khẩu"
            value={password}
            onValueChange={setPassword}
            type={isVisible ? "text" : "password"}
            isDisabled={isLoading}
            endContent={
              <button
                aria-label="toggle password visibility"
                className="cursor-pointer text-[#71717a] transition-transform active:scale-90 duration-200"
                type="button"
                onClick={() => setIsVisible(!isVisible)}
                tabIndex={-1}
                disabled={isLoading}
              >
                {isVisible ? <Eye size={22} /> : <EyeOff size={22} />}
              </button>
            }
          />

          <Button 
            fullWidth 
            type="submit" 
            color="primary"
            isLoading={isLoading}
          >
            Đăng nhập
          </Button>
        </Form>
      </section>

      {/* Social Login */}
      <section>
        <div className="mt-6 text-center font-roboto text-sm leading-5 text-[#71717a]">
          Hoặc
        </div>
        <div className="mt-4 flex items-center justify-center gap-4">
          <Button 
            color="default" 
            variant="faded" 
            isDisabled={isLoading}
          >
            <FcGoogle size={20} className="mr-2" />
            Đăng nhập với Google
          </Button>
        </div>
      </section>
    </>
  );
}