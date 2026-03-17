import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    return [
      {
        // Bắt tất cả các request bắt đầu bằng /api/
        source: '/api/:path*',

        // Chuyển tiếp (proxy) thẳng sang backend Render
        // Đảm bảo bạn có biến NEXT_PUBLIC_API_URL trong file .env
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
