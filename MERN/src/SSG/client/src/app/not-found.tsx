"use client";

import Link from "next/link";

export default function NotFound() {
  // KHÔNG sử dụng useLogout, useRouter, hoặc các Provider Context ở đây để tránh lỗi Build.
  // Chỉ sử dụng HTML thuần và Tailwind CSS thuần.

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#18181b] p-4 text-center">
      <div className="max-w-md w-full border-4 border-black bg-white p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="mx-auto mb-6 inline-flex h-20 w-20 items-center justify-center bg-retro-orange border-4 border-black text-4xl font-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          404
        </div>

        <h1 className="text-3xl font-black text-black uppercase tracking-tighter mb-2">
          Không tìm thấy trang
        </h1>

        <p className="text-gray-600 font-medium mb-8">
          Đường dẫn không tồn tại hoặc nội dung đã bị di chuyển trong hệ thống.
        </p>

        <div className="flex flex-col gap-4">
          <Link
            href="/"
            className="w-full py-3 bg-[#00e5ff] text-black font-bold uppercase border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all text-center"
          >
            Về trang chủ
          </Link>

          <Link
            href="/login"
            className="w-full py-3 bg-zinc-200 text-black font-bold uppercase border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all text-center"
          >
            Đăng nhập lại
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t-4 border-dotted border-black text-xs font-mono font-bold uppercase">
          Error Code: 404_NOT_FOUND
        </div>
      </div>
    </div>
  );
}