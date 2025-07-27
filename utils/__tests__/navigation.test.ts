import { router } from 'expo-router';
import { NavigationGuards, NavigationHelper } from '../navigation';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(),
  },
}));

describe('NavigationHelper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('navigateToMemberDetails', () => {
    it('should navigate to member details with correct params', () => {
      const memberId = '123';
      NavigationHelper.navigateToMemberDetails(memberId);

      expect(router.push).toHaveBeenCalledWith({
        pathname: '/(tabs)/family/member-details',
        params: { id: memberId },
      });
    });
  });

  describe('navigateToAddMember', () => {
    it('should navigate to add member screen', () => {
      NavigationHelper.navigateToAddMember();

      expect(router.push).toHaveBeenCalledWith('/(tabs)/family/add-member');
    });
  });

  describe('navigateToTaskDetails', () => {
    it('should navigate to task details with correct params', () => {
      const taskId = '456';
      NavigationHelper.navigateToTaskDetails(taskId);

      expect(router.push).toHaveBeenCalledWith({
        pathname: '/(tabs)/tasks/task-details',
        params: { id: taskId },
      });
    });
  });

  describe('navigateToCreateTask', () => {
    it('should navigate to create task screen', () => {
      NavigationHelper.navigateToCreateTask();

      expect(router.push).toHaveBeenCalledWith('/(tabs)/tasks/create-task');
    });
  });

  describe('goBack', () => {
    it('should go back when canGoBack returns true', () => {
      (router.canGoBack as jest.Mock).mockReturnValue(true);
      
      NavigationHelper.goBack();

      expect(router.back).toHaveBeenCalled();
      expect(router.replace).not.toHaveBeenCalled();
    });

    it('should replace with fallback path when canGoBack returns false', () => {
      (router.canGoBack as jest.Mock).mockReturnValue(false);
      const fallbackPath = '/some/path';
      
      NavigationHelper.goBack(fallbackPath);

      expect(router.back).not.toHaveBeenCalled();
      expect(router.replace).toHaveBeenCalledWith(fallbackPath);
    });

    it('should replace with default path when canGoBack returns false and no fallback', () => {
      (router.canGoBack as jest.Mock).mockReturnValue(false);
      
      NavigationHelper.goBack();

      expect(router.back).not.toHaveBeenCalled();
      expect(router.replace).toHaveBeenCalledWith('/(tabs)');
    });
  });

  describe('navigateToHome', () => {
    it('should replace with home tab', () => {
      NavigationHelper.navigateToHome();

      expect(router.replace).toHaveBeenCalledWith('/(tabs)');
    });
  });
});

describe('NavigationGuards', () => {
  describe('canAccessAdminFeatures', () => {
    it('should return true by default', () => {
      expect(NavigationGuards.canAccessAdminFeatures()).toBe(true);
    });
  });

  describe('canManageFamilyMembers', () => {
    it('should return true by default', () => {
      expect(NavigationGuards.canManageFamilyMembers()).toBe(true);
    });
  });

  describe('canCreateTasksForOthers', () => {
    it('should return true by default', () => {
      expect(NavigationGuards.canCreateTasksForOthers()).toBe(true);
    });
  });

  describe('canManageEvents', () => {
    it('should return true by default', () => {
      expect(NavigationGuards.canManageEvents()).toBe(true);
    });
  });
});
