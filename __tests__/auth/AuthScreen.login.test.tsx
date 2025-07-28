/**
 * AuthScreen Login Flow Test
 * 
 * Tests user interactions for the login functionality in AuthScreen.
 * Focuses on login form behavior and user interactions.
 */

import React from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { render, fireEvent, waitFor, screen , createMockAuthResponse, createMockSessionData } from '../test-utils';
import AuthScreen from '../../app/(auth)/index';

// Mock dependencies
const mockSignIn = jest.fn();
const mockUseAuth = jest.fn();

jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock Alert
Alert.alert = jest.fn();

describe('AuthScreen - Login Flow', () => {
  const mockRouter = router as jest.Mocked<typeof router>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter.replace = jest.fn();
    // Ensure Alert mock is properly reset
    (Alert.alert as jest.Mock).mockClear();
    
    // Default mock for useAuth
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      family: null,
      familyRole: null,
      isLoading: false,
      signIn: mockSignIn,
      signOut: jest.fn(),
      resetPassword: jest.fn(),
      registerParent: jest.fn(),
      createFamily: jest.fn(),
    });
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

  describe('Login Form Interaction', () => {
    it('allows user to enter email and password', () => {
      const { getByTestId } = render(<AuthScreen />);

      // Should have login form inputs
      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');

      expect(emailInput.props.value).toBe('test@example.com');
      expect(passwordInput.props.value).toBe('password123');
    });

    it('shows login button', () => {
      const { getByText } = render(<AuthScreen />);
      
      expect(getByText('Sign In')).toBeTruthy();
    });
  });

  describe('Successful Login', () => {
    it('calls auth service and redirects on successful login', async () => {
      const mockSessionData = createMockSessionData();
      mockSignIn.mockResolvedValue(
        createMockAuthResponse(true, mockSessionData, null)
      );

      const { getByTestId, getByText } = render(<AuthScreen />);

      // Fill login form
      fireEvent.changeText(getByTestId('email-input'), 'parent@test.com');
      fireEvent.changeText(getByTestId('password-input'), 'SecurePass123!');

      // Submit login
      fireEvent.press(getByText('Sign In'));

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith({
          email: 'parent@test.com',
          password: 'SecurePass123!',
        });
      });

      // Login should be successful (no error alerts)
      expect(Alert.alert).not.toHaveBeenCalledWith(
        expect.stringContaining('Failed'),
        expect.any(String)
      );
    });
  });

  describe('Login Validation', () => {
    it('shows error for invalid email format', async () => {
      const { getByTestId, getByText } = render(<AuthScreen />);

      fireEvent.changeText(getByTestId('email-input'), 'invalid-email');
      fireEvent.changeText(getByTestId('password-input'), 'password123');
      fireEvent.press(getByText('Sign In'));

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeTruthy();
      });

      expect(mockSignIn).not.toHaveBeenCalled();
    });

    it('shows error for empty password', async () => {
      const { getByTestId, getByText } = render(<AuthScreen />);

      fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(getByTestId('password-input'), '');
      fireEvent.press(getByText('Sign In'));

      await waitFor(() => {
        expect(screen.getByText('Password is required')).toBeTruthy();
      });

      expect(mockSignIn).not.toHaveBeenCalled();
    });
  });

  describe('Login Errors', () => {
    it('shows alert when login fails', async () => {
      mockSignIn.mockResolvedValue(
        createMockAuthResponse(false, null, 'Invalid credentials')
      );

      const { getByTestId, getByText } = render(<AuthScreen />);

      fireEvent.changeText(getByTestId('email-input'), 'wrong@test.com');
      fireEvent.changeText(getByTestId('password-input'), 'wrongpassword');
      fireEvent.press(getByText('Sign In'));

      // Verify that signIn was called
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith({
          email: 'wrong@test.com',
          password: 'wrongpassword',
        });
      });

      // Then verify the alert was shown for the failed login  
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Login Failed',
          'Invalid credentials'
        );
      });
    });
  });

  describe('UI State During Login', () => {
    it('shows loading state during login attempt', async () => {
      // Mock slow login response
      const slowPromise = new Promise(resolve => setTimeout(() => 
        resolve(createMockAuthResponse(true, createMockSessionData(), null)), 100
      ));
      mockSignIn.mockImplementation(() => slowPromise);

      const { getByTestId, getByText } = render(<AuthScreen />);

      fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'password123');

      const signInButton = getByText('Sign In');
      fireEvent.press(signInButton);

      // Should show loading state with ActivityIndicator
      await waitFor(() => {
        expect(screen.UNSAFE_getByType(require('react-native').ActivityIndicator)).toBeTruthy();
      });

      // Wait for the async operation to complete to avoid teardown issues
      await slowPromise;
    });
  });
});