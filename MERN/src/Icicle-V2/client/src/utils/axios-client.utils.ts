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

export class ApiError extends Error {
  constructor(
    public override message: string, 
    public code?: number, 
    public status?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RetryableAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

/**
 * [FIXED] Updated types to satisfy TypeScript strict mode.
 * using 'unknown' instead of 'any' is safer.
 */
interface FailedQueueItem {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

let isRefreshing = false;
let failedQueue: FailedQueueItem[] = [];

/**
 * [FIXED] Replaced 'error: any' with 'error: unknown' to satisfy ESLint.
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
// AXIOS INSTANCE
// ============================================================================

const axiosClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
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

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      
      if (isRefreshing) {
        // [FIXED] Changed new Promise<void> to new Promise<unknown>
        // This matches the FailedQueueItem interface signature.
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
          `${axiosClient.defaults.baseURL}/auth/refresh`, 
          {}, 
          { withCredentials: true }
        );
        
        processQueue(null); 
        
        return axiosClient(originalRequest);

      } catch (refreshError: unknown) {
        processQueue(refreshError, null);
        
        const msg = refreshError instanceof Error ? refreshError.message : 'Session expired';
        return Promise.reject(new ApiError(msg, 401));
      } finally {
        isRefreshing = false;
      }
    }

    const backendError = error.response?.data;
    const errorMessage = backendError?.message || error.message || 'Server Error';
    
    return Promise.reject(
      new ApiError(
        errorMessage, 
        backendError?.code || error.response?.status, 
        backendError?.status
      )
    );
  }
);

export default axiosClient;