'use client';

import { fontSans } from "@/config/font.config";
import clsx from "clsx";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className={clsx("min-h-screen antialiased", fontSans.className)}>
        <div className="flex flex-col items-center justify-center p-10 min-h-screen text-center">
          <h1 className="text-2xl font-bold mb-4">Đã xảy ra lỗi hệ thống!</h1>
          <p className="text-default-500 mb-6">
            Vui lòng thử làm mới trang hoặc quay lại sau.
          </p>
          <button
            className="px-4 py-2 bg-primary text-white rounded-md"
            onClick={() => reset()}
          >
            Thử lại
          </button>
        </div>
      </body>
    </html>
  );
}