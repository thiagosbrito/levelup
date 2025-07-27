import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

/**
 * Hook to access authentication context
 * Must be used within an AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

/**
 * Hook to check if user is authenticated
 */
export const useIsAuthenticated = () => {
  const { user, session } = useAuth();
  return !!(user && session);
};

/**
 * Hook to check if user has a specific family role
 */
export const useHasRole = (role: 'parent' | 'child' | 'teen') => {
  const { familyRole } = useAuth();
  return familyRole === role;
};

/**
 * Hook to check if user is a parent (can manage family)
 */
export const useIsParent = () => {
  return useHasRole('parent');
};

/**
 * Hook to check if user is a child or teen
 */
export const useIsChild = () => {
  const { familyRole } = useAuth();
  return familyRole === 'child' || familyRole === 'teen';
};

/**
 * Hook to get family information
 */
export const useFamily = () => {
  const { family, familyRole } = useAuth();
  return { family, familyRole };
};
