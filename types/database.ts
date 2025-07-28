// Core database types matching Supabase PostgreSQL schema

// User and Authentication Types
export interface UserProfile {
  id: string; // UUID, matches auth.users.id
  email: string;
  display_name: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  age_group: 'child' | 'teen' | 'adult';
  total_points: number;
  level: number;
  created_at: string;
  updated_at: string;
}

// Family Management Types
export interface Family {
  id: string; // UUID
  name: string;
  description?: string;
  family_code: string; // Unique 6-character code for joining
  created_by: string; // UUID reference to user_profiles.id
  created_at: string;
  updated_at: string;
}

export interface FamilyMember {
  id: string; // UUID
  family_id: string; // UUID reference to families.id
  user_id: string; // UUID reference to user_profiles.id
  role: 'parent' | 'child' | 'teen';
  joined_at: string;
  is_active: boolean;
}

// Task Management Types
export interface Task {
  id: string; // UUID
  family_id: string; // UUID reference to families.id
  title: string;
  description?: string;
  category: 'chore' | 'homework' | 'activity' | 'habit' | 'goal';
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assigned_to?: string; // UUID reference to user_profiles.id
  created_by: string; // UUID reference to user_profiles.id
  due_date?: string;
  estimated_minutes?: number;
  points_value: number;
  is_recurring: boolean;
  recurrence_pattern?: string; // JSON string for cron-like patterns
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface TaskComment {
  id: string; // UUID
  task_id: string; // UUID reference to tasks.id
  user_id: string; // UUID reference to user_profiles.id
  comment: string;
  created_at: string;
}

// Event Management Types
export interface FamilyEvent {
  id: string; // UUID
  family_id: string; // UUID reference to families.id
  title: string;
  description?: string;
  event_type: 'appointment' | 'activity' | 'celebration' | 'reminder' | 'milestone';
  event_date: string;
  end_date?: string;
  location?: string;
  created_by: string; // UUID reference to user_profiles.id
  is_all_day: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventAttendee {
  id: string; // UUID
  event_id: string; // UUID reference to family_events.id
  user_id: string; // UUID reference to user_profiles.id
  status: 'going' | 'not_going' | 'maybe' | 'pending';
  added_at: string;
}

// Messaging Types
export interface FamilyMessage {
  id: string; // UUID
  family_id: string; // UUID reference to families.id
  sender_id: string; // UUID reference to user_profiles.id
  message: string;
  message_type: 'text' | 'image' | 'system' | 'achievement';
  reply_to?: string; // UUID reference to family_messages.id
  created_at: string;
  updated_at: string;
}

// Gamification and Achievement Types
export interface AchievementDefinition {
  id: string; // UUID
  name: string;
  description: string;
  icon: string;
  category: 'tasks' | 'streaks' | 'points' | 'social' | 'special';
  criteria: string; // JSON string defining achievement criteria
  points_reward: number;
  is_active: boolean;
  created_at: string;
}

export interface UserAchievement {
  id: string; // UUID
  user_id: string; // UUID reference to user_profiles.id
  achievement_id: string; // UUID reference to achievement_definitions.id
  earned_at: string;
  progress?: number; // For progressive achievements
}

export interface PointsTransaction {
  id: string; // UUID
  user_id: string; // UUID reference to user_profiles.id
  points: number; // Can be positive (earned) or negative (spent)
  transaction_type: 'task_completion' | 'achievement' | 'bonus' | 'penalty' | 'reward_redemption';
  reference_id?: string; // UUID reference to related entity (task, achievement, etc.)
  description: string;
  created_at: string;
}

// Habit Tracking Types
export interface Habit {
  id: string; // UUID
  family_id: string; // UUID reference to families.id
  user_id: string; // UUID reference to user_profiles.id
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'custom';
  target_count: number; // How many times per frequency period
  points_per_completion: number;
  created_by: string; // UUID reference to user_profiles.id
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HabitEntry {
  id: string; // UUID
  habit_id: string; // UUID reference to habits.id
  user_id: string; // UUID reference to user_profiles.id
  completed_at: string;
  notes?: string;
}

// Notification Types
export interface UserNotification {
  id: string; // UUID
  user_id: string; // UUID reference to user_profiles.id
  family_id?: string; // UUID reference to families.id
  title: string;
  message: string;
  notification_type: 'task_assigned' | 'task_due' | 'achievement_earned' | 'event_reminder' | 'message' | 'system';
  reference_id?: string; // UUID reference to related entity
  is_read: boolean;
  created_at: string;
  read_at?: string;
}

// Shopping and Rewards Types
export interface RewardItem {
  id: string; // UUID
  family_id: string; // UUID reference to families.id
  name: string;
  description?: string;
  points_cost: number;
  category: 'privilege' | 'treat' | 'outing' | 'toy' | 'experience' | 'custom';
  is_available: boolean;
  created_by: string; // UUID reference to user_profiles.id
  created_at: string;
  updated_at: string;
}

export interface RewardRedemption {
  id: string; // UUID
  reward_id: string; // UUID reference to reward_items.id
  user_id: string; // UUID reference to user_profiles.id
  points_spent: number;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  redeemed_at: string;
  approved_at?: string;
  approved_by?: string; // UUID reference to user_profiles.id
  notes?: string;
}

// Family Settings and Preferences
export interface FamilySettings {
  id: string; // UUID
  family_id: string; // UUID reference to families.id
  setting_key: string;
  setting_value: string; // JSON string for complex values
  updated_at: string;
  updated_by: string; // UUID reference to user_profiles.id
}

// Database Views and Computed Types
export interface TaskWithDetails extends Task {
  assigned_user?: Pick<UserProfile, 'id' | 'display_name' | 'avatar_url'>;
  created_by_user?: Pick<UserProfile, 'id' | 'display_name'>;
  comments_count?: number;
}

export interface FamilyWithMembers extends Family {
  family_members: (FamilyMember & {
    user_profiles: Pick<UserProfile, 'id' | 'display_name' | 'avatar_url' | 'age_group'>;
  })[];
  member_count?: number;
}

export interface MessageWithSender extends FamilyMessage {
  sender: Pick<UserProfile, 'id' | 'display_name' | 'avatar_url'>;
}

export interface EventWithAttendees extends FamilyEvent {
  event_attendees?: (EventAttendee & {
    user_profiles: Pick<UserProfile, 'id' | 'display_name' | 'avatar_url'>;
  })[];
  created_by_user?: Pick<UserProfile, 'id' | 'display_name'>;
}

export interface AchievementWithDefinition extends UserAchievement {
  achievement_definitions: AchievementDefinition;
}

// API Response Types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Form and Input Types
export interface CreateFamilyInput {
  name: string;
  description?: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  category: Task['category'];
  priority: Task['priority'];
  assigned_to?: string;
  due_date?: string;
  estimated_minutes?: number;
  points_value: number;
  is_recurring?: boolean;
  recurrence_pattern?: string;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  event_type: FamilyEvent['event_type'];
  event_date: string;
  end_date?: string;
  location?: string;
  is_all_day?: boolean;
}

export interface UpdateProfileInput {
  display_name?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
}

// Utility Types
export type DatabaseTables = 
  | 'user_profiles'
  | 'families'
  | 'family_members'
  | 'tasks'
  | 'task_comments'
  | 'family_events'
  | 'event_attendees'
  | 'family_messages'
  | 'achievement_definitions'
  | 'user_achievements'
  | 'points_transactions'
  | 'habits'
  | 'habit_entries'
  | 'user_notifications'
  | 'reward_items'
  | 'reward_redemptions'
  | 'family_settings';

export type UserRole = FamilyMember['role'];
export type TaskStatus = Task['status'];
export type TaskCategory = Task['category'];
export type TaskPriority = Task['priority'];
export type EventType = FamilyEvent['event_type'];
export type MessageType = FamilyMessage['message_type'];
export type NotificationType = UserNotification['notification_type'];
export type AgeGroup = UserProfile['age_group'];

// Authentication and Session Types
export interface SessionData {
  user: UserProfile | null;
  session: any; // Supabase session object
  family: Family | null;
  familyRole: 'parent' | 'child' | 'teen' | null;
}
