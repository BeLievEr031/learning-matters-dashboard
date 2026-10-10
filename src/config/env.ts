export const ENV = {
  API_BASE_URL: (import.meta.env.VITE_API_BASE_URL as string | undefined) || 'http://localhost:3000/api/v1',
  IS_PRODUCTION: import.meta.env.PROD,
};

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'lm_admin_access_token',
  REFRESH_TOKEN: 'lm_admin_refresh_token',
  USER: 'lm_admin_user',
  ACTIVE_SCHOOL_ID: 'lm_admin_active_school_id',
  VIEW_AS_ROLE: 'lm_admin_view_as_role',
  THEME: 'lm_admin_theme',
} as const;
