/**
 * RegisterParentForm Component Test
 * 
 * Tests user interactions and behavior for the parent registration form.
 * Focuses on what users see and how the UI responds to their actions.
 */

import React from 'react';
import { router } from 'expo-router';
import { render, fireEvent, waitFor, screen , createMockAuthResponse, createMockUser } from '../test-utils';
import { RegisterParentForm } from '../../components/auth/RegisterParentForm';

// Mock dependencies
const mockRegisterParent = jest.fn();

jest.mock('../../hooks/useAuth', () => ({
  useAuth: jest.fn(() => ({
    registerParent: mockRegisterParent,
  })),
}));

// Mock Alert at module level
const { Alert } = require('react-native');
Alert.alert = jest.fn();

describe('RegisterParentForm', () => {
  const mockRouter = router as jest.Mocked<typeof router>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter.push = jest.fn();
  });

  describe('Form Validation', () => {
    it('shows error when email is invalid', async () => {
      const { getByPlaceholderText, getByText } = render(<RegisterParentForm onSwitchToLogin={jest.fn()} />);

      // Fill all required fields but make email invalid
      fireEvent.changeText(getByPlaceholderText('Enter your email address'), 'invalid-email');
      fireEvent.changeText(getByPlaceholderText('Create a strong password'), 'Password123!');
      fireEvent.changeText(getByPlaceholderText('Confirm your password'), 'Password123!');
      fireEvent.changeText(getByPlaceholderText('How should we display your name?'), 'Test User');
      fireEvent.press(getByText('I accept the Terms of Service'));
      fireEvent.press(getByText('I accept the Privacy Policy'));
      fireEvent.press(getByText('Create Account'));

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeTruthy();
      });
    });

    it('shows error when passwords do not match', async () => {
      const { getByPlaceholderText, getByText } = render(<RegisterParentForm onSwitchToLogin={jest.fn()} />);

      // Fill all required fields but make passwords not match
      fireEvent.changeText(getByPlaceholderText('Enter your email address'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Create a strong password'), 'Password123!');
      fireEvent.changeText(getByPlaceholderText('Confirm your password'), 'DifferentPassword123!');
      fireEvent.changeText(getByPlaceholderText('How should we display your name?'), 'Test User');
      fireEvent.press(getByText('I accept the Terms of Service'));
      fireEvent.press(getByText('I accept the Privacy Policy'));
      fireEvent.press(getByText('Create Account'));

      await waitFor(() => {
        expect(screen.getByText("Passwords don't match")).toBeTruthy();
      });
    });

    it('shows error when terms are not accepted', async () => {
      const { getByPlaceholderText, getByText } = render(<RegisterParentForm onSwitchToLogin={jest.fn()} />);

      // Fill all fields but don't accept terms
      fireEvent.changeText(getByPlaceholderText('Enter your email address'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Create a strong password'), 'Password123!');
      fireEvent.changeText(getByPlaceholderText('Confirm your password'), 'Password123!');
      fireEvent.changeText(getByPlaceholderText('How should we display your name?'), 'Test User');
      fireEvent.press(getByText('I accept the Privacy Policy'));
      // Don't accept terms of service
      fireEvent.press(getByText('Create Account'));

      await waitFor(() => {
        expect(screen.getByText('You must accept the terms of service')).toBeTruthy();
      });
    });
  });

  describe('Successful Registration', () => {
    it('redirects to email confirmation on successful registration', async () => {
      mockRegisterParent.mockResolvedValue(
        createMockAuthResponse(true, createMockUser(), null)
      );

      const { getByPlaceholderText, getByText } = render(<RegisterParentForm onSwitchToLogin={jest.fn()} />);

      // Fill valid form
      fireEvent.changeText(getByPlaceholderText('Enter your email address'), 'parent@test.com');
      fireEvent.changeText(getByPlaceholderText('Create a strong password'), 'SecurePass123!');
      fireEvent.changeText(getByPlaceholderText('Confirm your password'), 'SecurePass123!');
      fireEvent.changeText(getByPlaceholderText('How should we display your name?'), 'Test Parent');
      fireEvent.press(getByText('I accept the Terms of Service'));
      fireEvent.press(getByText('I accept the Privacy Policy'));

      fireEvent.press(getByText('Create Account'));

      await waitFor(() => {
        expect(mockRegisterParent).toHaveBeenCalledWith({
          email: 'parent@test.com',
          password: 'SecurePass123!',
          confirmPassword: 'SecurePass123!',
          displayName: 'Test Parent',
          termsAccepted: true,
          privacyPolicyAccepted: true,
          marketingOptIn: false,
        });
      });

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/(auth)/confirm-email');
      });
    });
  });

  describe('Registration Errors', () => {
    it('shows alert when registration fails', async () => {
      mockRegisterParent.mockResolvedValue(
        createMockAuthResponse(false, null, 'Email already exists')
      );

      const { getByPlaceholderText, getByText } = render(<RegisterParentForm onSwitchToLogin={jest.fn()} />);

      // Fill valid form
      fireEvent.changeText(getByPlaceholderText('Enter your email address'), 'existing@test.com');
      fireEvent.changeText(getByPlaceholderText('Create a strong password'), 'SecurePass123!');
      fireEvent.changeText(getByPlaceholderText('Confirm your password'), 'SecurePass123!');
      fireEvent.changeText(getByPlaceholderText('How should we display your name?'), 'Test Parent');
      fireEvent.press(getByText('I accept the Terms of Service'));
      fireEvent.press(getByText('I accept the Privacy Policy'));

      fireEvent.press(getByText('Create Account'));

      // First verify that registerParent was called
      await waitFor(() => {
        expect(mockRegisterParent).toHaveBeenCalledWith({
          email: 'existing@test.com',
          password: 'SecurePass123!',
          confirmPassword: 'SecurePass123!',
          displayName: 'Test Parent',
          termsAccepted: true,
          privacyPolicyAccepted: true,
          marketingOptIn: false,
        });
      });

      // Then check that the alert was shown
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Registration Failed',
          'Email already exists'
        );
      });

      expect(mockRouter.push).not.toHaveBeenCalled();
    });
  });

  describe('UI State During Registration', () => {
    it('shows loading indicator during submission', async () => {
      // Mock a slow response
      mockRegisterParent.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => 
          resolve(createMockAuthResponse(true, createMockUser(), null)), 100
        ))
      );

      const { getByPlaceholderText, getByText, UNSAFE_getByType } = render(<RegisterParentForm onSwitchToLogin={jest.fn()} />);

      // Fill form
      fireEvent.changeText(getByPlaceholderText('Enter your email address'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Create a strong password'), 'SecurePass123!');
      fireEvent.changeText(getByPlaceholderText('Confirm your password'), 'SecurePass123!');
      fireEvent.changeText(getByPlaceholderText('How should we display your name?'), 'Test User');
      fireEvent.press(getByText('I accept the Terms of Service'));
      fireEvent.press(getByText('I accept the Privacy Policy'));

      fireEvent.press(getByText('Create Account'));

      // Should show ActivityIndicator while loading
      await waitFor(() => {
        expect(UNSAFE_getByType(require('react-native').ActivityIndicator)).toBeTruthy();
      });
    });
  });
});