# Testing Guide

## Overview
This guide covers testing practices for the LevelUp Family MVP React Native application using Jest and React Native Testing Library.

## Testing Philosophy
- **Test behavior, not implementation**
- **Write tests that give confidence**
- **Keep tests simple and focused**
- **Mock external dependencies**
- **Maintain good test coverage (70%+)**

## Test Types

### Unit Tests
Test individual functions, hooks, and utilities in isolation.

```typescript
// utils/formatDate.test.ts
import { formatDate } from './formatDate';

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2024-01-15');
    expect(formatDate(date)).toBe('Jan 15, 2024');
  });
});
```

### Component Tests
Test React components using React Native Testing Library.

```typescript
// components/Button.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from './Button';

describe('Button', () => {
  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button onPress={onPress}>Click me</Button>
    );
    
    fireEvent.press(getByText('Click me'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

### Integration Tests
Test component interactions and navigation flows.

```typescript
// __tests__/navigation.integration.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import App from '../App';

describe('Navigation Integration', () => {
  it('should navigate between tabs', () => {
    const { getByText } = render(
      <NavigationContainer>
        <App />
      </NavigationContainer>
    );
    
    fireEvent.press(getByText('Family'));
    expect(getByText('Family Screen')).toBeTruthy();
  });
});
```

## Testing Utilities

### Custom Render
Use the custom render function from `test-utils.tsx`:

```typescript
import { renderWithProviders } from '../test-utils';

test('component with providers', () => {
  const { getByText } = renderWithProviders(<MyComponent />);
  // Test implementation
});
```

### Common Mocks
Common mocks are set up in `jest.setup.js`:

```typescript
// Navigation mocks
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));

// Expo mocks
jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      name: 'test-app',
    },
  },
}));
```

## Testing Patterns

### Testing Hooks
```typescript
import { renderHook, act } from '@testing-library/react-native';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('should increment counter', () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });
});
```

### Testing Async Operations
```typescript
import { waitFor } from '@testing-library/react-native';

test('async data loading', async () => {
  const { getByText, queryByText } = render(<DataComponent />);
  
  expect(getByText('Loading...')).toBeTruthy();
  
  await waitFor(() => {
    expect(queryByText('Loading...')).toBeNull();
  });
  
  expect(getByText('Data loaded')).toBeTruthy();
});
```

### Testing Navigation
```typescript
import { router } from 'expo-router';

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

test('navigation on button press', () => {
  const { getByText } = render(<NavigationComponent />);
  
  fireEvent.press(getByText('Go to Profile'));
  
  expect(router.push).toHaveBeenCalledWith('/profile');
});
```

### Testing Forms
```typescript
test('form submission', () => {
  const onSubmit = jest.fn();
  const { getByPlaceholderText, getByText } = render(
    <LoginForm onSubmit={onSubmit} />
  );
  
  fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
  fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
  fireEvent.press(getByText('Login'));
  
  expect(onSubmit).toHaveBeenCalledWith({
    email: 'test@example.com',
    password: 'password123',
  });
});
```

### Testing Error States
```typescript
test('error handling', async () => {
  const mockFetch = jest.spyOn(global, 'fetch').mockRejectedValue(
    new Error('Network error')
  );
  
  const { getByText } = render(<ApiComponent />);
  
  await waitFor(() => {
    expect(getByText('Error: Network error')).toBeTruthy();
  });
  
  mockFetch.mockRestore();
});
```

## Accessibility Testing
```typescript
test('accessibility', () => {
  const { getByRole } = render(<Button>Submit</Button>);
  
  const button = getByRole('button');
  expect(button).toHaveAccessibilityState({ disabled: false });
  expect(button).toHaveAccessibilityLabel('Submit');
});
```

## Performance Testing
```typescript
test('component performance', () => {
  const { rerender } = render(<ExpensiveComponent data={[]} />);
  
  const start = performance.now();
  rerender(<ExpensiveComponent data={largeDataSet} />);
  const end = performance.now();
  
  expect(end - start).toBeLessThan(100); // Should render in < 100ms
});
```

## Snapshot Testing
```typescript
test('component snapshot', () => {
  const tree = render(<MyComponent prop="value" />).toJSON();
  expect(tree).toMatchSnapshot();
});
```

## Best Practices

### Do's
- ✅ Test user interactions and behavior
- ✅ Use descriptive test names
- ✅ Mock external dependencies
- ✅ Test error states
- ✅ Use `data-testid` for complex queries
- ✅ Test accessibility
- ✅ Keep tests focused and independent

### Don'ts
- ❌ Test implementation details
- ❌ Write tests that are too brittle
- ❌ Mock everything
- ❌ Ignore test failures
- ❌ Write tests without assertions
- ❌ Test library code

### Test Naming
```typescript
// Good
describe('UserProfile', () => {
  it('should display user name when logged in', () => {});
  it('should show login prompt when not authenticated', () => {});
  it('should handle profile update successfully', () => {});
});

// Bad
describe('UserProfile', () => {
  it('test 1', () => {});
  it('should work', () => {});
  it('profile test', () => {});
});
```

### Test Organization
```
__tests__/
  components/
    Button.test.tsx
    UserProfile.test.tsx
  utils/
    formatDate.test.ts
    validation.test.ts
  integration/
    navigation.test.tsx
    auth-flow.test.tsx
```

## Coverage Goals
- **Lines**: 15% (starting baseline, to be increased gradually)
- **Functions**: 15% (starting baseline, to be increased gradually)
- **Branches**: 15% (starting baseline, to be increased gradually)
- **Statements**: 15% (starting baseline, to be increased gradually)

**Note**: Coverage thresholds start low to allow development velocity and will be increased gradually as the codebase matures and test coverage improves organically.

## Running Tests

### Commands
```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Generate coverage report
npm run test:ci          # CI mode
npm run test:update      # Update snapshots
```

### Coverage Report
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

## Debugging Tests

### Debug Mode
```bash
npm test -- --verbose
npm test -- --detectOpenHandles
npm test -- --forceExit
```

### VS Code Debugging
1. Install Jest extension
2. Set breakpoints in test files
3. Run "Debug Jest Tests" command

### Console Output
```typescript
test('debug test', () => {
  const component = render(<MyComponent />);
  console.log(component.debug()); // Prints component tree
});
```

## Continuous Integration

Tests run automatically on:
- Every push to feature branches
- Pull requests to `develop` or `main`
- Scheduled nightly runs

### CI Configuration
```yaml
# .github/workflows/ci-cd.yml
- name: Run tests
  run: npm run test:ci
  
- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/lcov.info
```

## Resources
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://testing-library.com/docs/react-native-testing-library/intro)
- [Testing Best Practices](https://kentcdodds.com/blog/write-tests)
- [Expo Testing Guide](https://docs.expo.dev/testing/overview/)
