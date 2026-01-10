// client/src/utils/axios-client.utils.ts
import axios, { 
  AxiosInstance, 
  AxiosError, 
  InternalAxiosRequestConfig, 
  AxiosResponse 
} from 'axios';
import { ApiResponse } from '../types/api.types';
import { ENV } from '@/config/env.config';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Custom Error class to standardize error handling across the app.
 */
export class ApiError extends Error {
  constructor(
    public override message: string, 
    public code?: number, 
    public status?: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Extended Axios Request Config to track retry attempts.
 */
interface RetryableAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

/**
 * Queue Item interface for pending requests.
 */
interface FailedQueueItem {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

// Endpoints that should NOT trigger a refresh logic (to avoid infinite loops)
const EXCLUDED_REFRESH_URLS = ['/auth/login', '/auth/register', '/auth/refresh'];

// API Base URL
const BASE_URL = ENV.APP_URL;

// ============================================================================
// STATE MANAGEMENT (SINGLETON PATTERN)
// ============================================================================

// Flag to prevent multiple refresh requests simultaneously
let isRefreshing = false;

// Queue to hold requests that failed with 401 while token was refreshing
let failedQueue: FailedQueueItem[] = [];

/**
 * Process the queue of failed requests.
 * @param error - If present, rejects all queued requests.
 * @param token - (Optional) Unused in Cookie-based auth, but kept for pattern consistency.
 */
const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// ============================================================================
// AXIOS INSTANCE CREATION
// ============================================================================

const axiosClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
  withCredentials: true, // IMPORTANT: Allows sending cookies (HttpOnly)
});

// ============================================================================
// INTERCEPTORS
// ============================================================================

/**
 * Response Interceptor
 * Handles Data Unwrapping and Global Error Handling (Token Refresh)
 */
axiosClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<unknown>>): AxiosResponse => {
    // UNWRAP DATA: Return the inner data directly for cleaner usage in components.
    // NOTE: This changes the return type from AxiosResponse to the actual data.
    return response.data as unknown as AxiosResponse;
  },
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const originalRequest = error.config as RetryableAxiosRequestConfig | undefined;

    // 1. Safety Check: If no request config exists, reject immediately
    if (!originalRequest) {
      return Promise.reject(new ApiError('Unknown Request Error', 500));
    }

    // 2. EXCLUSION CHECK: Don't try to refresh if the error comes from Auth endpoints
    const isExcludedUrl = EXCLUDED_REFRESH_URLS.some((url) => 
      originalRequest.url?.includes(url)
    );

    if (isExcludedUrl) {
      const backendError = error.response?.data;
      return Promise.reject(
        new ApiError(
          backendError?.message || error.message || 'Authentication Failed',
          error.response?.status,
          backendError?.status
        )
      );
    }

    // 3. HANDLE 401 UNAUTHORIZED (TOKEN EXPIRATION)
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // CASE A: Refresh is already in progress.
      // Queue this request and wait for the "Leader" to finish refreshing.
      if (isRefreshing) {
        return new Promise<unknown>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            // After refresh succeeds, retry the original request
            return axiosClient(originalRequest);
          })
          .catch((err) => {
            // If refresh failed, propagate the error
            return Promise.reject(err);
          });
      }

      // CASE B: This is the first request to fail (The "Leader").
      // Lock the process and start refreshing.
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call the Refresh Endpoint using a raw axios instance 
        // (to avoid circular interceptor logic)
        await axios.post(
          `${BASE_URL}/auth/refresh`, 
          {}, 
          { withCredentials: true }
        );
        
        // If successful:
        // 1. Flush the queue (retry pending requests)
        processQueue(null); 
        
        // 2. Retry the original failing request
        return axiosClient(originalRequest);

      } catch (refreshError: unknown) {
        // If Refresh Fails (Token expired/revoked/reuse detected):
        
        // 1. Fail all queued requests
        processQueue(refreshError, null);
        
        // 2. Force Logout / Redirect to Login
        if (typeof window !== 'undefined') {
          // Use window.location to force a full reload and clear JS memory
          // Update '/login' to your actual login route
          window.location.href = '/login?session_expired=true';
        }
        
        // 3. Reject the promise
        const msg = refreshError instanceof Error ? refreshError.message : 'Session expired';
        return Promise.reject(new ApiError(msg, 403, 'session_expired'));
      } finally {
        // Always unlock the mutex
        isRefreshing = false;
      }
    }

    // 4. HANDLE GENERAL ERRORS (400, 403, 404, 500, etc.)
    const backendError = error.response?.data;
    const errorMessage = backendError?.message || error.message || 'Something went wrong';
    
    return Promise.reject(
      new ApiError(
        errorMessage, 
        error.response?.status, 
        backendError?.status,
        error
      )
    );
  }
);

export default axiosClient;