// client/src/services/task.service.ts
import axiosClient from "@/utils/axios-client.utils";
import { Task } from "@/types/deadline.types";
import { ApiResponse } from "@/types/api.types";

const ENDPOINTS = {
    TASKS: '/tasks'
} as const;

export const taskService = {
    /**
     * Gets all tasks for the logged-in user
     */
    getTasks: async (): Promise<ApiResponse<Task[]>> => {
        return axiosClient.get(ENDPOINTS.TASKS) as Promise<ApiResponse<Task[]>>;
    },

    /**
     * Creates a new task (personal or academic)
     */
    createTask: async (task: Partial<Task>): Promise<ApiResponse<Task>> => {
        return axiosClient.post(ENDPOINTS.TASKS, task) as Promise<ApiResponse<Task>>;
    },

    /**
     * Updates an existing task
     */
    updateTask: async (taskId: string, updates: Partial<Task>): Promise<ApiResponse<Task>> => {
        return axiosClient.patch(`${ENDPOINTS.TASKS}/${taskId}`, updates) as Promise<ApiResponse<Task>>;
    },

    /**
     * Deletes a task
     */
    deleteTask: async (taskId: string): Promise<ApiResponse<null>> => {
        return axiosClient.delete(`${ENDPOINTS.TASKS}/${taskId}`) as Promise<ApiResponse<null>>;
    }
};
