// client/src/services/user.service.ts
import axiosClient from '@/utils/axios-client.utils';
import { UsersResponse, UserResponse } from '@/types/rbac.types';
import { User } from '@/types/auth.types';

export const UserService = {
  /**
   * Fetch paginated users
   */
  async getUsers(params: { page?: number; limit?: number; search?: string; role?: string; status?: string }): Promise<UsersResponse> {
    return axiosClient.get('/users', { params }) as unknown as Promise<UsersResponse>;
  },

  /**
   * Fetch a single user by id
   */
  async getUser(id: string): Promise<UserResponse> {
    return axiosClient.get(`/users/${id}`) as unknown as Promise<UserResponse>;
  },

  /**
   * Create a user
   */
  async createUser(payload: Partial<User> & { password?: string, confirmPassword?: string }): Promise<UserResponse> {
    return axiosClient.post('/users', payload) as unknown as Promise<UserResponse>;
  },

  /**
   * Update an existing user
   */
  async updateUser(id: string, payload: Partial<User>): Promise<UserResponse> {
    return axiosClient.put(`/users/${id}`, payload) as unknown as Promise<UserResponse>;
  }
};
