-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create custom types
CREATE TYPE user_role AS ENUM ('coach', 'client', 'admin');
CREATE TYPE subscription_plan AS ENUM ('free', 'basic', 'premium', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'unpaid');

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coaches table
CREATE TABLE coaches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  business_name TEXT,
  bio TEXT,
  specialties TEXT[],
  certifications TEXT[],
  years_experience INTEGER,
  hourly_rate DECIMAL(10,2),
  location TEXT,
  timezone TEXT,
  verified BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3,2) DEFAULT 0,
  total_clients INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clients table
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  coach_id UUID REFERENCES coaches(id) ON DELETE SET NULL,
  
  -- Personal Information
  age INTEGER,
  height_cm INTEGER,
  weight_kg DECIMAL(5,2),
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  fitness_level TEXT CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced')),
  
  -- Goals
  primary_goal TEXT,
  secondary_goals TEXT[],
  target_weight_kg DECIMAL(5,2),
  goal_timeline TEXT,
  
  -- Preferences
  workout_types TEXT[],
  available_equipment TEXT[],
  days_per_week INTEGER,
  session_duration_minutes INTEGER,
  preferred_times TEXT[],
  
  -- Progress tracking
  current_weight_kg DECIMAL(5,2),
  body_fat_percentage DECIMAL(4,2),
  
  -- Status
  onboarding_completed BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID REFERENCES coaches(id) ON DELETE CASCADE,
  plan_type subscription_plan NOT NULL DEFAULT 'free',
  status subscription_status NOT NULL DEFAULT 'active',
  
  -- Billing information
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  
  -- Plan limits
  max_clients INTEGER,
  max_workouts_per_month INTEGER,
  ai_features_enabled BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coach-Client relationships
CREATE TABLE coach_client_relationships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID REFERENCES coaches(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'active', 'paused', 'ended')) DEFAULT 'active',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(coach_id, client_id)
);

-- Profile completion tracking
CREATE TABLE profile_completion (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  basic_info_completed BOOLEAN DEFAULT FALSE,
  role_specific_completed BOOLEAN DEFAULT FALSE,
  preferences_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Functions to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add update triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
CREATE TRIGGER update_coaches_updated_at BEFORE UPDATE ON coaches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_client_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_completion ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for coaches
CREATE POLICY "Coaches can view own data" ON coaches
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Coaches can update own data" ON coaches
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Coaches can insert own data" ON coaches
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policies for clients
CREATE POLICY "Clients can view own data" ON clients
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Clients can update own data" ON clients
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Clients can insert own data" ON clients
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Coaches can view their clients" ON clients
  FOR SELECT USING (
    coach_id IN (SELECT id FROM coaches WHERE user_id = auth.uid())
  );

-- RLS Policies for subscriptions
CREATE POLICY "Coaches can view own subscription" ON subscriptions
  FOR SELECT USING (
    coach_id IN (SELECT id FROM coaches WHERE user_id = auth.uid())
  );

CREATE POLICY "Coaches can update own subscription" ON subscriptions
  FOR UPDATE USING (
    coach_id IN (SELECT id FROM coaches WHERE user_id = auth.uid())
  );

-- RLS Policies for coach-client relationships
CREATE POLICY "Coaches can manage their relationships" ON coach_client_relationships
  FOR ALL USING (
    coach_id IN (SELECT id FROM coaches WHERE user_id = auth.uid())
  );

CREATE POLICY "Clients can view their relationships" ON coach_client_relationships
  FOR SELECT USING (
    client_id IN (SELECT id FROM clients WHERE user_id = auth.uid())
  );

-- RLS Policies for profile completion
CREATE POLICY "Users can manage own profile completion" ON profile_completion
  FOR ALL USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_coaches_user_id ON coaches(user_id);
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_coach_id ON clients(coach_id);
CREATE INDEX idx_subscriptions_coach_id ON subscriptions(coach_id);
CREATE INDEX idx_coach_client_relationships_coach_id ON coach_client_relationships(coach_id);
CREATE INDEX idx_coach_client_relationships_client_id ON coach_client_relationships(client_id);