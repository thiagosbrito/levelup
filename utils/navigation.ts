/**
 * Navigation utilities for LevelUp Family app
 * Provides helper functions for navigation state management and deep linking
 */

import { router } from 'expo-router';

export type NavigationParams = {
  [key: string]: string | number | boolean | undefined;
};

/**
 * Navigation helper class for managing app navigation
 */
export class NavigationHelper {
  /**
   * Navigate to family member details
   */
  static navigateToMemberDetails(memberId: string) {
    router.push({
      pathname: '/(tabs)/family/member-details',
      params: { id: memberId }
    });
  }

  /**
   * Navigate to add family member screen
   */
  static navigateToAddMember() {
    router.push('/(tabs)/family/add-member');
  }

  /**
   * Navigate to task details
   */
  static navigateToTaskDetails(taskId: string) {
    router.push({
      pathname: '/(tabs)/tasks/task-details',
      params: { id: taskId }
    });
  }

  /**
   * Navigate to create task screen
   */
  static navigateToCreateTask() {
    router.push('/(tabs)/tasks/create-task');
  }

  /**
   * Navigate to event details
   */
  static navigateToEventDetails(eventId: string) {
    router.push({
      pathname: '/(tabs)/events/event-details',
      params: { id: eventId }
    });
  }

  /**
   * Navigate to create event screen
   */
  static navigateToCreateEvent() {
    router.push('/(tabs)/events/create-event');
  }

  /**
   * Navigate to profile settings
   */
  static navigateToProfileSettings() {
    router.push('/(tabs)/profile/settings');
  }

  /**
   * Navigate back with optional fallback
   */
  static goBack(fallbackPath?: string) {
    if (router.canGoBack()) {
      router.back();
    } else if (fallbackPath) {
      // Use string assertion for now until more routes are defined
      router.replace(fallbackPath as any);
    } else {
      router.replace('/(tabs)');
    }
  }

  /**
   * Navigate to home tab
   */
  static navigateToHome() {
    router.replace('/(tabs)');
  }

  /**
   * Navigate to specific tab
   */
  static navigateToTab(tabName: 'family' | 'tasks' | 'events' | 'profile') {
    router.replace(`/(tabs)/${tabName}` as any);
  }

  /**
   * Navigate to family tab
   */
  static navigateToFamily() {
    router.push('/(tabs)/family');
  }

  /**
   * Navigate to tasks tab
   */
  static navigateToTasks() {
    router.push('/(tabs)/tasks');
  }

  /**
   * Navigate to events tab
   */
  static navigateToEvents() {
    router.push('/(tabs)/events');
  }

  /**
   * Navigate to profile tab
   */
  static navigateToProfile() {
    router.push('/(tabs)/profile');
  }
}

/**
 * Deep link URL patterns for the app
 */
export const DeepLinkPatterns = {
  // Family deep links
  FAMILY_MEMBER: 'levelup://family/member/:id',
  ADD_FAMILY_MEMBER: 'levelup://family/add',
  
  // Task deep links
  TASK_DETAILS: 'levelup://tasks/task/:id',
  CREATE_TASK: 'levelup://tasks/create',
  
  // Event deep links
  EVENT_DETAILS: 'levelup://events/event/:id',
  CREATE_EVENT: 'levelup://events/create',
  
  // Profile deep links
  PROFILE_SETTINGS: 'levelup://profile/settings',
} as const;

/**
 * Navigation guards for protected routes
 */
export class NavigationGuards {
  /**
   * Check if user can access admin features
   */
  static canAccessAdminFeatures(): boolean {
    // TODO: Implement actual user permission check
    return true;
  }

  /**
   * Check if user can manage family members
   */
  static canManageFamilyMembers(): boolean {
    // TODO: Implement actual permission check
    return true;
  }

  /**
   * Check if user can create tasks for other family members
   */
  static canCreateTasksForOthers(): boolean {
    // TODO: Implement actual permission check
    return true;
  }

  /**
   * Check if user can manage family events
   */
  static canManageEvents(): boolean {
    // TODO: Implement actual permission check
    return true;
  }
}
