-- AI Integration Database Schema
-- This schema supports intelligent coaching recommendations, conversations, and analytics

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- AI Conversations Table
-- Stores chat conversations between users and AI assistant
CREATE TABLE ai_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conversation_data JSONB NOT NULL DEFAULT '[]'::jsonb,
    context_type VARCHAR(50) NOT NULL, -- 'general', 'workout', 'nutrition', 'client_analysis', 'goal_setting'
    context_id UUID, -- References specific workout, client, etc.
    metadata JSONB DEFAULT '{}'::jsonb,
    total_messages INTEGER DEFAULT 0,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Insights Table
-- Automated insights and analysis generated for coaches about their clients
CREATE TABLE ai_insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    coach_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    insight_type VARCHAR(100) NOT NULL, -- 'progress_analysis', 'plateau_detection', 'nutrition_adherence', 'dropout_risk', etc.
    content JSONB NOT NULL,
    confidence_score DECIMAL(3,2) DEFAULT 0.85, -- 0.00 to 1.00
    priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    status VARCHAR(20) DEFAULT 'new', -- 'new', 'viewed', 'acted_on', 'dismissed'
    action_items JSONB DEFAULT '[]'::jsonb,
    expires_at TIMESTAMP WITH TIME ZONE,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Recommendations Table
-- Personalized recommendations for users (both coaches and clients)
CREATE TABLE ai_recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rec_type VARCHAR(100) NOT NULL, -- 'workout_modification', 'nutrition_adjustment', 'goal_change', 'exercise_substitution', etc.
    title VARCHAR(255) NOT NULL,
    content JSONB NOT NULL,
    reasoning TEXT,
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'declined', 'expired'
    category VARCHAR(50), -- 'workout', 'nutrition', 'recovery', 'goal_setting', 'engagement'
    target_data JSONB, -- Related workout_id, nutrition_goal_id, etc.
    implementation_guide JSONB,
    expires_at TIMESTAMP WITH TIME ZONE,
    applied_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Analytics Table
-- Pattern recognition results and predictive analytics
CREATE TABLE ai_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL, -- 'user', 'workout_program', 'nutrition_plan', 'business'
    entity_id UUID,
    data_type VARCHAR(100) NOT NULL, -- 'performance_trends', 'adherence_patterns', 'dropout_risk', 'success_factors'
    analysis_results JSONB NOT NULL,
    patterns_detected JSONB DEFAULT '[]'::jsonb,
    predictions JSONB DEFAULT '{}'::jsonb,
    confidence_metrics JSONB DEFAULT '{}'::jsonb,
    data_period_start DATE,
    data_period_end DATE,
    model_version VARCHAR(50),
    processing_time_ms INTEGER,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Coaching Actions Table
-- Tracks AI-suggested actions and their implementation by coaches
CREATE TABLE ai_coaching_actions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    coach_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action_type VARCHAR(100) NOT NULL, -- 'send_check_in', 'adjust_workout', 'modify_nutrition', 'schedule_meeting', etc.
    ai_suggested BOOLEAN DEFAULT true,
    suggestion_data JSONB,
    action_taken JSONB,
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'skipped'
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    effectiveness_score INTEGER, -- 1-10 rating of how effective the action was
    client_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Model Interactions Table
-- Track all interactions with AI models for analytics and billing
CREATE TABLE ai_model_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    model_name VARCHAR(100) NOT NULL, -- 'gpt-4', 'claude-3', 'custom-nutrition', etc.
    interaction_type VARCHAR(50) NOT NULL, -- 'chat', 'analysis', 'recommendation', 'image_analysis'
    input_data JSONB,
    output_data JSONB,
    tokens_used INTEGER,
    processing_time_ms INTEGER,
    cost_usd DECIMAL(10,4),
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Learning Data Table
-- Store data for continuous learning and model improvement
CREATE TABLE ai_learning_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    data_type VARCHAR(100) NOT NULL, -- 'user_feedback', 'outcome_tracking', 'pattern_validation'
    input_features JSONB NOT NULL,
    actual_outcome JSONB,
    predicted_outcome JSONB,
    feedback_score DECIMAL(3,2), -- User satisfaction rating
    correction_data JSONB,
    model_version VARCHAR(50),
    validated BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Prompt Templates Table
-- Store reusable AI prompts for different scenarios
CREATE TABLE ai_prompt_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- 'coaching', 'analysis', 'recommendations', 'communication'
    template TEXT NOT NULL,
    variables JSONB DEFAULT '[]'::jsonb, -- List of variables that can be substituted
    model_config JSONB DEFAULT '{}'::jsonb, -- Model-specific configuration
    usage_count INTEGER DEFAULT 0,
    success_rate DECIMAL(3,2) DEFAULT 1.00,
    created_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_ai_conversations_user_context ON ai_conversations(user_id, context_type, last_activity DESC);
CREATE INDEX idx_ai_insights_client_priority ON ai_insights(client_id, priority, status, created_at DESC);
CREATE INDEX idx_ai_insights_coach_status ON ai_insights(coach_id, status, priority, created_at DESC);
CREATE INDEX idx_ai_recommendations_user_status ON ai_recommendations(user_id, status, priority, created_at DESC);
CREATE INDEX idx_ai_analytics_entity ON ai_analytics(entity_type, entity_id, updated_at DESC);
CREATE INDEX idx_ai_coaching_actions_coach_status ON ai_coaching_actions(coach_id, status, due_date);
CREATE INDEX idx_ai_coaching_actions_client ON ai_coaching_actions(client_id, status, created_at DESC);
CREATE INDEX idx_ai_model_interactions_user_date ON ai_model_interactions(user_id, created_at DESC);
CREATE INDEX idx_ai_learning_data_type ON ai_learning_data(data_type, validated, created_at DESC);
CREATE INDEX idx_ai_prompt_templates_category ON ai_prompt_templates(category, is_active);

-- Row Level Security Policies
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_coaching_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_model_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_learning_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_prompt_templates ENABLE ROW LEVEL SECURITY;

-- AI Conversations Policies
CREATE POLICY "Users can view their own conversations" ON ai_conversations
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own conversations" ON ai_conversations
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own conversations" ON ai_conversations
    FOR UPDATE USING (user_id = auth.uid());

-- AI Insights Policies
CREATE POLICY "Coaches can view insights about their clients" ON ai_insights
    FOR SELECT USING (
        coach_id = auth.uid() OR 
        client_id = auth.uid()
    );

CREATE POLICY "System can create insights" ON ai_insights
    FOR INSERT WITH CHECK (true); -- System-generated, controlled by application

CREATE POLICY "Coaches can update insights for their clients" ON ai_insights
    FOR UPDATE USING (coach_id = auth.uid());

-- AI Recommendations Policies
CREATE POLICY "Users can view their own recommendations" ON ai_recommendations
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can create recommendations" ON ai_recommendations
    FOR INSERT WITH CHECK (true); -- System-generated

CREATE POLICY "Users can update their own recommendations" ON ai_recommendations
    FOR UPDATE USING (user_id = auth.uid());

-- AI Analytics Policies
CREATE POLICY "Users can view analytics related to them" ON ai_analytics
    FOR SELECT USING (
        entity_type = 'user' AND entity_id = auth.uid() OR
        entity_type IN ('business', 'platform') -- Global analytics for all users
    );

-- AI Coaching Actions Policies
CREATE POLICY "Coaches can view actions for their clients" ON ai_coaching_actions
    FOR SELECT USING (coach_id = auth.uid());

CREATE POLICY "Clients can view actions about them" ON ai_coaching_actions
    FOR SELECT USING (client_id = auth.uid());

CREATE POLICY "Coaches can create and update actions" ON ai_coaching_actions
    FOR ALL USING (coach_id = auth.uid());

-- AI Model Interactions Policies (for usage tracking)
CREATE POLICY "Users can view their own AI interactions" ON ai_model_interactions
    FOR SELECT USING (user_id = auth.uid());

-- Utility Functions for AI Operations

-- Function to add a message to a conversation
CREATE OR REPLACE FUNCTION add_ai_conversation_message(
    conversation_id UUID,
    role VARCHAR(20), -- 'user', 'assistant', 'system'
    content TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    message_id UUID;
    new_message JSONB;
BEGIN
    message_id := gen_random_uuid();
    
    new_message := jsonb_build_object(
        'id', message_id,
        'role', role,
        'content', content,
        'metadata', metadata,
        'timestamp', NOW()
    );
    
    UPDATE ai_conversations 
    SET 
        conversation_data = conversation_data || new_message,
        total_messages = total_messages + 1,
        last_activity = NOW(),
        updated_at = NOW()
    WHERE id = conversation_id;
    
    RETURN message_id;
END;
$$;

-- Function to create AI insight
CREATE OR REPLACE FUNCTION create_ai_insight(
    p_client_id UUID,
    p_coach_id UUID,
    p_insight_type VARCHAR(100),
    p_content JSONB,
    p_confidence_score DECIMAL DEFAULT 0.85,
    p_priority VARCHAR(20) DEFAULT 'medium',
    p_action_items JSONB DEFAULT '[]'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    insight_id UUID;
BEGIN
    INSERT INTO ai_insights (
        client_id, coach_id, insight_type, content, confidence_score, 
        priority, action_items
    ) VALUES (
        p_client_id, p_coach_id, p_insight_type, p_content, p_confidence_score,
        p_priority, p_action_items
    ) RETURNING id INTO insight_id;
    
    RETURN insight_id;
END;
$$;

-- Function to update recommendation status
CREATE OR REPLACE FUNCTION update_ai_recommendation_status(
    rec_id UUID,
    new_status VARCHAR(20),
    implementation_data JSONB DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE ai_recommendations 
    SET 
        status = new_status,
        applied_at = CASE WHEN new_status = 'accepted' THEN NOW() ELSE applied_at END,
        implementation_guide = COALESCE(implementation_data, implementation_guide),
        updated_at = NOW()
    WHERE id = rec_id;
    
    RETURN FOUND;
END;
$$;

-- Function to get AI coaching suggestions for a client
CREATE OR REPLACE FUNCTION get_ai_coaching_suggestions(p_client_id UUID)
RETURNS TABLE (
    action_type VARCHAR(100),
    priority VARCHAR(20),
    suggestion JSONB,
    confidence DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        aca.action_type,
        aca.priority,
        aca.suggestion_data as suggestion,
        COALESCE((aca.suggestion_data->>'confidence')::DECIMAL, 0.85) as confidence
    FROM ai_coaching_actions aca
    WHERE aca.client_id = p_client_id 
      AND aca.status = 'pending'
      AND aca.ai_suggested = true
    ORDER BY 
        CASE aca.priority 
            WHEN 'urgent' THEN 1
            WHEN 'high' THEN 2  
            WHEN 'medium' THEN 3
            ELSE 4
        END,
        aca.created_at DESC;
END;
$$;

-- Triggers for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ai_conversations_updated_at BEFORE UPDATE ON ai_conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_insights_updated_at BEFORE UPDATE ON ai_insights
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_recommendations_updated_at BEFORE UPDATE ON ai_recommendations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_analytics_updated_at BEFORE UPDATE ON ai_analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_coaching_actions_updated_at BEFORE UPDATE ON ai_coaching_actions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_prompt_templates_updated_at BEFORE UPDATE ON ai_prompt_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample AI prompt templates
INSERT INTO ai_prompt_templates (name, category, template, variables, model_config) VALUES
(
    'Weekly Progress Analysis',
    'analysis',
    'Analyze the weekly progress for client {{client_name}} based on the following data:

Workouts completed: {{workouts_completed}}/{{workouts_planned}}
Nutrition adherence: {{nutrition_adherence}}%
Weight change: {{weight_change}} kg
Body fat change: {{bf_change}}%
Sleep average: {{sleep_hours}} hours
Stress level: {{stress_level}}/10

Please provide:
1. Overall assessment of progress
2. Key achievements and areas of concern
3. Specific recommendations for next week
4. Motivational feedback for the client

Focus on actionable insights and maintain a encouraging tone.',
    '["client_name", "workouts_completed", "workouts_planned", "nutrition_adherence", "weight_change", "bf_change", "sleep_hours", "stress_level"]',
    '{"model": "gpt-4", "temperature": 0.7, "max_tokens": 1000}'
),
(
    'Workout Modification for Injury',
    'coaching',
    'The client {{client_name}} has reported {{injury_type}} affecting their {{body_part}}. 
    
Current workout plan includes:
{{current_exercises}}

Please suggest:
1. Exercises to avoid or modify
2. Alternative exercises that work similar muscle groups
3. Modifications to existing exercises
4. Recovery recommendations
5. Timeline for reassessment

Consider pain level: {{pain_level}}/10
Injury occurred: {{injury_date}}
Previous similar issues: {{injury_history}}',
    '["client_name", "injury_type", "body_part", "current_exercises", "pain_level", "injury_date", "injury_history"]',
    '{"model": "gpt-4", "temperature": 0.3, "max_tokens": 800}'
),
(
    'Plateau Breaking Strategy',
    'recommendations',
    'Client {{client_name}} has experienced a {{plateau_type}} plateau for {{plateau_duration}} weeks.

Current stats:
- Goal: {{primary_goal}}
- Current weight: {{current_weight}} kg
- Training frequency: {{training_days}} days/week
- Average calories: {{avg_calories}}/day
- Sleep: {{sleep_hours}} hours/night

Recent data shows:
{{recent_progress_data}}

Please create a comprehensive plateau-breaking strategy including:
1. Training modifications (exercises, intensity, volume)
2. Nutrition adjustments
3. Recovery optimization
4. Timeline and metrics to track
5. Motivation and mindset recommendations',
    '["client_name", "plateau_type", "plateau_duration", "primary_goal", "current_weight", "training_days", "avg_calories", "sleep_hours", "recent_progress_data"]',
    '{"model": "gpt-4", "temperature": 0.6, "max_tokens": 1200}'
);

-- Create a view for active AI recommendations dashboard
CREATE VIEW ai_recommendations_dashboard AS
SELECT 
    r.id,
    r.user_id,
    u.full_name as user_name,
    r.rec_type,
    r.title,
    r.priority,
    r.status,
    r.category,
    r.created_at,
    r.expires_at,
    CASE 
        WHEN r.expires_at < NOW() THEN true 
        ELSE false 
    END as is_expired
FROM ai_recommendations r
JOIN users u ON r.user_id = u.id
WHERE r.status IN ('pending', 'accepted')
ORDER BY 
    CASE r.priority 
        WHEN 'urgent' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        ELSE 4
    END,
    r.created_at DESC;

COMMENT ON TABLE ai_conversations IS 'Stores AI assistant conversations with context awareness';
COMMENT ON TABLE ai_insights IS 'AI-generated insights and analysis for coaches about their clients';
COMMENT ON TABLE ai_recommendations IS 'Personalized AI recommendations for users';
COMMENT ON TABLE ai_analytics IS 'Pattern recognition results and predictive analytics';
COMMENT ON TABLE ai_coaching_actions IS 'AI-suggested coaching actions and their implementation tracking';
COMMENT ON TABLE ai_model_interactions IS 'Tracks all AI model interactions for usage analytics';
COMMENT ON TABLE ai_learning_data IS 'Stores data for continuous AI learning and improvement';
COMMENT ON TABLE ai_prompt_templates IS 'Reusable AI prompt templates for different scenarios';