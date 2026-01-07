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

interface FailedQueueItem {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

// Define endpoints to exclude from refresh logic
const EXCLUDED_REFRESH_URLS = ['/auth/login', '/auth/register'];

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

let isRefreshing = false;
let failedQueue: FailedQueueItem[] = [];

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
    // Return data directly (stripping axios wrapper)
    return response.data as unknown as AxiosResponse;
  },
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const originalRequest = error.config as RetryableAxiosRequestConfig | undefined;

    // 1. Handle Missing Request Config (Edge Case)
    if (!originalRequest) {
      return Promise.reject(new ApiError('Unknown Request Error', 500));
    }

    // 2. CHECK: Ignore Refresh Logic for Login/Register Endpoints
    // If the error comes from Login, reject immediately so the UI handles the "Wrong Password" error.
    const isExcludedUrl = EXCLUDED_REFRESH_URLS.some((url) => 
      originalRequest.url?.includes(url)
    );

    if (isExcludedUrl) {
      const backendError = error.response?.data;
      return Promise.reject(
        new ApiError(
          backendError?.message || error.message || 'Login Failed',
          backendError?.code || error.response?.status,
          backendError?.status
        )
      );
    }

    // 3. Handle 401 Unauthorized (Token Expiration)
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
          `${axiosClient.defaults.baseURL}/auth/refresh`, 
          {}, 
          { withCredentials: true }
        );
        
        processQueue(null); 
        
        return axiosClient(originalRequest);

      } catch (refreshError: unknown) {
        processQueue(refreshError, null);
        
        // Use a generic message or extract from error
        const msg = refreshError instanceof Error ? refreshError.message : 'Session expired';
        return Promise.reject(new ApiError(msg, 401, 'unauthorized'));
      } finally {
        isRefreshing = false;
      }
    }

    // 4. Handle General Errors
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