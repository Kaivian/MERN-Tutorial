// client/src/utils/axios-client.ts
import axios, { 
  AxiosInstance, 
  AxiosError, 
  InternalAxiosRequestConfig, 
  AxiosResponse 
} from 'axios';
import { ApiResponse } from '../types/api';

/**
 * Standardized API Error class for handling backend-specific errors.
 */
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

/**
 * Internal interface to track retry attempts for token refreshing.
 */
interface RetryableAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

/**
 * Configured Axios instance for API communication.
 * Handles HttpOnly cookies automatically.
 */
const axiosClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
  withCredentials: true, 
});

/**
 * Global Response Interceptor
 * Automates token refreshing and unwraps response data.
 */
axiosClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<unknown>>): AxiosResponse => {
    /**
     * We return 'response.data' to simplify data access in the UI.
     * We cast to 'unknown' then 'AxiosResponse' to satisfy the internal 
     * Axios interceptor contract without using 'any'.
     */
    return response.data as unknown as AxiosResponse;
  },
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const originalRequest = error.config as RetryableAxiosRequestConfig | undefined;

    // 1. Handle 401 Unauthorized via Token Refresh logic
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await axios.post(
          `${axiosClient.defaults.baseURL}/auth/refresh`, 
          {}, 
          { withCredentials: true }
        );
        return axiosClient(originalRequest);
      } catch (refreshError: unknown) {
        const msg = refreshError instanceof Error ? refreshError.message : 'Session expired';
        return Promise.reject(new ApiError(msg, 401));
      }
    }

    // 2. Standardize Backend Errors from ApiResponse structure
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