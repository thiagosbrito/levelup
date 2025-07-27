import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration - these should be set in environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anonymous Key not found in environment variables');
}

// Create Supabase client with React Native specific configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database utility functions
export const database = {
  // Users and Families
  users: {
    async getProfile(userId: string) {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    },

    async updateProfile(userId: string, updates: any) {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  },

  families: {
    async getFamily(familyId: string) {
      const { data, error } = await supabase
        .from('families')
        .select(`
          *,
          family_members(
            id,
            role,
            user_profiles(id, display_name, avatar_url)
          )
        `)
        .eq('id', familyId)
        .single();
      
      if (error) throw error;
      return data;
    },

    async getFamilyMembers(familyId: string) {
      const { data, error } = await supabase
        .from('family_members')
        .select(`
          *,
          user_profiles(id, display_name, avatar_url, age_group)
        `)
        .eq('family_id', familyId);
      
      if (error) throw error;
      return data;
    }
  },

  // Tasks
  tasks: {
    async getFamilyTasks(familyId: string) {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assigned_user:user_profiles(id, display_name),
          created_by_user:user_profiles!tasks_created_by_fkey(id, display_name)
        `)
        .eq('family_id', familyId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },

    async createTask(task: any) {
      const { data, error } = await supabase
        .from('tasks')
        .insert(task)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async updateTaskStatus(taskId: string, status: string) {
      const { data, error } = await supabase
        .from('tasks')
        .update({ 
          status,
          updated_at: new Date().toISOString(),
          ...(status === 'completed' && { completed_at: new Date().toISOString() })
        })
        .eq('id', taskId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  },

  // Events
  events: {
    async getFamilyEvents(familyId: string) {
      const { data, error } = await supabase
        .from('family_events')
        .select(`
          *,
          created_by_user:user_profiles!family_events_created_by_fkey(id, display_name)
        `)
        .eq('family_id', familyId)
        .order('event_date', { ascending: true });
      
      if (error) throw error;
      return data;
    },

    async createEvent(event: any) {
      const { data, error } = await supabase
        .from('family_events')
        .insert(event)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  },

  // Messaging
  messaging: {
    async getFamilyMessages(familyId: string, limit = 50) {
      const { data, error } = await supabase
        .from('family_messages')
        .select(`
          *,
          sender:user_profiles!family_messages_sender_id_fkey(id, display_name, avatar_url)
        `)
        .eq('family_id', familyId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data?.reverse(); // Return in chronological order
    },

    async sendMessage(message: any) {
      const { data, error } = await supabase
        .from('family_messages')
        .insert(message)
        .select(`
          *,
          sender:user_profiles!family_messages_sender_id_fkey(id, display_name, avatar_url)
        `)
        .single();
      
      if (error) throw error;
      return data;
    }
  },

  // Achievements and Gamification
  achievements: {
    async getUserAchievements(userId: string) {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement_definitions(*)
        `)
        .eq('user_id', userId);
      
      if (error) throw error;
      return data;
    },

    async getUserPoints(userId: string) {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('total_points, level')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    },

    async awardPoints(userId: string, points: number, reason: string) {
      // This would typically be handled by a database function/trigger
      const { data, error } = await supabase.rpc('award_user_points', {
        user_id: userId,
        points_to_award: points,
        award_reason: reason
      });
      
      if (error) throw error;
      return data;
    }
  }
};

// Real-time subscriptions
export const subscriptions = {
  subscribeToFamilyTasks(familyId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`family-tasks-${familyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `family_id=eq.${familyId}`
        },
        callback
      )
      .subscribe();
  },

  subscribeToFamilyMessages(familyId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`family-messages-${familyId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'family_messages',
          filter: `family_id=eq.${familyId}`
        },
        callback
      )
      .subscribe();
  },

  subscribeToFamilyEvents(familyId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`family-events-${familyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'family_events',
          filter: `family_id=eq.${familyId}`
        },
        callback
      )
      .subscribe();
  }
};
