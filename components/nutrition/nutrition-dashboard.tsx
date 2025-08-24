'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { CalendarIcon, TrendingUp, Target, Utensils, Droplets, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { NutritionData, NutritionGoals, FoodLog, NutritionAnalytics } from '@/lib/types/nutrition'

interface DailyNutritionSummary {
  date: string
  consumed: NutritionData
  goals: NutritionGoals
  calories_remaining: number
  protein_remaining: number
  carbs_remaining: number
  fat_remaining: number
  water_consumed: number
  water_goal: number
}

interface MacroProgress {
  name: string
  consumed: number
  goal: number
  remaining: number
  percentage: number
  color: string
  unit: string
}

interface NutritionDashboardProps {
  userId: string
  selectedDate?: Date
  onDateChange?: (date: Date) => void
}

export function NutritionDashboard({ userId, selectedDate = new Date(), onDateChange }: NutritionDashboardProps) {
  const [date, setDate] = useState<Date>(selectedDate)
  const [dailySummary, setDailySummary] = useState<DailyNutritionSummary | null>(null)
  const [recentLogs, setRecentLogs] = useState<FoodLog[]>([])
  const [weeklyAnalytics, setWeeklyAnalytics] = useState<NutritionAnalytics[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [date, userId])

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      // In a real implementation, these would be API calls to Supabase
      const mockSummary: DailyNutritionSummary = {
        date: format(date, 'yyyy-MM-dd'),
        consumed: {
          calories: 1450,
          protein: 78,
          carbohydrates: 142,
          fat: 58,
          fiber: 28,
          sugar: 45,
          sodium: 1820
        },
        goals: {
          id: '1',
          user_id: userId,
          calories: 2000,
          protein: 120,
          carbohydrates: 200,
          fat: 67,
          fiber: 35,
          sodium: 2300,
          activity_level: 'moderate',
          goal_type: 'maintain',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        calories_remaining: 550,
        protein_remaining: 42,
        carbs_remaining: 58,
        fat_remaining: 9,
        water_consumed: 1800,
        water_goal: 2500
      }
      
      setDailySummary(mockSummary)
      setRecentLogs([]) // Would load from database
      setWeeklyAnalytics([]) // Would load from database
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate)
      onDateChange?.(newDate)
    }
  }

  const getMacroProgress = (): MacroProgress[] => {
    if (!dailySummary) return []

    return [
      {
        name: 'Calories',
        consumed: dailySummary.consumed.calories,
        goal: dailySummary.goals.calories,
        remaining: dailySummary.calories_remaining,
        percentage: (dailySummary.consumed.calories / dailySummary.goals.calories) * 100,
        color: 'bg-blue-500',
        unit: 'kcal'
      },
      {
        name: 'Protein',
        consumed: dailySummary.consumed.protein,
        goal: dailySummary.goals.protein,
        remaining: dailySummary.protein_remaining,
        percentage: (dailySummary.consumed.protein / dailySummary.goals.protein) * 100,
        color: 'bg-red-500',
        unit: 'g'
      },
      {
        name: 'Carbs',
        consumed: dailySummary.consumed.carbohydrates,
        goal: dailySummary.goals.carbohydrates,
        remaining: dailySummary.carbs_remaining,
        percentage: (dailySummary.consumed.carbohydrates / dailySummary.goals.carbohydrates) * 100,
        color: 'bg-green-500',
        unit: 'g'
      },
      {
        name: 'Fat',
        consumed: dailySummary.consumed.fat,
        goal: dailySummary.goals.fat,
        remaining: dailySummary.fat_remaining,
        percentage: (dailySummary.consumed.fat / dailySummary.goals.fat) * 100,
        color: 'bg-yellow-500',
        unit: 'g'
      }
    ]
  }

  const getCalorieDistribution = () => {
    if (!dailySummary) return { protein: 0, carbs: 0, fat: 0 }
    
    const proteinCals = dailySummary.consumed.protein * 4
    const carbsCals = dailySummary.consumed.carbohydrates * 4
    const fatCals = dailySummary.consumed.fat * 9
    const total = proteinCals + carbsCals + fatCals

    return {
      protein: total > 0 ? Math.round((proteinCals / total) * 100) : 0,
      carbs: total > 0 ? Math.round((carbsCals / total) * 100) : 0,
      fat: total > 0 ? Math.round((fatCals / total) * 100) : 0
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const macroProgress = getMacroProgress()
  const calorieDistribution = getCalorieDistribution()

  return (
    <div className="space-y-6">
      {/* Header with Date Picker */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nutrition Dashboard</h1>
          <p className="text-muted-foreground">
            Track your daily nutrition and reach your goals
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Log Food
          </Button>
        </div>
      </div>

      {/* Macro Progress Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {macroProgress.map((macro) => (
          <Card key={macro.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{macro.name}</CardTitle>
              <div className="h-4 w-4 rounded-full bg-current opacity-20" 
                   style={{ backgroundColor: macro.color.replace('bg-', '').replace('-500', '') }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(macro.consumed)}/{macro.goal} {macro.unit}
              </div>
              <Progress 
                value={Math.min(macro.percentage, 100)} 
                className="mt-2"
                style={{
                  backgroundColor: 'rgba(0,0,0,0.1)'
                }}
              />
              <p className="text-xs text-muted-foreground mt-2">
                {macro.remaining > 0 ? `${Math.round(macro.remaining)} ${macro.unit} remaining` : 'Goal exceeded!'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Calorie Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Calorie Distribution
            </CardTitle>
            <CardDescription>
              Breakdown of calories by macronutrient
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="text-sm">Protein</span>
                </div>
                <span className="text-sm font-medium">{calorieDistribution.protein}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="text-sm">Carbs</span>
                </div>
                <span className="text-sm font-medium">{calorieDistribution.carbs}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <span className="text-sm">Fat</span>
                </div>
                <span className="text-sm font-medium">{calorieDistribution.fat}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Water Intake */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5" />
              Water Intake
            </CardTitle>
            <CardDescription>
              Daily hydration progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-2xl font-bold">
                {dailySummary?.water_consumed || 0}ml / {dailySummary?.water_goal || 2500}ml
              </div>
              <Progress 
                value={dailySummary ? (dailySummary.water_consumed / dailySummary.water_goal) * 100 : 0}
                className="h-2"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>0ml</span>
                <span>{dailySummary?.water_goal || 2500}ml</span>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Water
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Nutrition Info */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Nutrition</CardTitle>
          <CardDescription>
            Complete breakdown of your daily nutrition intake
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="macros" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="macros">Macros</TabsTrigger>
              <TabsTrigger value="micros">Micros</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
            </TabsList>
            
            <TabsContent value="macros" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-medium">Primary Macros</h4>
                  {[
                    { name: 'Calories', value: dailySummary?.consumed.calories, unit: 'kcal' },
                    { name: 'Protein', value: dailySummary?.consumed.protein, unit: 'g' },
                    { name: 'Carbohydrates', value: dailySummary?.consumed.carbohydrates, unit: 'g' },
                    { name: 'Fat', value: dailySummary?.consumed.fat, unit: 'g' }
                  ].map((macro) => (
                    <div key={macro.name} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{macro.name}</span>
                      <span className="text-sm font-medium">{macro.value} {macro.unit}</span>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Other Nutrients</h4>
                  {[
                    { name: 'Fiber', value: dailySummary?.consumed.fiber, unit: 'g' },
                    { name: 'Sugar', value: dailySummary?.consumed.sugar, unit: 'g' },
                    { name: 'Sodium', value: dailySummary?.consumed.sodium, unit: 'mg' }
                  ].map((nutrient) => (
                    <div key={nutrient.name} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{nutrient.name}</span>
                      <span className="text-sm font-medium">{nutrient.value} {nutrient.unit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="micros" className="space-y-4">
              <div className="text-center text-muted-foreground">
                Micronutrient tracking coming soon
              </div>
            </TabsContent>
            
            <TabsContent value="analysis" className="space-y-4">
              <div className="space-y-4">
                <h4 className="font-medium">Today's Insights</h4>
                <div className="space-y-2">
                  <Badge variant="secondary">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    On track to meet protein goals
                  </Badge>
                  <Badge variant="outline">
                    Need 2 more servings of vegetables
                  </Badge>
                  <Badge variant="outline">
                    Sodium intake is within recommended range
                  </Badge>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}