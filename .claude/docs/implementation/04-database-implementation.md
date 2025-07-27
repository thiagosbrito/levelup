# Database Implementation Guide

## 🎯 Objective

Implement the complete LevelUp Family database schema using Supabase PostgreSQL, including tables, relationships, indexes, triggers, and Row Level Security (RLS) policies.

## 📋 Prerequisites

- Supabase project created and configured
- Local Supabase CLI installed
- Database schema documentation reviewed (`docs/architecture/02-data-models.md`)

## 🚀 Implementation Steps

### Step 1: Database Foundation Setup

#### Initialize Supabase Local Development
```bash
# Initialize Supabase in project
supabase init

# Start local development stack
supabase start

# Create first migration file
supabase migration new initial_schema
```

#### Enable Required Extensions
```sql
-- supabase/migrations/20240126000001_initial_schema.sql

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable encryption functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable fuzzy string matching (for search)
CREATE EXTENSION IF NOT EXISTS "fuzzystrmatch";

-- Enable trigram similarity (for search)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

### Step 2: Custom Types and Enums

```sql
-- Create custom enum types
CREATE TYPE family_role AS ENUM ('parent', 'child', 'guardian');
CREATE TYPE member_status AS ENUM ('active', 'inactive', 'pending', 'suspended');
CREATE TYPE task_status AS ENUM ('active', 'completed', 'expired', 'cancelled');
CREATE TYPE task_difficulty AS ENUM ('easy', 'medium', 'hard', 'epic');
CREATE TYPE task_recurrence AS ENUM ('none', 'daily', 'weekly', 'monthly');
CREATE TYPE completion_status AS ENUM ('submitted', 'approved', 'rejected', 'needs_revision');
CREATE TYPE transaction_type AS ENUM ('earned', 'spent', 'bonus', 'penalty', 'transfer', 'refund');
CREATE TYPE reward_type AS ENUM ('gift_card', 'physical_item', 'privilege', 'experience');
CREATE TYPE reward_status AS ENUM ('active', 'inactive', 'out_of_stock', 'discontinued');
CREATE TYPE redemption_status AS ENUM ('requested', 'approved', 'fulfilled', 'rejected', 'cancelled');
```

### Step 3: Core Entity Tables

#### Users Table
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
    total_coins INTEGER DEFAULT 0 CHECK (total_coins >= 0),
    total_xp INTEGER DEFAULT 0 CHECK (total_xp >= 0),
    current_level INTEGER DEFAULT 1 CHECK (current_level >= 1),
    current_streak INTEGER DEFAULT 0 CHECK (current_streak >= 0),
    longest_streak INTEGER DEFAULT 0 CHECK (longest_streak >= 0),
    
    -- Privacy and safety
    parent_email VARCHAR(255), -- For child accounts
    coppa_compliance BOOLEAN DEFAULT false,
    
    -- App preferences
    timezone VARCHAR(50) DEFAULT 'UTC',
    notification_preferences JSONB DEFAULT '{}',
    app_preferences JSONB DEFAULT '{}'
);

-- Indexes for users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_parent_email ON users(parent_email) WHERE parent_email IS NOT NULL;
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_level ON users(current_level);
CREATE INDEX idx_users_coins ON users(total_coins);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### Families Table
```sql
CREATE TABLE families (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    family_code VARCHAR(20) UNIQUE NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Family settings
    timezone VARCHAR(50) DEFAULT 'UTC',
    currency VARCHAR(3) DEFAULT 'USD',
    coin_to_currency_rate DECIMAL(10,4) DEFAULT 0.01,
    
    -- Gamification settings
    daily_task_bonus INTEGER DEFAULT 10,
    weekly_goal_bonus INTEGER DEFAULT 50,
    streak_multiplier DECIMAL(3,2) DEFAULT 1.5,
    
    -- Family rules and settings
    max_children INTEGER DEFAULT 10,
    require_parent_approval BOOLEAN DEFAULT true,
    auto_approve_small_rewards BOOLEAN DEFAULT true,
    small_reward_threshold INTEGER DEFAULT 100,
    
    -- Subscription and limits
    subscription_tier VARCHAR(20) DEFAULT 'free',
    monthly_gift_card_limit DECIMAL(10,2) DEFAULT 25.00,
    
    is_active BOOLEAN DEFAULT true
);

-- Indexes for families table
CREATE INDEX idx_families_family_code ON families(family_code);
CREATE INDEX idx_families_created_at ON families(created_at);
CREATE INDEX idx_families_active ON families(is_active) WHERE is_active = true;

-- Updated at trigger
CREATE TRIGGER update_families_updated_at BEFORE UPDATE ON families
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate unique family codes
CREATE OR REPLACE FUNCTION generate_family_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..8 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate family code
CREATE OR REPLACE FUNCTION set_family_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.family_code IS NULL OR NEW.family_code = '' THEN
        LOOP
            NEW.family_code := generate_family_code();
            EXIT WHEN NOT EXISTS (SELECT 1 FROM families WHERE family_code = NEW.family_code);
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_family_code_trigger
    BEFORE INSERT ON families
    FOR EACH ROW EXECUTE FUNCTION set_family_code();
```

#### Family Members Junction Table
```sql
CREATE TABLE family_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role family_role NOT NULL,
    status member_status DEFAULT 'active',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    invited_by UUID REFERENCES users(id),
    
    -- Role-specific data
    permissions JSONB DEFAULT '{}',
    spending_limit DECIMAL(10,2),
    weekly_task_limit INTEGER,
    
    UNIQUE(family_id, user_id)
);

-- Indexes for family_members table
CREATE INDEX idx_family_members_family_id ON family_members(family_id);
CREATE INDEX idx_family_members_user_id ON family_members(user_id);
CREATE INDEX idx_family_members_role ON family_members(role);
CREATE INDEX idx_family_members_status ON family_members(status);
```

### Step 4: Task Management Tables

#### Tasks Table
```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id),
    assigned_to UUID REFERENCES users(id),
    
    -- Task details
    title VARCHAR(200) NOT NULL,
    description TEXT,
    difficulty task_difficulty DEFAULT 'easy',
    category VARCHAR(50),
    
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
    tags TEXT[],
    custom_fields JSONB DEFAULT '{}'
);

-- Indexes for tasks table
CREATE INDEX idx_tasks_family_id ON tasks(family_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX idx_tasks_category ON tasks(category) WHERE category IS NOT NULL;
CREATE INDEX idx_tasks_difficulty ON tasks(difficulty);

-- Full-text search index for tasks
CREATE INDEX idx_tasks_search ON tasks USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Updated at trigger
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### Task Completions Table
```sql
CREATE TABLE task_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    completed_by UUID NOT NULL REFERENCES users(id),
    reviewed_by UUID REFERENCES users(id),
    
    -- Completion details
    status completion_status DEFAULT 'submitted',
    completion_notes TEXT,
    photo_urls TEXT[],
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

-- Indexes for task_completions table
CREATE INDEX idx_task_completions_task_id ON task_completions(task_id);
CREATE INDEX idx_task_completions_completed_by ON task_completions(completed_by);
CREATE INDEX idx_task_completions_reviewed_by ON task_completions(reviewed_by);
CREATE INDEX idx_task_completions_status ON task_completions(status);
CREATE INDEX idx_task_completions_completed_at ON task_completions(completed_at);
```

### Step 5: Gamification Tables

#### Coin Transactions Table
```sql
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

-- Indexes for coin_transactions table
CREATE INDEX idx_coin_transactions_user_id ON coin_transactions(user_id);
CREATE INDEX idx_coin_transactions_family_id ON coin_transactions(family_id);
CREATE INDEX idx_coin_transactions_type ON coin_transactions(type);
CREATE INDEX idx_coin_transactions_created_at ON coin_transactions(created_at);
CREATE INDEX idx_coin_transactions_task_completion ON coin_transactions(task_completion_id) WHERE task_completion_id IS NOT NULL;
```

#### Achievements Tables
```sql
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url TEXT,
    badge_color VARCHAR(7), -- Hex color
    category VARCHAR(50),
    
    -- Unlock criteria
    criteria JSONB NOT NULL,
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
    progress JSONB DEFAULT '{}',
    
    UNIQUE(user_id, achievement_id)
);

-- Indexes for achievements
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX idx_user_achievements_unlocked_at ON user_achievements(unlocked_at);
CREATE INDEX idx_achievements_category ON achievements(category) WHERE category IS NOT NULL;
```

### Step 6: Reward System Tables

#### Rewards Table
```sql
CREATE TABLE rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID REFERENCES families(id), -- NULL for global rewards
    created_by UUID REFERENCES users(id),
    
    -- Reward details
    name VARCHAR(200) NOT NULL,
    description TEXT,
    type reward_type NOT NULL,
    brand VARCHAR(100),
    
    -- Pricing
    coin_cost INTEGER NOT NULL CHECK (coin_cost > 0),
    real_world_value DECIMAL(10,2),
    
    -- Availability
    status reward_status DEFAULT 'active',
    stock_quantity INTEGER,
    max_per_child_per_month INTEGER DEFAULT 1,
    min_age INTEGER,
    max_age INTEGER,
    
    -- Gift card specific
    gift_card_denominations INTEGER[],
    gift_card_provider VARCHAR(100),
    gift_card_provider_id VARCHAR(200),
    
    -- Metadata
    image_url TEXT,
    terms_and_conditions TEXT,
    tags TEXT[],
    custom_fields JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for rewards table
CREATE INDEX idx_rewards_family_id ON rewards(family_id);
CREATE INDEX idx_rewards_created_by ON rewards(created_by);
CREATE INDEX idx_rewards_type ON rewards(type);
CREATE INDEX idx_rewards_status ON rewards(status);
CREATE INDEX idx_rewards_brand ON rewards(brand) WHERE brand IS NOT NULL;
CREATE INDEX idx_rewards_coin_cost ON rewards(coin_cost);

-- Updated at trigger
CREATE TRIGGER update_rewards_updated_at BEFORE UPDATE ON rewards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### Reward Redemptions Table
```sql
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
    gift_card_code TEXT, -- Will be encrypted
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

-- Indexes for reward_redemptions table
CREATE INDEX idx_reward_redemptions_reward_id ON reward_redemptions(reward_id);
CREATE INDEX idx_reward_redemptions_user_id ON reward_redemptions(user_id);
CREATE INDEX idx_reward_redemptions_family_id ON reward_redemptions(family_id);
CREATE INDEX idx_reward_redemptions_status ON reward_redemptions(status);
CREATE INDEX idx_reward_redemptions_requested_at ON reward_redemptions(requested_at);
```

### Step 7: Supporting Tables

#### Family Invitations Table
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

-- Indexes for family_invitations table
CREATE INDEX idx_family_invitations_code ON family_invitations(invitation_code);
CREATE INDEX idx_family_invitations_family_id ON family_invitations(family_id);
CREATE INDEX idx_family_invitations_expires_at ON family_invitations(expires_at);
CREATE INDEX idx_family_invitations_active ON family_invitations(is_active, expires_at) WHERE is_active = true;
```

### Step 8: Database Functions and Triggers

#### User Balance Update Function
```sql
CREATE OR REPLACE FUNCTION update_user_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Update user's total coins based on latest transaction
    UPDATE users 
    SET total_coins = NEW.balance_after,
        updated_at = NOW()
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_balance
    AFTER INSERT ON coin_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_balance();
```

#### Calculate User Level Function
```sql
CREATE OR REPLACE FUNCTION calculate_level(total_xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
    -- Level formula: level = floor(sqrt(total_xp / 100))
    -- Level 1 = 0-99 XP, Level 2 = 100-399 XP, Level 3 = 400-899 XP, etc.
    RETURN GREATEST(1, FLOOR(SQRT(total_xp::FLOAT / 100))::INTEGER);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update user level when XP changes
CREATE OR REPLACE FUNCTION update_user_level()
RETURNS TRIGGER AS $$
BEGIN
    -- Update user level based on total XP
    UPDATE users 
    SET current_level = calculate_level(NEW.total_xp),
        updated_at = NOW()
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_level
    AFTER UPDATE OF total_xp ON users
    FOR EACH ROW
    WHEN (OLD.total_xp IS DISTINCT FROM NEW.total_xp)
    EXECUTE FUNCTION update_user_level();
```

#### XP and Coin Award Function
```sql
CREATE OR REPLACE FUNCTION award_task_completion(
    p_task_completion_id UUID,
    p_coins INTEGER,
    p_xp INTEGER
)
RETURNS VOID AS $$
DECLARE
    v_user_id UUID;
    v_family_id UUID;
    v_current_balance INTEGER;
BEGIN
    -- Get user and family from task completion
    SELECT tc.completed_by, t.family_id
    INTO v_user_id, v_family_id
    FROM task_completions tc
    JOIN tasks t ON tc.task_id = t.id
    WHERE tc.id = p_task_completion_id;
    
    -- Get current balance
    SELECT total_coins INTO v_current_balance
    FROM users WHERE id = v_user_id;
    
    -- Insert coin transaction
    INSERT INTO coin_transactions (
        user_id, family_id, type, amount, description,
        task_completion_id, balance_after
    ) VALUES (
        v_user_id, v_family_id, 'earned', p_coins,
        'Task completion reward',
        p_task_completion_id, v_current_balance + p_coins
    );
    
    -- Update user XP
    UPDATE users 
    SET total_xp = total_xp + p_xp,
        updated_at = NOW()
    WHERE id = v_user_id;
    
    -- Update task completion with awarded amounts
    UPDATE task_completions
    SET coins_earned = p_coins,
        xp_earned = p_xp
    WHERE id = p_task_completion_id;
END;
$$ LANGUAGE plpgsql;
```

### Step 9: Views for Complex Queries

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
    COALESCE(SUM(u.total_coins), 0) as family_total_coins,
    COALESCE(SUM(u.total_xp), 0) as family_total_xp
FROM families f
LEFT JOIN family_members fm ON f.id = fm.family_id AND fm.status = 'active'
LEFT JOIN users u ON fm.user_id = u.id
LEFT JOIN tasks t ON f.id = t.family_id
LEFT JOIN task_completions tc ON t.id = tc.task_id
WHERE f.is_active = true
GROUP BY f.id, f.name;
```

#### User Progress View
```sql
CREATE VIEW user_progress AS
SELECT 
    u.id as user_id,
    u.display_name,
    u.current_level,
    u.total_xp,
    u.total_coins,
    u.current_streak,
    u.longest_streak,
    calculate_level(u.total_xp + 100) as next_level,
    (calculate_level(u.total_xp + 100)^2 * 100) - u.total_xp as xp_to_next_level,
    COUNT(DISTINCT ua.achievement_id) as achievements_unlocked,
    COUNT(DISTINCT CASE WHEN tc.status = 'approved' THEN tc.id END) as tasks_completed,
    COALESCE(AVG(CASE WHEN tc.completion_rating IS NOT NULL THEN tc.completion_rating END), 0) as avg_task_rating
FROM users u
LEFT JOIN user_achievements ua ON u.id = ua.user_id
LEFT JOIN task_completions tc ON u.id = tc.completed_by
WHERE u.is_active = true
GROUP BY u.id, u.display_name, u.current_level, u.total_xp, u.total_coins, u.current_streak, u.longest_streak;
```

### Step 10: Row Level Security (RLS) Policies

#### Enable RLS on All Tables
```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_invitations ENABLE ROW LEVEL SECURITY;
```

#### User Policies
```sql
-- Users can view their own profile and family members
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view family members" ON users
    FOR SELECT USING (
        id IN (
            SELECT fm.user_id 
            FROM family_members fm
            WHERE fm.family_id IN (
                SELECT family_id 
                FROM family_members 
                WHERE user_id = auth.uid() AND status = 'active'
            )
        )
    );
```

#### Family Policies
```sql
-- Family members can view their family
CREATE POLICY "Family members can view family" ON families
    FOR SELECT USING (
        id IN (
            SELECT family_id 
            FROM family_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Parents can update family settings
CREATE POLICY "Parents can update family" ON families
    FOR UPDATE USING (
        id IN (
            SELECT family_id 
            FROM family_members 
            WHERE user_id = auth.uid() 
            AND role = 'parent' 
            AND status = 'active'
        )
    );
```

#### Task Policies
```sql
-- Family members can view family tasks
CREATE POLICY "Family members can view tasks" ON tasks
    FOR SELECT USING (
        family_id IN (
            SELECT family_id 
            FROM family_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Parents can manage tasks
CREATE POLICY "Parents can manage tasks" ON tasks
    FOR ALL USING (
        family_id IN (
            SELECT family_id 
            FROM family_members 
            WHERE user_id = auth.uid() 
            AND role = 'parent' 
            AND status = 'active'
        )
    );

-- Children can update their assigned tasks
CREATE POLICY "Children can update assigned tasks" ON tasks
    FOR UPDATE USING (
        assigned_to = auth.uid()
        AND family_id IN (
            SELECT family_id 
            FROM family_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );
```

### Step 11: Seed Data for Development

#### Create Seed Data Migration
```sql
-- supabase/migrations/20240126000002_seed_data.sql

-- Insert default achievements
INSERT INTO achievements (id, name, description, icon_url, category, criteria, reward_coins, reward_xp, rarity) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'First Steps', 'Complete your very first task', '/icons/first-steps.png', 'progression', '{"tasksCompleted": 1}', 50, 100, 'common'),
('550e8400-e29b-41d4-a716-446655440002', 'Week Warrior', 'Complete tasks for 7 days in a row', '/icons/week-warrior.png', 'consistency', '{"dailyStreak": 7}', 200, 300, 'rare'),
('550e8400-e29b-41d4-a716-446655440003', 'Perfectionist', 'Get perfect ratings on 10 tasks', '/icons/perfectionist.png', 'quality', '{"perfectRatings": 10}', 500, 750, 'epic'),
('550e8400-e29b-41d4-a716-446655440004', 'Early Bird', 'Complete 20 tasks before their due date', '/icons/early-bird.png', 'quality', '{"earlyCompletions": 20}', 300, 400, 'rare'),
('550e8400-e29b-41d4-a716-446655440005', 'Family Helper', 'Help a family member with their task', '/icons/family-helper.png', 'social', '{"helpedFamilyMembers": 1}', 150, 200, 'rare');

-- Insert default global rewards (gift cards)
INSERT INTO rewards (id, name, description, type, brand, coin_cost, real_world_value, status, gift_card_denominations, gift_card_provider) VALUES
('550e8400-e29b-41d4-a716-446655440101', 'Steam Gift Card', 'Digital games and content on Steam', 'gift_card', 'Steam', 500, 5.00, 'active', ARRAY[5, 10, 20, 25, 50], 'tremendous'),
('550e8400-e29b-41d4-a716-446655440102', 'Xbox Live Gift Card', 'Xbox games, add-ons, and subscriptions', 'gift_card', 'Xbox', 1000, 10.00, 'active', ARRAY[10, 15, 25, 50], 'tremendous'),
('550e8400-e29b-41d4-a716-446655440103', 'PlayStation Store Gift Card', 'PlayStation games and content', 'gift_card', 'PlayStation', 1000, 10.00, 'active', ARRAY[10, 20, 50], 'tremendous'),
('550e8400-e29b-41d4-a716-446655440104', 'Amazon Gift Card', 'Millions of items on Amazon', 'gift_card', 'Amazon', 500, 5.00, 'active', ARRAY[5, 10, 15, 25, 50], 'tremendous');
```

### Step 12: Type Generation and Validation

#### Generate TypeScript Types
```bash
# Generate TypeScript types from database schema
supabase gen types typescript --local > types/database.ts
```

#### Create Database Client
```typescript
// services/database/client.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Type aliases for easier usage
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Specific type exports
export type User = Tables<'users'>;
export type Family = Tables<'families'>;
export type Task = Tables<'tasks'>;
export type TaskCompletion = Tables<'task_completions'>;
export type CoinTransaction = Tables<'coin_transactions'>;
export type Achievement = Tables<'achievements'>;
export type Reward = Tables<'rewards'>;
```

### Step 13: Database Testing and Validation

#### Create Database Test Suite
```typescript
// __tests__/database/schema.test.ts
import { supabase } from '@/services/database/client';

describe('Database Schema', () => {
  test('should create and retrieve users', async () => {
    const testUser = {
      email: 'test@example.com',
      display_name: 'Test User',
      total_coins: 100,
      total_xp: 250
    };

    const { data, error } = await supabase
      .from('users')
      .insert(testUser)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toMatchObject(testUser);
    expect(data.current_level).toBe(2); // Level calculated from 250 XP
  });

  test('should enforce family data isolation', async () => {
    // Create two families
    const family1 = await supabase.from('families').insert({ name: 'Family 1' }).select().single();
    const family2 = await supabase.from('families').insert({ name: 'Family 2' }).select().single();

    // Create tasks for each family
    await supabase.from('tasks').insert([
      { family_id: family1.data.id, title: 'Task 1', coin_reward: 10, xp_reward: 20 },
      { family_id: family2.data.id, title: 'Task 2', coin_reward: 15, xp_reward: 25 }
    ]);

    // Verify RLS policies prevent cross-family access
    // This would be tested with actual user sessions
  });

  test('should calculate user levels correctly', async () => {
    const testCases = [
      { xp: 0, expectedLevel: 1 },
      { xp: 99, expectedLevel: 1 },
      { xp: 100, expectedLevel: 1 },
      { xp: 399, expectedLevel: 1 },
      { xp: 400, expectedLevel: 2 },
      { xp: 899, expectedLevel: 2 },
      { xp: 900, expectedLevel: 3 },
      { xp: 2500, expectedLevel: 5 }
    ];

    for (const { xp, expectedLevel } of testCases) {
      const { data } = await supabase.rpc('calculate_level', { total_xp: xp });
      expect(data).toBe(expectedLevel);
    }
  });
});
```

## ✅ Implementation Checklist

### Database Foundation
- [ ] Supabase project created and configured
- [ ] Local development environment set up
- [ ] Extensions enabled (uuid-ossp, pgcrypto, etc.)
- [ ] Custom types and enums created

### Core Tables
- [ ] Users table with gamification fields
- [ ] Families table with settings and configuration
- [ ] Family members junction table with roles
- [ ] Tasks table with all requirements and metadata

### Gamification Tables
- [ ] Task completions table with approval workflow
- [ ] Coin transactions table with balance tracking
- [ ] Achievements and user achievements tables
- [ ] Progress calculation functions

### Reward System Tables
- [ ] Rewards table with gift card support
- [ ] Reward redemptions table with fulfillment tracking
- [ ] Family invitations table with expiration logic

### Security and Performance
- [ ] Row Level Security policies configured
- [ ] Proper indexes for performance
- [ ] Database triggers for automated calculations
- [ ] Views for complex queries

### Development Support
- [ ] TypeScript types generated and exported
- [ ] Database client configured
- [ ] Seed data for development
- [ ] Test suite for schema validation

## 🔧 Maintenance and Updates

### Regular Tasks
- **Weekly**: Review slow query logs and optimize
- **Monthly**: Update indexes based on usage patterns
- **Quarterly**: Review and update RLS policies

### Monitoring
- **Performance**: Track query execution times
- **Security**: Monitor failed authentication attempts
- **Usage**: Track table growth and storage usage

This database implementation provides a solid, scalable foundation for the LevelUp Family app with proper security, performance optimization, and developer experience considerations.