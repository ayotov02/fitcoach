export type ClientStatus = 'active' | 'inactive' | 'needs_attention' | 'at_risk' | 'paused';
export type RiskLevel = 'low' | 'medium' | 'high';
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';
export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
export type WorkoutLocationPreference = 'home' | 'gym' | 'outdoor' | 'hybrid';
export type PhotoType = 'front' | 'back' | 'side_left' | 'side_right' | 'progress' | 'before' | 'after';
export type NoteType = 'general' | 'workout' | 'nutrition' | 'progress' | 'concern' | 'achievement' | 'ai_insight';
export type Priority = 'low' | 'medium' | 'high';
export type GoalType = 'weight_loss' | 'muscle_gain' | 'strength' | 'endurance' | 'flexibility' | 'body_composition' | 'performance' | 'lifestyle' | 'health';
export type GoalStatus = 'active' | 'completed' | 'paused' | 'cancelled' | 'modified';

export interface ClientProfile {
  id: string;
  user_id: string;
  coach_id: string;
  
  // Personal Information
  date_of_birth?: Date;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  occupation?: string;
  
  // Fitness Information
  fitness_level?: FitnessLevel;
  activity_level?: ActivityLevel;
  training_experience_years?: number;
  
  // Medical Information
  medical_conditions?: string[];
  injuries?: string[];
  medications?: string[];
  allergies?: string[];
  medical_clearance: boolean;
  
  // Goals and Preferences
  primary_goal: string;
  secondary_goals?: string[];
  motivation_factors?: string[];
  barriers_to_exercise?: string[];
  
  // Training Preferences
  preferred_workout_times?: string[];
  available_days?: string[];
  session_duration_preference?: number;
  workout_location_preference?: WorkoutLocationPreference;
  equipment_access?: string[];
  
  // Status and Tracking
  status: ClientStatus;
  risk_level: RiskLevel;
  last_activity_date?: Date;
  onboarding_completed: boolean;
  
  created_at: Date;
  updated_at: Date;
  
  // Populated relations
  user?: {
    full_name?: string;
    email: string;
    avatar_url?: string;
  };
  coach?: {
    business_name?: string;
    user?: {
      full_name?: string;
    };
  };
}

export interface ClientMeasurement {
  id: string;
  client_id: string;
  measurement_date: Date;
  
  // Body Composition
  weight_kg?: number;
  body_fat_percentage?: number;
  muscle_mass_kg?: number;
  bmr_calories?: number;
  
  // Body Measurements (flexible JSON structure)
  measurements: {
    chest?: number;
    waist?: number;
    hips?: number;
    bicep_left?: number;
    bicep_right?: number;
    thigh_left?: number;
    thigh_right?: number;
    neck?: number;
    forearm_left?: number;
    forearm_right?: number;
    calf_left?: number;
    calf_right?: number;
    [key: string]: number | undefined;
  };
  
  // Additional Metrics
  resting_heart_rate?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  
  // Notes and Context
  notes?: string;
  measurement_context?: string;
  
  created_at: Date;
}

export interface ClientPhoto {
  id: string;
  client_id: string;
  photo_url: string;
  photo_type: PhotoType;
  photo_date: Date;
  
  // Photo metadata
  description?: string;
  tags?: string[];
  is_public: boolean;
  is_before_photo: boolean;
  is_milestone_photo: boolean;
  
  // File information
  file_size_bytes?: number;
  mime_type?: string;
  original_filename?: string;
  
  created_at: Date;
  updated_at: Date;
}

export interface ClientNote {
  id: string;
  client_id: string;
  coach_id: string;
  note_text: string;
  note_type: NoteType;
  
  // AI Integration
  ai_generated: boolean;
  ai_confidence_score?: number;
  ai_suggestion_category?: string;
  
  // Categorization
  tags?: string[];
  priority: Priority;
  is_private: boolean;
  
  // Follow-up
  requires_action: boolean;
  action_deadline?: Date;
  action_completed: boolean;
  
  created_at: Date;
  updated_at: Date;
  
  // Populated relations
  coach?: {
    user?: {
      full_name?: string;
    };
  };
}

export interface GoalMilestone {
  percentage: number;
  description: string;
  achieved: boolean;
  achieved_date?: string;
  target_date?: string;
}

export interface ClientGoal {
  id: string;
  client_id: string;
  goal_title: string;
  goal_description?: string;
  goal_type: GoalType;
  
  // SMART Goal Criteria
  specific_description?: string;
  measurable_metric?: string;
  target_value?: number;
  target_unit?: string;
  current_value?: number;
  
  // Timeline
  start_date: Date;
  target_date: Date;
  achieved_date?: Date;
  
  // Status
  status: GoalStatus;
  priority: Priority;
  
  // Progress Tracking
  progress_percentage: number;
  milestones: GoalMilestone[];
  
  // Motivation and Tracking
  reward_for_achievement?: string;
  accountability_partner?: string;
  
  created_at: Date;
  updated_at: Date;
}

export interface ClientActivityLog {
  id: string;
  client_id: string;
  activity_type: 'login' | 'workout_completed' | 'measurement_logged' | 'photo_uploaded' | 'message_sent' | 'goal_updated' | 'check_in';
  activity_date: Date;
  activity_data: Record<string, any>;
  activity_source?: string;
  engagement_score: number;
  created_at: Date;
}

export interface ClientCommunicationPreferences {
  id: string;
  client_id: string;
  
  // Communication Channels
  preferred_contact_method: 'email' | 'sms' | 'app_notification' | 'call';
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  
  // Timing Preferences
  preferred_contact_times?: string[];
  timezone: string;
  
  // Content Preferences
  workout_reminders: boolean;
  progress_updates: boolean;
  motivational_messages: boolean;
  educational_content: boolean;
  
  // Frequency Settings
  check_in_frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  progress_report_frequency: 'weekly' | 'biweekly' | 'monthly';
  
  created_at: Date;
  updated_at: Date;
}

// Enhanced client with all related data
export interface ClientWithDetails extends ClientProfile {
  measurements?: ClientMeasurement[];
  photos?: ClientPhoto[];
  notes?: ClientNote[];
  goals?: ClientGoal[];
  activity_log?: ClientActivityLog[];
  communication_preferences?: ClientCommunicationPreferences;
  latest_measurement?: ClientMeasurement;
  progress_summary?: {
    total_weight_lost?: number;
    goals_completed: number;
    engagement_score: number;
    days_since_last_activity: number;
  };
}

// Form types for client onboarding
export interface ClientOnboardingStep1 {
  full_name: string;
  email: string;
  date_of_birth: Date;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  occupation?: string;
}

export interface ClientOnboardingStep2 {
  primary_goal: string;
  secondary_goals?: string[];
  target_weight?: number;
  target_date?: Date;
  motivation_factors?: string[];
}

export interface ClientOnboardingStep3 {
  medical_conditions?: string[];
  injuries?: string[];
  medications?: string[];
  allergies?: string[];
  medical_clearance: boolean;
}

export interface ClientOnboardingStep4 {
  fitness_level: FitnessLevel;
  activity_level: ActivityLevel;
  training_experience_years?: number;
  preferred_workout_times?: string[];
  available_days?: string[];
  session_duration_preference?: number;
  workout_location_preference?: WorkoutLocationPreference;
  equipment_access?: string[];
}

export interface ClientOnboardingData extends 
  ClientOnboardingStep1, 
  ClientOnboardingStep2, 
  ClientOnboardingStep3, 
  ClientOnboardingStep4 {
  initial_measurements?: Partial<ClientMeasurement>;
  initial_photos?: File[];
}