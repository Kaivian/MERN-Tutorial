// client/src/types/api.ts
/**
 * Standard API Response structure from the Backend.
 * @template T - The type of the data payload (default: unknown).
 */
export interface ApiResponse<T = unknown> {
  status: 'success' | 'error' | 'warning' | 'fail';
  code: number;
  message: string;
  data: T;
  timestamp?: string;
}