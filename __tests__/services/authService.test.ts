/**
 * AuthService Unit Tests
 * 
 * Tests the AuthService class methods and their behavior.
 * Focuses on service logic, error handling, and API interactions.
 */

import { AuthService } from '../../services/auth/authService';
import { supabase } from '../../services/supabase';

// Unmock the authService for this test since we're testing the real implementation
jest.unmock('../../services/auth/authService');

// Mock Supabase
jest.mock('../../services/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      getUser: jest.fn(),
      onAuthStateChange: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
    })),
  },
}));

describe('AuthService', () => {
  let authService: AuthService;
  const mockSupabase = supabase as jest.Mocked<typeof supabase>;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('registerParent', () => {
    it('successfully registers a parent with correct data', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const registrationData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        displayName: 'Test User',
        termsAccepted: true,
      };

      const result = await authService.registerParent(registrationData);

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'SecurePass123!',
        options: {
          data: {
            display_name: 'Test User',
            age_group: 'adult',
          },
          emailRedirectTo: 'exp://localhost:8081/--/(auth)/auth-callback',
        },
      });

      expect(result.success).toBe(true);
      expect(result.data).toBe(mockUser);
      expect(result.error).toBeNull();
    });

    it('handles registration errors', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: null,
        error: { message: 'Email already registered' },
      });

      const registrationData = {
        email: 'existing@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        displayName: 'Test User',
        termsAccepted: true,
      };

      const result = await authService.registerParent(registrationData);

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toBe('Email already registered');
    });

    it('handles missing user in response', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const registrationData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        displayName: 'Test User',
        termsAccepted: true,
      };

      const result = await authService.registerParent(registrationData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to create user account');
    });
  });

  describe('signIn', () => {
    it('successfully signs in user and loads profile', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockSession = { access_token: 'token-123' };
      const mockProfile = { id: 'user-123', display_name: 'Test User' };
      const mockFamilyMember = {
        role: 'parent',
        family_id: 'family-123',
        families: { id: 'family-123', name: 'Test Family' },
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      // Mock profile query
      const mockSelect = jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: mockProfile,
            error: null,
          }),
        })),
      }));

      // Mock family query  
      const mockFamilySelect = jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: mockFamilyMember,
              error: null,
            }),
          })),
        })),
      }));

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'user_profiles') {
          return { select: mockSelect };
        }
        if (table === 'family_members') {
          return { select: mockFamilySelect };
        }
        return { select: jest.fn() };
      });

      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await authService.signIn(loginData);

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith(loginData);
      expect(result.success).toBe(true);
      expect(result.data?.user).toBe(mockProfile);
      expect(result.data?.familyRole).toBe('parent');
    });

    it('handles sign in errors', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid credentials' },
      });

      const loginData = {
        email: 'wrong@example.com',
        password: 'wrongpassword',
      };

      const result = await authService.signIn(loginData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
    });
  });

  describe('signOut', () => {
    it('successfully signs out user', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: null });

      const result = await authService.signOut();

      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
    });

    it('handles sign out errors', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({
        error: { message: 'Sign out failed' },
      });

      const result = await authService.signOut();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Sign out failed');
    });
  });

  describe('createFamily', () => {
    it('successfully creates family and adds creator as parent', async () => {
      const mockUser = { id: 'user-123' };
      const mockFamily = { id: 'family-123', name: 'Test Family' };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Mock family creation
      const mockFamilyInsert = jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: mockFamily,
            error: null,
          }),
        })),
      }));

      // Mock member insertion
      const mockMemberInsert = jest.fn().mockResolvedValue({
        error: null,
      });

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'families') {
          return { insert: mockFamilyInsert };
        }
        if (table === 'family_members') {
          return { insert: mockMemberInsert };
        }
        return {};
      });

      const familyData = {
        familyName: 'Test Family',
        familyDescription: 'A test family',
      };

      const result = await authService.createFamily(familyData);

      expect(result.success).toBe(true);
      expect(result.data).toBe(mockFamily);
      expect(mockMemberInsert).toHaveBeenCalledWith({
        family_id: 'family-123',
        user_id: 'user-123',
        role: 'parent',
      });
    });

    it('handles unauthenticated user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const familyData = {
        familyName: 'Test Family',
      };

      const result = await authService.createFamily(familyData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not authenticated');
    });
  });

  describe('getCurrentSession', () => {
    it('returns null session when no user is logged in', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await authService.getCurrentSession();

      expect(result.success).toBe(true);
      expect(result.data?.user).toBeNull();
      expect(result.data?.session).toBeNull();
    });

    it('loads complete session data for authenticated user', async () => {
      const mockSession = { user: { id: 'user-123' } };
      const mockProfile = { id: 'user-123', display_name: 'Test User' };
      const mockFamilyMember = {
        role: 'parent',
        family_id: 'family-123',
        families: { id: 'family-123', name: 'Test Family' },
      };

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      // Mock profile query
      const mockProfileSelect = jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: mockProfile,
            error: null,
          }),
        })),
      }));

      // Mock family query  
      const mockFamilySelect = jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: mockFamilyMember,
              error: null,
            }),
          })),
        })),
      }));

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'user_profiles') {
          return { select: mockProfileSelect };
        }
        if (table === 'family_members') {
          return { select: mockFamilySelect };
        }
        return { select: jest.fn() };
      });

      const result = await authService.getCurrentSession();

      expect(result.success).toBe(true);
      expect(result.data?.user).toBe(mockProfile);
      expect(result.data?.familyRole).toBe('parent');
    });
  });
});