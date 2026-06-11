export const ROLE_ADMIN = 'ADMIN';
export const ROLE_USER = 'USER';

export const normalizeRole = (role) => {
  if (!role) return null;

  if (Array.isArray(role)) {
    const normalizedRoles = role
      .filter((r) => typeof r === 'string')
      .map((r) => r.trim().toUpperCase().replace(/^ROLE_/, ''))
      .filter(Boolean);

    if (normalizedRoles.includes(ROLE_ADMIN)) {
      return ROLE_ADMIN;
    }
    return normalizedRoles[0] || null;
  }

  return role.toString().trim().toUpperCase().replace(/^ROLE_/, '');
};

export const API_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
};

export const PRODUCT_STATUS = {
  ACTIVE: true,
  INACTIVE: false,
};

export const PAGE_SIZES = [10, 20, 50, 100];
export const DEFAULT_PAGE_SIZE = 10;