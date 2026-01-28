// client/src/config/env.config.ts

/**
 * @file env.config.ts
 * @description Centralized configuration for Environment Variables.
 * Acts as the Single Source of Truth (SSOT) for process.env with safety fallbacks.
 * * NOTE: Since this is a Next.js client-side config, we must use the 
 * 'NEXT_PUBLIC_' prefix to ensure variables are exposed to the browser.
 */

export const ENV = {
  // Node environment usually comes from the build process itself
  NODE_ENV: process.env.NODE_ENV || process.env.NEXT_PUBLIC_NODE_ENV || "development",

  // -----------------------------------------------------------------
  // 1. API & Network Configuration
  // -----------------------------------------------------------------
  /** * The base URL of the Backend API server. 
   * Maps to NEXT_PUBLIC_API_URL in .env 
   */
  API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",

  /** * The public URL of this Frontend application.
   * Maps to NEXT_PUBLIC_APP_URL in .env
   */
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

  // -----------------------------------------------------------------
  // 2. Application Identity
  // -----------------------------------------------------------------
  /** * The display name of the application used in UI/Metadata.
   * Maps to NEXT_PUBLIC_APP_NAME in .env
   */
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "Management System",

  /** * Unique Client ID to identify this frontend to the backend.
   * Maps to NEXT_PUBLIC_CLIENT_AUDIENCE_ID in .env
   */
  CLIENT_AUDIENCE_ID: process.env.NEXT_PUBLIC_CLIENT_AUDIENCE_ID || "client-app-fe",

  // -----------------------------------------------------------------
  // 3. Third-Party Integrations
  // -----------------------------------------------------------------
  /** * Google OAuth Public Client ID.
   * Maps to NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env
   */
  GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",

  // -----------------------------------------------------------------
  // 4. Feature Flags (Optional)
  // -----------------------------------------------------------------
  /**
   * Toggle for registration feature. 
   * strings "true" from .env need to be converted to boolean.
   */
  ENABLE_REGISTRATION: process.env.NEXT_PUBLIC_ENABLE_REGISTRATION === "true",

} as const;