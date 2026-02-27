// client/src/services/role.service.ts
import axiosClient from '@/utils/axios-client.utils';
import { RolesResponse, RoleResponse, Role } from '@/types/rbac.types';
import { ApiResponse } from '@/types/auth.types';

export const RoleService = {
  /**
   * Fetch all roles
   */
  async getRoles(includeInactive: boolean = false): Promise<RolesResponse> {
    return axiosClient.get(`/roles`, {
      params: { includeInactive }
    }) as unknown as Promise<RolesResponse>;
  },

  /**
   * Fetch single role by id
   */
  async getRole(id: string): Promise<RoleResponse> {
    return axiosClient.get(`/roles/${id}`) as unknown as Promise<RoleResponse>;
  },

  /**
   * Create a new role
   */
  async createRole(payload: Partial<Role>): Promise<RoleResponse> {
    return axiosClient.post('/roles', payload) as unknown as Promise<RoleResponse>;
  },

  /**
   * Update an existing role
   */
  async updateRole(id: string, payload: Partial<Role>): Promise<RoleResponse> {
    return axiosClient.put(`/roles/${id}`, payload) as unknown as Promise<RoleResponse>;
  },

  /**
   * Delete a role
   */
  async deleteRole(id: string): Promise<ApiResponse<null>> {
    return axiosClient.delete(`/roles/${id}`) as unknown as Promise<ApiResponse<null>>;
  }
};
