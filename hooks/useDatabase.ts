import { useEffect, useState } from 'react';
import { database, supabase } from '../services/supabase';
import type {
    EventWithAttendees,
    MessageWithSender,
    TaskWithDetails,
    UserProfile
} from '../types/database';

// Auth Hook
export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    user,
    session,
    loading,
    signOut,
    isAuthenticated: !!user,
  };
};

// User Profile Hook
export const useUserProfile = (userId?: string) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await database.users.getProfile(userId);
        setProfile(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch profile');
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!userId) return;
    
    try {
      const updatedProfile = await database.users.updateProfile(userId, updates);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      throw err;
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
  };
};

// Family Hook
export const useFamily = (familyId?: string) => {
  const [family, setFamily] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!familyId) {
      setFamily(null);
      setMembers([]);
      setLoading(false);
      return;
    }

    const fetchFamily = async () => {
      try {
        setLoading(true);
        const [familyData, membersData] = await Promise.all([
          database.families.getFamily(familyId),
          database.families.getFamilyMembers(familyId)
        ]);
        
        setFamily(familyData);
        setMembers(membersData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch family');
        setFamily(null);
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFamily();
  }, [familyId]);

  return {
    family,
    members,
    loading,
    error,
  };
};

// Tasks Hook
export const useFamilyTasks = (familyId?: string) => {
  const [tasks, setTasks] = useState<TaskWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!familyId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    const fetchTasks = async () => {
      try {
        setLoading(true);
        const data = await database.tasks.getFamilyTasks(familyId);
        setTasks(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [familyId]);

  const createTask = async (taskData: any) => {
    try {
      const newTask = await database.tasks.createTask({
        ...taskData,
        family_id: familyId,
      });
      setTasks(prev => [newTask, ...prev]);
      return newTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
      throw err;
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      const updatedTask = await database.tasks.updateTaskStatus(taskId, status);
      setTasks(prev => 
        prev.map(task => task.id === taskId ? { ...task, ...updatedTask } : task)
      );
      return updatedTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
      throw err;
    }
  };

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTaskStatus,
  };
};

// Events Hook
export const useFamilyEvents = (familyId?: string) => {
  const [events, setEvents] = useState<EventWithAttendees[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!familyId) {
      setEvents([]);
      setLoading(false);
      return;
    }

    const fetchEvents = async () => {
      try {
        setLoading(true);
        const data = await database.events.getFamilyEvents(familyId);
        setEvents(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch events');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [familyId]);

  const createEvent = async (eventData: any) => {
    try {
      const newEvent = await database.events.createEvent({
        ...eventData,
        family_id: familyId,
      });
      setEvents(prev => [...prev, newEvent].sort((a, b) => 
        new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
      ));
      return newEvent;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
      throw err;
    }
  };

  return {
    events,
    loading,
    error,
    createEvent,
  };
};

// Messages Hook
export const useFamilyMessages = (familyId?: string) => {
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!familyId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const data = await database.messaging.getFamilyMessages(familyId);
        setMessages(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch messages');
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [familyId]);

  const sendMessage = async (messageText: string, senderId: string) => {
    try {
      const newMessage = await database.messaging.sendMessage({
        family_id: familyId,
        sender_id: senderId,
        message: messageText,
        message_type: 'text',
      });
      setMessages(prev => [...prev, newMessage]);
      return newMessage;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      throw err;
    }
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
  };
};

// Achievements Hook
export const useUserAchievements = (userId?: string) => {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [userPoints, setUserPoints] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setAchievements([]);
      setUserPoints(null);
      setLoading(false);
      return;
    }

    const fetchAchievements = async () => {
      try {
        setLoading(true);
        const [achievementsData, pointsData] = await Promise.all([
          database.achievements.getUserAchievements(userId),
          database.achievements.getUserPoints(userId)
        ]);
        
        setAchievements(achievementsData);
        setUserPoints(pointsData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch achievements');
        setAchievements([]);
        setUserPoints(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [userId]);

  return {
    achievements,
    userPoints,
    loading,
    error,
  };
};

// Real-time Hooks
export const useRealtimeTaskUpdates = (familyId: string, onUpdate: (payload: any) => void) => {
  useEffect(() => {
    if (!familyId) return;

    const subscription = supabase
      .channel(`family-tasks-${familyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `family_id=eq.${familyId}`
        },
        onUpdate
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [familyId, onUpdate]);
};

export const useRealtimeMessages = (familyId: string, onNewMessage: (payload: any) => void) => {
  useEffect(() => {
    if (!familyId) return;

    const subscription = supabase
      .channel(`family-messages-${familyId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'family_messages',
          filter: `family_id=eq.${familyId}`
        },
        onNewMessage
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [familyId, onNewMessage]);
};
