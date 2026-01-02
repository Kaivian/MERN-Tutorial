// client/src/config/routes.config.ts
import { RouteConfig } from '@/types/auth.types';

export const ROUTES_CONFIG: RouteConfig[] = [
  // ==============================
  // 1. PUBLIC ROUTES (Open to all)
  // ==============================
  { 
    path: '/', 
    type: 'PUBLIC' 
  },
  { 
    path: '/about', 
    type: 'PUBLIC' 
  },
  { 
    path: '/403', 
    type: 'PUBLIC' 
  },
  { 
    path: '/404', 
    type: 'PUBLIC' 
  },

  // ==============================
  // 2. GUEST ONLY (Redirects if logged in)
  // ==============================
  { 
    path: '/login', 
    type: 'GUEST_ONLY' 
  },
  { 
    path: '/register', 
    type: 'GUEST_ONLY' 
  },
  { 
    path: '/forgot-password', 
    type: 'GUEST_ONLY' 
  },

  // ==============================
  // 3. PRIVATE ROUTES (Requires Token)
  // ==============================
  
  // --- SPECIAL FLOW: Force Change Password ---
  // Đây là trang Private ĐẶC BIỆT. 
  // AuthGuard sẽ kiểm tra: Nếu mustChangePassword === true -> CHỈ được vào trang này.
  { 
    path: '/login/change-default-password', 
    type: 'PRIVATE' 
  },

  // --- STANDARD PRIVATE ROUTES ---
  // AuthGuard sẽ kiểm tra: Nếu mustChangePassword === true -> KHÔNG được vào các trang dưới đây.
  { 
    path: '/dashboard', 
    type: 'PRIVATE' 
  },
  { 
    path: '/profile', 
    type: 'PRIVATE' 
  },
  { 
    path: '/settings', 
    type: 'PRIVATE' 
  },

  // --- EXAMPLE: Admin Routes (With Permissions) ---
  // { 
  //   path: '/admin/users', 
  //   type: 'PRIVATE', 
  //   permission: 'user:read' 
  // }
];