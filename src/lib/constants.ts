// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  CLERGY: 'clergy',
  PARISH: 'parish',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Dashboard routes
export const DASHBOARD_ROUTES = {
  ADMIN: '/admin',
  CLERGY: '/clergy',
  PARISH: '/parish',
} as const;

