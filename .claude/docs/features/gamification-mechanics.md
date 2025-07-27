# Gamification Mechanics Specification

## Overview

The LevelUp Family app uses gamification to motivate children and create engaging family experiences. The system balances fun with meaningful rewards while promoting positive behaviors and family bonding.

## Core Gamification Framework

### The Three-Layer Motivation System

```
┌─────────────────────────────────────────────────────────┐
│                    Meta-Game Layer                      │
├─────────────────────────────────────────────────────────┤
│  Achievements | Badges | Family Leaderboards | Stories │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│                 Progress Mechanics Layer                │
├─────────────────────────────────────────────────────────┤
│      Levels | XP | Streaks | Skill Trees | Stats       │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│                  Core Reward Layer                      │
├─────────────────────────────────────────────────────────┤
│         Coins | Task Completion | Instant Feedback     │
└─────────────────────────────────────────────────────────┘
```

## Core Mechanics

### 1. Coin System (Primary Currency)

**Purpose**: Immediate gratification and purchasing power for rewards

```typescript
interface CoinSystem {
  baseRewards: {
    easy: 10-25;     // Simple tasks (5-15 min)
    medium: 30-60;   // Moderate tasks (15-45 min)
    hard: 70-120;    // Complex tasks (45+ min)
    epic: 150-300;   // Special/creative tasks
  };
  
  bonusMultipliers: {
    perfectCompletion: 1.5;     // Task done excellently
    earlyCompletion: 1.2;       // Completed before due date
    firstTime: 1.3;             // First time doing this task
    streakBonus: 1.1-2.0;       // Based on current streak
    familyGoal: 1.4;            // Contributing to family goal
  };
  
  penalties: {
    lateCompletion: 0.8;        // Completed after due date
    qualityIssues: 0.7;         // Parent requests revision
    incompleteSubmission: 0.5;   // Missing required elements
  };
}

// Dynamic coin calculation
const calculateCoins = (task: Task, completion: TaskCompletion): number => {
  let baseCoins = COIN_REWARDS[task.difficulty];
  let multiplier = 1.0;
  
  // Apply bonuses
  if (completion.quality_rating >= 5) multiplier *= 1.5;
  if (completion.completed_early) multiplier *= 1.2;
  if (completion.is_first_time) multiplier *= 1.3;
  
  // Apply streak bonus
  const streakMultiplier = Math.min(1.0 + (completion.current_streak * 0.1), 2.0);
  multiplier *= streakMultiplier;
  
  // Apply penalties
  if (completion.completed_late) multiplier *= 0.8;
  if (completion.revision_requested) multiplier *= 0.7;
  
  return Math.round(baseCoins * multiplier);
};
```

### 2. Experience Points (XP) & Leveling

**Purpose**: Long-term progression and status recognition

```typescript
interface XPSystem {
  sources: {
    taskCompletion: number;      // Base XP per task
    qualityBonus: number;        // Extra XP for excellent work
    consistencyBonus: number;    // Daily/weekly consistency
    helpingFamily: number;       // Helping siblings with tasks
    achievements: number;        // Unlocking achievements
    milestones: number;          // Reaching certain milestones
  };
  
  levelProgression: {
    formula: 'quadratic';        // XP = level^2 * 100
    maxLevel: 50;
    prestigeSystem: boolean;     // Reset with benefits at max level
  };
}

// XP Calculation
const calculateXP = (task: Task, completion: TaskCompletion): number => {
  const baseXP = XP_REWARDS[task.difficulty];
  let bonusXP = 0;
  
  // Quality bonus
  if (completion.quality_rating >= 4) bonusXP += baseXP * 0.5;
  if (completion.quality_rating === 5) bonusXP += baseXP * 0.5; // Total 2x for perfect
  
  // Consistency bonus
  if (completion.current_streak >= 7) bonusXP += baseXP * 0.3;
  if (completion.current_streak >= 30) bonusXP += baseXP * 0.7; // Total 1.5x for month streak
  
  return Math.round(baseXP + bonusXP);
};

// Level calculation
const calculateLevel = (totalXP: number): number => {
  return Math.floor(Math.sqrt(totalXP / 100));
};

const getXPForNextLevel = (currentLevel: number): number => {
  return (currentLevel + 1) ** 2 * 100;
};
```

### 3. Streak System

**Purpose**: Encourage consistency and build habits

```typescript
interface StreakSystem {
  types: {
    daily: {
      requirement: 'complete_any_task_daily';
      maxValue: 365;
      resetOnMiss: true;
      gracePeriod: 12; // hours
    };
    
    weekly: {
      requirement: 'complete_weekly_goal';
      maxValue: 52;
      resetOnMiss: true;
      gracePeriod: 48; // hours
    };
    
    category: {
      requirement: 'complete_same_category_consecutive_days';
      maxValue: 100;
      resetOnMiss: true;
      categories: ['chores', 'homework', 'exercise', 'creativity'];
    };
  };
  
  rewards: {
    milestones: [7, 14, 30, 60, 100, 365];
    bonuses: {
      coinMultiplier: 1.1-2.0;
      xpBonus: 50-500;
      specialRewards: boolean;
    };
  };
}

const updateStreaks = async (userId: string, taskCategory: string): Promise<StreakUpdate> => {
  const user = await getUser(userId);
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 24*60*60*1000).toDateString();
  
  // Daily streak
  if (user.last_task_date === yesterday || user.last_task_date === today) {
    if (user.last_task_date === yesterday) {
      user.daily_streak += 1;
    }
  } else {
    user.daily_streak = 1; // Reset streak
  }
  
  // Category streak
  if (user.last_category === taskCategory && user.last_task_date === yesterday) {
    user.category_streaks[taskCategory] += 1;
  } else {
    user.category_streaks[taskCategory] = 1;
  }
  
  user.last_task_date = today;
  user.last_category = taskCategory;
  
  return await saveUser(user);
};
```

### 4. Achievement System

**Purpose**: Recognize milestones and encourage exploration

```typescript
interface AchievementSystem {
  categories: {
    progression: Achievement[];    // Level-based achievements
    consistency: Achievement[];    // Streak-based achievements
    quality: Achievement[];        // Excellence-based achievements
    exploration: Achievement[];    // Trying new things
    social: Achievement[];         // Family interaction
    seasonal: Achievement[];       // Time-limited achievements
    secret: Achievement[];         // Hidden achievements
  };
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
  unlockedIcon: string;
  
  // Unlock criteria
  criteria: AchievementCriteria;
  
  // Rewards
  coinReward: number;
  xpReward: number;
  badgeUnlock?: string;
  titleUnlock?: string;
  
  // Metadata
  isSecret: boolean;
  isSeasonalAvailable: boolean;
  unlockHint?: string;
  flavor_text?: string;
}

// Example achievements
const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Complete your very first task',
    category: 'progression',
    rarity: 'common',
    criteria: { tasksCompleted: 1 },
    coinReward: 50,
    xpReward: 100,
    isSecret: false,
  },
  
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Complete tasks for 7 days in a row',
    category: 'consistency',
    rarity: 'rare',
    criteria: { dailyStreak: 7 },
    coinReward: 200,
    xpReward: 300,
    titleUnlock: 'Consistent',
    isSecret: false,
  },
  
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Get perfect ratings on 10 tasks',
    category: 'quality',
    rarity: 'epic',
    criteria: { perfectRatings: 10 },
    coinReward: 500,
    xpReward: 750,
    badgeUnlock: 'golden_star',
    isSecret: false,
  },
  
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete 20 tasks before their due date',
    category: 'quality',
    rarity: 'rare',
    criteria: { earlyCompletions: 20 },
    coinReward: 300,
    xpReward: 400,
    isSecret: false,
  },
  
  {
    id: 'family_helper',
    name: 'Family Helper',
    description: 'Help a family member with their task',
    category: 'social',
    rarity: 'rare',
    criteria: { helpedFamilyMembers: 1 },
    coinReward: 150,
    xpReward: 200,
    isSecret: false,
  },
  
  {
    id: 'midnight_tasker',
    name: 'Midnight Tasker',
    description: 'Complete a task between 11 PM and 1 AM',
    category: 'exploration',
    rarity: 'epic',
    criteria: { lateNightTasks: 1 },
    coinReward: 100,
    xpReward: 150,
    isSecret: true,
    unlockHint: 'Some tasks are best done when the house is quiet...',
  },
];

const checkAchievements = async (userId: string, context: TaskCompletionContext): Promise<Achievement[]> => {
  const user = await getUserWithStats(userId);
  const unlockedAchievements: Achievement[] = [];
  
  for (const achievement of ACHIEVEMENTS) {
    if (user.achievements.includes(achievement.id)) continue;
    
    if (await evaluateAchievementCriteria(achievement.criteria, user, context)) {
      await unlockAchievement(userId, achievement.id);
      unlockedAchievements.push(achievement);
    }
  }
  
  return unlockedAchievements;
};
```

### 5. Badge & Title System

**Purpose**: Visual recognition and personal expression

```typescript
interface BadgeSystem {
  badges: {
    id: string;
    name: string;
    description: string;
    iconUrl: string;
    category: BadgeCategory;
    rarity: BadgeRarity;
    unlockCondition: AchievementCriteria;
    isAnimated: boolean;
  }[];
  
  titles: {
    id: string;
    text: string;
    colorScheme: string;
    unlockCondition: AchievementCriteria;
    isExclusive: boolean; // Can only be worn by one person in family
  }[];
}

interface UserProfile {
  displayName: string;
  currentTitle?: string;
  currentBadge?: string;
  equippedBadges: string[]; // Max 3 displayed badges
  unlockedTitles: string[];
  unlockedBadges: string[];
}

// Badge categories
enum BadgeCategory {
  ACHIEVEMENT = 'achievement',    // From achievements
  SEASONAL = 'seasonal',          // Limited time events
  FAMILY = 'family',             // Family-specific badges
  MILESTONE = 'milestone',        // Major progression markers
  SPECIAL = 'special',           // Unique circumstances
}

// Example badges
const BADGES = [
  {
    id: 'first_week',
    name: 'Week One Warrior',
    description: 'Survived your first week!',
    category: BadgeCategory.MILESTONE,
    rarity: 'common',
    unlockCondition: { daysActive: 7 },
  },
  
  {
    id: 'chore_master',
    name: 'Chore Master',
    description: 'Completed 50 household chores',
    category: BadgeCategory.ACHIEVEMENT,
    rarity: 'rare',
    unlockCondition: { categoryTasks: { chores: 50 } },
  },
  
  {
    id: 'summer_explorer',
    name: 'Summer Explorer',
    description: 'Completed outdoor activities all summer',
    category: BadgeCategory.SEASONAL,
    rarity: 'epic',
    unlockCondition: { seasonalTasks: { summer: 30 } },
    isAnimated: true,
  },
];
```

## Advanced Gamification Features

### 6. Family Leaderboards

**Purpose**: Healthy competition and family bonding

```typescript
interface LeaderboardSystem {
  types: {
    weekly: {
      metric: 'coins_earned' | 'tasks_completed' | 'xp_gained';
      resetPeriod: 'weekly';
      rewards: LeaderboardReward[];
    };
    
    monthly: {
      metric: 'achievement_unlocks' | 'streak_length' | 'quality_score';
      resetPeriod: 'monthly';
      rewards: LeaderboardReward[];
    };
    
    allTime: {
      metric: 'total_contribution' | 'level' | 'total_coins';
      resetPeriod: 'never';
      rewards: LeaderboardReward[];
    };
  };
  
  familyGoals: {
    id: string;
    name: string;
    description: string;
    target: number;
    currentProgress: number;
    participants: string[];
    rewards: FamilyGoalReward[];
    deadline: Date;
  }[];
}

interface FamilyGoal {
  id: string;
  familyId: string;
  name: string;
  description: string;
  type: 'tasks' | 'coins' | 'streaks' | 'categories';
  target: number;
  currentProgress: number;
  deadline: Date;
  rewards: {
    individual: { coins: number; xp: number };
    family: { unlocks?: string[]; bonuses?: number[] };
  };
  participants: string[];
  isActive: boolean;
}

// Example family goals
const createFamilyGoal = async (familyId: string, goal: CreateFamilyGoalInput): Promise<FamilyGoal> => {
  const familyGoal: FamilyGoal = {
    id: generateUUID(),
    familyId,
    name: goal.name,
    description: goal.description,
    type: goal.type,
    target: goal.target,
    currentProgress: 0,
    deadline: goal.deadline,
    rewards: goal.rewards,
    participants: await getFamilyChildrenIds(familyId),
    isActive: true,
  };
  
  await saveFamilyGoal(familyGoal);
  await notifyFamilyMembers(familyId, 'new_family_goal', familyGoal);
  
  return familyGoal;
};
```

### 7. Skill Trees & Specializations

**Purpose**: Personalized progression paths

```typescript
interface SkillTree {
  categories: {
    household: SkillNode[];     // Cleaning, cooking, organizing
    academic: SkillNode[];      // Homework, reading, studying
    creative: SkillNode[];      // Art, music, writing
    physical: SkillNode[];      // Exercise, sports, outdoor
    social: SkillNode[];        // Helping others, leadership
    life: SkillNode[];          // Money management, planning
  };
}

interface SkillNode {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  level: number; // 1-5
  prerequisites: string[];
  unlockRequirements: {
    tasksInCategory: number;
    specificTasks?: string[];
    achievementsUnlocked?: string[];
  };
  benefits: {
    coinMultiplier?: number;
    xpBonus?: number;
    newTaskTypes?: string[];
    specialRewards?: string[];
  };
}

// Example skill progression
const HOUSEHOLD_SKILLS: SkillNode[] = [
  {
    id: 'basic_cleaning',
    name: 'Basic Cleaning',
    description: 'Master the fundamentals of keeping things tidy',
    category: 'household',
    level: 1,
    prerequisites: [],
    unlockRequirements: { tasksInCategory: 5 },
    benefits: { coinMultiplier: 1.1 },
  },
  
  {
    id: 'deep_cleaning',
    name: 'Deep Cleaning Specialist',
    description: 'Advanced cleaning techniques and attention to detail',
    category: 'household',
    level: 3,
    prerequisites: ['basic_cleaning'],
    unlockRequirements: { tasksInCategory: 25, specificTasks: ['vacuum_house', 'clean_bathroom'] },
    benefits: { coinMultiplier: 1.25, newTaskTypes: ['organize_closet', 'deep_clean_room'] },
  },
];
```

### 8. Seasonal Events & Limited-Time Content

**Purpose**: Maintain engagement and create special memories

```typescript
interface SeasonalEvent {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  theme: 'spring' | 'summer' | 'fall' | 'winter' | 'holiday' | 'special';
  
  content: {
    specialTasks: Task[];
    limitedRewards: Reward[];
    exclusiveAchievements: Achievement[];
    eventCurrency?: {
      name: string;
      conversionRate: number; // How many regular coins = 1 event coin
    };
  };
  
  progressTracking: {
    individualGoals: EventGoal[];
    familyGoals: EventGoal[];
    leaderboards: EventLeaderboard[];
  };
}

// Example seasonal events
const SEASONAL_EVENTS = [
  {
    id: 'spring_cleaning_2024',
    name: 'Spring Cleaning Challenge',
    description: 'Help your family prepare for spring with deep cleaning tasks',
    theme: 'spring',
    duration: '2 weeks',
    specialRewards: ['spring_badge', 'early_bloomer_title'],
    bonusMultiplier: 1.5,
  },
  
  {
    id: 'summer_adventure_2024',
    name: 'Summer Adventure Quest',
    description: 'Explore the outdoors and try new activities',
    theme: 'summer',
    duration: '3 months',
    specialCurrency: 'Adventure Points',
    exclusiveRewards: ['outdoor_gear_vouchers', 'family_trip_contributions'],
  },
];
```

## Balancing & Progression Design

### Economic Balance

```typescript
interface EconomicBalance {
  // Earning rates (coins per hour of effort)
  earningRates: {
    casual: 20-40;        // Light tasks, 1-2 per day
    moderate: 40-80;      // Regular engagement, 3-5 tasks per day
    dedicated: 80-150;    // High engagement, 6+ tasks per day
  };
  
  // Spending rates (average reward costs)
  rewardCosts: {
    small: 50-150;        // Small treats, digital items
    medium: 200-500;      // Toys, activities, small gift cards
    large: 600-1500;      // Electronics, larger gift cards
    premium: 1500+;       // Major items, experiences
  };
  
  // Time to earn ratios
  timeToEarn: {
    small: '1-3 days';
    medium: '1-2 weeks';
    large: '1-2 months';
    premium: '2-4 months';
  };
}
```

### Engagement Optimization

```typescript
interface EngagementOptimization {
  // Prevent burnout
  dailyTaskLimits: {
    age_6_8: 2-3;
    age_9_12: 3-5;
    age_13_16: 4-7;
    age_17_plus: 5-10;
  };
  
  // Maintain interest
  varietyRequirements: {
    maxSameCategoryPerDay: 2;
    weeklyVarietyBonus: true;
    newTaskIntroductionRate: 'weekly';
  };
  
  // Social features
  familyInteraction: {
    sharedGoals: true;
    helpingMechanics: true;
    celebrationMoments: true;
    progressSharing: true;
  };
}
```

## Implementation Considerations

### Data Tracking

```typescript
interface GamificationTracking {
  userStats: {
    totalCoinsEarned: number;
    totalCoinsSpent: number;
    totalXP: number;
    currentLevel: number;
    longestStreak: number;
    currentStreak: number;
    tasksCompleted: number;
    achievementsUnlocked: string[];
    badgesEarned: string[];
    titlesUnlocked: string[];
  };
  
  behaviorAnalytics: {
    preferredTaskCategories: string[];
    averageCompletionTime: number;
    qualityTrends: number[];
    engagementPatterns: EngagementPattern[];
    progressionSpeed: number;
  };
}
```

### Personalization

```typescript
interface PersonalizationEngine {
  adaptiveRewards: {
    adjustBasedOnEngagement: boolean;
    personalizeTaskSuggestions: boolean;
    customizeProgressionPace: boolean;
  };
  
  individualPreferences: {
    preferredRewardTypes: string[];
    motivationStyle: 'competition' | 'cooperation' | 'achievement' | 'exploration';
    feedbackFrequency: 'immediate' | 'daily' | 'weekly';
  };
}
```

This gamification system creates a balanced, engaging experience that motivates children while building positive habits and strengthening family bonds through shared goals and achievements.