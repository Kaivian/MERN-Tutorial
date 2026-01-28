// client/src/app/auth/layout.tsx
"use client";

import React from "react";
import { Terminal, Gamepad2, GraduationCap } from "lucide-react";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const currentYear = new Date().getFullYear();
    const leftSectionBgImage = "/auth/background.png";

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Left Section */}
            <section className="hidden xl:flex w-1/2 relative flex-col justify-center items-center p-12 overflow-hidden border-r-4 border-black bg-cover bg-center"
                style={{
                    backgroundImage: `url('${leftSectionBgImage}')`,
                }}>
                <div className="absolute inset-0 bg-linear-to-br from-retro-dark/90 via-retro-purple/80 to-retro-orange/90 z-0"></div>

                {/* Background Decorations (Giữ nguyên animation float) */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
                    <div className="absolute top-20 left-20 w-16 h-16 bg-white/10 border-4 border-white/20 animate-float rounded-none"></div>
                    <div className="absolute top-1/4 right-1/4 w-4 h-4 bg-retro-orange shadow-[4px_4px_0_0_rgba(0,0,0,0.5)] animate-float-delay"></div>
                    <div className="absolute bottom-1/8 left-1/4 w-8 h-8 bg-retro-pink shadow-[4px_4px_0_0_rgba(0,0,0,0.5)] animate-float-short"></div>
                    <div className="absolute bottom-1/5 right-1/5 w-6 h-6 bg-retro-purple shadow-[4px_4px_0_0_rgba(0,0,0,0.5)] animate-float-delay"></div>
                    <div
                        className="absolute inset-0 opacity-10 pointer-events-none"
                        style={{
                            backgroundImage: 'radial-gradient(white 2px, transparent 0)',
                            backgroundSize: '40px 40px'
                        }}
                    ></div>
                </div>

                {/* Left Main Content */}
                <div className="relative z-20 max-w-3xl text-center flex flex-col items-center">
                    {/* Badge: Xuất hiện đầu tiên */}
                    <div className="inline-block mb-6 bg-black/30 backdrop-blur-sm border-2 border-white/20 p-4 shadow-pixel opacity-0 animate-fade-in-up ">
                        <span className="text-retro-orange text-xl tracking-widest uppercase font-bold font-display">
                            Student Life
                        </span>
                    </div>

                    {/* Title: Xuất hiện sau 100ms */}
                    <h1 className="text-6xl font-bold leading-tight mb-6 text-white drop-shadow-[4px_4px_0_rgba(0,0,0,1)] uppercase tracking-tighter font-display opacity-0 animate-fade-in-up delay-100">
                        FPT Unimate
                    </h1>

                    {/* Subtitle Box: Xuất hiện sau 200ms */}
                    <div className="bg-white/10 backdrop-blur-md border-2 border-white/30 p-6 shadow-pixel-lg inline-block transform -rotate-1 opacity-0 animate-fade-in-up delay-200">
                        <h2 className="text-2xl text-white font-medium leading-relaxed max-w-xl font-display">
                            Personal management solution for FPT students
                        </h2>
                    </div>

                    {/* Icons: Xuất hiện sau 300ms */}
                    <div className="flex justify-center gap-8 mt-12 opacity-0 animate-fade-in-up delay-300">
                        <Terminal className="text-white w-14 h-14 drop-shadow-[4px_4px_0_rgba(0,0,0,1)] animate-float-delay" strokeWidth={1.5} />
                        <Gamepad2 className="text-retro-orange w-14 h-14 drop-shadow-[4px_4px_0_rgba(0,0,0,1)] animate-float" strokeWidth={1.5} />
                        <GraduationCap className="text-retro-pink w-14 h-14 drop-shadow-[4px_4px_0_rgba(0,0,0,1)] animate-float-delay" strokeWidth={1.5} />
                    </div>
                </div>
            </section>

            {/* Right Section (Main Content Area) */}
            <section className="w-full flex-1 flex flex-col items-center bg-background transition-colors duration-300">
                <div className="grow flex flex-col items-center justify-center w-full p-4">
                    <h1 className="text-6xl font-bold leading-tight mb-6 text-retro-orange drop-shadow-[4px_4px_0_rgba(0,0,0,1)] uppercase tracking-tighter font-display xl:hidden opacity-0 animate-fade-in-up">
                        FPT Unimate
                    </h1>

                    <div className="w-full max-w-xl bg-transparent md:bg-white border-0 md:border-4 border-black shadow-none md:shadow-pixel-card relative p-4 md:p-8 opacity-0 animate-fade-in-up delay-200">
                        <div className="hidden md:block absolute -top-1 -left-1 w-3 h-3 bg-white border-2 border-black"></div>
                        <div className="hidden md:block absolute -top-1 -right-1 w-3 h-3 bg-white border-2 border-black"></div>
                        <div className="hidden md:block absolute -bottom-1 -left-1 w-3 h-3 bg-white border-2 border-black"></div>
                        <div className="hidden md:block absolute -bottom-1 -right-1 w-3 h-3 bg-white border-2 border-black"></div>

                        {children}
                    </div>
                </div>

                {/* Footer: Xuất hiện cuối cùng */}
                <footer className="w-full max-w-xl px-4 pb-4 opacity-0 animate-fade-in-up delay-500">
                    <div className="mt-6 text-center text-sm leading-5 text-[#71717a]">
                        <p>
                            <span className="font-roboto">&copy;</span>{' '}
                            {currentYear} SE20A06 - SSG104 - Group 3. All rights reserved.
                        </p>
                    </div>
                </footer>
            </section>
        </div>
    );
}