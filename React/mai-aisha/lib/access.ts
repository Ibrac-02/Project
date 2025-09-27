import { useEffect, useMemo } from 'react';
import { router } from 'expo-router';
import { useAuth } from './auth';

/**
 * useRequireRole ensures the current user has one of the allowed roles.
 * - While auth is loading, it returns { loading: true, allowed: false }
 * - If not allowed, it redirects to /(auth)/login and returns { allowed: false }
 * - If allowed, returns { allowed: true }
 */
export function useRequireRole(allowedRoles: string | string[]) {
  const roles = useMemo(() => (Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]), [allowedRoles]);
  const { user, role, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/(auth)/login');
      return;
    }
    if (role && roles.length > 0 && !roles.includes(role)) {
      // Optionally route based on role
      router.replace('/');
    }
  }, [loading, user, role, roles]);

  const allowed = !!user && !!role && roles.includes(role);
  return { allowed, loading } as const;
}
