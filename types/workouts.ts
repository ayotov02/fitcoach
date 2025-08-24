export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  subcategory?: string;
  muscle_groups: string[];
  equipment: string[];
  instructions: string;
  form_cues?: string[];
  video_url?: string;
  image_url?: string;
  difficulty: ExerciseDifficulty;
  exercise_type: ExerciseType;
  calories_per_minute?: number;
  tags?: string[];
  variations?: string[];
  is_compound: boolean;
  is_unilateral: boolean;
  contraindications?: string[];
  modifications?: string[];
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
}

export interface WorkoutTemplate {
  id: string;
  coach_id: string;
  name: string;
  description?: string;
  category: WorkoutCategory;
  difficulty: ExerciseDifficulty;
  estimated_duration: number; // minutes
  equipment_needed: string[];
  muscle_groups_targeted: string[];
  tags: string[];
  is_public: boolean;
  calories_estimate?: number;
  workout_structure?: WorkoutStructure;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
  exercises?: WorkoutExercise[];
}

export interface WorkoutExercise {
  id: string;
  workout_template_id: string;
  exercise_id: string;
  section: WorkoutSection;
  exercise_order: number;
  superset_group?: number;
  circuit_group?: number;
  sets?: number;
  reps?: string; // Can be "10" or "8-12" or "AMRAP"
  weight?: string; // Can be "135" or "75% 1RM"
  duration_seconds?: number;
  rest_seconds: number;
  distance?: string;
  intensity?: string;
  tempo?: string; // e.g., "3-1-2-1"
  notes?: string;
  coaching_cues?: string[];
  is_optional: boolean;
  alternatives?: string[];
  exercise?: Exercise;
  created_at: Date;
}

export interface ClientWorkout {
  id: string;
  client_id: string;
  workout_template_id?: string;
  scheduled_date: Date;
  status: WorkoutStatus;
  started_at?: Date;
  completed_at?: Date;
  actual_duration?: number; // minutes
  difficulty_rating?: number; // 1-5
  energy_rating?: number; // 1-5
  enjoyment_rating?: number; // 1-5
  client_notes?: string;
  coach_notes?: string;
  modifications_made?: string[];
  created_at: Date;
  updated_at: Date;
  workout_template?: WorkoutTemplate;
  exercise_logs?: ExerciseLog[];
}

export interface ExerciseLog {
  id: string;
  client_id: string;
  client_workout_id: string;
  exercise_id: string;
  workout_exercise_id?: string;
  set_number: number;
  reps_completed?: number;
  weight_used?: number;
  duration_seconds?: number;
  distance_completed?: number;
  perceived_exertion?: number; // 1-10
  rest_time_seconds?: number;
  form_rating?: number; // 1-5
  notes?: string;
  completed_at: Date;
  exercise?: Exercise;
}

export interface WorkoutProgram {
  id: string;
  coach_id: string;
  name: string;
  description?: string;
  duration_weeks: number;
  difficulty: ExerciseDifficulty;
  program_type: ProgramType;
  sessions_per_week: number;
  equipment_needed: string[];
  goals: string[];
  is_public: boolean;
  price?: number;
  tags: string[];
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
  weeks?: ProgramWeek[];
}

export interface ProgramWeek {
  id: string;
  workout_program_id: string;
  week_number: number;
  description?: string;
  focus?: string;
  intensity_modifier: number;
  created_at: Date;
  sessions?: ProgramSession[];
}

export interface ProgramSession {
  id: string;
  program_week_id: string;
  workout_template_id: string;
  session_number: number; // 1-7 for days of week
  session_name?: string;
  is_optional: boolean;
  created_at: Date;
  workout_template?: WorkoutTemplate;
}

export interface ClientProgram {
  id: string;
  client_id: string;
  workout_program_id: string;
  start_date: Date;
  current_week: number;
  status: ProgramStatus;
  completion_percentage: number;
  created_at: Date;
  updated_at: Date;
  workout_program?: WorkoutProgram;
}

export interface ExerciseAnalytics {
  id: string;
  client_id: string;
  exercise_id: string;
  date: Date;
  total_volume?: number;
  max_weight?: number;
  total_reps?: number;
  total_sets?: number;
  average_rest_time?: number;
  one_rep_max_estimate?: number;
  created_at: Date;
}

// Enums and Types
export type ExerciseCategory = 
  | 'chest' 
  | 'back' 
  | 'shoulders' 
  | 'arms' 
  | 'legs' 
  | 'core' 
  | 'cardio' 
  | 'functional'
  | 'full_body';

export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type ExerciseType = 
  | 'strength' 
  | 'cardio' 
  | 'flexibility' 
  | 'mobility' 
  | 'plyometric' 
  | 'balance';

export type WorkoutCategory = 
  | 'strength' 
  | 'cardio' 
  | 'hiit' 
  | 'circuit' 
  | 'flexibility' 
  | 'rehabilitation'
  | 'sports_specific';

export type WorkoutSection = 'warmup' | 'main' | 'cooldown';

export type WorkoutStatus = 
  | 'scheduled' 
  | 'in_progress' 
  | 'completed' 
  | 'skipped' 
  | 'cancelled';

export type ProgramType = 
  | 'strength' 
  | 'hypertrophy' 
  | 'powerlifting' 
  | 'weight_loss' 
  | 'endurance'
  | 'general_fitness';

export type ProgramStatus = 'active' | 'paused' | 'completed' | 'cancelled';

export interface WorkoutStructure {
  warmup?: {
    duration: number;
    exercises: number;
  };
  main?: {
    duration: number;
    exercises: number;
    circuits?: number;
    supersets?: number;
  };
  cooldown?: {
    duration: number;
    exercises: number;
  };
}

// Workout Builder Types
export interface WorkoutBuilderState {
  template: Partial<WorkoutTemplate>;
  exercises: WorkoutExercise[];
  activeSection: WorkoutSection;
  isEditing: boolean;
  draggedExercise?: Exercise;
  selectedExercise?: WorkoutExercise;
}

export interface ExerciseFilter {
  category?: ExerciseCategory;
  muscle_groups?: string[];
  equipment?: string[];
  difficulty?: ExerciseDifficulty;
  exercise_type?: ExerciseType;
  search?: string;
  tags?: string[];
}

export interface SetConfiguration {
  sets: number;
  reps: string;
  weight?: string;
  rest_seconds: number;
  tempo?: string;
  intensity?: string;
  notes?: string;
}

export interface SupersetGroup {
  id: number;
  exercises: WorkoutExercise[];
  rest_seconds: number;
  rounds: number;
  notes?: string;
}

export interface CircuitGroup {
  id: number;
  exercises: WorkoutExercise[];
  rounds: number;
  rest_between_exercises: number;
  rest_between_rounds: number;
  notes?: string;
}

// Workout Performance Types
export interface WorkoutPerformance {
  workout_id: string;
  total_duration: number;
  exercises_completed: number;
  total_sets: number;
  total_reps: number;
  total_volume: number; // weight * reps * sets
  calories_burned?: number;
  average_heart_rate?: number;
  difficulty_rating: number;
  energy_rating: number;
  enjoyment_rating: number;
  notes?: string;
}

export interface ExercisePerformance {
  exercise_id: string;
  sets_completed: number;
  best_set: {
    reps: number;
    weight?: number;
    duration?: number;
  };
  total_volume: number;
  average_rest_time: number;
  form_rating: number;
  perceived_exertion: number;
  notes?: string;
}

// Equipment Types
export const EQUIPMENT_OPTIONS = [
  'bodyweight',
  'dumbbells',
  'barbell',
  'kettlebell',
  'resistance_bands',
  'medicine_ball',
  'pull_up_bar',
  'bench',
  'squat_rack',
  'cable_machine',
  'smith_machine',
  'leg_press',
  'rowing_machine',
  'treadmill',
  'elliptical',
  'stationary_bike',
  'suspension_trainer',
  'foam_roller',
  'stability_ball',
  'bosu_ball',
  'battle_ropes',
  'plyo_box',
  'agility_ladder',
  'cones',
  'parallette_bars',
  'ab_wheel',
  'gymnastic_rings'
] as const;

export type Equipment = typeof EQUIPMENT_OPTIONS[number];

// Muscle Groups
export const MUSCLE_GROUPS = [
  'chest',
  'upper_chest',
  'lower_chest',
  'back',
  'lats',
  'rhomboids',
  'traps',
  'rear_delts',
  'shoulders',
  'front_delts',
  'side_delts',
  'arms',
  'biceps',
  'triceps',
  'forearms',
  'legs',
  'quads',
  'hamstrings',
  'glutes',
  'calves',
  'tibialis',
  'core',
  'abs',
  'obliques',
  'lower_back',
  'hip_flexors',
  'neck',
  'full_body'
] as const;

export type MuscleGroup = typeof MUSCLE_GROUPS[number];

// Workout Templates
export interface WorkoutTemplatePreset {
  name: string;
  description: string;
  category: WorkoutCategory;
  difficulty: ExerciseDifficulty;
  duration: number;
  equipment: Equipment[];
  exercises: {
    exercise_name: string;
    section: WorkoutSection;
    sets: number;
    reps: string;
    rest: number;
    notes?: string;
  }[];
}

export const PRESET_TEMPLATES: WorkoutTemplatePreset[] = [
  {
    name: "Beginner Full Body",
    description: "Perfect starter workout targeting all major muscle groups",
    category: "strength",
    difficulty: "beginner",
    duration: 45,
    equipment: ["dumbbells", "bench"],
    exercises: [
      { exercise_name: "Bodyweight Squats", section: "warmup", sets: 1, reps: "10", rest: 30 },
      { exercise_name: "Arm Circles", section: "warmup", sets: 1, reps: "10 each", rest: 30 },
      { exercise_name: "Goblet Squats", section: "main", sets: 3, reps: "12", rest: 60 },
      { exercise_name: "Dumbbell Bench Press", section: "main", sets: 3, reps: "10", rest: 90 },
      { exercise_name: "Bent-Over Dumbbell Rows", section: "main", sets: 3, reps: "10", rest: 90 },
      { exercise_name: "Overhead Dumbbell Press", section: "main", sets: 3, reps: "8", rest: 90 },
      { exercise_name: "Plank", section: "main", sets: 3, reps: "30 seconds", rest: 60 },
      { exercise_name: "Walking", section: "cooldown", sets: 1, reps: "5 minutes", rest: 0 },
    ]
  },
  {
    name: "HIIT Cardio Blast",
    description: "High-intensity interval training for maximum calorie burn",
    category: "hiit",
    difficulty: "intermediate",
    duration: 30,
    equipment: ["bodyweight"],
    exercises: [
      { exercise_name: "Jumping Jacks", section: "warmup", sets: 1, reps: "30 seconds", rest: 30 },
      { exercise_name: "High Knees", section: "warmup", sets: 1, reps: "30 seconds", rest: 30 },
      { exercise_name: "Burpees", section: "main", sets: 4, reps: "45 seconds", rest: 15 },
      { exercise_name: "Mountain Climbers", section: "main", sets: 4, reps: "45 seconds", rest: 15 },
      { exercise_name: "Jump Squats", section: "main", sets: 4, reps: "45 seconds", rest: 15 },
      { exercise_name: "Push-ups", section: "main", sets: 4, reps: "45 seconds", rest: 15 },
      { exercise_name: "Plank Jacks", section: "main", sets: 4, reps: "45 seconds", rest: 15 },
      { exercise_name: "Child's Pose", section: "cooldown", sets: 1, reps: "60 seconds", rest: 0 },
    ]
  }
];

export interface WorkoutTimer {
  isRunning: boolean;
  currentTime: number;
  exerciseTime: number;
  restTime: number;
  currentPhase: 'exercise' | 'rest' | 'prepare';
  currentExercise: number;
  currentSet: number;
}

export interface WorkoutStats {
  totalWorkouts: number;
  totalDuration: number; // minutes
  totalVolume: number;
  averageWorkoutDuration: number;
  favoriteExercises: { exercise_id: string; count: number; name: string }[];
  strengthProgress: { exercise_id: string; progress: number }[];
  completionRate: number;
  currentStreak: number;
  bestStreak: number;
}