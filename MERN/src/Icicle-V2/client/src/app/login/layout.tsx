// client/src/app/login/layout.tsx
"use client";

import { Image } from "@heroui/react";
import { useSyncImage } from "@/hooks/generals/useSyncImage";
import ThemeSwitchButton from "@/components/theme-switch/ThemeSwitchButton";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex h-screen"> 
      {/* Left Section */}
      <section className="hidden xl:flex w-[45%] items-center justify-center bg-content4 transition-colors duration-300">
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

      {/* Right Section (Main Content Area) */}
      <section className="w-full flex-1 flex flex-col items-center bg-background transition-colors duration-300">
        <div className="grow flex flex-col items-center justify-center w-full">
          <div className="mb-10">
            <Image className="w-40" {...useSyncImage("/logo.png", "Logo")} suppressHydrationWarning={true}/>
          </div>
          <div className="w-3/4 max-w-xl">
            {children}
          </div>
        </div>

        {/* Footer cố định ở Layout */}
        <footer className="w-full max-w-xl px-4 pb-4">
          <div className="mt-6 text-center font-roboto text-sm leading-5 text-[#71717a]">
            &copy; {currentYear} Công ty TNHH Sản xuất Thương mại và Dịch vụ Gia Lực. All rights reserved.
          </div>
        </footer>
      </section>
    </div>
  );
}