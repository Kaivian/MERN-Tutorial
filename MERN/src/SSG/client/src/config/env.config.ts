/**
 * @file env.config.ts
 * @description Centralized configuration for Environment Variables.
 * * QUAN TRỌNG: 
 * 1. Trong Next.js Middleware/Edge Runtime, bạn nên truy xuất trực tiếp 
 * process.env.VAR_NAME thay vì gán cả object process.env.
 * 2. Đảm bảo các biến đã được thêm vào Vercel Project Settings.
 */

export const ENV = {
  // Ưu tiên biến từ .env, sau đó đến biến hệ thống, cuối cùng là mặc định
  NODE_ENV:
    process.env.NEXT_PUBLIC_NODE_ENV ||
    process.env.NODE_ENV ||
    "development",

  // -----------------------------------------------------------------
  // 1. API & Network Configuration
  // -----------------------------------------------------------------
  API_URL:
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000/api",

  APP_URL:
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000",

  // -----------------------------------------------------------------
  // 2. Application Identity
  // -----------------------------------------------------------------
  APP_NAME:
    process.env.NEXT_PUBLIC_APP_NAME ||
    "FPT Unimate App",

  CLIENT_AUDIENCE_ID:
    process.env.NEXT_PUBLIC_CLIENT_AUDIENCE_ID ||
    "fptunimate-client-app-fe-2026",

  // -----------------------------------------------------------------
  // 3. Third-Party Integrations
  // -----------------------------------------------------------------
  GOOGLE_CLIENT_ID:
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    "",

  // -----------------------------------------------------------------
  // 4. Feature Flags
  // -----------------------------------------------------------------
  // Ép kiểu về boolean một cách an toàn
  ENABLE_REGISTRATION:
    String(process.env.NEXT_PUBLIC_ENABLE_REGISTRATION) === "true",

} as const;

// Helper để kiểm tra nhanh môi trường (Dùng trong code cho gọn)
export const isProd = ENV.NODE_ENV === "production";
export const isDev = ENV.NODE_ENV === "development";