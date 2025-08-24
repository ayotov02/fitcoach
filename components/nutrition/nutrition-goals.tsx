'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Target, Sparkles, Calculator, TrendingUp, User, Activity, Save, RefreshCw } from 'lucide-react'
import { NutritionGoals, NutritionData } from '@/lib/types/nutrition'

interface NutritionGoalsProps {
  userId: string
  currentGoals?: NutritionGoals
  onGoalsSaved?: (goals: NutritionGoals) => void
}

interface UserProfile {
  age: number
  gender: 'male' | 'female' | 'other'
  height: number // cm
  weight: number // kg
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  goal_type: 'maintain' | 'lose' | 'gain'
  weekly_goal?: number // kg per week
  health_conditions: string[]
  dietary_restrictions: string[]
}

interface AIRecommendations {
  calories: { value: number; reasoning: string }
  protein: { value: number; reasoning: string }
  carbohydrates: { value: number; reasoning: string }
  fat: { value: number; reasoning: string }
  fiber: { value: number; reasoning: string }
  sodium: { value: number; reasoning: string }
  recommendations: string[]
  adjustments: {
    meal_timing: string[]
    food_suggestions: string[]
    hydration: string
  }
}

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary', description: 'Little to no exercise' },
  { value: 'light', label: 'Light', description: 'Light exercise 1-3 days/week' },
  { value: 'moderate', label: 'Moderate', description: 'Moderate exercise 3-5 days/week' },
  { value: 'active', label: 'Active', description: 'Hard exercise 6-7 days/week' },
  { value: 'very_active', label: 'Very Active', description: 'Very hard exercise, 2x/day' }
]

const GOAL_TYPES = [
  { value: 'maintain', label: 'Maintain Weight', description: 'Keep current weight' },
  { value: 'lose', label: 'Lose Weight', description: 'Create caloric deficit' },
  { value: 'gain', label: 'Gain Weight', description: 'Create caloric surplus' }
]

const HEALTH_CONDITIONS = [
  'diabetes', 'hypertension', 'heart_disease', 'kidney_disease', 
  'celiac_disease', 'ibs', 'gerd', 'food_allergies', 'none'
]

const DIETARY_RESTRICTIONS = [
  'vegetarian', 'vegan', 'gluten_free', 'dairy_free', 'keto', 
  'paleo', 'low_carb', 'low_fat', 'mediterranean', 'none'
]

export function NutritionGoals({ userId, currentGoals, onGoalsSaved }: NutritionGoalsProps) {
  const [activeTab, setActiveTab] = useState('profile')
  const [userProfile, setUserProfile] = useState<UserProfile>({
    age: 30,
    gender: 'male',
    height: 175,
    weight: 70,
    activity_level: 'moderate',
    goal_type: 'maintain',
    weekly_goal: 0.5,
    health_conditions: [],
    dietary_restrictions: []
  })

  const [nutritionGoals, setNutritionGoals] = useState<Partial<NutritionGoals>>({
    calories: currentGoals?.calories || 2000,
    protein: currentGoals?.protein || 150,
    carbohydrates: currentGoals?.carbohydrates || 200,
    fat: currentGoals?.fat || 67,
    fiber: currentGoals?.fiber || 25,
    sodium: currentGoals?.sodium || 2300,
    activity_level: currentGoals?.activity_level || 'moderate',
    goal_type: currentGoals?.goal_type || 'maintain'
  })

  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendations | null>(null)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (currentGoals) {
      setNutritionGoals({
        calories: currentGoals.calories,
        protein: currentGoals.protein,
        carbohydrates: currentGoals.carbohydrates,
        fat: currentGoals.fat,
        fiber: currentGoals.fiber,
        sodium: currentGoals.sodium,
        activity_level: currentGoals.activity_level,
        goal_type: currentGoals.goal_type
      })
    }
  }, [currentGoals])

  const calculateBMR = () => {
    // Mifflin-St Jeor Equation
    if (userProfile.gender === 'male') {
      return (10 * userProfile.weight) + (6.25 * userProfile.height) - (5 * userProfile.age) + 5
    } else {
      return (10 * userProfile.weight) + (6.25 * userProfile.height) - (5 * userProfile.age) - 161
    }
  }

  const calculateTDEE = () => {
    const bmr = calculateBMR()
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    }
    return bmr * activityMultipliers[userProfile.activity_level]
  }

  const generateAIRecommendations = async () => {
    setIsGeneratingAI(true)
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const tdee = calculateTDEE()
      let targetCalories = tdee
      
      // Adjust calories based on goal
      if (userProfile.goal_type === 'lose') {
        targetCalories -= 500 * (userProfile.weekly_goal || 0.5) // 500 cal deficit per 0.5kg/week
      } else if (userProfile.goal_type === 'gain') {
        targetCalories += 500 * (userProfile.weekly_goal || 0.5)
      }

      // Calculate macros
      const proteinGrams = Math.round(userProfile.weight * 2.2) // 2.2g per kg for active individuals
      const fatGrams = Math.round(targetCalories * 0.25 / 9) // 25% of calories from fat
      const proteinCalories = proteinGrams * 4
      const fatCalories = fatGrams * 9
      const carbCalories = targetCalories - proteinCalories - fatCalories
      const carbGrams = Math.round(carbCalories / 4)

      const mockRecommendations: AIRecommendations = {
        calories: {
          value: Math.round(targetCalories),
          reasoning: `Based on your TDEE of ${Math.round(tdee)} calories and ${userProfile.goal_type} goal`
        },
        protein: {
          value: proteinGrams,
          reasoning: `2.2g per kg body weight for muscle maintenance and growth`
        },
        carbohydrates: {
          value: carbGrams,
          reasoning: `Remaining calories after protein and fat allocation for energy`
        },
        fat: {
          value: fatGrams,
          reasoning: `25% of total calories for hormone production and nutrient absorption`
        },
        fiber: {
          value: Math.max(25, Math.round(targetCalories / 1000 * 14)),
          reasoning: `14g per 1000 calories for digestive health`
        },
        sodium: {
          value: userProfile.health_conditions.includes('hypertension') ? 1500 : 2300,
          reasoning: userProfile.health_conditions.includes('hypertension') 
            ? 'Reduced for blood pressure management' 
            : 'Standard recommendation for healthy adults'
        },
        recommendations: [
          `Your BMR is ${Math.round(calculateBMR())} calories`,
          `Your TDEE is ${Math.round(tdee)} calories based on ${userProfile.activity_level} activity level`,
          userProfile.goal_type === 'lose' 
            ? `Aiming for ${userProfile.weekly_goal}kg/week weight loss requires ${Math.round(500 * (userProfile.weekly_goal || 0.5))} calorie deficit`
            : userProfile.goal_type === 'gain'
            ? `Aiming for ${userProfile.weekly_goal}kg/week weight gain requires ${Math.round(500 * (userProfile.weekly_goal || 0.5))} calorie surplus`
            : 'Maintenance calories to keep current weight',
          `High protein intake supports ${userProfile.goal_type === 'lose' ? 'muscle preservation during weight loss' : 'muscle building and recovery'}`
        ],
        adjustments: {
          meal_timing: [
            'Consider eating protein within 2 hours post-workout',
            'Spread protein intake throughout the day (20-30g per meal)',
            userProfile.goal_type === 'lose' ? 'Consider intermittent fasting for additional benefits' : 'Eat every 3-4 hours to support metabolism'
          ],
          food_suggestions: [
            'Lean proteins: chicken, fish, tofu, Greek yogurt',
            'Complex carbs: oats, quinoa, sweet potatoes, brown rice',
            'Healthy fats: avocados, nuts, olive oil, fatty fish',
            'Fiber-rich foods: vegetables, fruits, legumes, whole grains'
          ],
          hydration: `Aim for ${Math.round(userProfile.weight * 35)}ml of water daily (35ml per kg body weight)`
        }
      }

      setAiRecommendations(mockRecommendations)
      
      // Auto-apply AI recommendations
      setNutritionGoals({
        calories: mockRecommendations.calories.value,
        protein: mockRecommendations.protein.value,
        carbohydrates: mockRecommendations.carbohydrates.value,
        fat: mockRecommendations.fat.value,
        fiber: mockRecommendations.fiber.value,
        sodium: mockRecommendations.sodium.value,
        activity_level: userProfile.activity_level,
        goal_type: userProfile.goal_type
      })

    } catch (error) {
      console.error('Failed to generate AI recommendations:', error)
    } finally {
      setIsGeneratingAI(false)
    }
  }

  const saveGoals = async () => {
    setIsSaving(true)
    try {
      const goals: NutritionGoals = {
        id: currentGoals?.id || crypto.randomUUID(),
        user_id: userId,
        calories: nutritionGoals.calories!,
        protein: nutritionGoals.protein!,
        carbohydrates: nutritionGoals.carbohydrates!,
        fat: nutritionGoals.fat!,
        fiber: nutritionGoals.fiber,
        sodium: nutritionGoals.sodium,
        activity_level: nutritionGoals.activity_level!,
        goal_type: nutritionGoals.goal_type!,
        weekly_goal: userProfile.weekly_goal,
        created_at: currentGoals?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // In real implementation, save to Supabase
      console.log('Saving nutrition goals:', goals)
      
      onGoalsSaved?.(goals)
      alert('Nutrition goals saved successfully!')
    } catch (error) {
      console.error('Failed to save goals:', error)
      alert('Failed to save goals. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const getMacroDistribution = () => {
    if (!nutritionGoals.calories || !nutritionGoals.protein || !nutritionGoals.carbohydrates || !nutritionGoals.fat) {
      return { protein: 0, carbs: 0, fat: 0 }
    }

    const proteinCals = nutritionGoals.protein * 4
    const carbsCals = nutritionGoals.carbohydrates * 4
    const fatCals = nutritionGoals.fat * 9
    const totalMacroCals = proteinCals + carbsCals + fatCals

    return {
      protein: Math.round((proteinCals / totalMacroCals) * 100),
      carbs: Math.round((carbsCals / totalMacroCals) * 100),
      fat: Math.round((fatCals / totalMacroCals) * 100)
    }
  }

  const macroDistribution = getMacroDistribution()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nutrition Goals</h1>
          <p className="text-muted-foreground">
            Set personalized nutrition targets with AI-powered recommendations
          </p>
        </div>
        
        <Button onClick={saveGoals} disabled={isSaving}>
          {isSaving ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Goals
            </>
          )}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="ai-recommendations">AI Recommendations</TabsTrigger>
          <TabsTrigger value="manual">Manual Goals</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={userProfile.age}
                      onChange={(e) => setUserProfile(prev => ({ 
                        ...prev, 
                        age: parseInt(e.target.value) || 30 
                      }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={userProfile.gender}
                      onValueChange={(value: 'male' | 'female' | 'other') => 
                        setUserProfile(prev => ({ ...prev, gender: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={userProfile.height}
                      onChange={(e) => setUserProfile(prev => ({ 
                        ...prev, 
                        height: parseInt(e.target.value) || 175 
                      }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      value={userProfile.weight}
                      onChange={(e) => setUserProfile(prev => ({ 
                        ...prev, 
                        weight: parseFloat(e.target.value) || 70 
                      }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Activity & Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="activity">Activity Level</Label>
                  <Select
                    value={userProfile.activity_level}
                    onValueChange={(value: typeof userProfile.activity_level) => 
                      setUserProfile(prev => ({ ...prev, activity_level: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTIVITY_LEVELS.map(level => (
                        <SelectItem key={level.value} value={level.value}>
                          <div>
                            <div className="font-medium">{level.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {level.description}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="goal-type">Goal Type</Label>
                  <Select
                    value={userProfile.goal_type}
                    onValueChange={(value: typeof userProfile.goal_type) => 
                      setUserProfile(prev => ({ ...prev, goal_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GOAL_TYPES.map(goal => (
                        <SelectItem key={goal.value} value={goal.value}>
                          <div>
                            <div className="font-medium">{goal.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {goal.description}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {userProfile.goal_type !== 'maintain' && (
                  <div className="space-y-2">
                    <Label htmlFor="weekly-goal">Weekly Goal (kg)</Label>
                    <Input
                      id="weekly-goal"
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="1.0"
                      value={userProfile.weekly_goal}
                      onChange={(e) => setUserProfile(prev => ({ 
                        ...prev, 
                        weekly_goal: parseFloat(e.target.value) || 0.5 
                      }))}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Health Conditions</CardTitle>
                <CardDescription>
                  Select any health conditions that may affect your nutrition needs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {HEALTH_CONDITIONS.map(condition => (
                    <Badge
                      key={condition}
                      variant={userProfile.health_conditions.includes(condition) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        setUserProfile(prev => ({
                          ...prev,
                          health_conditions: prev.health_conditions.includes(condition)
                            ? prev.health_conditions.filter(c => c !== condition)
                            : [...prev.health_conditions.filter(c => c !== 'none'), condition]
                        }))
                      }}
                    >
                      {condition.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dietary Restrictions</CardTitle>
                <CardDescription>
                  Select your dietary preferences and restrictions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {DIETARY_RESTRICTIONS.map(restriction => (
                    <Badge
                      key={restriction}
                      variant={userProfile.dietary_restrictions.includes(restriction) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        setUserProfile(prev => ({
                          ...prev,
                          dietary_restrictions: prev.dietary_restrictions.includes(restriction)
                            ? prev.dietary_restrictions.filter(r => r !== restriction)
                            : [...prev.dietary_restrictions.filter(r => r !== 'none'), restriction]
                        }))
                      }}
                    >
                      {restriction.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={generateAIRecommendations}
              disabled={isGeneratingAI}
              size="lg"
            >
              {isGeneratingAI ? (
                <>
                  <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                  Generating Recommendations...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate AI Recommendations
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        {/* AI Recommendations Tab */}
        <TabsContent value="ai-recommendations" className="space-y-6">
          {!aiRecommendations ? (
            <Card>
              <CardContent className="text-center py-12">
                <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No AI Recommendations Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Complete your profile and generate AI recommendations to see personalized goals
                </p>
                <Button onClick={() => setActiveTab('profile')}>
                  Complete Profile
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[
                  { key: 'calories', name: 'Calories', unit: 'kcal', color: 'bg-blue-500' },
                  { key: 'protein', name: 'Protein', unit: 'g', color: 'bg-red-500' },
                  { key: 'carbohydrates', name: 'Carbs', unit: 'g', color: 'bg-green-500' },
                  { key: 'fat', name: 'Fat', unit: 'g', color: 'bg-yellow-500' },
                  { key: 'fiber', name: 'Fiber', unit: 'g', color: 'bg-purple-500' },
                  { key: 'sodium', name: 'Sodium', unit: 'mg', color: 'bg-orange-500' }
                ].map(macro => (
                  <Card key={macro.key}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <div className={`h-3 w-3 rounded-full ${macro.color}`} />
                        {macro.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold mb-2">
                        {(aiRecommendations as any)[macro.key].value} {macro.unit}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {(aiRecommendations as any)[macro.key].reasoning}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5" />
                      Key Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {aiRecommendations.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                          <p className="text-sm">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Optimization Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Meal Timing</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {aiRecommendations.adjustments.meal_timing.map((tip, index) => (
                            <li key={index}>• {tip}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Food Suggestions</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {aiRecommendations.adjustments.food_suggestions.map((tip, index) => (
                            <li key={index}>• {tip}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Hydration</h4>
                        <p className="text-sm text-muted-foreground">
                          {aiRecommendations.adjustments.hydration}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={generateAIRecommendations}
                  disabled={isGeneratingAI}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate
                </Button>
                <Button onClick={() => setActiveTab('preview')}>
                  Apply & Preview
                </Button>
              </div>
            </>
          )}
        </TabsContent>

        {/* Manual Goals Tab */}
        <TabsContent value="manual" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Calories</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  type="number"
                  value={nutritionGoals.calories || ''}
                  onChange={(e) => setNutritionGoals(prev => ({
                    ...prev,
                    calories: parseInt(e.target.value) || 0
                  }))}
                />
                <p className="text-xs text-muted-foreground mt-1">kcal per day</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Protein</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  type="number"
                  value={nutritionGoals.protein || ''}
                  onChange={(e) => setNutritionGoals(prev => ({
                    ...prev,
                    protein: parseInt(e.target.value) || 0
                  }))}
                />
                <p className="text-xs text-muted-foreground mt-1">grams per day</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Carbohydrates</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  type="number"
                  value={nutritionGoals.carbohydrates || ''}
                  onChange={(e) => setNutritionGoals(prev => ({
                    ...prev,
                    carbohydrates: parseInt(e.target.value) || 0
                  }))}
                />
                <p className="text-xs text-muted-foreground mt-1">grams per day</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Fat</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  type="number"
                  value={nutritionGoals.fat || ''}
                  onChange={(e) => setNutritionGoals(prev => ({
                    ...prev,
                    fat: parseInt(e.target.value) || 0
                  }))}
                />
                <p className="text-xs text-muted-foreground mt-1">grams per day</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Fiber</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  type="number"
                  value={nutritionGoals.fiber || ''}
                  onChange={(e) => setNutritionGoals(prev => ({
                    ...prev,
                    fiber: parseInt(e.target.value) || 0
                  }))}
                />
                <p className="text-xs text-muted-foreground mt-1">grams per day</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Sodium</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  type="number"
                  value={nutritionGoals.sodium || ''}
                  onChange={(e) => setNutritionGoals(prev => ({
                    ...prev,
                    sodium: parseInt(e.target.value) || 0
                  }))}
                />
                <p className="text-xs text-muted-foreground mt-1">mg per day</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Your Nutrition Goals
              </CardTitle>
              <CardDescription>
                Preview your daily nutrition targets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Daily Calories</span>
                    <span className="text-xl font-bold text-blue-600">
                      {nutritionGoals.calories} kcal
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Protein</span>
                      <span className="font-medium">{nutritionGoals.protein}g</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Carbohydrates</span>
                      <span className="font-medium">{nutritionGoals.carbohydrates}g</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Fat</span>
                      <span className="font-medium">{nutritionGoals.fat}g</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Fiber</span>
                      <span className="font-medium">{nutritionGoals.fiber}g</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Sodium</span>
                      <span className="font-medium">{nutritionGoals.sodium}mg</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Macro Distribution</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-red-500" />
                        <span className="text-sm">Protein</span>
                      </div>
                      <span className="text-sm font-medium">{macroDistribution.protein}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-green-500" />
                        <span className="text-sm">Carbs</span>
                      </div>
                      <span className="text-sm font-medium">{macroDistribution.carbs}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-yellow-500" />
                        <span className="text-sm">Fat</span>
                      </div>
                      <span className="text-sm font-medium">{macroDistribution.fat}%</span>
                    </div>

                    {/* Visual Distribution */}
                    <div className="w-full h-4 rounded-full overflow-hidden flex mt-4">
                      <div 
                        className="bg-red-500 h-full transition-all" 
                        style={{ width: `${macroDistribution.protein}%` }}
                      />
                      <div 
                        className="bg-green-500 h-full transition-all" 
                        style={{ width: `${macroDistribution.carbs}%` }}
                      />
                      <div 
                        className="bg-yellow-500 h-full transition-all" 
                        style={{ width: `${macroDistribution.fat}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}