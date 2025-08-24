export interface NutritionData {
  calories: number
  protein: number
  carbohydrates: number
  fat: number
  fiber?: number
  sugar?: number
  sodium?: number
  cholesterol?: number
  saturated_fat?: number
  trans_fat?: number
  vitamin_a?: number
  vitamin_c?: number
  vitamin_d?: number
  vitamin_e?: number
  vitamin_k?: number
  thiamin?: number
  riboflavin?: number
  niacin?: number
  vitamin_b6?: number
  folate?: number
  vitamin_b12?: number
  biotin?: number
  pantothenic_acid?: number
  choline?: number
  calcium?: number
  iron?: number
  magnesium?: number
  phosphorus?: number
  potassium?: number
  zinc?: number
  copper?: number
  manganese?: number
  selenium?: number
  chromium?: number
  molybdenum?: number
  iodine?: number
}

export interface Food {
  id: string
  name: string
  brand?: string
  description?: string
  category: FoodCategory
  serving_size: number
  serving_unit: ServingUnit
  nutrition_per_serving: NutritionData
  barcode?: string
  image_url?: string
  verified: boolean
  allergens: string[]
  dietary_tags: string[]
  ingredients?: string[]
  created_at: string
  updated_at: string
}

export type FoodCategory = 
  | 'fruits'
  | 'vegetables' 
  | 'grains'
  | 'protein'
  | 'dairy'
  | 'fats_oils'
  | 'beverages'
  | 'snacks'
  | 'desserts'
  | 'condiments'
  | 'herbs_spices'
  | 'prepared_meals'
  | 'baby_food'
  | 'supplements'

export type ServingUnit = 
  | 'g'
  | 'kg'
  | 'oz'
  | 'lb'
  | 'ml'
  | 'l'
  | 'cup'
  | 'tablespoon'
  | 'teaspoon'
  | 'piece'
  | 'slice'
  | 'serving'

export interface FoodLog {
  id: string
  user_id: string
  food_id: string
  quantity: number
  meal_type: MealType
  logged_at: string
  logging_method: LoggingMethod
  confidence_score?: number
  notes?: string
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export type LoggingMethod = 
  | 'manual'
  | 'barcode'
  | 'photo_ai'
  | 'voice'
  | 'recipe'
  | 'meal_plan'

export interface Recipe {
  id: string
  name: string
  description?: string
  instructions: string[]
  prep_time?: number
  cook_time?: number
  servings: number
  difficulty: 'easy' | 'medium' | 'hard'
  cuisine?: string
  dietary_tags: string[]
  image_url?: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface RecipeIngredient {
  id: string
  recipe_id: string
  food_id: string
  quantity: number
  unit: string
  notes?: string
}

export interface MealPlan {
  id: string
  user_id: string
  name: string
  start_date: string
  end_date: string
  target_calories?: number
  target_protein?: number
  target_carbs?: number
  target_fat?: number
  created_at: string
  updated_at: string
}

export interface DailyMeal {
  id: string
  meal_plan_id: string
  date: string
  meal_type: MealType
  food_id?: string
  recipe_id?: string
  quantity: number
  notes?: string
}

export interface NutritionGoals {
  id: string
  user_id: string
  calories: number
  protein: number
  carbohydrates: number
  fat: number
  fiber?: number
  sodium?: number
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  goal_type: 'maintain' | 'lose' | 'gain'
  weekly_goal?: number
  created_at: string
  updated_at: string
}

export interface NutritionAnalytics {
  id: string
  user_id: string
  date: string
  calories_consumed: number
  protein_consumed: number
  carbs_consumed: number
  fat_consumed: number
  fiber_consumed?: number
  sodium_consumed?: number
  water_consumed?: number
  calories_burned?: number
  weight?: number
  body_fat_percentage?: number
  muscle_mass?: number
  insights: Record<string, any>
  created_at: string
}

export interface MealTemplate {
  id: string
  name: string
  description?: string
  meal_type: MealType
  dietary_restrictions: string[]
  target_calories?: number
  target_protein?: number
  difficulty: 'easy' | 'medium' | 'hard'
  prep_time?: number
  ingredients: {
    food_id: string
    quantity: number
    unit: string
  }[]
  instructions?: string[]
  tags: string[]
  created_at: string
}