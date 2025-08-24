'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  TrendingUp, TrendingDown, BarChart3, PieChart, Activity, Target, 
  Brain, Award, AlertTriangle, CheckCircle, Calendar as CalendarIcon,
  Zap, Heart, Scale, Utensils, Droplets
} from 'lucide-react'
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'
import { cn } from '@/lib/utils'
import { NutritionGoals, NutritionData } from '@/lib/types/nutrition'

interface NutritionAnalyticsProps {
  userId: string
  dateRange?: { start: Date; end: Date }
}

interface AnalyticsPeriod {
  value: string
  label: string
  days: number
}

interface TrendData {
  metric: string
  current: number
  previous: number
  change: number
  changePercent: number
  trend: 'up' | 'down' | 'stable'
  status: 'good' | 'warning' | 'needs_attention'
  unit: string
}

interface WeeklyPattern {
  day: string
  calories: number
  protein: number
  adherence: number
}

interface NutrientInsight {
  nutrient: string
  status: 'excellent' | 'good' | 'fair' | 'poor'
  average: number
  target: number
  adherenceRate: number
  recommendation: string
  priority: 'high' | 'medium' | 'low'
}

interface CoachingInsight {
  type: 'achievement' | 'improvement' | 'warning' | 'tip'
  title: string
  description: string
  action?: string
  priority: 'high' | 'medium' | 'low'
}

const PERIODS: AnalyticsPeriod[] = [
  { value: '7d', label: 'Last 7 Days', days: 7 },
  { value: '30d', label: 'Last 30 Days', days: 30 },
  { value: '90d', label: 'Last 90 Days', days: 90 },
  { value: '180d', label: 'Last 6 Months', days: 180 }
]

export function NutritionAnalytics({ userId, dateRange }: NutritionAnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [trendsData, setTrendsData] = useState<TrendData[]>([])
  const [weeklyPatterns, setWeeklyPatterns] = useState<WeeklyPattern[]>([])
  const [nutrientInsights, setNutrientInsights] = useState<NutrientInsight[]>([])
  const [coachingInsights, setCoachingInsights] = useState<CoachingInsight[]>([])
  const [overallScore, setOverallScore] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAnalyticsData()
  }, [selectedPeriod, userId])

  const loadAnalyticsData = async () => {
    setIsLoading(true)
    try {
      // Simulate loading analytics data - in real implementation, this would call your API
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock trends data
      const mockTrends: TrendData[] = [
        {
          metric: 'Average Daily Calories',
          current: 2150,
          previous: 2280,
          change: -130,
          changePercent: -5.7,
          trend: 'down',
          status: 'good',
          unit: 'kcal'
        },
        {
          metric: 'Daily Protein Average',
          current: 142,
          previous: 118,
          change: 24,
          changePercent: 20.3,
          trend: 'up',
          status: 'good',
          unit: 'g'
        },
        {
          metric: 'Fiber Intake',
          current: 22,
          previous: 19,
          change: 3,
          changePercent: 15.8,
          trend: 'up',
          status: 'good',
          unit: 'g'
        },
        {
          metric: 'Sodium Intake',
          current: 2450,
          previous: 2680,
          change: -230,
          changePercent: -8.6,
          trend: 'down',
          status: 'good',
          unit: 'mg'
        },
        {
          metric: 'Goal Adherence',
          current: 78,
          previous: 71,
          change: 7,
          changePercent: 9.9,
          trend: 'up',
          status: 'good',
          unit: '%'
        }
      ]

      // Mock weekly patterns
      const mockWeeklyPatterns: WeeklyPattern[] = [
        { day: 'Mon', calories: 2100, protein: 145, adherence: 85 },
        { day: 'Tue', calories: 2200, protein: 138, adherence: 82 },
        { day: 'Wed', calories: 2050, protein: 152, adherence: 88 },
        { day: 'Thu', calories: 2180, protein: 141, adherence: 79 },
        { day: 'Fri', calories: 2300, protein: 135, adherence: 75 },
        { day: 'Sat', calories: 2400, protein: 128, adherence: 68 },
        { day: 'Sun', calories: 2250, protein: 148, adherence: 81 }
      ]

      // Mock nutrient insights
      const mockNutrientInsights: NutrientInsight[] = [
        {
          nutrient: 'Protein',
          status: 'excellent',
          average: 142,
          target: 120,
          adherenceRate: 89,
          recommendation: 'Great job maintaining high protein intake! This supports muscle building and recovery.',
          priority: 'low'
        },
        {
          nutrient: 'Fiber',
          status: 'good',
          average: 22,
          target: 25,
          adherenceRate: 72,
          recommendation: 'Add more vegetables, fruits, and whole grains to reach your fiber target.',
          priority: 'medium'
        },
        {
          nutrient: 'Sodium',
          status: 'fair',
          average: 2450,
          target: 2300,
          adherenceRate: 58,
          recommendation: 'Reduce processed foods and add more home-cooked meals to lower sodium intake.',
          priority: 'medium'
        },
        {
          nutrient: 'Vitamin D',
          status: 'poor',
          average: 12,
          target: 20,
          adherenceRate: 34,
          recommendation: 'Consider vitamin D supplements or foods fortified with vitamin D.',
          priority: 'high'
        }
      ]

      // Mock coaching insights
      const mockCoachingInsights: CoachingInsight[] = [
        {
          type: 'achievement',
          title: '7-Day Protein Streak!',
          description: 'You\'ve hit your protein target for 7 consecutive days. Excellent work supporting your muscle building goals!',
          priority: 'low'
        },
        {
          type: 'improvement',
          title: 'Weekend Consistency Opportunity',
          description: 'Your nutrition adherence drops by 15% on weekends. Planning ahead could help maintain consistency.',
          action: 'Try meal prepping on Sundays',
          priority: 'medium'
        },
        {
          type: 'warning',
          title: 'Low Micronutrient Variety',
          description: 'Your diet lacks variety in fruits and vegetables, missing key vitamins and minerals.',
          action: 'Add 2 different colored vegetables to each meal',
          priority: 'high'
        },
        {
          type: 'tip',
          title: 'Hydration Reminder',
          description: 'Based on your activity level, aim for 2.5L of water daily to optimize performance and recovery.',
          priority: 'medium'
        }
      ]

      setTrendsData(mockTrends)
      setWeeklyPatterns(mockWeeklyPatterns)
      setNutrientInsights(mockNutrientInsights)
      setCoachingInsights(mockCoachingInsights)
      setOverallScore(78)

    } catch (error) {
      console.error('Failed to load analytics data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getInsightIcon = (type: CoachingInsight['type']) => {
    switch (type) {
      case 'achievement': return <Award className="h-5 w-5 text-green-500" />
      case 'improvement': return <TrendingUp className="h-5 w-5 text-blue-500" />
      case 'warning': return <AlertTriangle className="h-5 w-5 text-orange-500" />
      case 'tip': return <Zap className="h-5 w-5 text-purple-500" />
      default: return <Brain className="h-5 w-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600'
      case 'good': return 'text-blue-600'
      case 'fair': return 'text-yellow-600'
      case 'poor': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getTrendIcon = (trend: string, status: string) => {
    if (trend === 'up') {
      return <TrendingUp className={cn("h-4 w-4", status === 'good' ? "text-green-500" : "text-red-500")} />
    } else if (trend === 'down') {
      return <TrendingDown className={cn("h-4 w-4", status === 'good' ? "text-green-500" : "text-red-500")} />
    }
    return <div className="h-4 w-4" />
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-blue-600'
    if (score >= 60) return 'text-yellow-600'
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nutrition Analytics</h1>
          <p className="text-muted-foreground">
            Deep insights into your nutrition patterns and coaching recommendations
          </p>
        </div>
        
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIODS.map(period => (
              <SelectItem key={period.value} value={period.value}>
                {period.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Overall Nutrition Score
          </CardTitle>
          <CardDescription>
            Your comprehensive nutrition performance over the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className={cn("text-6xl font-bold", getScoreColor(overallScore))}>
                {overallScore}
              </div>
              <div>
                <Progress value={overallScore} className="w-48 h-3 mb-2" />
                <div className="text-sm text-muted-foreground">
                  {overallScore >= 90 ? 'Excellent' :
                   overallScore >= 75 ? 'Good' :
                   overallScore >= 60 ? 'Fair' : 'Needs Improvement'}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-2">Based on:</div>
              <div className="space-y-1 text-sm">
                <div>• Goal adherence</div>
                <div>• Nutrient balance</div>
                <div>• Consistency</div>
                <div>• Variety</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Trends */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Key Trends
              </CardTitle>
              <CardDescription>
                Changes in your nutrition metrics over {selectedPeriod}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trendsData.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getTrendIcon(trend.trend, trend.status)}
                      <div>
                        <div className="font-medium">{trend.metric}</div>
                        <div className="text-sm text-muted-foreground">
                          {trend.current} {trend.unit} (was {trend.previous} {trend.unit})
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={cn("font-medium", 
                        trend.status === 'good' ? 'text-green-600' : 'text-red-600'
                      )}>
                        {trend.change > 0 ? '+' : ''}{trend.change} {trend.unit}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {trend.changePercent > 0 ? '+' : ''}{trend.changePercent.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Patterns */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Weekly Patterns
              </CardTitle>
              <CardDescription>
                Your nutrition consistency throughout the week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weeklyPatterns.map((pattern, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{pattern.day}</span>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <span>{pattern.calories} cal</span>
                        <span>{pattern.protein}g protein</span>
                        <span>{pattern.adherence}% adherence</span>
                      </div>
                    </div>
                    <Progress value={pattern.adherence} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coaching Insights */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Coaching Insights
              </CardTitle>
              <CardDescription>
                Personalized recommendations based on your data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {coachingInsights.map((insight, index) => (
                <div key={index} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-start gap-2">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{insight.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {insight.description}
                      </p>
                      {insight.action && (
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs">
                            Action: {insight.action}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Nutrient Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Nutrient Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {nutrientInsights.map((nutrient, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{nutrient.nutrient}</span>
                    <Badge variant={nutrient.status === 'excellent' ? 'default' : 
                                  nutrient.status === 'good' ? 'secondary' :
                                  nutrient.status === 'fair' ? 'outline' : 'destructive'}>
                      {nutrient.status}
                    </Badge>
                  </div>
                  <Progress value={nutrient.adherenceRate} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    Avg: {nutrient.average} / Target: {nutrient.target}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detailed Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Detailed Recommendations
          </CardTitle>
          <CardDescription>
            Specific actions to improve your nutrition
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="priority" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="priority">Priority Actions</TabsTrigger>
              <TabsTrigger value="nutrients">Nutrient Focus</TabsTrigger>
              <TabsTrigger value="habits">Habit Building</TabsTrigger>
            </TabsList>
            
            <TabsContent value="priority" className="space-y-4">
              {nutrientInsights
                .filter(n => n.priority === 'high')
                .map((nutrient, index) => (
                  <div key={index} className="p-4 border-l-4 border-red-500 bg-red-50 rounded-r-lg">
                    <h4 className="font-medium text-red-900">{nutrient.nutrient} - Action Needed</h4>
                    <p className="text-sm text-red-700 mt-1">{nutrient.recommendation}</p>
                  </div>
                ))
              }
              {nutrientInsights
                .filter(n => n.priority === 'medium')
                .map((nutrient, index) => (
                  <div key={index} className="p-4 border-l-4 border-yellow-500 bg-yellow-50 rounded-r-lg">
                    <h4 className="font-medium text-yellow-900">{nutrient.nutrient} - Consider Improving</h4>
                    <p className="text-sm text-yellow-700 mt-1">{nutrient.recommendation}</p>
                  </div>
                ))
              }
            </TabsContent>
            
            <TabsContent value="nutrients" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-3 text-green-700">Nutrients You're Crushing</h4>
                  <div className="space-y-2">
                    {nutrientInsights
                      .filter(n => n.status === 'excellent' || n.status === 'good')
                      .map((nutrient, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>{nutrient.nutrient}</span>
                        </div>
                      ))
                    }
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3 text-orange-700">Areas for Improvement</h4>
                  <div className="space-y-2">
                    {nutrientInsights
                      .filter(n => n.status === 'fair' || n.status === 'poor')
                      .map((nutrient, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          <span>{nutrient.nutrient}</span>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="habits" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Utensils className="h-5 w-5 text-blue-500" />
                    <h4 className="font-medium">Meal Timing</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your best adherence days are when you eat regularly spaced meals. 
                    Try setting meal reminders.
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets className="h-5 w-5 text-cyan-500" />
                    <h4 className="font-medium">Hydration</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Proper hydration supports nutrient absorption. Aim for 8-10 glasses 
                    of water daily.
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Scale className="h-5 w-5 text-purple-500" />
                    <h4 className="font-medium">Portion Control</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Using smaller plates and measuring portions can help maintain 
                    consistent calorie intake.
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarIcon className="h-5 w-5 text-green-500" />
                    <h4 className="font-medium">Meal Prep</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Weekend meal prep correlates with better weekday adherence. 
                    Try batch cooking proteins.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}