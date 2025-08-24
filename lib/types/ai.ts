export interface AIConversation {
  id: string
  user_id: string
  conversation_data: AIMessage[]
  context_type: 'general' | 'workout' | 'nutrition' | 'client_analysis' | 'goal_setting'
  context_id?: string
  metadata: Record<string, any>
  total_messages: number
  last_activity: string
  created_at: string
  updated_at: string
}

export interface AIMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  metadata?: Record<string, any>
  timestamp: string
}

export interface AIInsight {
  id: string
  client_id: string
  coach_id: string
  insight_type: 'progress_analysis' | 'plateau_detection' | 'nutrition_adherence' | 'dropout_risk' | 'goal_adjustment' | 'exercise_form' | 'recovery_needs' | 'motivation_boost'
  content: {
    title: string
    summary: string
    details: string
    data_points: Record<string, any>
    visualizations?: {
      type: 'chart' | 'progress_bar' | 'comparison' | 'trend'
      data: any[]
    }[]
  }
  confidence_score: number
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'new' | 'viewed' | 'acted_on' | 'dismissed'
  action_items: AIActionItem[]
  expires_at?: string
  acknowledged_at?: string
  created_at: string
  updated_at: string
}

export interface AIRecommendation {
  id: string
  user_id: string
  rec_type: 'workout_modification' | 'nutrition_adjustment' | 'goal_change' | 'exercise_substitution' | 'recovery_protocol' | 'supplement_suggestion' | 'timing_optimization'
  title: string
  content: {
    description: string
    benefits: string[]
    implementation_steps: string[]
    expected_outcomes: string[]
    timeline: string
  }
  reasoning: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  category: 'workout' | 'nutrition' | 'recovery' | 'goal_setting' | 'engagement'
  target_data?: Record<string, any>
  implementation_guide: {
    difficulty: 'easy' | 'medium' | 'hard'
    estimated_time: string
    resources_needed: string[]
    success_metrics: string[]
  }
  expires_at?: string
  applied_at?: string
  created_at: string
  updated_at: string
}

export interface AIAnalytics {
  id: string
  entity_type: 'user' | 'workout_program' | 'nutrition_plan' | 'business'
  entity_id?: string
  data_type: 'performance_trends' | 'adherence_patterns' | 'dropout_risk' | 'success_factors' | 'plateau_detection' | 'goal_achievement' | 'engagement_analysis'
  analysis_results: {
    summary: string
    key_findings: string[]
    trends: {
      metric: string
      direction: 'improving' | 'declining' | 'stable'
      change_percentage: number
      significance: 'low' | 'medium' | 'high'
    }[]
    anomalies: {
      type: string
      description: string
      severity: 'low' | 'medium' | 'high'
      detected_at: string
    }[]
  }
  patterns_detected: AIPattern[]
  predictions: {
    metric: string
    prediction: any
    confidence: number
    timeframe: string
    factors: string[]
  }[]
  confidence_metrics: {
    overall_confidence: number
    data_quality: number
    sample_size: number
    prediction_accuracy: number
  }
  data_period_start?: string
  data_period_end?: string
  model_version?: string
  processing_time_ms?: number
  updated_at: string
  created_at: string
}

export interface AICoachingAction {
  id: string
  coach_id: string
  client_id: string
  action_type: 'send_check_in' | 'adjust_workout' | 'modify_nutrition' | 'schedule_meeting' | 'provide_encouragement' | 'address_plateau' | 'goal_reassessment' | 'form_correction'
  ai_suggested: boolean
  suggestion_data?: {
    reasoning: string
    urgency: 'low' | 'medium' | 'high' | 'urgent'
    expected_impact: string
    success_probability: number
  }
  action_taken?: {
    method: 'message' | 'call' | 'email' | 'in_app' | 'program_update'
    content: string
    timestamp: string
  }
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed' | 'skipped'
  due_date?: string
  completed_at?: string
  effectiveness_score?: number
  client_response?: {
    satisfaction: number
    feedback: string
    outcome_achieved: boolean
  }
  created_at: string
  updated_at: string
}

export interface AIActionItem {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  action_type: 'immediate' | 'short_term' | 'long_term'
  estimated_impact: 'low' | 'medium' | 'high'
  completion_status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  due_date?: string
}

export interface AIPattern {
  id: string
  pattern_type: 'behavioral' | 'performance' | 'adherence' | 'physiological'
  description: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'irregular'
  strength: number // 0-1 confidence in pattern
  first_detected: string
  last_observed: string
  related_factors: string[]
}

export interface AIModelInteraction {
  id: string
  user_id?: string
  model_name: 'gpt-4' | 'gpt-3.5' | 'claude-3' | 'custom-nutrition' | 'custom-workout'
  interaction_type: 'chat' | 'analysis' | 'recommendation' | 'image_analysis' | 'pattern_recognition'
  input_data: Record<string, any>
  output_data: Record<string, any>
  tokens_used?: number
  processing_time_ms?: number
  cost_usd?: number
  success: boolean
  error_message?: string
  created_at: string
}

export interface AIPromptTemplate {
  id: string
  name: string
  category: 'coaching' | 'analysis' | 'recommendations' | 'communication'
  template: string
  variables: string[]
  model_config: {
    model: string
    temperature: number
    max_tokens: number
    [key: string]: any
  }
  usage_count: number
  success_rate: number
  created_by?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AIContext {
  user_id: string
  user_role: 'coach' | 'client'
  current_context: {
    type: 'general' | 'workout' | 'nutrition' | 'client_analysis' | 'goal_setting'
    data?: Record<string, any>
  }
  user_profile?: {
    name: string
    goals: string[]
    preferences: Record<string, any>
    restrictions: string[]
    history: {
      workouts_completed: number
      nutrition_adherence: number
      last_active: string
    }
  }
  client_context?: {
    id: string
    name: string
    current_program: any
    recent_progress: any
    last_interaction: string
  }
}

export interface AIAssistantConfig {
  model: string
  temperature: number
  max_tokens: number
  system_prompt: string
  context_window_size: number
  memory_enabled: boolean
  voice_enabled: boolean
  image_analysis_enabled: boolean
  real_time_data_access: boolean
}

export interface AIInsightGenerationRequest {
  client_id: string
  coach_id: string
  insight_types: string[]
  data_sources: ('workouts' | 'nutrition' | 'progress_photos' | 'measurements' | 'check_ins')[]
  time_range: {
    start: string
    end: string
  }
  priority_filter?: 'low' | 'medium' | 'high' | 'urgent'
  auto_generate_actions: boolean
}

export interface AIRecommendationRequest {
  user_id: string
  context_type: 'workout' | 'nutrition' | 'goal_setting' | 'recovery' | 'motivation'
  current_data: Record<string, any>
  goals: string[]
  constraints?: string[]
  preferences?: Record<string, any>
  urgency?: 'low' | 'medium' | 'high' | 'urgent'
}

export interface AIAnalysisRequest {
  entity_type: 'user' | 'workout_program' | 'nutrition_plan' | 'business'
  entity_id?: string
  analysis_types: string[]
  time_range: {
    start: string
    end: string
  }
  include_predictions: boolean
  confidence_threshold?: number
}

export interface AIProgressAnalysis {
  overall_score: number
  trend_direction: 'improving' | 'declining' | 'stable'
  key_achievements: string[]
  areas_of_concern: string[]
  recommendations: {
    immediate: AIRecommendation[]
    short_term: AIRecommendation[]
    long_term: AIRecommendation[]
  }
  predictions: {
    goal_achievement_probability: number
    estimated_goal_date?: string
    risk_factors: string[]
    success_factors: string[]
  }
  comparative_analysis: {
    vs_similar_users: {
      performance_percentile: number
      adherence_percentile: number
    }
    vs_personal_best: {
      current_vs_best_percentage: number
      time_since_best: string
    }
  }
}

export interface AIPlateauDetection {
  plateau_detected: boolean
  plateau_type: 'strength' | 'weight_loss' | 'muscle_gain' | 'performance' | 'motivation'
  duration_weeks: number
  severity: 'mild' | 'moderate' | 'severe'
  likely_causes: string[]
  intervention_strategies: {
    immediate: string[]
    short_term: string[]
    long_term: string[]
  }
  success_probability: number
  monitoring_metrics: string[]
}

export interface AIGoalOptimization {
  current_goals: {
    id: string
    description: string
    target_date: string
    progress_percentage: number
  }[]
  optimized_goals: {
    goal_id?: string
    type: 'modify' | 'add' | 'remove' | 'extend'
    description: string
    reasoning: string
    expected_impact: string
    difficulty_adjustment: number
    timeline_adjustment?: string
  }[]
  goal_conflicts: {
    conflicting_goals: string[]
    resolution_strategy: string
  }[]
  resource_allocation: {
    time_distribution: Record<string, number>
    priority_ranking: string[]
  }
}