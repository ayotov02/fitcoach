-- =============================================
-- AI SYSTEM ENHANCEMENT TABLES
-- Add these to existing AI system tables
-- =============================================

-- AI Recommendations
CREATE TABLE IF NOT EXISTS public.ai_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  rec_type TEXT NOT NULL CHECK (rec_type IN ('workout', 'nutrition', 'recovery', 'goal', 'general')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('pending', 'viewed', 'applied', 'dismissed')) DEFAULT 'pending',
  confidence_score DECIMAL(3,2),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Analytics
CREATE TABLE IF NOT EXISTS public.ai_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  coach_id UUID REFERENCES public.coaches(id) ON DELETE CASCADE,
  data_type TEXT NOT NULL CHECK (data_type IN ('progress', 'performance', 'nutrition', 'behavior', 'goals')),
  analysis_results JSONB NOT NULL DEFAULT '{}',
  patterns_detected TEXT[] DEFAULT '{}',
  predictions JSONB DEFAULT '{}',
  trends JSONB DEFAULT '{}',
  anomalies JSONB DEFAULT '{}',
  confidence_score DECIMAL(3,2),
  period_start DATE,
  period_end DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Coaching Actions
CREATE TABLE IF NOT EXISTS public.ai_coaching_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID REFERENCES public.coaches(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('check_in', 'program_adjustment', 'goal_update', 'intervention', 'celebration')),
  ai_suggested BOOLEAN DEFAULT TRUE,
  suggestion_reason TEXT,
  action_taken TEXT,
  effectiveness_score DECIMAL(3,2),
  completed_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('suggested', 'scheduled', 'completed', 'skipped')) DEFAULT 'suggested',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Progress Patterns
CREATE TABLE IF NOT EXISTS public.ai_progress_patterns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  pattern_type TEXT NOT NULL CHECK (pattern_type IN ('plateau', 'breakthrough', 'decline', 'consistency', 'volatility')),
  detected_metrics TEXT[] NOT NULL,
  pattern_strength DECIMAL(3,2),
  pattern_duration_days INTEGER,
  suggested_actions TEXT[],
  intervention_required BOOLEAN DEFAULT FALSE,
  pattern_data JSONB DEFAULT '{}',
  detection_date DATE DEFAULT CURRENT_DATE,
  resolution_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Content Generation History
CREATE TABLE IF NOT EXISTS public.ai_content_generation (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('workout', 'meal_plan', 'message', 'educational', 'social_media')),
  prompt_used TEXT NOT NULL,
  generated_content TEXT NOT NULL,
  personalization_factors JSONB DEFAULT '{}',
  usage_count INTEGER DEFAULT 0,
  effectiveness_rating DECIMAL(3,2),
  client_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  used_at TIMESTAMPTZ[]
);

-- AI Model Performance Tracking
CREATE TABLE IF NOT EXISTS public.ai_model_performance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  model_type TEXT NOT NULL,
  model_version TEXT NOT NULL,
  task_type TEXT NOT NULL,
  accuracy_score DECIMAL(5,4),
  confidence_avg DECIMAL(3,2),
  response_time_ms INTEGER,
  usage_count INTEGER DEFAULT 1,
  success_rate DECIMAL(3,2),
  error_count INTEGER DEFAULT 0,
  feedback_score DECIMAL(3,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR AI TABLES
-- =============================================

-- AI Recommendations indexes
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_user_id ON public.ai_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_client_id ON public.ai_recommendations(client_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_status ON public.ai_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_priority ON public.ai_recommendations(priority);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_expires_at ON public.ai_recommendations(expires_at);

-- AI Analytics indexes
CREATE INDEX IF NOT EXISTS idx_ai_analytics_client_id ON public.ai_analytics(client_id);
CREATE INDEX IF NOT EXISTS idx_ai_analytics_coach_id ON public.ai_analytics(coach_id);
CREATE INDEX IF NOT EXISTS idx_ai_analytics_data_type ON public.ai_analytics(data_type);
CREATE INDEX IF NOT EXISTS idx_ai_analytics_period ON public.ai_analytics(period_start, period_end);

-- AI Coaching Actions indexes
CREATE INDEX IF NOT EXISTS idx_ai_coaching_actions_coach_id ON public.ai_coaching_actions(coach_id);
CREATE INDEX IF NOT EXISTS idx_ai_coaching_actions_client_id ON public.ai_coaching_actions(client_id);
CREATE INDEX IF NOT EXISTS idx_ai_coaching_actions_status ON public.ai_coaching_actions(status);
CREATE INDEX IF NOT EXISTS idx_ai_coaching_actions_due_date ON public.ai_coaching_actions(due_date);

-- AI Progress Patterns indexes
CREATE INDEX IF NOT EXISTS idx_ai_progress_patterns_client_id ON public.ai_progress_patterns(client_id);
CREATE INDEX IF NOT EXISTS idx_ai_progress_patterns_type ON public.ai_progress_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_ai_progress_patterns_detection_date ON public.ai_progress_patterns(detection_date);

-- AI Content Generation indexes
CREATE INDEX IF NOT EXISTS idx_ai_content_generation_user_id ON public.ai_content_generation(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_content_generation_type ON public.ai_content_generation(content_type);
CREATE INDEX IF NOT EXISTS idx_ai_content_generation_created_at ON public.ai_content_generation(created_at);

-- =============================================
-- RLS POLICIES FOR AI TABLES
-- =============================================

-- Enable RLS
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_coaching_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_progress_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_content_generation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_model_performance ENABLE ROW LEVEL SECURITY;

-- AI Recommendations policies
CREATE POLICY "Users can view their AI recommendations" ON public.ai_recommendations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Coaches can view client recommendations" ON public.ai_recommendations
  FOR SELECT USING (client_id IN (SELECT id FROM public.clients WHERE coach_id IN (SELECT id FROM public.coaches WHERE user_id = auth.uid())));

-- AI Analytics policies
CREATE POLICY "Coaches can view their analytics" ON public.ai_analytics
  FOR SELECT USING (coach_id IN (SELECT id FROM public.coaches WHERE user_id = auth.uid()));

CREATE POLICY "Clients can view their analytics" ON public.ai_analytics
  FOR SELECT USING (client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid()));

-- AI Coaching Actions policies
CREATE POLICY "Coaches can manage their coaching actions" ON public.ai_coaching_actions
  FOR ALL USING (coach_id IN (SELECT id FROM public.coaches WHERE user_id = auth.uid()));

-- AI Progress Patterns policies
CREATE POLICY "Coaches can view client progress patterns" ON public.ai_progress_patterns
  FOR SELECT USING (client_id IN (SELECT id FROM public.clients WHERE coach_id IN (SELECT id FROM public.coaches WHERE user_id = auth.uid())));

CREATE POLICY "Clients can view their progress patterns" ON public.ai_progress_patterns
  FOR SELECT USING (client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid()));

-- AI Content Generation policies
CREATE POLICY "Users can manage their AI content" ON public.ai_content_generation
  FOR ALL USING (auth.uid() = user_id);

-- AI Model Performance policies (admin only)
CREATE POLICY "Admin can view model performance" ON public.ai_model_performance
  FOR SELECT USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

CREATE TRIGGER update_ai_recommendations_updated_at BEFORE UPDATE ON public.ai_recommendations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_analytics_updated_at BEFORE UPDATE ON public.ai_analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_coaching_actions_updated_at BEFORE UPDATE ON public.ai_coaching_actions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_progress_patterns_updated_at BEFORE UPDATE ON public.ai_progress_patterns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_model_performance_updated_at BEFORE UPDATE ON public.ai_model_performance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();