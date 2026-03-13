"use client";
import Link from "next/link";
// We don't need useTranslation or Button anymore for the retro aesthetic

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-[#18181b] border-b-4 border-black relative z-50">
      <Link href="/" className="flex items-center gap-3 group">
        <div className="w-10 h-10 bg-[#ee9d2b] border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_#ff0055] group-hover:scale-105 transition-transform">
          <span className="text-black font-bold text-2xl">F</span>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-widest uppercase group-hover:text-[#ee9d2b] transition-colors drop-shadow-[2px_2px_0px_#ff0055]">
          FPT Unimate
        </h1>
      </Link>

      <div className="flex gap-4">
        <Link
          href="/login"
          className="px-6 py-2 bg-zinc-800 text-white text-xl font-bold uppercase transition-all hover:-translate-y-1 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="px-6 py-2 bg-[#00e5ff] text-black text-xl font-bold uppercase transition-all hover:-translate-y-1 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none"
        >
          Register
        </Link>
      </div>
    </nav>
  );
}
