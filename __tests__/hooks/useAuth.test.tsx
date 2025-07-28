import { renderHook } from '@testing-library/react-native';
import React from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { useAuth, useFamily, useHasRole, useIsAuthenticated, useIsChild, useIsParent } from '../../hooks/useAuth';
import { createMockFamily, createMockUser } from '../test-utils';

// Mock AuthContext
const createMockAuthContext = (overrides = {}) => ({
  user: null,
  session: null,
  family: null,
  familyRole: null,
  isLoading: false,
  signIn: jest.fn(),
  signOut: jest.fn(),
  resetPassword: jest.fn(),
  registerParent: jest.fn(),
  createFamily: jest.fn(),
  ...overrides,
});

describe('Authentication Hooks', () => {
  describe('useAuth', () => {
    it('should throw error when used outside AuthProvider', () => {
      // Spy on console.error to suppress error output during test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');
      
      consoleSpy.mockRestore();
    });

    it('should return auth context when used within provider', () => {
      const mockContext = createMockAuthContext({
        user: createMockUser(),
        session: { access_token: 'token' },
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthContext.Provider value={mockContext}>
          {children}
        </AuthContext.Provider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.user).toEqual(mockContext.user);
      expect(result.current.session).toEqual(mockContext.session);
      expect(result.current.signIn).toBe(mockContext.signIn);
    });
  });

  describe('useIsAuthenticated', () => {
    it('should return true when user and session exist', () => {
      const mockContext = createMockAuthContext({
        user: createMockUser(),
        session: { access_token: 'token' },
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthContext.Provider value={mockContext}>
          {children}
        </AuthContext.Provider>
      );

      const { result } = renderHook(() => useIsAuthenticated(), { wrapper });

      expect(result.current).toBe(true);
    });

    it('should return false when user is null', () => {
      const mockContext = createMockAuthContext({
        user: null,
        session: { access_token: 'token' },
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthContext.Provider value={mockContext}>
          {children}
        </AuthContext.Provider>
      );

      const { result } = renderHook(() => useIsAuthenticated(), { wrapper });

      expect(result.current).toBe(false);
    });

    it('should return false when session is null', () => {
      const mockContext = createMockAuthContext({
        user: createMockUser(),
        session: null,
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthContext.Provider value={mockContext}>
          {children}
        </AuthContext.Provider>
      );

      const { result } = renderHook(() => useIsAuthenticated(), { wrapper });

      expect(result.current).toBe(false);
    });
  });

  describe('useHasRole', () => {
    it('should return true when user has the specified role', () => {
      const mockContext = createMockAuthContext({
        familyRole: 'parent',
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthContext.Provider value={mockContext}>
          {children}
        </AuthContext.Provider>
      );

      const { result } = renderHook(() => useHasRole('parent'), { wrapper });

      expect(result.current).toBe(true);
    });

    it('should return false when user has a different role', () => {
      const mockContext = createMockAuthContext({
        familyRole: 'child',
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthContext.Provider value={mockContext}>
          {children}
        </AuthContext.Provider>
      );

      const { result } = renderHook(() => useHasRole('parent'), { wrapper });

      expect(result.current).toBe(false);
    });

    it('should return false when user has no role', () => {
      const mockContext = createMockAuthContext({
        familyRole: null,
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthContext.Provider value={mockContext}>
          {children}
        </AuthContext.Provider>
      );

      const { result } = renderHook(() => useHasRole('parent'), { wrapper });

      expect(result.current).toBe(false);
    });
  });

  describe('useIsParent', () => {
    it('should return true when user is a parent', () => {
      const mockContext = createMockAuthContext({
        familyRole: 'parent',
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthContext.Provider value={mockContext}>
          {children}
        </AuthContext.Provider>
      );

      const { result } = renderHook(() => useIsParent(), { wrapper });

      expect(result.current).toBe(true);
    });

    it('should return false when user is not a parent', () => {
      const mockContext = createMockAuthContext({
        familyRole: 'child',
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthContext.Provider value={mockContext}>
          {children}
        </AuthContext.Provider>
      );

      const { result } = renderHook(() => useIsParent(), { wrapper });

      expect(result.current).toBe(false);
    });
  });

  describe('useIsChild', () => {
    it('should return true when user is a child', () => {
      const mockContext = createMockAuthContext({
        familyRole: 'child',
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthContext.Provider value={mockContext}>
          {children}
        </AuthContext.Provider>
      );

      const { result } = renderHook(() => useIsChild(), { wrapper });

      expect(result.current).toBe(true);
    });

    it('should return true when user is a teen', () => {
      const mockContext = createMockAuthContext({
        familyRole: 'teen',
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthContext.Provider value={mockContext}>
          {children}
        </AuthContext.Provider>
      );

      const { result } = renderHook(() => useIsChild(), { wrapper });

      expect(result.current).toBe(true);
    });

    it('should return false when user is a parent', () => {
      const mockContext = createMockAuthContext({
        familyRole: 'parent',
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthContext.Provider value={mockContext}>
          {children}
        </AuthContext.Provider>
      );

      const { result } = renderHook(() => useIsChild(), { wrapper });

      expect(result.current).toBe(false);
    });
  });

  describe('useFamily', () => {
    it('should return family and role information', () => {
      const mockFamily = createMockFamily();
      const mockContext = createMockAuthContext({
        family: mockFamily,
        familyRole: 'parent',
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthContext.Provider value={mockContext}>
          {children}
        </AuthContext.Provider>
      );

      const { result } = renderHook(() => useFamily(), { wrapper });

      expect(result.current.family).toEqual(mockFamily);
      expect(result.current.familyRole).toBe('parent');
    });

    it('should return null values when no family', () => {
      const mockContext = createMockAuthContext({
        family: null,
        familyRole: null,
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthContext.Provider value={mockContext}>
          {children}
        </AuthContext.Provider>
      );

      const { result } = renderHook(() => useFamily(), { wrapper });

      expect(result.current.family).toBeNull();
      expect(result.current.familyRole).toBeNull();
    });
  });
});
