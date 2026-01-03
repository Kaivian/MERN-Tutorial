// client/src/config/routes.config.ts
import { RouteConfig } from '@/types/auth.types';

export const ROUTES_CONFIG: RouteConfig[] = [
  // 1. PUBLIC
  { path: '/', type: 'PUBLIC' },
  { path: '/about', type: 'PUBLIC' },
  
  // 2. GUEST ONLY
  { path: '/login', type: 'GUEST_ONLY' },

  // 3. PRIVATE
  { path: '/login/change-default-password', type: 'PRIVATE' }, // Ưu tiên cao hơn vì dài hơn
  { path: '/dashboard', type: 'PRIVATE' }, // Sẽ khớp với cả /dashboard/user, /dashboard/settings...
  { path: '/profile', type: 'PRIVATE' },
];