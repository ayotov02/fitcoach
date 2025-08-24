export interface User {
  id: string;
  email: string;
  name: string;
  role: 'coach' | 'client';
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: string;
  userId: string;
  coachId: string;
  personalInfo: {
    age: number;
    height: number; // in cm
    weight: number; // in kg
    gender: 'male' | 'female' | 'other';
    fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  };
  goals: {
    primary: string;
    secondary?: string[];
    targetWeight?: number;
    timeline?: string;
  };
  preferences: {
    workoutTypes: string[];
    equipment: string[];
    timeAvailability: {
      daysPerWeek: number;
      sessionDuration: number; // in minutes
      preferredTimes: string[];
    };
  };
  progress: {
    currentWeight: number;
    bodyFat?: number;
    measurements?: Record<string, number>;
    photos?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Exercise {
  id: string;
  name: string;
  category: string;
  muscleGroups: string[];
  equipment: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string[];
  tips?: string[];
  videoUrl?: string;
  imageUrl?: string;
}

export interface WorkoutSet {
  reps?: number;
  weight?: number; // in kg
  duration?: number; // in seconds
  distance?: number; // in meters
  restTime?: number; // in seconds
  notes?: string;
}

export interface WorkoutExercise {
  exerciseId: string;
  exercise?: Exercise; // populated when needed
  sets: WorkoutSet[];
  notes?: string;
  order: number;
}

export interface Workout {
  id: string;
  clientId: string;
  coachId: string;
  name: string;
  description?: string;
  type: 'strength' | 'cardio' | 'flexibility' | 'mixed';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number; // in minutes
  exercises: WorkoutExercise[];
  status: 'draft' | 'assigned' | 'completed' | 'skipped';
  scheduledFor?: Date;
  completedAt?: Date;
  feedback?: {
    rating: number; // 1-5
    notes?: string;
    difficulty: number; // 1-5
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkoutTemplate {
  id: string;
  coachId: string;
  name: string;
  description?: string;
  type: 'strength' | 'cardio' | 'flexibility' | 'mixed';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number;
  exercises: Omit<WorkoutExercise, 'sets'>[];
  tags: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NutritionEntry {
  id: string;
  clientId: string;
  date: Date;
  meals: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
    snacks?: string[];
  };
  calories?: number;
  macros?: {
    protein: number;
    carbs: number;
    fat: number;
  };
  water?: number; // in liters
  notes?: string;
}

export interface ProgressPhoto {
  id: string;
  clientId: string;
  url: string;
  type: 'front' | 'side' | 'back';
  date: Date;
  notes?: string;
}

export interface Measurement {
  id: string;
  clientId: string;
  date: Date;
  weight?: number;
  bodyFat?: number;
  muscle?: number;
  measurements: {
    chest?: number;
    waist?: number;
    hips?: number;
    biceps?: number;
    thighs?: number;
  };
}

export interface AIRecommendation {
  id: string;
  clientId: string;
  type: 'workout' | 'nutrition' | 'recovery';
  title: string;
  description: string;
  confidence: number; // 0-1
  reasoning: string[];
  actionItems?: string[];
  createdAt: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  role: 'coach' | 'client';
}

export interface ClientOnboardingForm {
  personalInfo: Client['personalInfo'];
  goals: Client['goals'];
  preferences: Client['preferences'];
}