-- LevelUp Family - Complete Database Schema
-- Run this script in Supabase SQL Editor to create all tables and functions
-- Make sure to run this as a single transaction

BEGIN;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table (extends Supabase auth.users)
CREATE TABLE user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    age_group TEXT NOT NULL CHECK (age_group IN ('child', 'teen', 'adult')) DEFAULT 'adult',
    total_points INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Families Table
CREATE TABLE families (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    family_code TEXT UNIQUE NOT NULL,
    created_by UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Family Members Table (junction table for users and families)
CREATE TABLE family_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    family_id UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('parent', 'child', 'teen')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    UNIQUE(family_id, user_id)
);

-- Family Invitations Table (for LEV-6 authentication)
CREATE TABLE family_invitations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    family_id UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
    invited_by UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    invitation_code TEXT UNIQUE NOT NULL,
    invitation_type TEXT NOT NULL CHECK (invitation_type IN ('child', 'parent', 'guardian')),
    email TEXT,
    phone_number TEXT,
    custom_message TEXT,
    max_uses INTEGER DEFAULT 1,
    current_uses INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Tasks Table
CREATE TABLE tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    family_id UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('chore', 'homework', 'activity', 'habit', 'goal')),
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
    assigned_to UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    created_by UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    estimated_minutes INTEGER,
    points_value INTEGER NOT NULL DEFAULT 10,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Task Comments Table
CREATE TABLE task_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Family Events Table
CREATE TABLE family_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    family_id UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT NOT NULL CHECK (event_type IN ('appointment', 'activity', 'celebration', 'reminder', 'milestone')),
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    location TEXT,
    created_by UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    is_all_day BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Event Attendees Table
CREATE TABLE event_attendees (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES family_events(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('going', 'not_going', 'maybe', 'pending')) DEFAULT 'pending',
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(event_id, user_id)
);

-- Family Messages Table
CREATE TABLE family_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    family_id UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    message TEXT NOT NULL,
    message_type TEXT NOT NULL CHECK (message_type IN ('text', 'image', 'system', 'achievement')) DEFAULT 'text',
    reply_to UUID REFERENCES family_messages(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Achievement Definitions Table
CREATE TABLE achievement_definitions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('tasks', 'streaks', 'points', 'social', 'special')),
    criteria TEXT NOT NULL,
    points_reward INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- User Achievements Table
CREATE TABLE user_achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    achievement_id UUID REFERENCES achievement_definitions(id) ON DELETE CASCADE NOT NULL,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    progress INTEGER DEFAULT 100,
    UNIQUE(user_id, achievement_id)
);

-- Points Transactions Table
CREATE TABLE points_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    points INTEGER NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('task_completion', 'achievement', 'bonus', 'penalty', 'reward_redemption')),
    reference_id UUID,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Habits Table
CREATE TABLE habits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    family_id UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'custom')) DEFAULT 'daily',
    target_count INTEGER NOT NULL DEFAULT 1,
    points_per_completion INTEGER NOT NULL DEFAULT 5,
    created_by UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Habit Entries Table
CREATE TABLE habit_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    notes TEXT
);

-- User Notifications Table
CREATE TABLE user_notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    family_id UUID REFERENCES families(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('task_assigned', 'task_due', 'achievement_earned', 'event_reminder', 'message', 'system')),
    reference_id UUID,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE
);

-- Reward Items Table
CREATE TABLE reward_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    family_id UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    points_cost INTEGER NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('privilege', 'treat', 'outing', 'toy', 'experience', 'custom')),
    is_available BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Reward Redemptions Table
CREATE TABLE reward_redemptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    reward_id UUID REFERENCES reward_items(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    points_spent INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'completed', 'cancelled')) DEFAULT 'pending',
    redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    notes TEXT
);

-- Family Settings Table
CREATE TABLE family_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    family_id UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
    setting_key TEXT NOT NULL,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_by UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    UNIQUE(family_id, setting_key)
);

-- Performance Indexes
CREATE INDEX idx_family_members_family_id ON family_members(family_id);
CREATE INDEX idx_family_members_user_id ON family_members(user_id);
CREATE INDEX idx_family_invitations_code ON family_invitations(invitation_code);
CREATE INDEX idx_family_invitations_family_id ON family_invitations(family_id);
CREATE INDEX idx_family_invitations_expires_at ON family_invitations(expires_at);
CREATE INDEX idx_tasks_family_id ON tasks(family_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_family_events_family_id ON family_events(family_id);
CREATE INDEX idx_family_events_event_date ON family_events(event_date);
CREATE INDEX idx_family_messages_family_id ON family_messages(family_id);
CREATE INDEX idx_family_messages_created_at ON family_messages(created_at DESC);
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_points_transactions_user_id ON points_transactions(user_id);
CREATE INDEX idx_points_transactions_created_at ON points_transactions(created_at DESC);
CREATE INDEX idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX idx_user_notifications_is_read ON user_notifications(is_read);

-- Updated At Trigger Function
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply Updated At Triggers
CREATE TRIGGER set_timestamp_user_profiles BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_families BEFORE UPDATE ON families FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_tasks BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_family_events BEFORE UPDATE ON family_events FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_family_messages BEFORE UPDATE ON family_messages FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_habits BEFORE UPDATE ON habits FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_reward_items BEFORE UPDATE ON reward_items FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_family_settings BEFORE UPDATE ON family_settings FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- Utility Functions
CREATE OR REPLACE FUNCTION generate_family_code()
RETURNS TEXT AS $$
DECLARE
    new_code TEXT;
    done BOOLEAN := FALSE;
BEGIN
    WHILE NOT done LOOP
        new_code := upper(substring(md5(random()::text) from 1 for 6));
        IF NOT EXISTS (SELECT 1 FROM families WHERE family_code = new_code) THEN
            done := TRUE;
        END IF;
    END LOOP;
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_invitation_code()
RETURNS TEXT AS $$
DECLARE
    new_code TEXT;
    done BOOLEAN := FALSE;
    chars TEXT := 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
BEGIN
    WHILE NOT done LOOP
        new_code := '';
        FOR i IN 1..8 LOOP
            new_code := new_code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
        END LOOP;
        IF NOT EXISTS (SELECT 1 FROM family_invitations WHERE invitation_code = new_code) THEN
            done := TRUE;
        END IF;
    END LOOP;
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_user_level(total_points INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN GREATEST(1, FLOOR(SQRT(total_points / 100.0)) + 1);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION award_user_points(
    user_id UUID,
    points_to_award INTEGER,
    award_reason TEXT,
    reference_id UUID DEFAULT NULL,
    transaction_type TEXT DEFAULT 'bonus'
)
RETURNS TABLE(new_total_points INTEGER, new_level INTEGER) AS $$
DECLARE
    current_points INTEGER;
    new_points INTEGER;
    new_user_level INTEGER;
BEGIN
    SELECT total_points INTO current_points 
    FROM user_profiles 
    WHERE id = user_id;
    
    new_points := current_points + points_to_award;
    new_user_level := calculate_user_level(new_points);
    
    UPDATE user_profiles 
    SET total_points = new_points, 
        level = new_user_level,
        updated_at = NOW()
    WHERE id = user_id;
    
    INSERT INTO points_transactions (user_id, points, transaction_type, reference_id, description)
    VALUES (user_id, points_to_award, transaction_type, reference_id, award_reason);
    
    RETURN QUERY SELECT new_points, new_user_level;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate codes triggers
CREATE OR REPLACE FUNCTION set_family_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.family_code IS NULL OR NEW.family_code = '' THEN
        NEW.family_code := generate_family_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_family_code 
    BEFORE INSERT ON families 
    FOR EACH ROW 
    EXECUTE FUNCTION set_family_code();

CREATE OR REPLACE FUNCTION set_invitation_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.invitation_code IS NULL OR NEW.invitation_code = '' THEN
        NEW.invitation_code := generate_invitation_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_invitation_code 
    BEFORE INSERT ON family_invitations 
    FOR EACH ROW 
    EXECUTE FUNCTION set_invitation_code();

-- Task completion trigger
CREATE OR REPLACE FUNCTION handle_task_completion()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        IF NEW.assigned_to IS NOT NULL THEN
            PERFORM award_user_points(
                NEW.assigned_to,
                NEW.points_value,
                'Task completed: ' || NEW.title,
                NEW.id,
                'task_completion'
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_task_completion 
    AFTER UPDATE ON tasks 
    FOR EACH ROW 
    EXECUTE FUNCTION handle_task_completion();

-- Handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, display_name, age_group)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'age_group', 'adult')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view family members" ON family_members
    FOR SELECT USING (
        user_id = auth.uid() OR
        family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can view family invitations" ON family_invitations
    FOR SELECT USING (
        invited_by = auth.uid() OR
        family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Family members can create invitations" ON family_invitations
    FOR INSERT WITH CHECK (
        family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid() AND role = 'parent')
    );

CREATE POLICY "Users can view family tasks" ON tasks
    FOR SELECT USING (
        family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Family members can create tasks" ON tasks
    FOR INSERT WITH CHECK (
        family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can update assigned tasks or own created tasks" ON tasks
    FOR UPDATE USING (
        assigned_to = auth.uid() OR 
        created_by = auth.uid() OR
        (family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid() AND role = 'parent'))
    );

CREATE POLICY "Users can view family events" ON family_events
    FOR SELECT USING (
        family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can view family messages" ON family_messages
    FOR SELECT USING (
        family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can view own points transactions" ON points_transactions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view own notifications" ON user_notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Anyone can view achievement definitions" ON achievement_definitions
    FOR SELECT USING (true);

CREATE POLICY "Users can view own achievements" ON user_achievements
    FOR SELECT USING (user_id = auth.uid());

-- Insert default achievement definitions
INSERT INTO achievement_definitions (name, description, icon, category, criteria, points_reward) VALUES
('First Task', 'Complete your first task', '🎯', 'tasks', '{"tasks_completed": 1}', 50),
('Task Master', 'Complete 10 tasks', '🏆', 'tasks', '{"tasks_completed": 10}', 100),
('Streak Starter', 'Complete tasks for 3 days in a row', '🔥', 'streaks', '{"daily_streak": 3}', 75),
('Week Warrior', 'Complete tasks for 7 days in a row', '⚡', 'streaks', '{"daily_streak": 7}', 200),
('Point Collector', 'Earn 500 total points', '💎', 'points', '{"total_points": 500}', 100),
('Point Master', 'Earn 1000 total points', '👑', 'points', '{"total_points": 1000}', 250),
('Team Player', 'Help a family member with their task', '🤝', 'social', '{"helped_others": 1}', 50),
('Family Star', 'Receive 5 positive comments from family', '⭐', 'social', '{"positive_feedback": 5}', 150);

COMMIT;
