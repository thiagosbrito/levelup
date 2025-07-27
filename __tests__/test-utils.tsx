import { DefaultTheme, NavigationContainer, ThemeProvider } from '@react-navigation/native';
import { render, RenderOptions } from '@testing-library/react-native';
import React, { ReactElement } from 'react';
import { AuthProvider } from '../contexts/AuthContext';

// All providers wrapper
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <NavigationContainer>
      <ThemeProvider value={DefaultTheme}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </NavigationContainer>
  );
};

// Custom render function
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Custom render without providers (for isolated component testing)
export const renderWithoutProviders = (
  ui: ReactElement,
  options?: RenderOptions,
) => render(ui, options);

// Re-export everything
export * from '@testing-library/react-native';

// Override render method
export { customRender as render };

// Test data factories
export const createMockUser = (overrides = {}) => ({
  id: 'user-123',
  email: 'test@example.com',
  display_name: 'Test User',
  first_name: 'Test',
  last_name: 'User',
  avatar_url: null,
  age_group: 'adult',
  total_points: 100,
  level: 1,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createMockFamily = (overrides = {}) => ({
  id: 'family-123',
  name: 'Test Family',
  description: 'A test family',
  family_code: 'ABC123',
  created_by: 'user-123',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createMockAuthResponse = (success = true, data: any = null, error: string | null = null) => ({
  success,
  data,
  error,
});

export const createMockSessionData = (overrides = {}) => ({
  user: createMockUser(),
  session: { access_token: 'mock-token' },
  family: createMockFamily(),
  familyRole: 'parent',
  ...overrides,
});

// Wait for navigation
export const waitForNavigation = () => new Promise(resolve => setTimeout(resolve, 0));