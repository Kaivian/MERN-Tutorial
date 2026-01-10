// client/src/config/env.config.ts
/**
 * @file env.config.ts
 * @description Centralized configuration for Environment Variables.
 * Acts as the Single Source of Truth (SSOT) for process.env with safety fallbacks.
 */

export const ENV = {
  NODE_ENV: process.env.NEXT_PUBLIC_NODE_ENV || "development",

  // -----------------------------------------------------------------
  // 1. API & Network Configuration
  // -----------------------------------------------------------------
  /** The base URL of the Backend API server. */
  API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",

  /** The public URL of this Frontend application. */
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

  // -----------------------------------------------------------------
  // 2. Application Identity
  // -----------------------------------------------------------------
  /** The display name of the application used in UI/Metadata. */
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "Management System",

  /** Unique Client ID to identify this frontend to the backend. */
  CLIENT_AUDIENCE_ID: process.env.NEXT_PUBLIC_CLIENT_AUDIENCE_ID || "client-app-fe",

  // -----------------------------------------------------------------
  // 3. Third-Party Integrations
  // -----------------------------------------------------------------
  /** Google OAuth Public Client ID. */
  GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
} as const;