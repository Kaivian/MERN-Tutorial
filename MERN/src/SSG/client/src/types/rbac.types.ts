// client/src/types/rbac.types.ts
import { ApiResponse } from './auth.types';

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: any;
  ipAddress: string;
  createdAt: string;
}

export interface Role {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  permissions: string[];
  isSystem: boolean;
  status: 'active' | 'inactive';
  createdAt?: string;
}

export interface PaginatedUsersResponse {
  docs: any[]; // User type
  totalDocs: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export type RolesResponse = ApiResponse<{ roles: Role[] }>;
export type RoleResponse = ApiResponse<{ role: Role }>;
export type UsersResponse = ApiResponse<PaginatedUsersResponse>;
export type UserResponse = ApiResponse<{ user: any }>;
