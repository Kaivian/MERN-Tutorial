// client/src/services/general.service.ts
import axiosClient from "@/utils/axios-client.utils";
import { ApiResponse } from "@/types/api.types";

/**
 * Interface for the Health Check response data.
 */
interface HealthStatus {
  status: string;
  version: string;
}

export const generalService = {
  /**
   * Performs a health check on the backend API.
   * @returns {Promise<ApiResponse<HealthStatus>>}
   */
  checkStatus: (): Promise<ApiResponse<HealthStatus>> => {
    return axiosClient.get("/status");
  },
};
