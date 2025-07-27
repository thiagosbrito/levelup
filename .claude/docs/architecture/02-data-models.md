# Data Models & Database Schema

## Database Schema Design

### Entity Relationship Overview

```
Users (1) ←→ (M) FamilyMembers (M) ←→ (1) Families
  │                                        │
  │                                        ├─→ (M) Tasks
  │                                        ├─→ (M) Rewards  
  │                                        └─→ (M) FamilyInvitations
  │
  ├─→ (M) TaskCompletions
  ├─→ (M) CoinTransactions
  ├─→ (M) RewardRedemptions
  └─→ (M) UserAchievements
```

### Core Entities

#### 1. Users
Primary user entity for authentication and profile data.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE,
    display_name VARCHAR(100),
    avatar_url TEXT,
    date_of_birth DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    
    -- Gamification fields
    total_coins INTEGER DEFAULT 0,
    total_xp INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    
    -- Privacy and safety
    parent_email VARCHAR(255), -- For child accounts
    coppa_compliance BOOLEAN DEFAULT false,
    
    -- App preferences
    timezone VARCHAR(50) DEFAULT 'UTC',
    notification_preferences JSONB DEFAULT '{}',
    app_preferences JSONB DEFAULT '{}'
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_parent_email ON users(parent_email);
CREATE INDEX idx_users_created_at ON users(created_at);
```

#### 2. Families
Container for family groups with settings and configuration.

```sql
CREATE TABLE families (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    family_code VARCHAR(20) UNIQUE NOT NULL, -- For invitations
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Family settings
    timezone VARCHAR(50) DEFAULT 'UTC',
    currency VARCHAR(3) DEFAULT 'USD',
    coin_to_currency_rate DECIMAL(10,4) DEFAULT 0.01, -- 100 coins = $1
    
    -- Gamification settings
    daily_task_bonus INTEGER DEFAULT 10,
    weekly_goal_bonus INTEGER DEFAULT 50,
    streak_multiplier DECIMAL(3,2) DEFAULT 1.5,
    
    -- Family rules and settings
    max_children INTEGER DEFAULT 10,
    require_parent_approval BOOLEAN DEFAULT true,
    auto_approve_small_rewards BOOLEAN DEFAULT true,
    small_reward_threshold INTEGER DEFAULT 100, -- coins
    
    -- Subscription and limits
    subscription_tier VARCHAR(20) DEFAULT 'free',
    monthly_gift_card_limit DECIMAL(10,2) DEFAULT 25.00,
    
    is_active BOOLEAN DEFAULT true
);

-- Indexes
CREATE INDEX idx_families_family_code ON families(family_code);
CREATE INDEX idx_families_created_at ON families(created_at);
```

#### 3. FamilyMembers
Junction table defining user roles within families.

```sql
CREATE TYPE family_role AS ENUM ('parent', 'child', 'guardian');
CREATE TYPE member_status AS ENUM ('active', 'inactive', 'pending', 'suspended');

CREATE TABLE family_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role family_role NOT NULL,
    status member_status DEFAULT 'active',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    invited_by UUID REFERENCES users(id),
    
    -- Role-specific data
    permissions JSONB DEFAULT '{}', -- Custom permissions
    spending_limit DECIMAL(10,2), -- For children
    weekly_task_limit INTEGER, -- Max tasks per week for child
    
    UNIQUE(family_id, user_id)
);

-- Indexes
CREATE INDEX idx_family_members_family_id ON family_members(family_id);
CREATE INDEX idx_family_members_user_id ON family_members(user_id);
CREATE INDEX idx_family_members_role ON family_members(role);
```

#### 4. Tasks
Tasks that can be assigned to family members.

```sql
CREATE TYPE task_status AS ENUM ('active', 'completed', 'expired', 'cancelled');
CREATE TYPE task_difficulty AS ENUM ('easy', 'medium', 'hard', 'epic');
CREATE TYPE task_recurrence AS ENUM ('none', 'daily', 'weekly', 'monthly');

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id),
    assigned_to UUID REFERENCES users(id),
    
    -- Task details
    title VARCHAR(200) NOT NULL,
    description TEXT,
    difficulty task_difficulty DEFAULT 'easy',
    category VARCHAR(50), -- 'chores', 'homework', 'exercise', etc.
    
    -- Reward structure
    coin_reward INTEGER NOT NULL CHECK (coin_reward > 0),
    xp_reward INTEGER NOT NULL CHECK (xp_reward > 0),
    bonus_multiplier DECIMAL(3,2) DEFAULT 1.0,
    
    -- Timing
    due_date TIMESTAMP WITH TIME ZONE,
    estimated_duration INTEGER, -- minutes
    recurrence task_recurrence DEFAULT 'none',
    recurrence_end_date TIMESTAMP WITH TIME ZONE,
    
    -- Requirements
    requires_photo BOOLEAN DEFAULT false,
    requires_parent_approval BOOLEAN DEFAULT true,
    auto_approve_on_time BOOLEAN DEFAULT false,
    
    -- Status
    status task_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadata
    tags TEXT[], -- searchable tags
    custom_fields JSONB DEFAULT '{}'
);

-- Indexes
CREATE INDEX idx_tasks_family_id ON tasks(family_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_category ON tasks(category);
```

#### 5. TaskCompletions
Records of task completion attempts and approvals.

```sql
CREATE TYPE completion_status AS ENUM ('submitted', 'approved', 'rejected', 'needs_revision');

CREATE TABLE task_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    completed_by UUID NOT NULL REFERENCES users(id),
    reviewed_by UUID REFERENCES users(id),
    
    -- Completion details
    status completion_status DEFAULT 'submitted',
    completion_notes TEXT,
    photo_urls TEXT[], -- proof photos
    completion_rating INTEGER CHECK (completion_rating BETWEEN 1 AND 5),
    
    -- Rewards earned
    coins_earned INTEGER DEFAULT 0,
    xp_earned INTEGER DEFAULT 0,
    bonus_earned INTEGER DEFAULT 0,
    
    -- Timing
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    
    -- Feedback
    parent_feedback TEXT,
    revision_notes TEXT
);

-- Indexes
CREATE INDEX idx_task_completions_task_id ON task_completions(task_id);
CREATE INDEX idx_task_completions_completed_by ON task_completions(completed_by);
CREATE INDEX idx_task_completions_status ON task_completions(status);
CREATE INDEX idx_task_completions_completed_at ON task_completions(completed_at);
```

#### 6. CoinTransactions
All coin-related transactions (earning, spending, transfers).

```sql
CREATE TYPE transaction_type AS ENUM ('earned', 'spent', 'bonus', 'penalty', 'transfer', 'refund');

CREATE TABLE coin_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    family_id UUID NOT NULL REFERENCES families(id),
    
    -- Transaction details
    type transaction_type NOT NULL,
    amount INTEGER NOT NULL, -- Can be negative for spending
    description TEXT NOT NULL,
    
    -- References
    task_completion_id UUID REFERENCES task_completions(id),
    reward_redemption_id UUID REFERENCES reward_redemptions(id),
    related_user_id UUID REFERENCES users(id), -- For transfers
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Balance tracking (for easier queries)
    balance_after INTEGER NOT NULL
);

-- Indexes
CREATE INDEX idx_coin_transactions_user_id ON coin_transactions(user_id);
CREATE INDEX idx_coin_transactions_family_id ON coin_transactions(family_id);
CREATE INDEX idx_coin_transactions_type ON coin_transactions(type);
CREATE INDEX idx_coin_transactions_created_at ON coin_transactions(created_at);
```

#### 7. Rewards
Available rewards that can be redeemed with coins.

```sql
CREATE TYPE reward_type AS ENUM ('gift_card', 'physical_item', 'privilege', 'experience');
CREATE TYPE reward_status AS ENUM ('active', 'inactive', 'out_of_stock', 'discontinued');

CREATE TABLE rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID REFERENCES families(id), -- NULL for global rewards
    created_by UUID REFERENCES users(id),
    
    -- Reward details
    name VARCHAR(200) NOT NULL,
    description TEXT,
    type reward_type NOT NULL,
    brand VARCHAR(100), -- 'Steam', 'Xbox', 'Amazon', etc.
    
    -- Pricing
    coin_cost INTEGER NOT NULL CHECK (coin_cost > 0),
    real_world_value DECIMAL(10,2), -- For gift cards
    
    -- Availability
    status reward_status DEFAULT 'active',
    stock_quantity INTEGER, -- NULL for unlimited
    max_per_child_per_month INTEGER DEFAULT 1,
    min_age INTEGER,
    max_age INTEGER,
    
    -- Gift card specific
    gift_card_denominations INTEGER[], -- Available amounts
    gift_card_provider VARCHAR(100), -- API provider
    gift_card_provider_id VARCHAR(200), -- External ID
    
    -- Metadata
    image_url TEXT,
    terms_and_conditions TEXT,
    tags TEXT[],
    custom_fields JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_rewards_family_id ON rewards(family_id);
CREATE INDEX idx_rewards_type ON rewards(type);
CREATE INDEX idx_rewards_status ON rewards(status);
CREATE INDEX idx_rewards_brand ON rewards(brand);
```

#### 8. RewardRedemptions
Records of reward redemption requests and fulfillment.

```sql
CREATE TYPE redemption_status AS ENUM ('requested', 'approved', 'fulfilled', 'rejected', 'cancelled');

CREATE TABLE reward_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reward_id UUID NOT NULL REFERENCES rewards(id),
    user_id UUID NOT NULL REFERENCES users(id),
    family_id UUID NOT NULL REFERENCES families(id),
    approved_by UUID REFERENCES users(id),
    
    -- Redemption details
    status redemption_status DEFAULT 'requested',
    coins_spent INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    
    -- Gift card specific
    gift_card_amount DECIMAL(10,2),
    gift_card_code TEXT, -- Encrypted
    gift_card_url TEXT,
    
    -- Fulfillment
    delivery_email VARCHAR(255),
    delivery_notes TEXT,
    tracking_info JSONB,
    
    -- Timing
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    fulfilled_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- External provider data
    provider_transaction_id VARCHAR(200),
    provider_response JSONB
);

-- Indexes
CREATE INDEX idx_reward_redemptions_user_id ON reward_redemptions(user_id);
CREATE INDEX idx_reward_redemptions_family_id ON reward_redemptions(family_id);
CREATE INDEX idx_reward_redemptions_status ON reward_redemptions(status);
CREATE INDEX idx_reward_redemptions_requested_at ON reward_redemptions(requested_at);
```

### Supporting Entities

#### 9. FamilyInvitations
Temporary invitations for joining families.

```sql
CREATE TABLE family_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    invited_by UUID NOT NULL REFERENCES users(id),
    
    -- Invitation details
    invitation_code VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255),
    role family_role DEFAULT 'child',
    
    -- Expiration
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    max_uses INTEGER DEFAULT 1,
    current_uses INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_family_invitations_code ON family_invitations(invitation_code);
CREATE INDEX idx_family_invitations_family_id ON family_invitations(family_id);
CREATE INDEX idx_family_invitations_expires_at ON family_invitations(expires_at);
```

#### 10. UserAchievements
Gamification achievements and badges.

```sql
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url TEXT,
    badge_color VARCHAR(7), -- Hex color
    category VARCHAR(50),
    
    -- Unlock criteria
    criteria JSONB NOT NULL, -- Flexible criteria definition
    reward_coins INTEGER DEFAULT 0,
    reward_xp INTEGER DEFAULT 0,
    
    -- Metadata
    is_secret BOOLEAN DEFAULT false,
    rarity VARCHAR(20) DEFAULT 'common', -- common, rare, epic, legendary
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    achievement_id UUID NOT NULL REFERENCES achievements(id),
    
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progress JSONB DEFAULT '{}', -- Current progress toward achievement
    
    UNIQUE(user_id, achievement_id)
);

-- Indexes
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_unlocked_at ON user_achievements(unlocked_at);
```

### Views and Computed Fields

#### Family Statistics View
```sql
CREATE VIEW family_stats AS
SELECT 
    f.id as family_id,
    f.name as family_name,
    COUNT(DISTINCT fm.user_id) as total_members,
    COUNT(DISTINCT CASE WHEN fm.role = 'child' THEN fm.user_id END) as total_children,
    COUNT(DISTINCT CASE WHEN fm.role = 'parent' THEN fm.user_id END) as total_parents,
    COALESCE(SUM(CASE WHEN t.status = 'active' THEN 1 ELSE 0 END), 0) as active_tasks,
    COALESCE(SUM(CASE WHEN tc.status = 'approved' THEN 1 ELSE 0 END), 0) as completed_tasks,
    COALESCE(SUM(u.total_coins), 0) as family_total_coins
FROM families f
LEFT JOIN family_members fm ON f.id = fm.family_id
LEFT JOIN users u ON fm.user_id = u.id
LEFT JOIN tasks t ON f.id = t.family_id
LEFT JOIN task_completions tc ON t.id = tc.task_id
GROUP BY f.id, f.name;
```

### Database Triggers and Functions

#### Update User Balance Trigger
```sql
CREATE OR REPLACE FUNCTION update_user_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Update user's total coins
    UPDATE users 
    SET total_coins = (
        SELECT COALESCE(SUM(amount), 0) 
        FROM coin_transactions 
        WHERE user_id = NEW.user_id
    )
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_balance
    AFTER INSERT ON coin_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_balance();
```

This schema provides a robust foundation for the LevelUp Family app with proper normalization, indexing, and relationships to support all core features while maintaining performance and scalability.