-- Additional Client Management Tables
-- Run this after the main schema.sql file

-- Extended client profiles table
CREATE TABLE client_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  coach_id UUID REFERENCES coaches(id) ON DELETE CASCADE,
  
  -- Personal Information
  date_of_birth DATE,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  occupation TEXT,
  
  -- Fitness Information
  fitness_level TEXT CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced')),
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active')),
  training_experience_years INTEGER,
  
  -- Medical Information
  medical_conditions TEXT[],
  injuries TEXT[],
  medications TEXT[],
  allergies TEXT[],
  medical_clearance BOOLEAN DEFAULT FALSE,
  
  -- Goals and Preferences
  primary_goal TEXT NOT NULL,
  secondary_goals TEXT[],
  motivation_factors TEXT[],
  barriers_to_exercise TEXT[],
  
  -- Training Preferences
  preferred_workout_times TEXT[],
  available_days TEXT[],
  session_duration_preference INTEGER, -- in minutes
  workout_location_preference TEXT CHECK (workout_location_preference IN ('home', 'gym', 'outdoor', 'hybrid')),
  equipment_access TEXT[],
  
  -- Status and Tracking
  status TEXT CHECK (status IN ('active', 'inactive', 'needs_attention', 'at_risk', 'paused')) DEFAULT 'active',
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')) DEFAULT 'low',
  last_activity_date TIMESTAMPTZ,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, coach_id)
);

-- Client measurements tracking
CREATE TABLE client_measurements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES client_profiles(id) ON DELETE CASCADE,
  measurement_date DATE NOT NULL,
  
  -- Body Composition
  weight_kg DECIMAL(5,2),
  body_fat_percentage DECIMAL(4,2),
  muscle_mass_kg DECIMAL(5,2),
  bmr_calories INTEGER,
  
  -- Body Measurements (in cm)
  measurements JSONB DEFAULT '{}', -- flexible measurements storage
  /*
  Example measurements JSON structure:
  {
    "chest": 95.5,
    "waist": 82.0,
    "hips": 98.2,
    "bicep_left": 32.1,
    "bicep_right": 32.3,
    "thigh_left": 56.8,
    "thigh_right": 56.5,
    "neck": 38.2,
    "forearm_left": 28.1,
    "forearm_right": 28.3,
    "calf_left": 36.2,
    "calf_right": 36.4
  }
  */
  
  -- Additional Metrics
  resting_heart_rate INTEGER,
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  
  -- Notes and Context
  notes TEXT,
  measurement_context TEXT, -- e.g., "morning, fasted", "post-workout", etc.
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(client_id, measurement_date)
);

-- Client progress photos
CREATE TABLE client_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES client_profiles(id) ON DELETE CASCADE,
  
  photo_url TEXT NOT NULL,
  photo_type TEXT CHECK (photo_type IN ('front', 'back', 'side_left', 'side_right', 'progress', 'before', 'after')) NOT NULL,
  photo_date DATE NOT NULL,
  
  -- Photo metadata
  description TEXT,
  tags TEXT[],
  is_public BOOLEAN DEFAULT FALSE,
  is_before_photo BOOLEAN DEFAULT FALSE,
  is_milestone_photo BOOLEAN DEFAULT FALSE,
  
  -- File information
  file_size_bytes INTEGER,
  mime_type TEXT,
  original_filename TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coach notes and AI insights
CREATE TABLE client_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES client_profiles(id) ON DELETE CASCADE,
  coach_id UUID REFERENCES coaches(id) ON DELETE CASCADE,
  
  note_text TEXT NOT NULL,
  note_type TEXT CHECK (note_type IN ('general', 'workout', 'nutrition', 'progress', 'concern', 'achievement', 'ai_insight')) DEFAULT 'general',
  
  -- AI Integration
  ai_generated BOOLEAN DEFAULT FALSE,
  ai_confidence_score DECIMAL(3,2), -- 0.00 to 1.00
  ai_suggestion_category TEXT,
  
  -- Categorization
  tags TEXT[],
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  is_private BOOLEAN DEFAULT FALSE,
  
  -- Follow-up
  requires_action BOOLEAN DEFAULT FALSE,
  action_deadline DATE,
  action_completed BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client goals tracking
CREATE TABLE client_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES client_profiles(id) ON DELETE CASCADE,
  
  goal_title TEXT NOT NULL,
  goal_description TEXT,
  goal_type TEXT CHECK (goal_type IN ('weight_loss', 'muscle_gain', 'strength', 'endurance', 'flexibility', 'body_composition', 'performance', 'lifestyle', 'health')) NOT NULL,
  
  -- SMART Goal Criteria
  specific_description TEXT,
  measurable_metric TEXT,
  target_value DECIMAL(10,2),
  target_unit TEXT, -- kg, %, reps, minutes, etc.
  current_value DECIMAL(10,2),
  
  -- Timeline
  start_date DATE DEFAULT CURRENT_DATE,
  target_date DATE NOT NULL,
  achieved_date DATE,
  
  -- Status
  status TEXT CHECK (status IN ('active', 'completed', 'paused', 'cancelled', 'modified')) DEFAULT 'active',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  
  -- Progress Tracking
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  milestones JSONB DEFAULT '[]', -- array of milestone objects
  /*
  Example milestones JSON:
  [
    {
      "percentage": 25,
      "description": "Lost 5kg",
      "achieved": true,
      "achieved_date": "2024-02-15"
    },
    {
      "percentage": 50,
      "description": "Lost 10kg",
      "achieved": false,
      "target_date": "2024-04-01"
    }
  ]
  */
  
  -- Motivation and Tracking
  reward_for_achievement TEXT,
  accountability_partner TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client activity log for status tracking
CREATE TABLE client_activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES client_profiles(id) ON DELETE CASCADE,
  
  activity_type TEXT CHECK (activity_type IN ('login', 'workout_completed', 'measurement_logged', 'photo_uploaded', 'message_sent', 'goal_updated', 'check_in')) NOT NULL,
  activity_date TIMESTAMPTZ DEFAULT NOW(),
  
  -- Activity metadata
  activity_data JSONB DEFAULT '{}',
  activity_source TEXT, -- web, mobile, api, etc.
  
  -- Scoring for engagement tracking
  engagement_score INTEGER DEFAULT 1, -- points for different activities
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client communication preferences
CREATE TABLE client_communication_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES client_profiles(id) ON DELETE CASCADE,
  
  -- Communication Channels
  preferred_contact_method TEXT CHECK (preferred_contact_method IN ('email', 'sms', 'app_notification', 'call')) DEFAULT 'app_notification',
  email_notifications BOOLEAN DEFAULT TRUE,
  sms_notifications BOOLEAN DEFAULT FALSE,
  push_notifications BOOLEAN DEFAULT TRUE,
  
  -- Timing Preferences
  preferred_contact_times TEXT[], -- e.g., ['morning', 'evening']
  timezone TEXT DEFAULT 'UTC',
  
  -- Content Preferences
  workout_reminders BOOLEAN DEFAULT TRUE,
  progress_updates BOOLEAN DEFAULT TRUE,
  motivational_messages BOOLEAN DEFAULT TRUE,
  educational_content BOOLEAN DEFAULT FALSE,
  
  -- Frequency Settings
  check_in_frequency TEXT CHECK (check_in_frequency IN ('daily', 'weekly', 'biweekly', 'monthly')) DEFAULT 'weekly',
  progress_report_frequency TEXT CHECK (progress_report_frequency IN ('weekly', 'biweekly', 'monthly')) DEFAULT 'monthly',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(client_id)
);

-- Add update triggers for new tables
CREATE TRIGGER update_client_profiles_updated_at BEFORE UPDATE ON client_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_photos_updated_at BEFORE UPDATE ON client_photos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_notes_updated_at BEFORE UPDATE ON client_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_goals_updated_at BEFORE UPDATE ON client_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_communication_preferences_updated_at BEFORE UPDATE ON client_communication_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on new tables
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_communication_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for client_profiles
CREATE POLICY "Clients can view own profile" ON client_profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Clients can update own profile" ON client_profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Coaches can view their client profiles" ON client_profiles
  FOR SELECT USING (
    coach_id IN (SELECT id FROM coaches WHERE user_id = auth.uid())
  );

CREATE POLICY "Coaches can update their client profiles" ON client_profiles
  FOR UPDATE USING (
    coach_id IN (SELECT id FROM coaches WHERE user_id = auth.uid())
  );

CREATE POLICY "Coaches can insert client profiles" ON client_profiles
  FOR INSERT WITH CHECK (
    coach_id IN (SELECT id FROM coaches WHERE user_id = auth.uid())
  );

-- RLS Policies for client_measurements
CREATE POLICY "Clients can view own measurements" ON client_measurements
  FOR SELECT USING (
    client_id IN (SELECT id FROM client_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Coaches can view their client measurements" ON client_measurements
  FOR SELECT USING (
    client_id IN (
      SELECT cp.id FROM client_profiles cp 
      JOIN coaches c ON cp.coach_id = c.id 
      WHERE c.user_id = auth.uid()
    )
  );

CREATE POLICY "Coaches can manage their client measurements" ON client_measurements
  FOR ALL USING (
    client_id IN (
      SELECT cp.id FROM client_profiles cp 
      JOIN coaches c ON cp.coach_id = c.id 
      WHERE c.user_id = auth.uid()
    )
  );

-- RLS Policies for client_photos
CREATE POLICY "Clients can view own photos" ON client_photos
  FOR SELECT USING (
    client_id IN (SELECT id FROM client_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Coaches can view their client photos" ON client_photos
  FOR SELECT USING (
    client_id IN (
      SELECT cp.id FROM client_profiles cp 
      JOIN coaches c ON cp.coach_id = c.id 
      WHERE c.user_id = auth.uid()
    )
  );

CREATE POLICY "Coaches can manage their client photos" ON client_photos
  FOR ALL USING (
    client_id IN (
      SELECT cp.id FROM client_profiles cp 
      JOIN coaches c ON cp.coach_id = c.id 
      WHERE c.user_id = auth.uid()
    )
  );

-- RLS Policies for client_notes
CREATE POLICY "Coaches can manage their client notes" ON client_notes
  FOR ALL USING (
    coach_id IN (SELECT id FROM coaches WHERE user_id = auth.uid())
  );

-- RLS Policies for client_goals
CREATE POLICY "Clients can view own goals" ON client_goals
  FOR SELECT USING (
    client_id IN (SELECT id FROM client_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Coaches can manage their client goals" ON client_goals
  FOR ALL USING (
    client_id IN (
      SELECT cp.id FROM client_profiles cp 
      JOIN coaches c ON cp.coach_id = c.id 
      WHERE c.user_id = auth.uid()
    )
  );

-- Similar policies for remaining tables...
CREATE POLICY "Client activity log access" ON client_activity_log
  FOR ALL USING (
    client_id IN (
      SELECT cp.id FROM client_profiles cp 
      WHERE cp.user_id = auth.uid() 
      OR cp.coach_id IN (SELECT id FROM coaches WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Client communication preferences access" ON client_communication_preferences
  FOR ALL USING (
    client_id IN (
      SELECT cp.id FROM client_profiles cp 
      WHERE cp.user_id = auth.uid() 
      OR cp.coach_id IN (SELECT id FROM coaches WHERE user_id = auth.uid())
    )
  );

-- Indexes for better performance
CREATE INDEX idx_client_profiles_coach_id ON client_profiles(coach_id);
CREATE INDEX idx_client_profiles_status ON client_profiles(status);
CREATE INDEX idx_client_profiles_user_id ON client_profiles(user_id);
CREATE INDEX idx_client_measurements_client_id ON client_measurements(client_id);
CREATE INDEX idx_client_measurements_date ON client_measurements(measurement_date);
CREATE INDEX idx_client_photos_client_id ON client_photos(client_id);
CREATE INDEX idx_client_photos_date ON client_photos(photo_date);
CREATE INDEX idx_client_notes_client_id ON client_notes(client_id);
CREATE INDEX idx_client_notes_coach_id ON client_notes(coach_id);
CREATE INDEX idx_client_goals_client_id ON client_goals(client_id);
CREATE INDEX idx_client_goals_status ON client_goals(status);
CREATE INDEX idx_client_activity_log_client_id ON client_activity_log(client_id);
CREATE INDEX idx_client_activity_log_date ON client_activity_log(activity_date);