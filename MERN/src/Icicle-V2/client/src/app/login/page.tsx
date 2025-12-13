"use client";

import React from "react";
import { Card, CardBody, Input, Button, Link } from "@heroui/react";
import { Mail, Lock } from "lucide-react"; 

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center p-4">
      
      {/* 1. Card Container chính của HeroUI */}
      <Card className="w-full max-w-6xl min-h-[550px] shadow-2xl overflow-hidden">
        <CardBody className="p-0 flex flex-row overflow-hidden">
          
          {/* --- CỘT TRÁI: FORM (60% trên desktop) --- */}
          <div className="w-full lg:w-3/5 p-8 md:p-12 flex flex-col justify-center bg-white z-10">
            
            {/* Logo giả lập */}
            <div className="flex items-center gap-3 mb-10">
              <div className="w-8 h-8 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-full shadow-lg" />
              <span className="font-bold text-xl text-gray-700 tracking-wider">HERO LOGO</span>
            </div>

            <h2 className="text-3xl font-bold text-gray-800 mb-2">LOGIN</h2>
            <p className="text-gray-400 text-sm mb-8">Welcome back! Please login to your account.</p>
            
            <form className="flex flex-col gap-6">
              {/* Input HeroUI: variant="underlined" để tạo dòng kẻ dưới giống ảnh mẫu */}
              <Input
                type="email"
                label="EMAIL ADDRESS"
                placeholder="yourname@email.com"
                variant="underlined" 
                color="primary"
                classNames={{
                  label: "text-gray-500 font-semibold tracking-wider text-xs",
                  input: "text-gray-700",
                }}
                endContent={<Mail className="text-gray-400 w-4 h-4" />}
              />

              <Input
                type="password"
                label="PASSWORD"
                placeholder="••••••••••••"
                variant="underlined"
                color="primary"
                classNames={{
                  label: "text-gray-500 font-semibold tracking-wider text-xs",
                  input: "text-gray-700",
                }}
                endContent={<Lock className="text-gray-400 w-4 h-4" />}
              />

              <div className="flex justify-end mt-2">
                <Link href="#" size="sm" className="text-gray-400 hover:text-blue-600">
                  Forgot your password?
                </Link>
              </div>

              {/* Button HeroUI: radius="full" để bo tròn 2 đầu */}
              <Button 
                color="primary" 
                size="lg" 
                radius="full"
                className="w-32 mt-4 bg-gradient-to-r from-blue-500 to-blue-700 font-bold shadow-lg shadow-blue-500/40"
              >
                LOGIN
              </Button>
            </form>
          </div>

          {/* --- CỘT PHẢI: ẢNH MINH HỌA (Ẩn trên mobile) --- */}
          <div className="hidden lg:flex w-1/2 relative items-center justify-center bg-blue-600 overflow-hidden">
            {/* Background Image */}
            <img 
              src="https://img.freepik.com/free-vector/gradient-network-connection-background_23-2148879890.jpg" 
              alt="City Background" 
              className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
            />
            
            {/* Overlay Gradient cho đẹp hơn */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-600/80 to-purple-600/80 mix-blend-multiply" />

            {/* Nội dung nổi bật trên nền ảnh */}
            <div className="relative z-20 flex flex-col items-center text-white p-8 text-center">
              <div className="w-28 h-28 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 mb-6 shadow-2xl">
                 {/* Icon Building */}
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-14 h-14 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
                  </svg>
              </div>
              <h3 className="text-2xl font-bold tracking-[0.2em] uppercase">Company Name</h3>
              <p className="text-blue-100 mt-4 max-w-xs text-sm">
                Join our community and experience the best services suitable for your business.
              </p>
            </div>
          </div>

        </CardBody>
      </Card>
    </main>
  );
}