// client/src/utils/axios-client.utils.ts
import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse
} from 'axios';
import { ApiResponse } from '../types/api.types';

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

const EXCLUDED_REFRESH_URLS = ['/auth/login', '/auth/register', '/auth/refresh'];

// ============================================================================
// STATE MANAGEMENT (SINGLETON PATTERN)
// ============================================================================

let isRefreshing = false;
let failedQueue: FailedQueueItem[] = [];

/**
 * Process the queue of failed requests.
 * * @param error - If present, rejects all queued requests.
 * @param token - (Optional) Unused in Cookie-based auth, kept for pattern consistency.
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
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
  withCredentials: true,
});

// ============================================================================
// INTERCEPTORS
// ============================================================================

axiosClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<unknown>>): AxiosResponse => {
    return response.data as unknown as AxiosResponse;
  },
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const originalRequest = error.config as RetryableAxiosRequestConfig | undefined;

    if (!originalRequest) {
      return Promise.reject(new ApiError('Unknown Request Error', 500));
    }

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

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<unknown>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return axiosClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post(
          '/auth/refresh',
          {},
          {
            baseURL: '/api',
            withCredentials: true
          }
        );

        processQueue(null);

        return axiosClient(originalRequest);
      } catch (refreshError: unknown) {
        processQueue(refreshError, null);

        if (typeof window !== 'undefined') {
          window.location.href = '/login?session_expired=true';
        }

        const msg = refreshError instanceof Error ? refreshError.message : 'Session expired';
        return Promise.reject(new ApiError(msg, 403, 'session_expired'));
      } finally {
        isRefreshing = false;
      }
    }

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