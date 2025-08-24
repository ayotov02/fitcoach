'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CalendarIcon, Plus, Copy, Shuffle, Target, Clock, Users, ChefHat, Trash2 } from 'lucide-react'
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'
import { cn } from '@/lib/utils'
import { MealPlan, DailyMeal, MealType, Food, Recipe, NutritionData } from '@/lib/types/nutrition'
import { FoodDatabase } from '@/lib/utils/food-database'

interface MealPlannerProps {
  userId: string
  onMealPlanChange?: (mealPlan: MealPlan) => void
}

interface WeeklyMealPlan {
  [date: string]: {
    [K in MealType]: DailyMeal[]
  }
}

interface MealSlot {
  date: string
  mealType: MealType
  meals: DailyMeal[]
}

interface AIGenerationOptions {
  dietaryRestrictions: string[]
  targetCalories: number
  cuisinePreferences: string[]
  cookingTime: 'quick' | 'moderate' | 'any'
  mealComplexity: 'simple' | 'moderate' | 'complex'
}

const MEAL_TYPES: { value: MealType; label: string; icon: string }[] = [
  { value: 'breakfast', label: 'Breakfast', icon: '🌅' },
  { value: 'lunch', label: 'Lunch', icon: '☀️' },
  { value: 'dinner', label: 'Dinner', icon: '🌙' },
  { value: 'snack', label: 'Snacks', icon: '🍎' }
]

const DIETARY_RESTRICTIONS = [
  'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'paleo', 'low-carb', 'high-protein'
]

const CUISINE_TYPES = [
  'American', 'Italian', 'Mexican', 'Asian', 'Mediterranean', 'Indian', 'Thai', 'Japanese', 'French'
]

export function MealPlanner({ userId, onMealPlanChange }: MealPlannerProps) {
  const [selectedWeek, setSelectedWeek] = useState<Date>(new Date())
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyMealPlan>({})
  const [currentMealPlan, setCurrentMealPlan] = useState<MealPlan | null>(null)
  const [isCreatingPlan, setIsCreatingPlan] = useState(false)
  const [draggedItem, setDraggedItem] = useState<{ type: 'food' | 'recipe'; item: Food | Recipe } | null>(null)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  
  // AI Generation state
  const [aiOptions, setAiOptions] = useState<AIGenerationOptions>({
    dietaryRestrictions: [],
    targetCalories: 2000,
    cuisinePreferences: [],
    cookingTime: 'moderate',
    mealComplexity: 'moderate'
  })

  const foodDatabase = FoodDatabase.getInstance()

  useEffect(() => {
    foodDatabase.initialize()
    loadWeeklyPlan()
  }, [selectedWeek, userId])

  const getWeekDays = () => {
    const start = startOfWeek(selectedWeek)
    const end = endOfWeek(selectedWeek)
    return eachDayOfInterval({ start, end })
  }

  const loadWeeklyPlan = async () => {
    // In a real implementation, this would load from Supabase
    const mockWeeklyPlan: WeeklyMealPlan = {}
    const weekDays = getWeekDays()
    
    weekDays.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd')
      mockWeeklyPlan[dateStr] = {
        breakfast: [],
        lunch: [
          {
            id: crypto.randomUUID(),
            meal_plan_id: '1',
            date: dateStr,
            meal_type: 'lunch',
            food_id: '1',
            quantity: 1,
            notes: 'Sample meal'
          }
        ],
        dinner: [],
        snack: []
      }
    })
    
    setWeeklyPlan(mockWeeklyPlan)
  }

  const createNewMealPlan = async (name: string, startDate: Date, endDate: Date) => {
    setIsCreatingPlan(true)
    try {
      const newPlan: MealPlan = {
        id: crypto.randomUUID(),
        user_id: userId,
        name,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        target_calories: aiOptions.targetCalories,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      setCurrentMealPlan(newPlan)
      onMealPlanChange?.(newPlan)
    } catch (error) {
      console.error('Failed to create meal plan:', error)
    } finally {
      setIsCreatingPlan(false)
    }
  }

  const addMealToSlot = async (date: string, mealType: MealType, item: Food | Recipe, quantity: number = 1) => {
    const newMeal: DailyMeal = {
      id: crypto.randomUUID(),
      meal_plan_id: currentMealPlan?.id || '1',
      date,
      meal_type: mealType,
      food_id: 'name' in item ? item.id : undefined,
      recipe_id: 'instructions' in item ? item.id : undefined,
      quantity,
      notes: undefined
    }

    setWeeklyPlan(prev => ({
      ...prev,
      [date]: {
        ...prev[date],
        [mealType]: [...(prev[date]?.[mealType] || []), newMeal]
      }
    }))
  }

  const removeMealFromSlot = (date: string, mealType: MealType, mealId: string) => {
    setWeeklyPlan(prev => ({
      ...prev,
      [date]: {
        ...prev[date],
        [mealType]: prev[date]?.[mealType].filter(meal => meal.id !== mealId) || []
      }
    }))
  }

  const generateAIMealPlan = async () => {
    setIsGeneratingAI(true)
    try {
      // Simulate AI generation - in a real implementation, this would call your AI service
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const weekDays = getWeekDays()
      const newWeeklyPlan: WeeklyMealPlan = {}
      
      // Mock AI-generated meals based on preferences
      weekDays.forEach((day, index) => {
        const dateStr = format(day, 'yyyy-MM-dd')
        newWeeklyPlan[dateStr] = {
          breakfast: [
            {
              id: crypto.randomUUID(),
              meal_plan_id: currentMealPlan?.id || '1',
              date: dateStr,
              meal_type: 'breakfast',
              food_id: '2', // Banana
              quantity: 1,
              notes: 'AI Generated'
            }
          ],
          lunch: [
            {
              id: crypto.randomUUID(),
              meal_plan_id: currentMealPlan?.id || '1',
              date: dateStr,
              meal_type: 'lunch',
              food_id: '4', // Chicken Breast
              quantity: 150,
              notes: 'AI Generated'
            }
          ],
          dinner: [
            {
              id: crypto.randomUUID(),
              meal_plan_id: currentMealPlan?.id || '1',
              date: dateStr,
              meal_type: 'dinner',
              food_id: '3', // Broccoli
              quantity: 100,
              notes: 'AI Generated'
            }
          ],
          snack: []
        }
      })
      
      setWeeklyPlan(newWeeklyPlan)
    } catch (error) {
      console.error('Failed to generate AI meal plan:', error)
    } finally {
      setIsGeneratingAI(false)
    }
  }

  const copyMealPlan = (sourceDate: string, targetDate: string) => {
    const sourcePlan = weeklyPlan[sourceDate]
    if (!sourcePlan) return

    const copiedPlan = Object.keys(sourcePlan).reduce((acc, mealType) => {
      acc[mealType as MealType] = sourcePlan[mealType as MealType].map(meal => ({
        ...meal,
        id: crypto.randomUUID(),
        date: targetDate
      }))
      return acc
    }, {} as WeeklyMealPlan[string])

    setWeeklyPlan(prev => ({
      ...prev,
      [targetDate]: copiedPlan
    }))
  }

  const calculateDayNutrition = (date: string): NutritionData => {
    const dayPlan = weeklyPlan[date]
    if (!dayPlan) return { calories: 0, protein: 0, carbohydrates: 0, fat: 0 }

    const allMeals = [
      ...dayPlan.breakfast,
      ...dayPlan.lunch,
      ...dayPlan.dinner,
      ...dayPlan.snack
    ]

    // This would calculate nutrition from actual food/recipe data
    // For demo purposes, using mock values
    return {
      calories: allMeals.length * 300,
      protein: allMeals.length * 25,
      carbohydrates: allMeals.length * 30,
      fat: allMeals.length * 12
    }
  }

  const weekDays = getWeekDays()

  return (
    <div className="space-y-6">
      {/* Header with Week Navigation */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meal Planner</h1>
          <p className="text-muted-foreground">
            Plan your weekly meals with drag-and-drop simplicity
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedWeek}
                onSelect={(date) => date && setSelectedWeek(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Plan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Meal Plan</DialogTitle>
                <DialogDescription>
                  Set up a new meal plan with AI assistance or start from scratch
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="manual" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="manual">Manual</TabsTrigger>
                  <TabsTrigger value="ai">AI Generated</TabsTrigger>
                </TabsList>
                
                <TabsContent value="manual" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="plan-name">Plan Name</Label>
                    <Input id="plan-name" placeholder="e.g., Weekly Meal Plan" />
                  </div>
                  
                  <Button 
                    onClick={() => createNewMealPlan("Manual Plan", weekDays[0], weekDays[6])}
                    disabled={isCreatingPlan}
                    className="w-full"
                  >
                    Create Plan
                  </Button>
                </TabsContent>
                
                <TabsContent value="ai" className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Daily Calorie Target</Label>
                      <Input
                        type="number"
                        value={aiOptions.targetCalories}
                        onChange={(e) => setAiOptions(prev => ({
                          ...prev,
                          targetCalories: parseInt(e.target.value) || 2000
                        }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Dietary Restrictions</Label>
                      <div className="flex flex-wrap gap-2">
                        {DIETARY_RESTRICTIONS.map(restriction => (
                          <Badge
                            key={restriction}
                            variant={aiOptions.dietaryRestrictions.includes(restriction) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => {
                              setAiOptions(prev => ({
                                ...prev,
                                dietaryRestrictions: prev.dietaryRestrictions.includes(restriction)
                                  ? prev.dietaryRestrictions.filter(r => r !== restriction)
                                  : [...prev.dietaryRestrictions, restriction]
                              }))
                            }}
                          >
                            {restriction}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Cooking Time Preference</Label>
                      <Select
                        value={aiOptions.cookingTime}
                        onValueChange={(value: 'quick' | 'moderate' | 'any') => 
                          setAiOptions(prev => ({ ...prev, cookingTime: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="quick">Quick (under 30 min)</SelectItem>
                          <SelectItem value="moderate">Moderate (30-60 min)</SelectItem>
                          <SelectItem value="any">Any duration</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button
                      onClick={generateAIMealPlan}
                      disabled={isGeneratingAI}
                      className="w-full"
                    >
                      {isGeneratingAI ? (
                        <>
                          <Clock className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Shuffle className="mr-2 h-4 w-4" />
                          Generate AI Plan
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Weekly Meal Grid */}
      <div className="grid grid-cols-7 gap-4">
        {weekDays.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const dayNutrition = calculateDayNutrition(dateStr)
          
          return (
            <div key={dateStr} className="space-y-4">
              {/* Day Header */}
              <Card className="text-center">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{format(day, 'EEE')}</CardTitle>
                  <CardDescription className="text-sm">
                    {format(day, 'MMM d')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span>Calories:</span>
                      <span className="font-medium">{dayNutrition.calories}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Protein:</span>
                      <span className="font-medium">{dayNutrition.protein}g</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Meal Slots */}
              <div className="space-y-2">
                {MEAL_TYPES.map((mealType) => {
                  const meals = weeklyPlan[dateStr]?.[mealType.value] || []
                  
                  return (
                    <Card
                      key={mealType.value}
                      className={cn(
                        "min-h-[120px] transition-colors",
                        draggedItem && "border-dashed border-primary/50"
                      )}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault()
                        if (draggedItem) {
                          addMealToSlot(dateStr, mealType.value, draggedItem.item)
                          setDraggedItem(null)
                        }
                      }}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <span>{mealType.icon}</span>
                          {mealType.label}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {meals.length === 0 ? (
                          <div className="text-xs text-muted-foreground text-center py-4">
                            Drop foods or recipes here
                          </div>
                        ) : (
                          meals.map((meal) => (
                            <div
                              key={meal.id}
                              className="flex items-center justify-between p-2 bg-muted rounded text-xs group"
                            >
                              <div>
                                <div className="font-medium">
                                  {meal.food_id ? 'Food Item' : 'Recipe'}
                                </div>
                                <div className="text-muted-foreground">
                                  {meal.quantity} serving{meal.quantity !== 1 ? 's' : ''}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                                onClick={() => removeMealFromSlot(dateStr, mealType.value, meal.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Day Actions */}
              <div className="space-y-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => {
                    const yesterday = format(addDays(day, -1), 'yyyy-MM-dd')
                    copyMealPlan(yesterday, dateStr)
                  }}
                >
                  <Copy className="mr-1 h-3 w-3" />
                  Copy Yesterday
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Weekly Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Weekly Summary
          </CardTitle>
          <CardDescription>
            Overview of your weekly meal plan nutrition
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {(() => {
              const weekTotalNutrition = weekDays.reduce((total, day) => {
                const dayNutrition = calculateDayNutrition(format(day, 'yyyy-MM-dd'))
                total.calories += dayNutrition.calories
                total.protein += dayNutrition.protein
                total.carbohydrates += dayNutrition.carbohydrates
                total.fat += dayNutrition.fat
                return total
              }, { calories: 0, protein: 0, carbohydrates: 0, fat: 0 })

              const avgDaily = {
                calories: Math.round(weekTotalNutrition.calories / 7),
                protein: Math.round(weekTotalNutrition.protein / 7),
                carbohydrates: Math.round(weekTotalNutrition.carbohydrates / 7),
                fat: Math.round(weekTotalNutrition.fat / 7)
              }

              return (
                <>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{avgDaily.calories}</div>
                    <div className="text-sm text-muted-foreground">Avg Daily Calories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{avgDaily.protein}g</div>
                    <div className="text-sm text-muted-foreground">Avg Daily Protein</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{avgDaily.carbohydrates}g</div>
                    <div className="text-sm text-muted-foreground">Avg Daily Carbs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{avgDaily.fat}g</div>
                    <div className="text-sm text-muted-foreground">Avg Daily Fat</div>
                  </div>
                </>
              )
            })()}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}