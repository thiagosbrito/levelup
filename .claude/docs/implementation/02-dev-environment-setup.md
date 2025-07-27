# Development Environment Setup Guide

## 🎯 Objective

Set up a complete development environment for LevelUp Family app development, including backend services, development tools, and deployment pipeline.

## 📋 Prerequisites

### Required Software
- **Node.js**: Version 18.x or higher
- **npm**: Version 8.x or higher  
- **Git**: Latest version
- **VS Code**: Recommended IDE with extensions
- **Expo CLI**: Latest version (`npm install -g @expo/cli`)

### Platform-Specific Requirements

#### iOS Development (macOS only)
- **Xcode**: Latest version from App Store
- **iOS Simulator**: Included with Xcode
- **CocoaPods**: `sudo gem install cocoapods`

#### Android Development (All platforms)
- **Android Studio**: Latest version
- **Android SDK**: API Level 33+ 
- **Android Emulator**: Set up via Android Studio

## 🚀 Step-by-Step Setup

### Step 1: Backend Service Decision & Setup

#### Option A: Supabase (Recommended)

**Why Supabase:**
- PostgreSQL database with complex query support
- Built-in real-time subscriptions
- Integrated authentication with RBAC
- Cost-effective for MVP scaling
- Strong TypeScript support

**Setup Process:**
```bash
# 1. Create Supabase project at https://supabase.com
# 2. Note down your project URL and anon key
# 3. Install Supabase CLI
npm install -g supabase

# 4. Initialize Supabase in project
supabase init

# 5. Link to your project
supabase link --project-ref your-project-ref
```

**Environment Variables:**
```env
# .env.local
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### Option B: Firebase

**Why Firebase:**
- Google infrastructure and reliability
- Excellent real-time database
- Strong mobile SDK support
- Advanced analytics and monitoring

**Setup Process:**
```bash
# 1. Create Firebase project at https://console.firebase.google.com
# 2. Install Firebase CLI
npm install -g firebase-tools

# 3. Login and initialize
firebase login
firebase init

# 4. Configure Firestore and Authentication
# Enable Email/Password and Google Sign-in
```

**Environment Variables:**
```env
# .env.local
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### Step 2: Project Dependencies Installation

**Core Dependencies:**
```bash
# Authentication & Backend
npm install @supabase/supabase-js
# OR
npm install firebase

# State Management
npm install zustand
npm install @tanstack/react-query

# Form Handling & Validation
npm install react-hook-form
npm install zod
npm install @hookform/resolvers

# UI & Styling
npm install react-native-elements
npm install react-native-vector-icons
npm install react-native-paper

# Utilities
npm install date-fns
npm install lodash
npm install react-native-uuid

# Notifications
npm install expo-notifications
npm install expo-device
npm install expo-constants

# Camera & Media
npm install expo-image-picker
npm install expo-camera
npm install expo-media-library

# Sharing & Deep Linking
npm install expo-sharing
npm install expo-linking
npm install react-native-qrcode-svg

# Security
npm install expo-crypto
npm install expo-secure-store
npm install react-native-keychain
```

**Development Dependencies:**
```bash
# Testing
npm install --save-dev jest
npm install --save-dev @testing-library/react-native
npm install --save-dev @testing-library/jest-native
npm install --save-dev react-test-renderer

# Code Quality
npm install --save-dev eslint
npm install --save-dev prettier
npm install --save-dev @typescript-eslint/eslint-plugin
npm install --save-dev @typescript-eslint/parser

# Build Tools
npm install --save-dev @expo/webpack-config
npm install --save-dev babel-plugin-module-resolver
```

### Step 3: Development Tools Configuration

#### VS Code Extensions
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-jest",
    "expo.vscode-expo-tools",
    "ms-vscode.vscode-json"
  ]
}
```

#### ESLint Configuration
```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'expo',
    '@typescript-eslint/recommended',
    'prettier'
  ],
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    'react-hooks/exhaustive-deps': 'error'
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/no-shadow': ['error'],
        'no-shadow': 'off',
        'no-undef': 'off',
      },
    },
  ],
};
```

#### Prettier Configuration
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

#### TypeScript Configuration
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./components/*"],
      "@/hooks/*": ["./hooks/*"],
      "@/services/*": ["./services/*"],
      "@/store/*": ["./store/*"],
      "@/types/*": ["./types/*"],
      "@/utils/*": ["./utils/*"]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts"
  ]
}
```

### Step 4: Environment Configuration

#### Development Environments Setup

**Create Environment Files:**
```bash
# Development
.env.development.local

# Staging  
.env.staging.local

# Production
.env.production.local
```

**Environment Variable Structure:**
```env
# .env.development.local
NODE_ENV=development
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-dev-anon-key

# Analytics & Monitoring
EXPO_PUBLIC_ANALYTICS_ENABLED=false
EXPO_PUBLIC_CRASH_REPORTING_ENABLED=false

# Feature Flags
EXPO_PUBLIC_GIFT_CARDS_ENABLED=true
EXPO_PUBLIC_ACHIEVEMENTS_ENABLED=true
EXPO_PUBLIC_FAMILY_GOALS_ENABLED=false

# External APIs
TREMENDOUS_API_KEY=your-tremendous-test-key
TREMENDOUS_API_SECRET=your-tremendous-test-secret
TREMENDOUS_ENVIRONMENT=testflight

# Security
JWT_SECRET=your-development-jwt-secret
ENCRYPTION_KEY=your-development-encryption-key
```

#### Secrets Management
```bash
# Install EAS CLI for secure secret management
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Set secrets for each environment
eas secret:create --scope project --name SUPABASE_SERVICE_ROLE_KEY --value your-secret
eas secret:create --scope project --name TREMENDOUS_API_SECRET --value your-secret
```

### Step 5: Database Setup

#### Supabase Database Setup
```sql
-- Run these commands in Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE family_role AS ENUM ('parent', 'child', 'guardian');
CREATE TYPE member_status AS ENUM ('active', 'inactive', 'pending', 'suspended');
CREATE TYPE task_status AS ENUM ('active', 'completed', 'expired', 'cancelled');
CREATE TYPE task_difficulty AS ENUM ('easy', 'medium', 'hard', 'epic');

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
```

#### Database Migrations Setup
```bash
# Create migrations directory
mkdir -p supabase/migrations

# Generate migration files
supabase db diff --file initial_schema
```

### Step 6: CI/CD Pipeline Setup

#### GitHub Actions Configuration
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
        
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run linting
        run: npm run lint
        
      - name: Run type checking
        run: npm run type-check
        
      - name: Run tests
        run: npm test -- --coverage
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
        
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Setup EAS
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
          
      - name: Build for development
        if: github.ref == 'refs/heads/develop'
        run: eas build --platform all --profile development --non-interactive
        
      - name: Build for production
        if: github.ref == 'refs/heads/main'
        run: eas build --platform all --profile production --non-interactive
```

#### EAS Build Configuration
```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "NODE_ENV": "development"
      }
    },
    "preview": {
      "distribution": "internal",
      "env": {
        "NODE_ENV": "staging"
      }
    },
    "production": {
      "env": {
        "NODE_ENV": "production"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### Step 7: Development Scripts

#### Package.json Scripts
```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    
    "build:development": "eas build --profile development",
    "build:preview": "eas build --profile preview", 
    "build:production": "eas build --profile production",
    
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
    "lint:fix": "eslint . --ext .ts,.tsx,.js,.jsx --fix",
    "type-check": "tsc --noEmit",
    
    "db:generate-types": "supabase gen types typescript --local > types/database.ts",
    "db:reset": "supabase db reset",
    "db:migrate": "supabase db push",
    
    "clean": "expo r -c",
    "clean:deps": "rm -rf node_modules && npm install"
  }
}
```

### Step 8: Local Development Setup

#### Development Server Setup
```bash
# Start Supabase local development
supabase start

# Start Expo development server
npm start

# Start with specific platform
npm run ios     # iOS Simulator
npm run android # Android Emulator  
npm run web     # Web browser
```

#### Hot Reload Configuration
```javascript
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable Fast Refresh
config.resolver.unstable_enableSymlinks = true;

// Add path aliases
config.resolver.alias = {
  '@': './src',
  '@/components': './components',
  '@/hooks': './hooks',
  '@/services': './services',
  '@/store': './store',
  '@/types': './types',
  '@/utils': './utils',
};

module.exports = config;
```

### Step 9: Testing Setup

#### Jest Configuration
```javascript
// jest.config.js
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: [
    '@testing-library/jest-native/extend-expect',
    '<rootDir>/jest.setup.js'
  ],
  testMatch: [
    '**/__tests__/**/*.(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)'
  ],
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/coverage/**',
    '!**/node_modules/**',
    '!**/.expo/**',
    '!**/dist/**'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/hooks/(.*)$': '<rootDir>/hooks/$1',
    '^@/services/(.*)$': '<rootDir>/services/$1',
    '^@/store/(.*)$': '<rootDir>/store/$1',
    '^@/types/(.*)$': '<rootDir>/types/$1',
    '^@/utils/(.*)$': '<rootDir>/utils/$1'
  }
};
```

#### Test Setup File
```javascript
// jest.setup.js
import 'react-native-gesture-handler/jestSetup';

// Mock native modules
jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: 'MaterialIcons',
  FontAwesome: 'FontAwesome',
}));

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
}));

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    })),
  })),
}));

// Global test utilities
global.fetch = jest.fn();
global.__DEV__ = true;
```

## ✅ Verification Checklist

### Environment Setup
- [ ] Node.js and npm installed and working
- [ ] Expo CLI installed globally
- [ ] Platform development tools installed (Xcode/Android Studio)
- [ ] VS Code with recommended extensions

### Backend Configuration  
- [ ] Backend service (Supabase/Firebase) project created
- [ ] Database schema deployed
- [ ] Authentication configured
- [ ] Environment variables set for all environments

### Project Configuration
- [ ] All dependencies installed successfully
- [ ] TypeScript compilation working
- [ ] ESLint and Prettier configured
- [ ] Path aliases working correctly

### Development Workflow
- [ ] App starts successfully on all platforms
- [ ] Hot reload working
- [ ] Basic navigation functional
- [ ] Database connection established

### CI/CD Pipeline
- [ ] GitHub Actions workflow configured
- [ ] EAS build configuration complete
- [ ] Environment secrets properly managed
- [ ] Test pipeline running successfully

### Testing Infrastructure
- [ ] Jest configuration complete
- [ ] Test files can be run successfully
- [ ] Coverage reporting working
- [ ] Mock setup functioning

## 🚨 Common Issues & Solutions

### Metro Bundler Issues
**Problem**: Metro bundler cache issues
**Solution**: `npx expo start --clear` or `npm run clean`

### TypeScript Path Issues
**Problem**: Path aliases not resolving
**Solution**: Verify `tsconfig.json` paths and `metro.config.js` aliases match

### iOS Simulator Issues
**Problem**: iOS Simulator not starting
**Solution**: Reset simulator: Device → Erase All Content and Settings

### Android Emulator Issues
**Problem**: Android emulator performance
**Solution**: Increase RAM allocation in AVD Manager, enable hardware acceleration

### Supabase Connection Issues
**Problem**: Unable to connect to Supabase
**Solution**: Verify API keys, check network settings, validate RLS policies

### Environment Variable Issues
**Problem**: Environment variables not loading
**Solution**: Restart development server, verify `.env` file format, check `EXPO_PUBLIC_` prefix

This setup guide provides a complete foundation for LevelUp Family app development. Following these steps ensures a robust, scalable development environment ready for implementing the application features.