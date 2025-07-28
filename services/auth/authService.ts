import type { Database } from '../../types/supabase';
import { NewPasswordData, ParentLoginData, ParentRegistrationData, PasswordResetData } from '../../utils/validation/schemas';
import { supabase } from '../supabase';

// Type helpers for Supabase tables
type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert'];
type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update'];

type Family = Database['public']['Tables']['families']['Row'];
type FamilyInsert = Database['public']['Tables']['families']['Insert'];

type FamilyMember = Database['public']['Tables']['family_members']['Row'];
type FamilyMemberInsert = Database['public']['Tables']['family_members']['Insert'];

type FamilyInvitation = Database['public']['Tables']['family_invitations']['Row'];
type FamilyInvitationInsert = Database['public']['Tables']['family_invitations']['Insert'];

// Authentication response types
export interface AuthResponse<T = any> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface SessionData {
  user: UserProfile | null;
  session: any | null;
  family: Family | null;
  familyRole: 'parent' | 'child' | 'teen' | null;
}

// Family creation data
export interface FamilyCreationData {
  familyName: string;
  familyDescription?: string;
  currency?: string;
  timezone?: string;
}

export class AuthService {
  /**
   * Register a new parent user with email and password
   */
  async registerParent(data: ParentRegistrationData): Promise<AuthResponse<UserProfile>> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            display_name: data.displayName,
            age_group: 'adult',
          },
          emailRedirectTo: 'exp://localhost:8081/--/(auth)/auth-callback',
        },
      });

      if (authError) {
        return {
          data: null,
          error: authError.message,
          success: false,
        };
      }

      if (!authData.user) {
        return {
          data: null,
          error: 'Failed to create user account',
          success: false,
        };
      }

      return {
        data: authData.user,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false,
      };
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(data: ParentLoginData): Promise<AuthResponse<SessionData>> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        return {
          data: null,
          error: authError.message,
          success: false,
        };
      }

      if (!authData.user) {
        return {
          data: null,
          error: 'Invalid credentials',
          success: false,
        };
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profile) {
        return {
          data: null,
          error: 'Failed to load user profile',
          success: false,
        };
      }

      // Get user's family and role
      const { data: familyMember, error: familyError } = await supabase
        .from('family_members')
        .select(`
          role,
          family_id,
          families (*)
        `)
        .eq('user_id', authData.user.id)
        .eq('is_active', true)
        .single();

      const sessionData: SessionData = {
        user: profile,
        session: authData.session,
        family: (familyMember?.families as unknown as Family) || null,
        familyRole: familyMember?.role as 'parent' | 'child' | 'teen' || null,
      };

      return {
        data: sessionData,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false,
      };
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<AuthResponse<null>> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return {
          data: null,
          error: error.message,
          success: false,
        };
      }

      return {
        data: null,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false,
      };
    }
  }

  /**
   * Reset password via email
   */
  async resetPassword(data: PasswordResetData): Promise<AuthResponse<null>> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        return {
          data: null,
          error: error.message,
          success: false,
        };
      }

      return {
        data: null,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false,
      };
    }
  }

  /**
   * Update password (for password reset flow)
   */
  async updatePassword(data: NewPasswordData): Promise<AuthResponse<null>> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        return {
          data: null,
          error: error.message,
          success: false,
        };
      }

      return {
        data: null,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false,
      };
    }
  }

  /**
   * Get current session data
   */
  async getCurrentSession(): Promise<AuthResponse<SessionData>> {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !sessionData.session?.user) {
        return {
          data: {
            user: null,
            session: null,
            family: null,
            familyRole: null,
          },
          error: sessionError?.message || null,
          success: true,
        };
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', sessionData.session.user.id)
        .single();

      if (profileError || !profile) {
        return {
          data: {
            user: null,
            session: null,
            family: null,
            familyRole: null,
          },
          error: 'Failed to load user profile',
          success: false,
        };
      }

      // Get user's family and role
      const { data: familyMember, error: familyError } = await supabase
        .from('family_members')
        .select(`
          role,
          family_id,
          families (*)
        `)
        .eq('user_id', sessionData.session.user.id)
        .eq('is_active', true)
        .single();

      const session: SessionData = {
        user: profile,
        session: sessionData.session,
        family: (familyMember?.families as unknown as Family) || null,
        familyRole: familyMember?.role as 'parent' | 'child' | 'teen' || null,
      };

      return {
        data: session,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: {
          user: null,
          session: null,
          family: null,
          familyRole: null,
        },
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false,
      };
    }
  }

  /**
   * Create a family after parent registration
   */
  async createFamily(familyData: FamilyCreationData): Promise<AuthResponse<Family>> {
    try {
      // Get current user
      const { data: sessionData } = await supabase.auth.getUser();
      
      if (!sessionData.user) {
        return {
          data: null,
          error: 'User not authenticated',
          success: false,
        };
      }

      // Create family
      const { data: family, error: familyError } = await supabase
        .from('families')
        .insert({
          name: familyData.familyName,
          description: familyData.familyDescription,
          created_by: sessionData.user.id,
        })
        .select()
        .single();

      if (familyError || !family) {
        return {
          data: null,
          error: familyError?.message || 'Failed to create family',
          success: false,
        };
      }

      // Add creator as parent member
      const { error: memberError } = await supabase
        .from('family_members')
        .insert({
          family_id: family.id,
          user_id: sessionData.user.id,
          role: 'parent',
        });

      if (memberError) {
        return {
          data: null,
          error: 'Failed to add user to family',
          success: false,
        };
      }

      return {
        data: family,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false,
      };
    }
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (session: SessionData | null) => void) {
    return supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      if (session?.user) {
        const sessionResponse = await this.getCurrentSession();
        callback(sessionResponse.data);
      } else {
        callback(null);
      }
    });
  }
}

// Export singleton instance
export const authService = new AuthService();
