'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CalendarIcon, TrendingUp, TrendingDown, Target, Clock, Award, Zap } from 'lucide-react'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'
import { cn } from '@/lib/utils'
import { NutritionData, NutritionGoals, NutritionAnalytics } from '@/lib/types/nutrition'

interface MacroTrackerProps {
  userId: string
  selectedDate?: Date
  onDateChange?: (date: Date) => void
}

interface MacroProgress {
  name: string
  current: number
  target: number
  percentage: number
  remaining: number
  color: string
  unit: string
  status: 'under' | 'on-track' | 'over'
  recommendation?: string
}

interface DailyMacroData {
  date: string
  consumed: NutritionData
  goals: NutritionGoals
  adherenceScore: number
  insights: string[]
}

interface WeeklyTrend {
  metric: string
  change: number
  direction: 'up' | 'down' | 'stable'
  isGood: boolean
}

const MACRO_COLORS = {
  calories: '#3B82F6',
  protein: '#EF4444', 
  carbohydrates: '#10B981',
  fat: '#F59E0B',
  fiber: '#8B5CF6',
  sodium: '#F97316'
}

const TIME_PERIODS = [
  { value: '1d', label: 'Today' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' }
]

export function MacroTracker({ userId, selectedDate = new Date(), onDateChange }: MacroTrackerProps) {
  const [date, setDate] = useState<Date>(selectedDate)
  const [timePeriod, setTimePeriod] = useState('1d')
  const [dailyData, setDailyData] = useState<DailyMacroData | null>(null)
  const [weeklyTrends, setWeeklyTrends] = useState<WeeklyTrend[]>([])
  const [historicalData, setHistoricalData] = useState<DailyMacroData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadMacroData()
  }, [date, userId, timePeriod])

  const loadMacroData = async () => {
    setIsLoading(true)
    try {
      // Mock data - in real implementation, this would load from Supabase
      const mockDailyData: DailyMacroData = {
        date: format(date, 'yyyy-MM-dd'),
        consumed: {
          calories: 1750,
          protein: 95,
          carbohydrates: 185,
          fat: 65,
          fiber: 28,
          sugar: 45,
          sodium: 1850
        },
        goals: {
          id: '1',
          user_id: userId,
          calories: 2200,
          protein: 120,
          carbohydrates: 220,
          fat: 75,
          fiber: 35,
          sodium: 2300,
          activity_level: 'moderate',
          goal_type: 'lose',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        adherenceScore: 87,
        insights: [
          'Great job on protein intake today!',
          'Consider adding more fiber-rich foods',
          'Sodium levels are well within range'
        ]
      }

      const mockWeeklyTrends: WeeklyTrend[] = [
        {
          metric: 'Calories',
          change: -5.2,
          direction: 'down',
          isGood: true
        },
        {
          metric: 'Protein',
          change: 8.1,
          direction: 'up',
          isGood: true
        },
        {
          metric: 'Fiber',
          change: -2.3,
          direction: 'down',
          isGood: false
        },
        {
          metric: 'Sodium',
          change: -12.4,
          direction: 'down',
          isGood: true
        }
      ]

      // Generate historical data for the selected period
      const days = timePeriod === '1d' ? 1 : parseInt(timePeriod.replace('d', ''))
      const mockHistoricalData: DailyMacroData[] = []
      
      for (let i = days - 1; i >= 0; i--) {
        const histDate = subDays(date, i)
        mockHistoricalData.push({
          date: format(histDate, 'yyyy-MM-dd'),
          consumed: {
            calories: 1500 + Math.random() * 500,
            protein: 80 + Math.random() * 40,
            carbohydrates: 150 + Math.random() * 100,
            fat: 50 + Math.random() * 30,
            fiber: 20 + Math.random() * 15,
            sodium: 1500 + Math.random() * 1000
          },
          goals: mockDailyData.goals,
          adherenceScore: 70 + Math.random() * 30,
          insights: []
        })
      }

      setDailyData(mockDailyData)
      setWeeklyTrends(mockWeeklyTrends)
      setHistoricalData(mockHistoricalData)
    } catch (error) {
      console.error('Failed to load macro data:', error)
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
    if (!dailyData) return []

    const macros = [
      {
        name: 'Calories',
        current: dailyData.consumed.calories,
        target: dailyData.goals.calories,
        color: MACRO_COLORS.calories,
        unit: 'kcal'
      },
      {
        name: 'Protein',
        current: dailyData.consumed.protein,
        target: dailyData.goals.protein,
        color: MACRO_COLORS.protein,
        unit: 'g'
      },
      {
        name: 'Carbs',
        current: dailyData.consumed.carbohydrates,
        target: dailyData.goals.carbohydrates,
        color: MACRO_COLORS.carbohydrates,
        unit: 'g'
      },
      {
        name: 'Fat',
        current: dailyData.consumed.fat,
        target: dailyData.goals.fat,
        color: MACRO_COLORS.fat,
        unit: 'g'
      },
      {
        name: 'Fiber',
        current: dailyData.consumed.fiber || 0,
        target: dailyData.goals.fiber || 25,
        color: MACRO_COLORS.fiber,
        unit: 'g'
      },
      {
        name: 'Sodium',
        current: dailyData.consumed.sodium || 0,
        target: dailyData.goals.sodium || 2300,
        color: MACRO_COLORS.sodium,
        unit: 'mg'
      }
    ]

    return macros.map(macro => {
      const percentage = (macro.current / macro.target) * 100
      const remaining = Math.max(0, macro.target - macro.current)
      
      let status: 'under' | 'on-track' | 'over' = 'on-track'
      let recommendation = ''
      
      if (percentage < 80) {
        status = 'under'
        recommendation = `Add ${remaining.toFixed(0)} ${macro.unit} more`
      } else if (percentage > 120) {
        status = 'over'
        recommendation = `${(macro.current - macro.target).toFixed(0)} ${macro.unit} over target`
      } else {
        recommendation = 'On track!'
      }

      return {
        ...macro,
        percentage: Math.min(percentage, 150), // Cap at 150% for visual purposes
        remaining,
        status,
        recommendation
      }
    })
  }

  const getCalorieDistribution = () => {
    if (!dailyData) return { protein: 0, carbs: 0, fat: 0 }

    const proteinCals = dailyData.consumed.protein * 4
    const carbsCals = dailyData.consumed.carbohydrates * 4
    const fatCals = dailyData.consumed.fat * 9
    const total = proteinCals + carbsCals + fatCals

    return {
      protein: total > 0 ? Math.round((proteinCals / total) * 100) : 0,
      carbs: total > 0 ? Math.round((carbsCals / total) * 100) : 0,
      fat: total > 0 ? Math.round((fatCals / total) * 100) : 0
    }
  }

  const getAdherenceColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
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
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Macro Tracker</h1>
          <p className="text-muted-foreground">
            Track your macronutrients with real-time visualizations
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_PERIODS.map(period => (
                <SelectItem key={period.value} value={period.value}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {timePeriod === '1d' && (
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
          )}
        </div>
      </div>

      {/* Adherence Score */}
      {dailyData && timePeriod === '1d' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Daily Adherence Score
            </CardTitle>
            <CardDescription>
              How well you're meeting your nutrition goals today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn("text-4xl font-bold", getAdherenceColor(dailyData.adherenceScore))}>
                  {dailyData.adherenceScore}%
                </div>
                <div>
                  <Progress value={dailyData.adherenceScore} className="w-48 h-2" />
                  <div className="text-sm text-muted-foreground mt-1">
                    {dailyData.adherenceScore >= 90 ? 'Excellent' : 
                     dailyData.adherenceScore >= 75 ? 'Good' : 'Needs Improvement'}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Insights</div>
                <div className="space-y-1">
                  {dailyData.insights.slice(0, 2).map((insight, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {insight}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Macro Progress Cards */}
        <div className="lg:col-span-2 grid gap-4 md:grid-cols-2">
          {macroProgress.map((macro) => (
            <Card key={macro.name} className="relative overflow-hidden">
              <div 
                className="absolute inset-0 opacity-5" 
                style={{ backgroundColor: macro.color }}
              />
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  {macro.name}
                  <Badge 
                    variant={macro.status === 'on-track' ? 'default' : macro.status === 'under' ? 'secondary' : 'destructive'}
                  >
                    {macro.status === 'on-track' ? 'On Track' : macro.status === 'under' ? 'Under' : 'Over'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold" style={{ color: macro.color }}>
                      {Math.round(macro.current)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      / {macro.target} {macro.unit}
                    </span>
                  </div>
                  
                  <Progress 
                    value={macro.percentage} 
                    className="h-2"
                    style={{
                      backgroundColor: `${macro.color}20`
                    }}
                  />
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {Math.round(macro.percentage)}%
                    </span>
                    <span className="font-medium">
                      {macro.recommendation}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Side Panels */}
        <div className="space-y-6">
          {/* Calorie Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Calorie Distribution
              </CardTitle>
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

                {/* Visual Distribution */}
                <div className="w-full h-2 rounded-full overflow-hidden flex">
                  <div 
                    className="bg-red-500 h-full transition-all" 
                    style={{ width: `${calorieDistribution.protein}%` }}
                  />
                  <div 
                    className="bg-green-500 h-full transition-all" 
                    style={{ width: `${calorieDistribution.carbs}%` }}
                  />
                  <div 
                    className="bg-yellow-500 h-full transition-all" 
                    style={{ width: `${calorieDistribution.fat}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Trends */}
          {timePeriod !== '1d' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Trends
                </CardTitle>
                <CardDescription>
                  Changes compared to previous period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {weeklyTrends.map((trend, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{trend.metric}</span>
                      <div className="flex items-center gap-2">
                        {trend.direction === 'up' ? (
                          <TrendingUp className={cn("h-3 w-3", trend.isGood ? "text-green-500" : "text-red-500")} />
                        ) : trend.direction === 'down' ? (
                          <TrendingDown className={cn("h-3 w-3", trend.isGood ? "text-green-500" : "text-red-500")} />
                        ) : (
                          <div className="h-3 w-3" />
                        )}
                        <span className={cn("text-sm font-medium", trend.isGood ? "text-green-600" : "text-red-600")}>
                          {Math.abs(trend.change).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Clock className="mr-2 h-4 w-4" />
                Log Food
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Target className="mr-2 h-4 w-4" />
                Adjust Goals
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Award className="mr-2 h-4 w-4" />
                View Progress
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Historical Chart Placeholder */}
      {timePeriod !== '1d' && (
        <Card>
          <CardHeader>
            <CardTitle>Historical Trends</CardTitle>
            <CardDescription>
              {timePeriod === '7d' ? 'Last 7 days' : 
               timePeriod === '30d' ? 'Last 30 days' : 
               'Last 90 days'} macro intake
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
              <div className="text-center text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Interactive chart visualization would appear here</p>
                <p className="text-sm">Showing macro trends over {timePeriod}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}