/**
 * ConfirmEmailScreen Component Test
 * 
 * Tests user interactions and behavior for the email confirmation screen.
 * Focuses on what users see and how they can interact with the screen.
 */

import React from 'react';
import { router } from 'expo-router';
import { render, fireEvent } from '../test-utils';
import ConfirmEmailScreen from '../../app/(auth)/confirm-email';

// Mock dependencies
jest.mock('expo-linking', () => ({
  openURL: jest.fn(),
}));


describe('ConfirmEmailScreen', () => {
  const mockRouter = router as jest.Mocked<typeof router>;
  const mockLinking = require('expo-linking');

  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter.back = jest.fn();
    global.Alert.alert = jest.fn();
    global.Linking.openURL = jest.fn();
  });

  describe('Screen Content', () => {
    it('displays correct messaging about email confirmation', () => {
      const { getByText } = render(<ConfirmEmailScreen />);

      expect(getByText('Check Your Email')).toBeTruthy();
      expect(getByText(/We sent you a confirmation link/)).toBeTruthy();
      expect(getByText(/Please check your email and click the link/)).toBeTruthy();
    });

    it('shows email icon', () => {
      const { getByText } = render(<ConfirmEmailScreen />);
      
      expect(getByText('📧')).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('navigates back when back button is pressed', () => {
      const { getByText } = render(<ConfirmEmailScreen />);

      fireEvent.press(getByText('← Back to Sign Up'));

      expect(mockRouter.back).toHaveBeenCalled();
    });

    // TODO: Add tests for email app opening and resend email functionality
    // These require proper function mocking which will be implemented later
  });

  describe('Button Visibility', () => {
    it('displays all action buttons', () => {
      const { getByText } = render(<ConfirmEmailScreen />);

      expect(getByText('Open Email App')).toBeTruthy();
      expect(getByText('Resend Email')).toBeTruthy();
      expect(getByText('← Back to Sign Up')).toBeTruthy();
    });
  });
});