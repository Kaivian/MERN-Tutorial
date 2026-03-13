import Navbar from "../components/Navbar";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#18181b] text-[#f4f4f5] font-jersey10 selection:bg-[#ee9d2b] selection:text-black overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative px-6 py-24 sm:py-32 flex flex-col items-center justify-center text-center">
        {/* Pixel aesthetic background pattern */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#ee9d2b 2px, transparent 2px)',
            backgroundSize: '32px 32px'
          }}
        ></div>

        <div className="z-10 max-w-5xl mx-auto relative mt-10">
          <div className="absolute -top-16 -left-16 sm:-left-32 text-6xl animate-bounce hidden sm:block">👾</div>
          <div className="absolute -bottom-16 -right-16 sm:-right-32 text-6xl animate-pulse hidden sm:block">⭐</div>

          <h1 className="text-6xl sm:text-8xl md:text-9xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#ee9d2b] via-[#ff0055] to-[#00e5ff] drop-shadow-[5px_5px_0px_rgba(0,0,0,1)] tracking-wider">
            FPT UNIMATE
          </h1>
          <p className="text-2xl sm:text-3xl text-zinc-300 mb-12 max-w-3xl mx-auto drop-shadow-[3px_3px_0px_rgba(0,0,0,1)] leading-relaxed">
            The ultimate 8-bit aesthetic learning and lifestyle management system! <br className="hidden md:block" />
            Your loyal companion to conquer every semester.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              href="/dashboard"
              className="group relative px-8 py-4 bg-[#ee9d2b] text-black text-2xl sm:text-3xl font-bold uppercase transition-all hover:-translate-y-1 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] active:translate-y-2 active:translate-x-2 active:shadow-none"
            >
              Start Game [►]
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-zinc-800 text-white text-2xl sm:text-3xl font-bold uppercase transition-all hover:-translate-y-1 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] active:translate-y-2 active:translate-x-2 active:shadow-none"
            >
              Insert Coin
            </Link>
          </div>
        </div>
      </section>

      {/* Stats/Marquee Banner */}
      <div className="w-full bg-[#00e5ff] border-y-4 border-black py-4 overflow-hidden relative rotate-1 scale-105 my-10">
        <div className="animate-[marquee_20s_linear_infinite] whitespace-nowrap text-black font-bold text-3xl sm:text-4xl tracking-widest flex gap-10">
          <span>🎮 LEVEL UP YOUR STUDY</span>
          <span>•</span>
          <span>🌟 100% EXPERIENCE BOOST</span>
          <span>•</span>
          <span>⚔️ DEFEAT DEADLINES</span>
          <span>•</span>
          <span>🎓 GRADUATE VALEDICTORIAN</span>
          <span>•</span>
          <span>🎮 LEVEL UP YOUR STUDY</span>
        </div>
      </div>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 z-10 relative">
        <div className="text-center mb-16">
          <h2 className="inline-block text-5xl md:text-6xl font-bold text-white bg-black px-8 py-4 border-4 border-[#00e5ff] shadow-[8px_8px_0px_0px_#00e5ff]">
            // KEY FEATURES
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* Feature 1 */}
          <div className="bg-[#18181b] p-8 border-4 border-black shadow-[8px_8px_0px_0px_#ff0055] hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_#ff0055] transition-all duration-200 group relative">
            <div className="absolute top-4 right-4 text-zinc-600 font-bold text-2xl group-hover:text-[#ff0055]">01</div>
            <div className="text-6xl mb-6 bg-black w-20 h-20 flex items-center justify-center border-2 border-[#ff0055]">📅</div>
            <h3 className="text-3xl font-bold mb-4 text-white group-hover:text-[#ff0055] transition-colors">Monster Deadline Manager</h3>
            <p className="text-xl text-zinc-400 leading-relaxed">
              Smart system automatically reminds and distributes tasks. Turn "boss" deadlines into easy exp and gain honor points.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-[#18181b] p-8 border-4 border-black shadow-[8px_8px_0px_0px_#00e5ff] hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_#00e5ff] transition-all duration-200 group relative">
            <div className="absolute top-4 right-4 text-zinc-600 font-bold text-2xl group-hover:text-[#00e5ff]">02</div>
            <div className="text-6xl mb-6 bg-black w-20 h-20 flex items-center justify-center border-2 border-[#00e5ff]">📊</div>
            <h3 className="text-3xl font-bold mb-4 text-white group-hover:text-[#00e5ff] transition-colors">FPT Grade Tracker</h3>
            <p className="text-xl text-zinc-400 leading-relaxed">
              Grade matrix tailored specifically for all FPT majors. Accurately calculates the exact score needed to pass the course.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-[#18181b] p-8 border-4 border-black shadow-[8px_8px_0px_0px_#39ff14] hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_#39ff14] transition-all duration-200 group relative">
            <div className="absolute top-4 right-4 text-zinc-600 font-bold text-2xl group-hover:text-[#39ff14]">03</div>
            <div className="text-6xl mb-6 bg-black w-20 h-20 flex items-center justify-center border-2 border-[#39ff14]">📈</div>
            <h3 className="text-3xl font-bold mb-4 text-white group-hover:text-[#39ff14] transition-colors">Grade Analysis</h3>
            <p className="text-xl text-zinc-400 leading-relaxed">
              SWOT analysis for academic performance. Cool charts help you view your learning process like a pro-player analyzing the meta.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-[#18181b] p-8 border-4 border-black shadow-[8px_8px_0px_0px_#ee9d2b] hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_#ee9d2b] transition-all duration-200 group relative">
            <div className="absolute top-4 right-4 text-zinc-600 font-bold text-2xl group-hover:text-[#ee9d2b]">04</div>
            <div className="text-6xl mb-6 bg-black w-20 h-20 flex items-center justify-center border-2 border-[#ee9d2b]">💳</div>
            <h3 className="text-3xl font-bold mb-4 text-white group-hover:text-[#ee9d2b] transition-colors">Treasury Management</h3>
            <p className="text-xl text-zinc-400 leading-relaxed">
              Track personal income and expenses. Don't let real-world inflation beat you up, master your finances to save mana for weekend parties.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-[#18181b] p-8 border-4 border-black shadow-[8px_8px_0px_0px_#cc00ff] hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_#cc00ff] transition-all duration-200 group relative md:col-span-2 lg:col-span-1">
            <div className="absolute top-4 right-4 text-zinc-600 font-bold text-2xl group-hover:text-[#cc00ff]">05</div>
            <div className="text-6xl mb-6 bg-black w-20 h-20 flex items-center justify-center border-2 border-[#cc00ff]">🛡️</div>
            <h3 className="text-3xl font-bold mb-4 text-white group-hover:text-[#cc00ff] transition-colors">Admin Dashboard & More</h3>
            <p className="text-xl text-zinc-400 leading-relaxed">
              Supreme authority system for operational lords. Manage users, configure curriculums, and set up countless other macro utilities!
            </p>
          </div>

          {/* Missing slot filler */}
          <div className="hidden lg:flex bg-zinc-900 border-4 border-dashed border-zinc-700 items-center justify-center text-zinc-600 font-bold text-3xl flex-col p-8 opacity-50 hover:opacity-100 transition-opacity">
            <span className="text-5xl mb-4">🔮</span>
            <span>COMING SOON...</span>
          </div>

        </div>
      </section>

      {/* CTA Footer */}
      <footer className="bg-zinc-950 py-16 px-6 border-t-4 border-zinc-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-8 text-white drop-shadow-[2px_2px_0px_#ff0055]">
            READY TO RUSH THE SERVER TOP?
          </h2>
          <p className="text-2xl text-zinc-400 mb-8">Create an account today and get x2 experience in the battle against deadlines!</p>
          <button className="px-10 py-5 bg-[#ff0055] text-white text-3xl font-bold uppercase transition-all hover:scale-105 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:scale-95">
            CREATE ACCOUNT
          </button>
          <div className="mt-16 pt-8 border-t-2 border-zinc-800 text-xl text-zinc-600">
            <p>© 2026 FPT UNIMATE. All rights reserved. Do not steal my pixels.</p>
          </div>
        </div>
      </footer>

      {/* Required for custom marquee animation in this page specifically if not in global css */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}} />
    </main>
  );
}
