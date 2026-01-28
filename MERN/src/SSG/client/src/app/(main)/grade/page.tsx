"use client";

import { useAuth } from "@/providers/auth.provider";
import { Card, CardHeader, CardBody, CardFooter, Divider, Link, Image } from "@heroui/react";

export default function GradePage() {
  const { user } = useAuth();


  return (
    <div className="flex h-screen transition-colors duration-300 rounded-xl">
      {/* Card */}
      <section className="w-full">
        <Card
          fullWidth
          className="dark:bg-[#18181b] border-t-0 border-x-0 border-b-2 border-b-[#e6b689] dark:border-b-[#9d744d] rounded-xl overflow-hidden relative shadow-none"
        >
          {/* Background Grid Pattern (Optional decoration based on image) */}
          <div className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-[radial-gradient(#71717a_1px,transparent_1px)] bg-size-[16px_16px]" />

          <CardHeader className="relative z-10 flex flex-row justify-between items-end px-6 py-5">
            {/* --- LEFT SIDE: Icon + Title + Info --- */}
            <div className="flex flex-col gap-1 items-start">

              {/* Top Row: Icon & Main Title */}
              <div className="flex items-center gap-3">
                {/* Chart Icon */}
                <i
                  className="hn hn-chart-line text-retro-orange"
                  style={{ fontSize: "32px" }}
                />
                {/* Title with Hard Shadow */}
                <h1 className="text-4xl font-black text-retro-orange dark:text-white uppercase tracking-wide [text-shadow:3px_3px_0_#c47c16]">
                  Grade Tracker
                </h1>
              </div>

              {/* Bottom Row: Player & Level Info */}
              <div className="flex items-center gap-3 mt-2 text-[11px] md:text-xs font-bold tracking-widest uppercase font-mono">

                {/* Player Block */}
                <div className="flex items-center gap-1">
                  <span className="text-zinc-500">
                    <i className="hn hn-user mr-1" /> {/* Placeholder icon if needed */}
                    Player:
                  </span>
                  <span className="text-white text-sm">{user?.fullName ? user?.fullName : user?.username}</span>
                </div>

                {/* Separator */}
                <div className="h-3 w-px bg-zinc-600 mx-1"></div>

                {/* Level Block */}
                <div className="flex items-center gap-1">
                  <span className="text-zinc-500">
                    <i className="hn hn-calendar mr-1" /> {/* Placeholder icon if needed */}
                    Level:
                  </span>
                  <span className="text-retro-orange text-sm">Spring 2024</span>
                </div>
              </div>
            </div>

            {/* --- RIGHT SIDE: GPA Display --- */}
            <div className="flex flex-col items-end mb-1">
              <p className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase mb-0">
                Current GPA
              </p>
              <div className="flex items-baseline">
                <span className="text-4xl font-black text-retro-orange leading-none">
                  3.4
                </span>
                <span className="text-xl font-bold text-zinc-600 ml-1">
                  /4.0
                </span>
              </div>
            </div>

          </CardHeader>
        </Card>
      </section>
      <section>

      </section>
    </div>
  );
}