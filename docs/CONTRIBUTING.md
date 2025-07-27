# Contributing to LevelUp Family MVP

## Getting Started

### Prerequisites
- Node.js 20.x or later
- npm or yarn
- Expo CLI
- iOS Simulator (macOS) or Android Studio
- Git

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd levelup
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   ```bash
   npm run ios     # iOS Simulator
   npm run android # Android Emulator
   npm run web     # Web browser
   ```

## Development Workflow

### Branch Strategy
- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - Feature development branches
- `hotfix/*` - Critical production fixes

### Commit Convention
We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

feat(auth): add user login functionality
fix(navigation): resolve deep linking issues
docs(readme): update installation instructions
test(utils): add navigation helper tests
```

Types: `feat`, `fix`, `docs`, `test`, `refactor`, `style`, `chore`

### Code Quality

#### Before Committing
- All tests must pass: `npm test`
- Code must pass linting: `npm run lint`
- TypeScript must compile: `npm run type-check`
- Coverage must meet threshold (70%)

#### Pre-commit Hooks
Git hooks automatically run:
- ESLint
- TypeScript check
- Prettier formatting
- Test suite (affected files)

### Testing

#### Running Tests
```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Generate coverage report
npm run test:ci          # CI mode (no watch)
```

#### Writing Tests
- Place test files next to source files with `.test.ts` or `.test.tsx` extension
- Use React Native Testing Library for component tests
- Mock external dependencies
- Aim for 70%+ code coverage

#### Test Structure
```typescript
describe('ComponentName', () => {
  beforeEach(() => {
    // Setup
  });

  it('should render correctly', () => {
    // Test implementation
  });

  it('should handle user interaction', () => {
    // Test implementation
  });
});
```

### File Structure
```
app/                    # App screens and layouts
components/            # Reusable UI components
  ui/                 # Platform-specific components
constants/            # App constants
hooks/               # Custom React hooks
utils/              # Utility functions
__tests__/          # Test files
```

### Component Guidelines

#### Component Structure
```typescript
interface Props {
  // Define prop types
}

export function ComponentName({ prop1, prop2 }: Props) {
  // Component implementation
}
```

#### Styling
- Use themed colors from `constants/Colors.ts`
- Follow platform design guidelines
- Use `ThemedText` and `ThemedView` for consistent theming

### Navigation

#### Adding New Screens
1. Create screen component in `app/` directory
2. Follow Expo Router file-based routing
3. Add navigation types if needed
4. Update navigation tests

#### Navigation Patterns
```typescript
// Navigate to screen
router.push('/profile');

// Navigate with parameters
router.push('/family/123');

// Replace current screen
router.replace('/login');
```

### State Management
- Use React hooks for local state
- Context API for shared state
- Consider Zustand for complex state

### API Integration
- Create service files in `services/` directory
- Use proper TypeScript types
- Handle loading and error states
- Write integration tests

### Debugging

#### Development Tools
- Expo DevTools
- React Native Debugger
- Flipper (for advanced debugging)

#### Common Issues
- Metro bundler cache: `npx expo start --clear`
- iOS Simulator issues: Reset simulator
- Android emulator: Check AVD configuration

### Deployment

#### Staging
Automatic deployment to staging channel on `develop` branch merge.

#### Production
1. Create release branch from `develop`
2. Update version in `package.json` and `app.json`
3. Merge to `main` via Pull Request
4. Automatic deployment to production

#### Manual Deployment
```bash
# Staging
npx expo publish --release-channel staging

# Production
npx expo publish --release-channel production
```

### Code Review Guidelines

#### Before Requesting Review
- [ ] All tests pass
- [ ] Code is properly documented
- [ ] No console.log statements
- [ ] TypeScript errors resolved
- [ ] Accessibility considerations addressed

#### Review Checklist
- [ ] Code follows project conventions
- [ ] Tests cover new functionality
- [ ] Performance implications considered
- [ ] Security best practices followed
- [ ] Mobile-specific considerations addressed

### Getting Help
- Check existing issues and documentation
- Ask questions in team chat
- Pair programming sessions available
- Regular code review sessions

### Resources
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Router Documentation](https://expo.github.io/router/)
- [Testing Library Documentation](https://testing-library.com/docs/react-native-testing-library/intro)
