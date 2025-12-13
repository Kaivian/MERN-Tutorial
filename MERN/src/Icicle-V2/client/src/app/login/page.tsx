"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Image, Form, Input, Button, Link } from "@heroui/react";
import { useSyncImage } from "@/hooks/generals/useSyncImage";
import { VALIDATION_MESSAGES } from "@/utils/validation-messages";
import ThemeSwitchButton from "@/components/theme-switch/ThemeSwitchButton";

export default function LoginPage() {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Left Section */}
      <section className="hidden xl:flex w-9/20 items-center justify-center bg-content4 transition-colors duration-300">
        <div className="mx-auto text-center">
          <Image
            src="/login/chart.png"
            alt="Hệ thống quản lý"
            className="w-5/6 mx-auto mb-10 drop-shadow-xl"
          />
          <div className="flex flex-col items-center justify-center gap-4">
            <h1 className="font-medium font-roboto text-[32px] leading-12 tracking-[-0.01em]">
              HỆ THỐNG QUẢN LÝ NHÀ MÁY ĐÁ
            </h1>
            <h2 className="font-normal font-roboto text-lg leading-6">
              Giải pháp tối ưu vận hành và kiểm soát chi phí hiệu quả.
            </h2>
            <ThemeSwitchButton />
          </div>
        </div>
      </section>

      {/* Right Section */}
      <section className="w-full flex-1 flex flex-col items-center justify-center bg-background transition-colors duration-300">
        <div className="mb-10">
          <Image className="w-40" {...useSyncImage("/logo.png", "Logo")} />
        </div>
        <div className="w-3/4 max-w-xl">
          <h1 className="font-medium font-roboto text-[41px] leading-14 tracking-[-0.0075em] mb-10">
            Đăng nhập
          </h1>
          <Form className="space-y-6">
            <Input
              isRequired
              errorMessage={VALIDATION_MESSAGES.REQUIRED}
              label="Tên đăng nhập"
              labelPlacement="outside"
              variant="bordered"
              name="username"
              placeholder="Nhập tên đăng nhập"
            />
            <Input
                isRequired
                errorMessage={VALIDATION_MESSAGES.REQUIRED}
                label="Mật khẩu"
                labelPlacement="outside"
                variant="bordered"
                name="password"
                placeholder="Nhập mật khẩu"
                type={isVisible ? "text" : "password"}
                endContent={
                  <button
                    aria-label="toggle password visibility"
                    className="cursor-pointer text-[#71717a]"
                    type="button"
                    onClick={() => setIsVisible(!isVisible)}
                    tabIndex={-1}
                  >
                    {isVisible ? <Eye /> : <EyeOff />}
                  </button>
                }
              />
            <div className="flex flex-col gap-2 w-full">
              <div className="flex justify-end mr-1">
                <Link href="/change-password" size="sm" className="font-medium font-roboto text-sm leading-5 tracking-normal text-right align-middle dark:text-[#7e7e7e]">Đổi mật khẩu</Link>
              </div>
            </div>
            <Button fullWidth type="submit" color="primary">
              Đăng nhập
            </Button>
          </Form>
        </div>
      </section>
    </div>
  );
}