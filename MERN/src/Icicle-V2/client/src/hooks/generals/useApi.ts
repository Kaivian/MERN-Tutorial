import { useState, useCallback } from 'react';
import { addToast } from "@heroui/react";
import { ApiResponse } from '@/types/api';
import { getFriendlyError } from '@/config/error-mapping.config';

/**
 * Supported color variants for HeroUI Toasts.
 */
type HeroUIColor = "default" | "primary" | "secondary" | "success" | "warning" | "danger";

/**
 * Supported visual styles for HeroUI Toasts.
 */
type ToastVariant = "solid" | "bordered" | "flat";

/**
 * Configuration options for the API request execution.
 */
interface RequestOptions {
  /** * Whether to show a toast notification. 
   * - Defaults to `false` for success (unless configured manually).
   * - Defaults to `true` for errors.
   */
  showToast?: boolean;
  /** Custom title override (Mainly for SUCCESS state). */
  title?: string;
  /** Custom message override (Mainly for SUCCESS state). */
  msg?: string;
  /** Override toast color (Mainly for SUCCESS state). Auto-detected if omitted. */
  color?: HeroUIColor;
  /** Visual style of the toast. @default "flat" */
  variant?: ToastVariant;
}

/**
 * Return type definition for the useApi hook.
 */
interface UseApiResponse<TData, TArgs extends unknown[]> {
  response: ApiResponse<TData> | null;
  data: TData | null;
  loading: boolean;
  error: string | null;
  execute: (...args: [...TArgs, RequestOptions?]) => Promise<ApiResponse<TData>>;
  reset: () => void;
}

/**
 * Helper: Automatically determines the Toast color based on response status.
 */
const getAutoColor = (res: ApiResponse<unknown>): HeroUIColor => {
  if (res.status === 'success') return 'success';
  if (res.status === 'warning') return 'warning';
  if (res.status === 'error' || res.status === 'fail') return 'danger';
  if (res.code >= 200 && res.code < 300) return 'success';
  return 'danger';
};

/**
 * A custom hook for handling asynchronous API calls with:
 * 1. Automatic Loading state.
 * 2. Automatic Error Mapping (English Backend -> Vietnamese UI).
 * 3. Integrated HeroUI Toast feedback.
 * * @template TData - The expected type of the data payload.
 * @template TArgs - The type of arguments accepted by the API function.
 * @param apiFunc - The service function performing the API request.
 */
export const useApi = <TData = unknown, TArgs extends unknown[] = unknown[]>(
  apiFunc: (...args: TArgs) => Promise<ApiResponse<TData>>
): UseApiResponse<TData, TArgs> => {
  const [response, setResponse] = useState<ApiResponse<TData> | null>(null);
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (...allArgs: [...TArgs, RequestOptions?]): Promise<ApiResponse<TData>> => {
    // 1. Extract optional configuration from the last argument
    const hasOptions = allArgs.length > 0 && 
      typeof allArgs[allArgs.length - 1] === 'object' && 
      allArgs[allArgs.length - 1] !== null;

    const options = (hasOptions ? allArgs[allArgs.length - 1] : {}) as RequestOptions;
    const funcArgs = (hasOptions ? allArgs.slice(0, -1) : allArgs) as TArgs;

    const { 
      showToast, 
      title, 
      msg, 
      color, 
      variant = "flat" 
    } = options;

    setLoading(true);
    setError(null);

    try {
      // 2. Execute the API call (HAPPY PATH)
      const res = await apiFunc(...funcArgs);
      
      setResponse(res);
      setData(res.data);

      // 3. Handle Success Toast
      // Here we USE the custom title/msg/color provided in options
      if (showToast === true) {
        addToast({
          title: title || (res.status ? res.status.toUpperCase() : "SUCCESS"),
          description: msg || res.message,
          color: color || getAutoColor(res),
          variant: variant,
        });
      }

      return res;

    } catch (err: unknown) {
      // 4. Handle Errors (ERROR PATH)
      const rawErrorMessage = err instanceof Error ? err.message : String(err);
      
      // Auto-Mapping: Convert Backend Error -> Vietnamese UI Error
      const { title: friendlyTitle, msg: friendlyMsg } = getFriendlyError(rawErrorMessage);
      
      // Update local error state
      setError(friendlyMsg);

      // 5. Handle Error Toast
      // logic: Errors show toast by default unless explicitly disabled (showToast: false)
      if (showToast !== false) {
        addToast({
          // --- BUG FIX ---
          // Do NOT use 'title' or 'color' from options here. 
          // Those are meant for the Success state (e.g., "Login Successful").
          // For errors, we MUST use the mapped error title and Danger color.
          
          title: friendlyTitle || "Lỗi", 
          description: friendlyMsg,     
          color: "danger", // Force Red/Danger color for errors
          variant: variant,
        });
      }
      
      throw err; // Re-throw to allow component to handle specific logic
    } finally {
      setLoading(false);
    }
  }, [apiFunc]);

  const reset = useCallback(() => {
    setResponse(null);
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { response, data, loading, error, execute, reset };
};