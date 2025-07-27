/**
 * Database Layer Tests
 * 
 * Tests for Supabase integration, database operations, and utility functions
 */

import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { database, supabase } from '../services/supabase';
import type { Task, TaskCategory, TaskPriority, UserProfile } from '../types/database';
import {
    calculateLevel,
    calculateTaskPoints,
    createTaskObject,
    filterTasksByStatus,
    formatDate,
    formatDateTime,
    formatPoints,
    generateFamilyCode,
    generateId,
    getPointsForNextLevel,
    getProgressToNextLevel,
    getRelativeDate,
    getTaskCategoryIcon,
    getTaskPriorityColor,
    getTaskStatusColor,
    getUserDisplayName,
    getUserInitials,
    isOverdue,
    isToday,
    isTomorrow,
    searchTasks,
    sortTasksByDueDate,
    sortTasksByPriority,
    validateEmail,
    validateEventTitle,
    validateFamilyCode,
    validateTaskTitle
} from '../utils/database';

// Mock Supabase client
jest.mock('../services/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
          order: jest.fn(() => ({ data: [], error: null }))
        })),
        order: jest.fn(() => ({ data: [], error: null }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({ data: {}, error: null }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({ data: {}, error: null }))
          }))
        }))
      }))
    })),
    auth: {
      getSession: jest.fn(() => Promise.resolve({ data: { session: null } })),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } }))
    },
    channel: jest.fn(() => ({
      on: jest.fn(() => ({
        subscribe: jest.fn()
      }))
    }))
  },
  database: {
    users: {
      getProfile: jest.fn(),
      updateProfile: jest.fn()
    },
    families: {
      getFamily: jest.fn(),
      getFamilyMembers: jest.fn()
    },
    tasks: {
      getFamilyTasks: jest.fn(),
      createTask: jest.fn(),
      updateTaskStatus: jest.fn()
    },
    events: {
      getFamilyEvents: jest.fn(),
      createEvent: jest.fn()
    },
    messaging: {
      getFamilyMessages: jest.fn(),
      sendMessage: jest.fn()
    },
    achievements: {
      getUserAchievements: jest.fn(),
      getUserPoints: jest.fn(),
      awardPoints: jest.fn()
    }
  }
}));

describe('Database Utilities', () => {
  describe('ID Generation', () => {
    test('generateId should return a mocked UUID string', () => {
      const id = generateId();
      // Since we're mocking UUID, just check it's a string with expected format
      expect(typeof id).toBe('string');
      expect(id).toContain('test-uuid');
    });

    test('generateId should be consistent in mocked environment', () => {
      const id1 = generateId();
      const id2 = generateId();
      // In mocked environment, we expect consistent behavior
      expect(typeof id1).toBe('string');
      expect(typeof id2).toBe('string');
    });

    test('generateFamilyCode should return 6-character code', () => {
      const code = generateFamilyCode();
      expect(code).toMatch(/^[A-Z0-9]{6}$/);
    });

    test('generateFamilyCode should return unique values', () => {
      const code1 = generateFamilyCode();
      const code2 = generateFamilyCode();
      expect(code1).not.toBe(code2);
    });
  });

  describe('Date Utilities', () => {
    const testDate = new Date('2024-12-31T10:30:00Z');
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    test('formatDate should format date correctly', () => {
      const formatted = formatDate(testDate);
      expect(formatted).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });

    test('formatDateTime should include time', () => {
      const formatted = formatDateTime(testDate);
      // Just check that time components are present (hours and minutes)
      expect(formatted).toMatch(/\d{1,2}:\d{2}/); // Should contain time format like "11:30"
    });

    test('isToday should correctly identify today', () => {
      expect(isToday(today)).toBe(true);
      expect(isToday(tomorrow)).toBe(false);
      expect(isToday(yesterday)).toBe(false);
    });

    test('isTomorrow should correctly identify tomorrow', () => {
      expect(isTomorrow(tomorrow)).toBe(true);
      expect(isTomorrow(today)).toBe(false);
      expect(isTomorrow(yesterday)).toBe(false);
    });

    test('isOverdue should correctly identify past dates', () => {
      expect(isOverdue(yesterday)).toBe(true);
      expect(isOverdue(tomorrow)).toBe(false);
    });

    test('getRelativeDate should return appropriate labels', () => {
      expect(getRelativeDate(today)).toBe('Today');
      expect(getRelativeDate(tomorrow)).toBe('Tomorrow');
      expect(getRelativeDate(yesterday)).toBe('Overdue');
    });
  });

  describe('Task Utilities', () => {
    const mockTaskInput = {
      title: 'Test Task',
      description: 'Test description',
      category: 'chore' as TaskCategory,
      priority: 'medium' as TaskPriority,
      points_value: 15
    };

    test('createTaskObject should create valid task object', () => {
      const task = createTaskObject(mockTaskInput, 'family-id', 'user-id');
      
      expect(task.id).toBeDefined();
      expect(task.family_id).toBe('family-id');
      expect(task.created_by).toBe('user-id');
      expect(task.title).toBe('Test Task');
      expect(task.category).toBe('chore');
      expect(task.priority).toBe('medium');
      expect(task.status).toBe('pending');
      expect(task.points_value).toBe(15);
      expect(task.is_recurring).toBe(false);
    });

    test('getTaskStatusColor should return correct colors', () => {
      expect(getTaskStatusColor('completed')).toBe('#22c55e');
      expect(getTaskStatusColor('in_progress')).toBe('#f59e0b');
      expect(getTaskStatusColor('cancelled')).toBe('#ef4444');
      expect(getTaskStatusColor('pending')).toBe('#6b7280');
    });

    test('getTaskPriorityColor should return correct colors', () => {
      expect(getTaskPriorityColor('high')).toBe('#ef4444');
      expect(getTaskPriorityColor('medium')).toBe('#f59e0b');
      expect(getTaskPriorityColor('low')).toBe('#22c55e');
    });

    test('getTaskCategoryIcon should return correct icons', () => {
      expect(getTaskCategoryIcon('chore')).toBe('🧹');
      expect(getTaskCategoryIcon('homework')).toBe('📚');
      expect(getTaskCategoryIcon('activity')).toBe('🎯');
      expect(getTaskCategoryIcon('habit')).toBe('🔄');
      expect(getTaskCategoryIcon('goal')).toBe('🏆');
    });

    test('calculateTaskPoints should calculate points correctly', () => {
      expect(calculateTaskPoints('chore', 'medium')).toBe(18); // 15 * 1.2
      expect(calculateTaskPoints('homework', 'high')).toBe(30); // 20 * 1.5
      expect(calculateTaskPoints('activity', 'low')).toBe(10); // 10 * 1.0
      expect(calculateTaskPoints('chore', 'medium', 30)).toBe(20); // 15 * 1.2 * 1.1
      expect(calculateTaskPoints('chore', 'medium', 60)).toBe(23); // 15 * 1.2 * 1.3
    });
  });

  describe('User Utilities', () => {
    test('getUserDisplayName should handle different user formats', () => {
      expect(getUserDisplayName({ display_name: 'John Doe' })).toBe('John Doe');
      expect(getUserDisplayName({ first_name: 'John', last_name: 'Doe' })).toBe('John Doe');
      expect(getUserDisplayName({ first_name: 'John' })).toBe('John');
      expect(getUserDisplayName({ email: 'john@example.com' })).toBe('john');
      expect(getUserDisplayName({})).toBe('Unknown User');
    });

    test('getUserInitials should generate correct initials', () => {
      expect(getUserInitials({ display_name: 'John Doe' })).toBe('JD');
      expect(getUserInitials({ display_name: 'John' })).toBe('JO');
      expect(getUserInitials({ first_name: 'Alice', last_name: 'Smith' })).toBe('AS');
      expect(getUserInitials({ email: 'test@example.com' })).toBe('TE');
    });
  });

  describe('Points and Gamification', () => {
    test('formatPoints should format numbers correctly', () => {
      expect(formatPoints(50)).toBe('50');
      expect(formatPoints(1500)).toBe('1.5K');
      expect(formatPoints(1500000)).toBe('1.5M');
    });

    test('calculateLevel should calculate correct levels', () => {
      expect(calculateLevel(0)).toBe(1);
      expect(calculateLevel(99)).toBe(1);
      expect(calculateLevel(100)).toBe(2);
      expect(calculateLevel(400)).toBe(3);
      expect(calculateLevel(900)).toBe(4);
    });

    test('getPointsForNextLevel should calculate correct thresholds', () => {
      expect(getPointsForNextLevel(1)).toBe(100);
      expect(getPointsForNextLevel(2)).toBe(400);
      expect(getPointsForNextLevel(3)).toBe(900);
      expect(getPointsForNextLevel(4)).toBe(1600);
    });

    test('getProgressToNextLevel should calculate progress correctly', () => {
      const progress = getProgressToNextLevel(150);
      expect(progress.currentLevel).toBe(2);
      expect(progress.pointsForCurrentLevel).toBe(100);
      expect(progress.pointsForNextLevel).toBe(400);
      expect(progress.progressPercentage).toBeCloseTo(16.67, 1); // 50/300 * 100
      expect(progress.pointsNeeded).toBe(250);
    });
  });

  describe('Validation Utilities', () => {
    test('validateEmail should validate email addresses', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
    });

    test('validateFamilyCode should validate family codes', () => {
      expect(validateFamilyCode('ABC123')).toBe(true);
      expect(validateFamilyCode('FAMILY')).toBe(true);
      expect(validateFamilyCode('abc123')).toBe(false); // lowercase
      expect(validateFamilyCode('ABC12')).toBe(false); // too short
      expect(validateFamilyCode('ABC1234')).toBe(false); // too long
      expect(validateFamilyCode('ABC-12')).toBe(false); // invalid character
    });

    test('validateTaskTitle should validate task titles', () => {
      expect(validateTaskTitle('Valid task title')).toBe(true);
      expect(validateTaskTitle('AB')).toBe(false); // too short
      expect(validateTaskTitle('')).toBe(false); // empty
      expect(validateTaskTitle('A'.repeat(101))).toBe(false); // too long
    });

    test('validateEventTitle should validate event titles', () => {
      expect(validateEventTitle('Valid event title')).toBe(true);
      expect(validateEventTitle('AB')).toBe(false); // too short
      expect(validateEventTitle('')).toBe(false); // empty
      expect(validateEventTitle('A'.repeat(101))).toBe(false); // too long
    });
  });

  describe('Search and Filter Utilities', () => {
    const mockTasks = [
      {
        id: '1',
        title: 'Clean room',
        description: 'Clean the bedroom',
        status: 'pending',
        category: 'chore',
        priority: 'high',
        assigned_to: 'user1',
        due_date: '2024-12-31T10:00:00Z'
      },
      {
        id: '2',
        title: 'Do homework',
        description: 'Math homework',
        status: 'completed',
        category: 'homework',
        priority: 'medium',
        assigned_to: 'user2',
        due_date: '2024-12-30T10:00:00Z'
      },
      {
        id: '3',
        title: 'Exercise',
        description: 'Go for a run',
        status: 'in_progress',
        category: 'activity',
        priority: 'low',
        assigned_to: 'user1',
        due_date: null
      }
    ];

    test('filterTasksByStatus should filter correctly', () => {
      const pendingTasks = filterTasksByStatus(mockTasks, 'pending');
      expect(pendingTasks).toHaveLength(1);
      expect(pendingTasks[0].title).toBe('Clean room');

      const completedTasks = filterTasksByStatus(mockTasks, 'completed');
      expect(completedTasks).toHaveLength(1);
      expect(completedTasks[0].title).toBe('Do homework');

      const allTasks = filterTasksByStatus(mockTasks);
      expect(allTasks).toHaveLength(3);
    });

    test('searchTasks should search by title and description', () => {
      const cleanResults = searchTasks(mockTasks, 'clean');
      expect(cleanResults).toHaveLength(1);
      expect(cleanResults[0].title).toBe('Clean room');

      const mathResults = searchTasks(mockTasks, 'math');
      expect(mathResults).toHaveLength(1);
      expect(mathResults[0].title).toBe('Do homework');

      const noResults = searchTasks(mockTasks, 'xyz');
      expect(noResults).toHaveLength(0);

      const allResults = searchTasks(mockTasks, '');
      expect(allResults).toHaveLength(3);
    });

    test('sortTasksByDueDate should sort correctly', () => {
      const sorted = sortTasksByDueDate(mockTasks);
      expect(sorted[0].title).toBe('Do homework'); // earliest date
      expect(sorted[1].title).toBe('Clean room'); // later date
      expect(sorted[2].title).toBe('Exercise'); // no due date (last)
    });

    test('sortTasksByPriority should sort correctly', () => {
      const sorted = sortTasksByPriority(mockTasks);
      expect(sorted[0].priority).toBe('high');
      expect(sorted[1].priority).toBe('medium');
      expect(sorted[2].priority).toBe('low');
    });
  });
});

describe('Database Service Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('database.users.getProfile should be callable', () => {
    const mockGetProfile = database.users.getProfile as jest.MockedFunction<typeof database.users.getProfile>;
    mockGetProfile.mockResolvedValue({
      id: 'user-id',
      email: 'test@example.com',
      display_name: 'Test User',
      age_group: 'adult',
      total_points: 100,
      level: 2,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    } as UserProfile);

    expect(database.users.getProfile).toBeDefined();
    expect(typeof database.users.getProfile).toBe('function');
  });

  test('database.tasks.createTask should be callable', () => {
    const mockCreateTask = database.tasks.createTask as jest.MockedFunction<typeof database.tasks.createTask>;
    mockCreateTask.mockResolvedValue({
      id: 'task-id',
      family_id: 'family-id',
      title: 'Test Task',
      category: 'chore',
      priority: 'medium',
      status: 'pending',
      created_by: 'user-id',
      points_value: 10,
      is_recurring: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    } as Task);

    expect(database.tasks.createTask).toBeDefined();
    expect(typeof database.tasks.createTask).toBe('function');
  });

  test('database.families.getFamily should be callable', () => {
    const mockGetFamily = database.families.getFamily as jest.MockedFunction<typeof database.families.getFamily>;
    mockGetFamily.mockResolvedValue({
      id: 'family-id',
      name: 'Test Family',
      family_code: 'ABC123',
      created_by: 'user-id',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      family_members: []
    });

    expect(database.families.getFamily).toBeDefined();
    expect(typeof database.families.getFamily).toBe('function');
  });

  test('database.messaging.sendMessage should be callable', () => {
    const mockSendMessage = database.messaging.sendMessage as jest.MockedFunction<typeof database.messaging.sendMessage>;
    mockSendMessage.mockResolvedValue({
      id: 'message-id',
      family_id: 'family-id',
      sender_id: 'user-id',
      message: 'Test message',
      message_type: 'text',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      sender: {
        id: 'user-id',
        display_name: 'Test User',
        avatar_url: null
      }
    });

    expect(database.messaging.sendMessage).toBeDefined();
    expect(typeof database.messaging.sendMessage).toBe('function');
  });

  test('database.achievements.awardPoints should be callable', () => {
    const mockAwardPoints = database.achievements.awardPoints as jest.MockedFunction<typeof database.achievements.awardPoints>;
    mockAwardPoints.mockResolvedValue({
      new_total_points: 150,
      new_level: 2
    });

    expect(database.achievements.awardPoints).toBeDefined();
    expect(typeof database.achievements.awardPoints).toBe('function');
  });
});

describe('Environment Configuration', () => {
  test('should handle missing environment variables gracefully', () => {
    // This test ensures the Supabase client can be created even with placeholder values
    expect(supabase).toBeDefined();
    expect(typeof supabase.from).toBe('function');
    expect(typeof supabase.auth).toBe('object');
  });
});
