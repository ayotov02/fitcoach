# Database Schema Documentation

## Overview

This fitness coaching platform uses Supabase (PostgreSQL) with Row Level Security (RLS) for secure, role-based data access.

## Core Tables

### users
Extends Supabase auth.users with additional profile information.

```sql
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL,  -- 'coach', 'client', 'admin'
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### coaches
Coach-specific business information and settings.

```sql
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
  total_clients INTEGER DEFAULT 0
);
```

### clients
Client profiles with fitness goals and preferences.

```sql
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
  
  -- Goals and Preferences
  primary_goal TEXT,
  secondary_goals TEXT[],
  target_weight_kg DECIMAL(5,2),
  
  -- Status
  onboarding_completed BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE
);
```

### subscriptions
Coach subscription and billing management.

```sql
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID REFERENCES coaches(id) ON DELETE CASCADE,
  plan_type subscription_plan NOT NULL DEFAULT 'free',
  status subscription_status NOT NULL DEFAULT 'active',
  
  -- Stripe integration
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  
  -- Plan limits
  max_clients INTEGER,
  max_workouts_per_month INTEGER,
  ai_features_enabled BOOLEAN DEFAULT FALSE
);
```

## Security Model

### Row Level Security Policies

All tables have RLS enabled with policies that enforce:

1. **Users can only access their own data**
2. **Coaches can view/manage their clients**
3. **Clients can only see their assigned coach**
4. **Service role bypasses RLS for admin operations**

### Example Policies

```sql
-- Users can view own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Coaches can view their clients
CREATE POLICY "Coaches can view their clients" ON clients
  FOR SELECT USING (
    coach_id IN (SELECT id FROM coaches WHERE user_id = auth.uid())
  );
```

## Data Relationships

```
auth.users (Supabase)
    ↓ (extends)
users
    ↓
coaches ←→ clients (many-to-many via coach_client_relationships)
    ↓
subscriptions
```

## Indexes

Performance-optimized indexes on frequently queried columns:

- `users.email`, `users.role`
- `coaches.user_id`
- `clients.user_id`, `clients.coach_id`
- `subscriptions.coach_id`

## Migration Notes

When updating the schema:

1. Always test migrations on a development database first
2. Consider data migration scripts for existing users
3. Update RLS policies if table structure changes
4. Rebuild indexes if query patterns change

## Backup Strategy

Supabase provides:
- Automatic daily backups
- Point-in-time recovery
- Manual backup exports

For production:
- Set up additional backup automation
- Test restore procedures regularly
- Monitor backup success/failures