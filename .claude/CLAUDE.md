# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**LevelUp Family** is a cross-platform gamification app that transforms family task management into an engaging experience. Parents create tasks for children, who earn coins by completing them and can redeem those coins for real gift cards (Steam, Xbox, PlayStation, Amazon) or custom family rewards.

### Core Concept
- **Parents**: Create tasks, set rewards, verify completions, manage family settings
- **Children**: Complete tasks, earn coins/XP, level up, unlock achievements, redeem rewards
- **Gamification**: Comprehensive system with coins, XP, levels, badges, streaks, and achievements
- **Real Rewards**: Integration with gift card APIs (Tremendous/Rybbon) for actual redemptions

### Target MVP Features
- Family creation and invitation system via shareable links
- Task creation, assignment, and completion workflows
- Coin-based reward system with real gift card redemption
- Gamification elements (XP, levels, achievements, streaks)
- Parent approval workflows and family management
- COPPA-compliant child account management

This is an Expo React Native application using modern development practices, designed for rapid MVP development and A/B testing capabilities.

## Development Commands

### Core Commands
- `npm install` - Install dependencies
- `npx expo start` - Start development server with platform selection
- `npm run android` - Start for Android specifically
- `npm run ios` - Start for iOS specifically  
- `npm run web` - Start for web specifically
- `npm run lint` - Run ESLint with Expo configuration
- `npm run reset-project` - Reset to blank starter (moves current app to app-example)

### Development Workflow
- Use `npx expo start` and select your platform (press `a` for Android, `i` for iOS, `w` for web)
- Development builds, simulators, and Expo Go are all supported
- Press `cmd+d` (iOS), `cmd+m` (Android), or `F12` (web) to open developer tools

## Architecture

### File-Based Routing (Expo Router)
- `app/_layout.tsx` - Root layout with theme provider and navigation stack
- `app/(tabs)/` - Tab-based navigation group
  - `_layout.tsx` - Tab bar configuration with icons and styling
  - `index.tsx` - Home screen (main tab)
  - `explore.tsx` - Explore screen (second tab)
- `app/+not-found.tsx` - 404/not found screen

### Component System
- **Themed Components**: `ThemedText` and `ThemedView` automatically adapt to light/dark mode
- **Component Library**: Located in `components/` with reusable UI elements
  - `ParallaxScrollView` - Scrollable container with parallax header
  - `HelloWave` - Animated wave component
  - `HapticTab` - Tab button with haptic feedback
  - `IconSymbol` - Platform-specific icon system
  - `TabBarBackground` - Platform-specific tab bar styling
- **Platform-Specific Components**: iOS variants use `.ios.tsx` extension

### Theming System
- **Colors**: Defined in `constants/Colors.ts` with light/dark variants
- **Theme Hook**: `useThemeColor` hook for accessing theme colors
- **Color Scheme**: `useColorScheme` hook detects system preference
- **Theme Provider**: React Navigation theme provider handles system-wide theming

### Project Structure
```
app/                 # Expo Router pages (file-based routing)
├── (tabs)/         # Tab group for main navigation
├── _layout.tsx     # Root layout
└── +not-found.tsx  # 404 page

components/         # Reusable UI components
├── ui/            # Platform-specific UI components
└── themed/        # Theme-aware components

constants/         # App constants and configuration
hooks/            # Custom React hooks
assets/           # Static assets (images, fonts)
```

## Tech Stack

### Frontend
- **Expo SDK ~53.0** with new architecture enabled
- **React 19** and **React Native 0.79**
- **Expo Router 5** for file-based navigation
- **TypeScript** with strict mode and path aliases (`@/*`)
- **Zustand** for state management
- **React Query** for server state management

### Backend & Database
- **Supabase** (PostgreSQL + Real-time + Auth + Storage)
- **Row Level Security (RLS)** for family data isolation
- **Real-time subscriptions** for live updates
- **Edge Functions** for custom business logic

### External Integrations
- **Tremendous API** (primary gift card provider)
- **Rybbon API** (secondary gift card provider)
- **Expo Notifications** for push notifications
- **Expo Sharing** for family invitation links

### Design System
- **Blue-centric color palette** with accessibility compliance
- **Age-appropriate UI scaling** (6-8, 9-12, 13-16, adults)
- **Gamification elements** with coins, XP, achievements
- **Custom animations** with React Native Reanimated 3

## Development Notes

- **Path Aliases**: Use `@/` prefix for imports (e.g., `@/components/ThemedText`)
- **Role-Based Navigation**: App adapts routing based on user role (parent/child/guardian)
- **Family Data Isolation**: All data queries scoped to family membership via RLS
- **COPPA Compliance**: Age verification and parental consent workflows implemented
- **Theme Awareness**: Blue-based design system with light/dark mode support
- **Type Safety**: Strict TypeScript with auto-generated Supabase types
- **Real-time Updates**: Live task completion, coin earnings, and family activity feeds

## Platform Configuration

- **iOS**: Supports tablets, uses blur effects in tab bar
- **Android**: Edge-to-edge enabled with adaptive icon
- **Web**: Static output with Metro bundler
- **Universal**: Automatic UI style detection and orientation locked to portrait