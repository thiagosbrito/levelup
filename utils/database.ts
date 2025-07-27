import { v4 as uuidv4 } from 'uuid';
import type {
    AgeGroup,
    CreateEventInput,
    CreateTaskInput,
    EventType,
    TaskCategory,
    TaskPriority,
    TaskStatus,
    UserRole
} from '../types/database';

// UUID Generation
export const generateId = (): string => uuidv4();

// Family Code Generation (client-side fallback)
export const generateFamilyCode = (): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Date and Time Utilities
export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString();
};

export const formatDateTime = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleString();
};

export const formatTime = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const isToday = (date: string | Date): boolean => {
  const today = new Date();
  const d = new Date(date);
  return today.toDateString() === d.toDateString();
};

export const isTomorrow = (date: string | Date): boolean => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const d = new Date(date);
  return tomorrow.toDateString() === d.toDateString();
};

export const isOverdue = (date: string | Date): boolean => {
  const now = new Date();
  const d = new Date(date);
  return d < now;
};

export const getRelativeDate = (date: string | Date): string => {
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  if (isOverdue(date)) return 'Overdue';
  return formatDate(date);
};

// Task Utilities
export const createTaskObject = (
  input: CreateTaskInput,
  familyId: string,
  createdBy: string
) => ({
  id: generateId(),
  family_id: familyId,
  created_by: createdBy,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  status: 'pending' as TaskStatus,
  is_recurring: false,
  ...input,
  points_value: input.points_value || 10,
});

export const getTaskStatusColor = (status: TaskStatus): string => {
  switch (status) {
    case 'completed':
      return '#22c55e'; // green
    case 'in_progress':
      return '#f59e0b'; // amber
    case 'cancelled':
      return '#ef4444'; // red
    case 'pending':
    default:
      return '#6b7280'; // gray
  }
};

export const getTaskPriorityColor = (priority: TaskPriority): string => {
  switch (priority) {
    case 'high':
      return '#ef4444'; // red
    case 'medium':
      return '#f59e0b'; // amber
    case 'low':
    default:
      return '#22c55e'; // green
  }
};

export const getTaskCategoryIcon = (category: TaskCategory): string => {
  switch (category) {
    case 'chore':
      return '🧹';
    case 'homework':
      return '📚';
    case 'activity':
      return '🎯';
    case 'habit':
      return '🔄';
    case 'goal':
      return '🏆';
    default:
      return '📝';
  }
};

export const calculateTaskPoints = (
  category: TaskCategory,
  priority: TaskPriority,
  estimatedMinutes?: number
): number => {
  let basePoints = 10;
  
  // Category multiplier
  switch (category) {
    case 'chore':
      basePoints = 15;
      break;
    case 'homework':
      basePoints = 20;
      break;
    case 'activity':
      basePoints = 10;
      break;
    case 'habit':
      basePoints = 5;
      break;
    case 'goal':
      basePoints = 25;
      break;
  }
  
  // Priority multiplier
  switch (priority) {
    case 'high':
      basePoints *= 1.5;
      break;
    case 'medium':
      basePoints *= 1.2;
      break;
    case 'low':
      basePoints *= 1.0;
      break;
  }
  
  // Time-based bonus
  if (estimatedMinutes) {
    if (estimatedMinutes >= 60) {
      basePoints *= 1.3;
    } else if (estimatedMinutes >= 30) {
      basePoints *= 1.1;
    }
  }
  
  return Math.round(basePoints);
};

// Event Utilities
export const createEventObject = (
  input: CreateEventInput,
  familyId: string,
  createdBy: string
) => ({
  id: generateId(),
  family_id: familyId,
  created_by: createdBy,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  is_all_day: false,
  ...input,
});

export const getEventTypeIcon = (eventType: EventType): string => {
  switch (eventType) {
    case 'appointment':
      return '📅';
    case 'activity':
      return '🎉';
    case 'celebration':
      return '🎊';
    case 'reminder':
      return '⏰';
    case 'milestone':
      return '🏆';
    default:
      return '📌';
  }
};

export const getEventTypeColor = (eventType: EventType): string => {
  switch (eventType) {
    case 'appointment':
      return '#3b82f6'; // blue
    case 'activity':
      return '#8b5cf6'; // purple
    case 'celebration':
      return '#ec4899'; // pink
    case 'reminder':
      return '#f59e0b'; // amber
    case 'milestone':
      return '#10b981'; // emerald
    default:
      return '#6b7280'; // gray
  }
};

// User and Family Utilities
export const getUserDisplayName = (user: any): string => {
  if (user.display_name) return user.display_name;
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`;
  }
  if (user.first_name) return user.first_name;
  if (user.email) return user.email.split('@')[0];
  return 'Unknown User';
};

export const getUserInitials = (user: any): string => {
  const displayName = getUserDisplayName(user);
  const names = displayName.split(' ');
  if (names.length >= 2) {
    return `${names[0][0]}${names[1][0]}`.toUpperCase();
  }
  return displayName.substring(0, 2).toUpperCase();
};

export const getRoleDisplayName = (role: UserRole): string => {
  switch (role) {
    case 'parent':
      return 'Parent';
    case 'child':
      return 'Child';
    case 'teen':
      return 'Teen';
    default:
      return 'Member';
  }
};

export const getAgeGroupDisplayName = (ageGroup: AgeGroup): string => {
  switch (ageGroup) {
    case 'child':
      return 'Child (Under 13)';
    case 'teen':
      return 'Teen (13-17)';
    case 'adult':
      return 'Adult (18+)';
    default:
      return 'Unknown';
  }
};

// Points and Gamification Utilities
export const formatPoints = (points: number): string => {
  if (points >= 1000000) {
    return `${(points / 1000000).toFixed(1)}M`;
  }
  if (points >= 1000) {
    return `${(points / 1000).toFixed(1)}K`;
  }
  return points.toString();
};

export const calculateLevel = (totalPoints: number): number => {
  // Level = floor(sqrt(total_points / 100)) + 1
  return Math.max(1, Math.floor(Math.sqrt(totalPoints / 100)) + 1);
};

export const getPointsForNextLevel = (currentLevel: number): number => {
  // Points needed for level N = (N - 1)^2 * 100
  return Math.pow(currentLevel, 2) * 100;
};

export const getProgressToNextLevel = (totalPoints: number): {
  currentLevel: number;
  pointsForCurrentLevel: number;
  pointsForNextLevel: number;
  progressPercentage: number;
  pointsNeeded: number;
} => {
  const currentLevel = calculateLevel(totalPoints);
  const pointsForCurrentLevel = Math.pow(currentLevel - 1, 2) * 100;
  const pointsForNextLevel = Math.pow(currentLevel, 2) * 100;
  const pointsInCurrentLevel = totalPoints - pointsForCurrentLevel;
  const pointsNeededForLevel = pointsForNextLevel - pointsForCurrentLevel;
  const progressPercentage = (pointsInCurrentLevel / pointsNeededForLevel) * 100;
  const pointsNeeded = pointsForNextLevel - totalPoints;

  return {
    currentLevel,
    pointsForCurrentLevel,
    pointsForNextLevel,
    progressPercentage,
    pointsNeeded,
  };
};

// Message Utilities
export const formatMessageTime = (createdAt: string): string => {
  const messageDate = new Date(createdAt);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - messageDate.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }
  
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  }
  
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  }
  
  if (isToday(messageDate)) {
    return formatTime(messageDate);
  }
  
  return formatDate(messageDate);
};

// Validation Utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateFamilyCode = (code: string): boolean => {
  return /^[A-Z0-9]{6}$/.test(code);
};

export const validateTaskTitle = (title: string): boolean => {
  return title.trim().length >= 3 && title.trim().length <= 100;
};

export const validateEventTitle = (title: string): boolean => {
  return title.trim().length >= 3 && title.trim().length <= 100;
};

// Error Handling Utilities
export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.error?.message) return error.error.message;
  return 'An unexpected error occurred';
};

export const isSupabaseError = (error: any): boolean => {
  return error?.code && error?.message && error?.details;
};

// Storage Utilities
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Search and Filter Utilities
export const filterTasksByStatus = (tasks: any[], status?: TaskStatus) => {
  if (!status) return tasks;
  return tasks.filter(task => task.status === status);
};

export const filterTasksByCategory = (tasks: any[], category?: TaskCategory) => {
  if (!category) return tasks;
  return tasks.filter(task => task.category === category);
};

export const filterTasksByAssignee = (tasks: any[], userId?: string) => {
  if (!userId) return tasks;
  return tasks.filter(task => task.assigned_to === userId);
};

export const searchTasks = (tasks: any[], query: string) => {
  if (!query.trim()) return tasks;
  const lowercaseQuery = query.toLowerCase();
  return tasks.filter(task => 
    task.title.toLowerCase().includes(lowercaseQuery) ||
    task.description?.toLowerCase().includes(lowercaseQuery)
  );
};

export const sortTasksByDueDate = (tasks: any[]) => {
  return [...tasks].sort((a, b) => {
    if (!a.due_date && !b.due_date) return 0;
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });
};

export const sortTasksByPriority = (tasks: any[]) => {
  const priorityOrder: Record<TaskPriority, number> = { high: 3, medium: 2, low: 1 };
  return [...tasks].sort((a, b) => 
    priorityOrder[b.priority as TaskPriority] - priorityOrder[a.priority as TaskPriority]
  );
};
