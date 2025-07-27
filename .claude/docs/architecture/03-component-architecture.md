# Component Architecture & File Structure

## Application Architecture

### Layered Architecture Pattern

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                   │
├─────────────────────────────────────────────────────────┤
│  Screens & Components | Navigation | Theme & Styling   │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│                   Application Layer                     │
├─────────────────────────────────────────────────────────┤
│   Hooks | Context | State Management | Business Logic   │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│                     Service Layer                       │
├─────────────────────────────────────────────────────────┤
│      API Clients | External Services | Data Access      │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│                     Infrastructure                      │
├─────────────────────────────────────────────────────────┤
│    Database | Authentication | Push Notifications       │
└─────────────────────────────────────────────────────────┘
```

## Project File Structure

```
levelup/
├── app/                              # Expo Router pages
│   ├── (auth)/                       # Authentication flow
│   │   ├── _layout.tsx              # Auth stack navigator
│   │   ├── login.tsx                # Login screen
│   │   ├── register.tsx             # Registration screen
│   │   ├── forgot-password.tsx      # Password reset
│   │   └── family-setup.tsx         # Family creation/joining
│   │
│   ├── (parent)/                     # Parent-only screens
│   │   ├── _layout.tsx              # Parent tabs
│   │   ├── dashboard.tsx            # Parent dashboard
│   │   ├── tasks/                   # Task management
│   │   │   ├── index.tsx           # Task list
│   │   │   ├── create.tsx          # Create task
│   │   │   └── [id].tsx            # Task details
│   │   ├── family/                  # Family management
│   │   │   ├── index.tsx           # Family overview
│   │   │   ├── members.tsx         # Manage members
│   │   │   ├── invite.tsx          # Invite new members
│   │   │   └── settings.tsx        # Family settings
│   │   ├── rewards/                 # Reward management
│   │   │   ├── index.tsx           # Reward catalog
│   │   │   ├── create.tsx          # Create custom reward
│   │   │   └── approvals.tsx       # Pending approvals
│   │   └── analytics.tsx           # Family analytics
│   │
│   ├── (child)/                     # Child-only screens
│   │   ├── _layout.tsx             # Child tabs
│   │   ├── home.tsx                # Child dashboard
│   │   ├── tasks/                  # Task views
│   │   │   ├── index.tsx          # Available tasks
│   │   │   ├── active.tsx         # Active tasks
│   │   │   ├── completed.tsx      # Completed tasks
│   │   │   └── [id].tsx           # Task completion
│   │   ├── rewards/               # Reward redemption
│   │   │   ├── index.tsx          # Browse rewards
│   │   │   ├── redeem.tsx         # Redemption flow
│   │   │   └── history.tsx        # Redemption history
│   │   ├── profile/               # Child profile & gamification
│   │   │   ├── index.tsx          # Profile overview
│   │   │   ├── achievements.tsx   # Achievements & badges
│   │   │   └── stats.tsx          # Progress statistics
│   │   └── wallet.tsx             # Coin balance & transactions
│   │
│   ├── (shared)/                   # Shared screens
│   │   ├── profile.tsx            # User profile editing
│   │   ├── notifications.tsx      # Notification center
│   │   └── settings.tsx           # App settings
│   │
│   ├── _layout.tsx                # Root layout
│   ├── index.tsx                  # Entry point/role detection
│   └── +not-found.tsx            # 404 page
│
├── components/                     # Reusable UI components
│   ├── ui/                        # Basic UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── Avatar.tsx
│   │   ├── Badge.tsx
│   │   ├── Progress.tsx
│   │   └── index.ts              # Barrel exports
│   │
│   ├── forms/                     # Form components
│   │   ├── TaskForm.tsx
│   │   ├── RewardForm.tsx
│   │   ├── ProfileForm.tsx
│   │   ├── FamilySettingsForm.tsx
│   │   └── index.ts
│   │
│   ├── lists/                     # List components
│   │   ├── TaskList.tsx
│   │   ├── RewardList.tsx
│   │   ├── TransactionList.tsx
│   │   ├── AchievementList.tsx
│   │   └── index.ts
│   │
│   ├── cards/                     # Card components
│   │   ├── TaskCard.tsx
│   │   ├── RewardCard.tsx
│   │   ├── MemberCard.tsx
│   │   ├── AchievementCard.tsx
│   │   └── index.ts
│   │
│   ├── gamification/              # Gamification components
│   │   ├── XPBar.tsx
│   │   ├── CoinDisplay.tsx
│   │   ├── LevelBadge.tsx
│   │   ├── StreakCounter.tsx
│   │   ├── AchievementBadge.tsx
│   │   └── index.ts
│   │
│   ├── navigation/                # Navigation components
│   │   ├── TabBar.tsx
│   │   ├── BackButton.tsx
│   │   ├── HeaderTitle.tsx
│   │   └── index.ts
│   │
│   └── themed/                    # Theme-aware components
│       ├── ThemedText.tsx
│       ├── ThemedView.tsx
│       ├── ThemedButton.tsx
│       └── index.ts
│
├── hooks/                         # Custom React hooks
│   ├── auth/
│   │   ├── useAuth.ts
│   │   ├── useUser.ts
│   │   └── useFamilyRole.ts
│   ├── data/
│   │   ├── useTasks.ts
│   │   ├── useRewards.ts
│   │   ├── useFamily.ts
│   │   ├── useTransactions.ts
│   │   └── useAchievements.ts
│   ├── ui/
│   │   ├── useTheme.ts
│   │   ├── useToast.ts
│   │   ├── useModal.ts
│   │   └── useCamera.ts
│   └── utils/
│       ├── useDebounce.ts
│       ├── useLocalStorage.ts
│       └── useNetworkStatus.ts
│
├── contexts/                      # React Context providers
│   ├── AuthContext.tsx
│   ├── FamilyContext.tsx
│   ├── ThemeContext.tsx
│   ├── NotificationContext.tsx
│   └── index.ts
│
├── services/                      # External service integrations
│   ├── api/                       # API client
│   │   ├── client.ts             # Base API client
│   │   ├── auth.ts               # Authentication API
│   │   ├── tasks.ts              # Tasks API
│   │   ├── rewards.ts            # Rewards API
│   │   ├── family.ts             # Family API
│   │   ├── gamification.ts       # Gamification API
│   │   └── index.ts
│   │
│   ├── storage/                   # Local storage
│   │   ├── secure.ts             # Secure storage (tokens)
│   │   ├── cache.ts              # App cache
│   │   └── offline.ts            # Offline data
│   │
│   ├── notifications/             # Push notifications
│   │   ├── expo-notifications.ts
│   │   ├── handlers.ts
│   │   └── permissions.ts
│   │
│   ├── giftcards/                # Gift card providers
│   │   ├── tremendous.ts
│   │   ├── rybbon.ts
│   │   └── index.ts
│   │
│   ├── analytics/                # Analytics and tracking
│   │   ├── expo-analytics.ts
│   │   ├── events.ts
│   │   └── tracking.ts
│   │
│   └── external/                 # Other external services
│       ├── camera.ts
│       ├── sharing.ts
│       └── deep-linking.ts
│
├── store/                        # State management (Zustand)
│   ├── authStore.ts
│   ├── familyStore.ts
│   ├── taskStore.ts
│   ├── rewardStore.ts
│   ├── gamificationStore.ts
│   ├── uiStore.ts
│   └── index.ts
│
├── utils/                        # Utility functions
│   ├── validation/               # Form validation
│   │   ├── schemas.ts           # Zod schemas
│   │   ├── rules.ts             # Validation rules
│   │   └── messages.ts          # Error messages
│   ├── formatting/               # Data formatting
│   │   ├── currency.ts
│   │   ├── dates.ts
│   │   ├── numbers.ts
│   │   └── text.ts
│   ├── constants/                # App constants
│   │   ├── coins.ts             # Coin values and rules
│   │   ├── levels.ts            # XP and level progression
│   │   ├── achievements.ts      # Achievement definitions
│   │   └── rewards.ts           # Default rewards
│   └── helpers/                  # Helper functions
│       ├── permissions.ts
│       ├── security.ts
│       ├── platform.ts
│       └── debug.ts
│
├── types/                        # TypeScript type definitions
│   ├── api.ts                   # API response types
│   ├── database.ts              # Database model types
│   ├── navigation.ts            # Navigation types
│   ├── gamification.ts          # Gamification types
│   ├── forms.ts                 # Form types
│   └── index.ts
│
├── constants/                    # App-wide constants
│   ├── Colors.ts                # Theme colors
│   ├── Layout.ts                # Layout constants
│   ├── Config.ts                # App configuration
│   └── index.ts
│
├── assets/                       # Static assets
│   ├── images/
│   │   ├── icons/               # App icons
│   │   ├── avatars/             # Default avatars
│   │   ├── badges/              # Achievement badges
│   │   └── rewards/             # Reward images
│   ├── fonts/                   # Custom fonts
│   ├── animations/              # Lottie animations
│   └── sounds/                  # Achievement sounds
│
└── docs/                        # Project documentation
    ├── README.md
    ├── architecture/
    ├── features/
    ├── implementation/
    ├── api/
    └── assets/
```

## Component Design Patterns

### 1. Container/Presenter Pattern

**Container Components** (Smart Components)
- Manage state and side effects
- Handle data fetching and business logic
- Pass data and callbacks to presenters

**Presenter Components** (Dumb Components)
- Focus on UI rendering
- Receive data via props
- Highly reusable and testable

Example:
```typescript
// Container
const TaskListContainer = () => {
  const { tasks, loading, refetch } = useTasks();
  const { completeTask } = useTaskActions();
  
  return (
    <TaskListPresenter
      tasks={tasks}
      loading={loading}
      onTaskComplete={completeTask}
      onRefresh={refetch}
    />
  );
};

// Presenter
const TaskListPresenter = ({ tasks, loading, onTaskComplete, onRefresh }) => {
  // Pure UI rendering logic
};
```

### 2. Compound Components Pattern

For complex UI components with multiple related parts:

```typescript
// Usage
<TaskCard>
  <TaskCard.Header>
    <TaskCard.Title>Clean your room</TaskCard.Title>
    <TaskCard.Difficulty level="medium" />
  </TaskCard.Header>
  <TaskCard.Body>
    <TaskCard.Description>Make your bed and organize...</TaskCard.Description>
    <TaskCard.Rewards coins={50} xp={25} />
  </TaskCard.Body>
  <TaskCard.Actions>
    <TaskCard.CompleteButton />
    <TaskCard.DetailsButton />
  </TaskCard.Actions>
</TaskCard>
```

### 3. Render Props / Children as Function

For sharing stateful logic:

```typescript
<DataProvider>
  {({ data, loading, error }) => (
    loading ? <LoadingSpinner /> :
    error ? <ErrorMessage error={error} /> :
    <DataDisplay data={data} />
  )}
</DataProvider>
```

### 4. Theme-Aware Components

All components should support the app's theming system:

```typescript
interface ThemedComponentProps {
  theme?: 'light' | 'dark' | 'auto';
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
}

const ThemedButton: React.FC<ThemedComponentProps & ButtonProps> = ({
  theme = 'auto',
  variant = 'primary',
  ...props
}) => {
  const resolvedTheme = useTheme(theme);
  const styles = getButtonStyles(resolvedTheme, variant);
  
  return <Button style={styles} {...props} />;
};
```

## State Management Architecture

### Zustand Store Structure

```typescript
// Example: Task Store
interface TaskStore {
  // State
  tasks: Task[];
  activeTasks: Task[];
  completedTasks: Task[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchTasks: () => Promise<void>;
  createTask: (task: CreateTaskInput) => Promise<Task>;
  completeTask: (taskId: string, completion: TaskCompletion) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  
  // Computed
  getTaskById: (id: string) => Task | undefined;
  getTasksByStatus: (status: TaskStatus) => Task[];
  getTotalRewardsEarned: () => number;
}
```

### Context vs Zustand Guidelines

**Use React Context for:**
- Authentication state (user session)
- Theme preferences
- App-wide UI state (modals, toasts)
- Real-time data that needs immediate updates

**Use Zustand for:**
- Domain-specific data (tasks, rewards, family)
- Complex state with multiple actions
- Data that needs persistence
- Performance-critical state updates

## Navigation Architecture

### Route-Based Role Detection

```typescript
// app/_layout.tsx
export default function RootLayout() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <LoadingScreen />;
  if (!user) return <Redirect href="/(auth)/login" />;
  
  const userRole = useFamilyRole();
  
  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      {userRole === 'parent' && (
        <Stack.Screen name="(parent)" options={{ headerShown: false }} />
      )}
      {userRole === 'child' && (
        <Stack.Screen name="(child)" options={{ headerShown: false }} />
      )}
      <Stack.Screen name="(shared)" options={{ headerShown: false }} />
    </Stack>
  );
}
```

### Deep Linking Strategy

```typescript
// Deep link patterns
const DEEP_LINK_PATTERNS = {
  // Family invitations
  'family/invite/:code': '/(auth)/family-setup',
  
  // Task management
  'task/:id': '/(parent)/tasks/[id]',
  'complete-task/:id': '/(child)/tasks/[id]',
  
  // Reward redemption
  'redeem/:rewardId': '/(child)/rewards/redeem',
  'approve-reward/:redemptionId': '/(parent)/rewards/approvals',
  
  // Notifications
  'notification/:type/:id': (type, id) => {
    switch (type) {
      case 'task-completed': return `/(parent)/tasks/${id}`;
      case 'reward-request': return `/(parent)/rewards/approvals`;
      case 'achievement': return `/(child)/profile/achievements`;
      default: return '/';
    }
  }
};
```

## Performance Optimization Strategies

### Code Splitting by Role

```typescript
// Lazy loading role-specific components
const ParentDashboard = lazy(() => import('../screens/parent/Dashboard'));
const ChildDashboard = lazy(() => import('../screens/child/Dashboard'));

const RoleDashboard = () => {
  const role = useFamilyRole();
  
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      {role === 'parent' ? <ParentDashboard /> : <ChildDashboard />}
    </Suspense>
  );
};
```

### Memoization Strategy

```typescript
// Memoize expensive calculations
const TaskStatistics = memo(({ tasks }: { tasks: Task[] }) => {
  const stats = useMemo(() => {
    return calculateTaskStatistics(tasks);
  }, [tasks]);
  
  return <StatisticsDisplay stats={stats} />;
});

// Memoize callback functions
const TaskList = ({ onTaskComplete }: TaskListProps) => {
  const handleTaskComplete = useCallback(
    (taskId: string) => onTaskComplete(taskId),
    [onTaskComplete]
  );
  
  return (
    <FlatList
      data={tasks}
      renderItem={({ item }) => (
        <TaskItem task={item} onComplete={handleTaskComplete} />
      )}
      keyExtractor={(item) => item.id}
    />
  );
};
```

### Virtual Lists for Large Data

```typescript
// Use FlatList with optimization props
<FlatList
  data={tasks}
  renderItem={renderTaskItem}
  keyExtractor={keyExtractor}
  getItemLayout={getItemLayout} // If item height is fixed
  initialNumToRender={10}
  maxToRenderPerBatch={5}
  windowSize={10}
  removeClippedSubviews={true}
  updateCellsBatchingPeriod={50}
/>
```

This component architecture provides a scalable, maintainable foundation for the LevelUp Family app with clear separation of concerns, reusable components, and optimized performance patterns.