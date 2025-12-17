// client/src/hooks/generals/useApi.ts
import { useState, useCallback } from 'react';
import { addToast } from "@heroui/react";
import { ApiResponse } from '../../types/api';

/**
 * Supported color variants for HeroUI Toasts.
 */
type HeroUIColor = "default" | "primary" | "secondary" | "success" | "warning" | "danger";

/**
 * Supported visual styles for HeroUI Toasts.
 */
type ToastVariant = "solid" | "bordered" | "flat";

/**
 * Configuration options for the API request execution and toast notification.
 */
interface RequestOptions {
  /** Whether to show a toast notification. Default is false for success, true for errors. */
  showToast?: boolean;
  /** Custom title for the toast. Falls back to response status. */
  title?: string;
  /** Custom message for the toast. Falls back to response message. */
  msg?: string;
  /** Override toast color. If omitted, determined by backend code/status. */
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
 * Automatically determines the Toast color based on Backend Response status/code.
 */
const getAutoColor = (res: ApiResponse<unknown>): HeroUIColor => {
  if (res.status === 'success') return 'success';
  if (res.status === 'warning') return 'warning';
  if (res.status === 'error' || res.status === 'fail') return 'danger';
  
  if (res.code >= 200 && res.code < 300) return 'success';
  if (res.code >= 400) return 'danger';
  
  return 'primary';
};

/**
 * A custom hook for handling asynchronous API calls with integrated HeroUI Toast feedback.
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
    // Determine if the last argument is RequestOptions
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
      const res = await apiFunc(...funcArgs);
      
      setResponse(res);
      setData(res.data);

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
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);

      // Errors default to showToast: true unless explicitly set to false
      if (showToast !== false) {
        addToast({
          title: title || "ERROR",
          description: msg || errorMessage,
          color: color || "danger",
          variant: variant,
        });
      }
      
      throw err;
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