/**
 * CreateFamilyScreen Component Test
 * 
 * Tests user interactions and behavior for the family creation screen.
 * Focuses on what users see and how they can create their family.
 */

import React from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { render, fireEvent, waitFor, screen , createMockAuthResponse } from '../test-utils';
import CreateFamilyScreen from '../../app/(auth)/create-family';

// Mock dependencies
const mockCreateFamily = jest.fn();

jest.mock('../../hooks/useAuth', () => ({
  useAuth: jest.fn(() => ({
    createFamily: mockCreateFamily,
  })),
}));

// Mock Alert
Alert.alert = jest.fn();

describe('CreateFamilyScreen', () => {
  const mockRouter = router as jest.Mocked<typeof router>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter.replace = jest.fn();
    // Ensure Alert mock is properly reset
    (Alert.alert as jest.Mock).mockClear();
  });

  afterEach(() => {
    // Clean up any pending timers only if fake timers are being used
    try {
      if (jest.isMockFunction(setTimeout)) {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
      }
    } catch (e) {
      // Ignore timer cleanup errors
    }
  });

  describe('Screen Content', () => {
    it('displays correct title and subtitle', () => {
      const { getByText } = render(<CreateFamilyScreen />);

      expect(getByText('Create Your Family')).toBeTruthy();
      expect(getByText(/Set up your family space to start managing tasks/)).toBeTruthy();
    });

    it('renders family creation form', () => {
      const { getByTestId } = render(<CreateFamilyScreen />);

      expect(getByTestId('family-name-input')).toBeTruthy();
      expect(getByTestId('family-description-input')).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    it('shows error when family name is empty', async () => {
      const { getByText } = render(<CreateFamilyScreen />);

      fireEvent.press(getByText('Create My Family'));

      await waitFor(() => {
        expect(screen.getByText(/Family name is required/)).toBeTruthy();
      });

      expect(mockCreateFamily).not.toHaveBeenCalled();
    });

    it('allows optional family description', async () => {
      const mockFamily = { id: 'family-123', name: 'Test Family' };
      mockCreateFamily.mockResolvedValue(
        createMockAuthResponse(true, mockFamily, null)
      );

      const { getByTestId, getByText } = render(<CreateFamilyScreen />);

      // Only provide family name, leave description empty
      fireEvent.changeText(getByTestId('family-name-input'), 'The Smith Family');
      fireEvent.press(getByText('Create My Family'));

      await waitFor(() => {
        expect(mockCreateFamily).toHaveBeenCalledWith({
          familyName: 'The Smith Family',
          familyDescription: '',
          currency: 'USD',
          timezone: expect.any(String),
        });
      });
    });
  });

  describe('Successful Family Creation', () => {
    it('creates family and redirects to main app', async () => {
      const mockFamily = { id: 'family-123', name: 'Test Family', family_code: 'ABC123' };
      mockCreateFamily.mockResolvedValue(
        createMockAuthResponse(true, mockFamily, null)
      );

      const { getByTestId, getByText } = render(<CreateFamilyScreen />);

      // Fill form
      fireEvent.changeText(getByTestId('family-name-input'), 'The Johnson Family');
      fireEvent.changeText(getByTestId('family-description-input'), 'Our awesome family');

      fireEvent.press(getByText('Create My Family'));

      await waitFor(() => {
        expect(mockCreateFamily).toHaveBeenCalledWith({
          familyName: 'The Johnson Family',
          familyDescription: 'Our awesome family',
          currency: 'USD',
          timezone: expect.any(String),
        });
      });

      // The Alert should be called first, then we need to trigger the onPress callback
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Family Created!',
          expect.stringContaining('ABC123'),
          expect.any(Array)
        );
      });

      // Simulate pressing the "Get Started" button in the alert
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const getStartedButton = alertCall[2][0]; // First button in the array
      getStartedButton.onPress();

      expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)');
    });
  });

  describe('Family Creation Errors', () => {
    it('shows alert when family creation fails', async () => {
      mockCreateFamily.mockResolvedValue(
        createMockAuthResponse(false, null, 'Failed to create family')
      );

      const { getByTestId, getByText } = render(<CreateFamilyScreen />);

      fireEvent.changeText(getByTestId('family-name-input'), 'Test Family');
      fireEvent.press(getByText('Create My Family'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Creation Failed',
          'Failed to create family'
        );
      });

      expect(mockRouter.replace).not.toHaveBeenCalled();
    });
  });

  describe('UI State During Creation', () => {
    it('shows loading state during family creation', async () => {
      // Mock slow response
      const slowPromise = new Promise(resolve => setTimeout(() => 
        resolve(createMockAuthResponse(true, { id: 'family-123' }, null)), 100
      ));
      mockCreateFamily.mockImplementation(() => slowPromise);

      const { getByTestId, getByText } = render(<CreateFamilyScreen />);

      fireEvent.changeText(getByTestId('family-name-input'), 'Test Family');

      const createButton = getByText('Create My Family');
      fireEvent.press(createButton);

      // Should show loading state with ActivityIndicator
      await waitFor(() => {
        expect(screen.UNSAFE_getByType(require('react-native').ActivityIndicator)).toBeTruthy();
      });

      // Wait for the async operation to complete to avoid teardown issues
      await slowPromise;
    });
  });
});