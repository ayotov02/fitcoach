-- =============================================
-- COMPLETE SUPABASE DATABASE SETUP
-- Run this entire script in Supabase SQL Editor
-- =============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================
-- CUSTOM TYPES
-- =============================================

-- Create custom types
CREATE TYPE user_role AS ENUM ('coach', 'client', 'admin');
CREATE TYPE subscription_plan AS ENUM ('free', 'basic', 'premium', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'unpaid');
CREATE TYPE workout_status AS ENUM ('draft', 'active', 'completed', 'archived');
CREATE TYPE exercise_type AS ENUM ('strength', 'cardio', 'flexibility');

-- =============================================
-- CORE USER TABLES
-- =============================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'client',
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coaches table
CREATE TABLE IF NOT EXISTS public.coaches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  business_name TEXT,
  bio TEXT,
  specialties TEXT[] DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  years_experience INTEGER DEFAULT 0,
  hourly_rate DECIMAL(10,2),
  location TEXT,
  timezone TEXT DEFAULT 'UTC',
  verified BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3,2) DEFAULT 0,
  total_clients INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clients table
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  coach_id UUID REFERENCES public.coaches(id) ON DELETE SET NULL,
  
  -- Personal Information
  age INTEGER,
  height_cm INTEGER,
  weight_kg DECIMAL(5,2),
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  fitness_level TEXT CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced')),
  
  -- Goals
  primary_goal TEXT,
  secondary_goals TEXT[] DEFAULT '{}',
  target_weight_kg DECIMAL(5,2),
  goal_timeline TEXT,
  
  -- Status
  onboarding_completed BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- WORKOUT SYSTEM TABLES
-- =============================================

-- Exercises library
CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  muscle_groups TEXT[] DEFAULT '{}',
  equipment TEXT[] DEFAULT '{}',
  exercise_type exercise_type NOT NULL DEFAULT 'strength',
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  video_url TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workouts
CREATE TABLE IF NOT EXISTS public.workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID REFERENCES public.coaches(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status workout_status DEFAULT 'draft',
  scheduled_date DATE,
  duration_minutes INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workout exercises (junction table)
CREATE TABLE IF NOT EXISTS public.workout_exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_id UUID REFERENCES public.workouts(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  sets INTEGER,
  reps INTEGER,
  weight_kg DECIMAL(5,2),
  rest_seconds INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- AI SYSTEM TABLES
-- =============================================

-- AI Conversations
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  title TEXT,
  context_type TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Messages
CREATE TABLE IF NOT EXISTS public.ai_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Insights
CREATE TABLE IF NOT EXISTS public.ai_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  coach_id UUID REFERENCES public.coaches(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  data_analysis JSONB DEFAULT '{}',
  confidence_score DECIMAL(3,2),
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('pending', 'acknowledged', 'acted_upon', 'dismissed')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- =============================================
-- MARKETPLACE TABLES
-- =============================================

-- Marketplace Products
CREATE TABLE IF NOT EXISTS public.marketplace_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID REFERENCES public.coaches(id) ON DELETE CASCADE,
  product_type TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'active', 'paused', 'archived')),
  featured BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  cover_image_url TEXT,
  gallery_images TEXT[] DEFAULT '{}',
  file_urls TEXT[] DEFAULT '{}',
  is_subscription BOOLEAN DEFAULT FALSE,
  billing_interval TEXT,
  trial_days INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  purchase_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marketplace Orders
CREATE TABLE IF NOT EXISTS public.marketplace_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  buyer_id UUID REFERENCES public.users(id),
  seller_id UUID REFERENCES public.users(id),
  subtotal_amount DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  platform_fee_amount DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled', 'refunded')),
  payment_intent_id TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded')),
  billing_address JSONB,
  customer_email TEXT,
  ordered_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.marketplace_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.marketplace_products(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  download_links TEXT[] DEFAULT '{}',
  access_granted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marketplace Reviews
CREATE TABLE IF NOT EXISTS public.marketplace_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.marketplace_products(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES public.users(id),
  order_id UUID REFERENCES public.marketplace_orders(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_title TEXT,
  review_text TEXT,
  verified_purchase BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, buyer_id)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Coach indexes
CREATE INDEX IF NOT EXISTS idx_coaches_user_id ON public.coaches(user_id);
CREATE INDEX IF NOT EXISTS idx_coaches_verified ON public.coaches(verified);

-- Client indexes
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_coach_id ON public.clients(coach_id);

-- Workout indexes
CREATE INDEX IF NOT EXISTS idx_workouts_coach_id ON public.workouts(coach_id);
CREATE INDEX IF NOT EXISTS idx_workouts_client_id ON public.workouts(client_id);
CREATE INDEX IF NOT EXISTS idx_workouts_status ON public.workouts(status);

-- AI indexes
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON public.ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON public.ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_client_id ON public.ai_insights(client_id);

-- Marketplace indexes
CREATE INDEX IF NOT EXISTS idx_products_coach_id ON public.marketplace_products(coach_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.marketplace_products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.marketplace_products(category);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON public.marketplace_orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.marketplace_reviews(product_id);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_reviews ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Coaches policies
CREATE POLICY "Coaches can manage own data" ON public.coaches
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public can view verified coaches" ON public.coaches
  FOR SELECT USING (verified = true);

-- Clients policies
CREATE POLICY "Clients can manage own data" ON public.clients
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Coaches can view their clients" ON public.clients
  FOR SELECT USING (coach_id IN (SELECT id FROM public.coaches WHERE user_id = auth.uid()));

-- Workouts policies
CREATE POLICY "Coaches can manage workouts" ON public.workouts
  FOR ALL USING (coach_id IN (SELECT id FROM public.coaches WHERE user_id = auth.uid()));

CREATE POLICY "Clients can view their workouts" ON public.workouts
  FOR SELECT USING (client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid()));

-- AI policies
CREATE POLICY "Users can manage their AI conversations" ON public.ai_conversations
  FOR ALL USING (auth.uid() = user_id);

-- Marketplace policies
CREATE POLICY "Public can view active products" ON public.marketplace_products
  FOR SELECT USING (status = 'active');

CREATE POLICY "Coaches can manage their products" ON public.marketplace_products
  FOR ALL USING (coach_id IN (SELECT id FROM public.coaches WHERE user_id = auth.uid()));

-- Orders policies
CREATE POLICY "Users can view their orders" ON public.marketplace_orders
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Reviews policies
CREATE POLICY "Public can view approved reviews" ON public.marketplace_reviews
  FOR SELECT USING (is_approved = true);

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coaches_updated_at BEFORE UPDATE ON public.coaches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workouts_updated_at BEFORE UPDATE ON public.workouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.marketplace_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                      UPPER(SUBSTRING(NEW.id::text, 1, 8));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to generate order numbers
CREATE TRIGGER generate_order_number_trigger
  BEFORE INSERT ON public.marketplace_orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- =============================================
-- SAMPLE DATA (OPTIONAL)
-- =============================================

-- Insert sample exercises
INSERT INTO public.exercises (name, description, muscle_groups, equipment, exercise_type, difficulty_level) VALUES
('Push-ups', 'Classic bodyweight chest exercise', ARRAY['chest', 'shoulders', 'triceps'], ARRAY['bodyweight'], 'strength', 'beginner'),
('Squats', 'Fundamental lower body exercise', ARRAY['quadriceps', 'glutes', 'hamstrings'], ARRAY['bodyweight'], 'strength', 'beginner'),
('Plank', 'Core stability exercise', ARRAY['core', 'shoulders'], ARRAY['bodyweight'], 'strength', 'beginner'),
('Deadlifts', 'Compound posterior chain exercise', ARRAY['hamstrings', 'glutes', 'back'], ARRAY['barbell'], 'strength', 'intermediate'),
('Running', 'Cardiovascular endurance exercise', ARRAY['legs'], ARRAY['none'], 'cardio', 'beginner'),
('Pull-ups', 'Upper body pulling exercise', ARRAY['back', 'biceps'], ARRAY['pull-up bar'], 'strength', 'intermediate')
ON CONFLICT DO NOTHING;