'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  TrendingUp, TrendingDown, BarChart3, Target, Activity, Calendar,
  Award, AlertTriangle, CheckCircle, ArrowUp, ArrowDown, Minus,
  Clock, Zap, Users, Brain, RefreshCw, Download, Eye, Star,
  Lightbulb, Heart, Scale, Dumbbell, Timer, Camera
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AIProgressAnalysis } from '@/lib/types/ai'

interface AIProgressAnalyzerProps {
  userId: string
  userRole: 'coach' | 'client'
  clientId?: string
  timeRange?: 'week' | 'month' | 'quarter' | 'year'
  onRecommendationGenerated?: (recommendation: any) => void
}

interface ProgressMetric {
  id: string
  name: string
  current: number
  previous: number
  target: number
  unit: string
  trend: 'improving' | 'declining' | 'stable'
  changePercentage: number
  category: 'strength' | 'cardio' | 'body_composition' | 'nutrition' | 'lifestyle'
  icon: React.ReactNode
}

interface ProgressSummary {
  overall_score: number
  trend_direction: 'improving' | 'declining' | 'stable'
  metrics_improved: number
  metrics_declined: number
  goal_progress_avg: number
  consistency_score: number
}

interface ComparisonData {
  vs_similar_users: {
    performance_percentile: number
    adherence_percentile: number
    progress_rate_percentile: number
  }
  vs_personal_best: {
    current_vs_best_percentage: number
    time_since_best: string
    best_period: string
  }
}

export function AIProgressAnalyzer({
  userId,
  userRole,
  clientId,
  timeRange = 'month',
  onRecommendationGenerated
}: AIProgressAnalyzerProps) {
  const [progressAnalysis, setProgressAnalysis] = useState<AIProgressAnalysis | null>(null)
  const [progressMetrics, setProgressMetrics] = useState<ProgressMetric[]>([])
  const [progressSummary, setProgressSummary] = useState<ProgressSummary | null>(null)
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>(timeRange)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    loadProgressAnalysis()
  }, [userId, clientId, selectedTimeRange])

  const loadProgressAnalysis = async () => {
    try {
      // Mock progress metrics
      const mockMetrics: ProgressMetric[] = [
        {
          id: 'strength_index',
          name: 'Strength Index',
          current: 87.3,
          previous: 82.1,
          target: 90,
          unit: 'points',
          trend: 'improving',
          changePercentage: 6.3,
          category: 'strength',
          icon: <Dumbbell className="h-4 w-4" />
        },
        {
          id: 'body_weight',
          name: 'Body Weight',
          current: 68.2,
          previous: 70.5,
          target: 65,
          unit: 'kg',
          trend: 'improving',
          changePercentage: -3.3,
          category: 'body_composition',
          icon: <Scale className="h-4 w-4" />
        },
        {
          id: 'cardio_fitness',
          name: 'VO2 Max',
          current: 42.8,
          previous: 41.2,
          target: 45,
          unit: 'ml/kg/min',
          trend: 'improving',
          changePercentage: 3.9,
          category: 'cardio',
          icon: <Heart className="h-4 w-4" />
        },
        {
          id: 'workout_frequency',
          name: 'Workout Frequency',
          current: 4.2,
          previous: 3.8,
          target: 5,
          unit: 'per week',
          trend: 'improving',
          changePercentage: 10.5,
          category: 'lifestyle',
          icon: <Activity className="h-4 w-4" />
        },
        {
          id: 'nutrition_adherence',
          name: 'Nutrition Adherence',
          current: 84.2,
          previous: 78.9,
          target: 90,
          unit: '%',
          trend: 'improving',
          changePercentage: 6.7,
          category: 'nutrition',
          icon: <Target className="h-4 w-4" />
        },
        {
          id: 'sleep_quality',
          name: 'Sleep Quality',
          current: 7.8,
          previous: 8.2,
          target: 8.5,
          unit: '/10',
          trend: 'declining',
          changePercentage: -4.9,
          category: 'lifestyle',
          icon: <Timer className="h-4 w-4" />
        }
      ]

      const mockSummary: ProgressSummary = {
        overall_score: 78.5,
        trend_direction: 'improving',
        metrics_improved: 5,
        metrics_declined: 1,
        goal_progress_avg: 73.2,
        consistency_score: 85.7
      }

      const mockComparison: ComparisonData = {
        vs_similar_users: {
          performance_percentile: 82,
          adherence_percentile: 76,
          progress_rate_percentile: 91
        },
        vs_personal_best: {
          current_vs_best_percentage: 94.2,
          time_since_best: '3 weeks ago',
          best_period: 'March 2024'
        }
      }

      const mockAnalysis: AIProgressAnalysis = {
        overall_score: 78.5,
        trend_direction: 'improving',
        key_achievements: [
          'Strength increased by 6.3% - highest improvement in 6 months',
          'Body weight decreased by 3.3kg - on track for goal',
          'Workout consistency improved to 4.2x per week',
          'Nutrition adherence reached 84.2% - personal best'
        ],
        areas_of_concern: [
          'Sleep quality declined by 4.9% - may impact recovery',
          'Cardio progress slower than strength gains',
          'Weekend nutrition adherence still below weekday levels'
        ],
        recommendations: {
          immediate: [],
          short_term: [],
          long_term: []
        },
        predictions: {
          goal_achievement_probability: 87,
          estimated_goal_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
          risk_factors: ['Sleep consistency', 'Weekend adherence'],
          success_factors: ['Training consistency', 'Progressive overload', 'Nutrition tracking']
        },
        comparative_analysis: mockComparison
      }

      setProgressMetrics(mockMetrics)
      setProgressSummary(mockSummary)
      setComparisonData(mockComparison)
      setProgressAnalysis(mockAnalysis)
    } catch (error) {
      console.error('Failed to load progress analysis:', error)
    }
  }

  const runNewAnalysis = async () => {
    setIsAnalyzing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 3500))
      await loadProgressAnalysis()
    } catch (error) {
      console.error('Failed to run analysis:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const exportAnalysis = () => {
    console.log('Exporting progress analysis...')
  }

  const getTrendIcon = (trend: string, size = 'h-4 w-4') => {
    switch (trend) {
      case 'improving': return <ArrowUp className={cn(size, 'text-green-600')} />
      case 'declining': return <ArrowDown className={cn(size, 'text-red-600')} />
      default: return <Minus className={cn(size, 'text-gray-600')} />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-600'
      case 'declining': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getProgressColor = (current: number, target: number) => {
    const percentage = (current / target) * 100
    if (percentage >= 90) return 'bg-green-500'
    if (percentage >= 70) return 'bg-blue-500'
    if (percentage >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getPercentileColor = (percentile: number) => {
    if (percentile >= 90) return 'text-green-600'
    if (percentile >= 70) return 'text-blue-600'
    if (percentile >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const filteredMetrics = selectedCategory === 'all' 
    ? progressMetrics 
    : progressMetrics.filter(m => m.category === selectedCategory)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Progress Analyzer</h1>
          <p className="text-muted-foreground">
            Comprehensive progress analysis with AI-powered insights
            {clientId && ' for this client'}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportAnalysis}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button onClick={runNewAnalysis} disabled={isAnalyzing}>
            {isAnalyzing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Run Analysis
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Time Range and Category Filters */}
      <div className="flex gap-4 items-center">
        <Select value={selectedTimeRange} onValueChange={(value: 'week' | 'month' | 'quarter' | 'year') => setSelectedTimeRange(value)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="strength">Strength</SelectItem>
            <SelectItem value="cardio">Cardio</SelectItem>
            <SelectItem value="body_composition">Body Composition</SelectItem>
            <SelectItem value="nutrition">Nutrition</SelectItem>
            <SelectItem value="lifestyle">Lifestyle</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overall Progress Summary */}
      {progressSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Progress Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold flex items-center justify-center gap-2">
                  {progressSummary.overall_score}
                  {getTrendIcon(progressSummary.trend_direction, 'h-6 w-6')}
                </div>
                <div className="text-sm text-muted-foreground">Overall Progress Score</div>
                <Progress value={progressSummary.overall_score} className="h-2" />
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Metrics Improved</span>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-green-600">{progressSummary.metrics_improved}</span>
                    <ArrowUp className="h-3 w-3 text-green-600" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Metrics Declined</span>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-red-600">{progressSummary.metrics_declined}</span>
                    <ArrowDown className="h-3 w-3 text-red-600" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Goal Progress</span>
                  <span className="font-bold">{progressSummary.goal_progress_avg}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Consistency Score</span>
                  <span className="font-bold">{progressSummary.consistency_score}%</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Progress Distribution</div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Improved ({progressSummary.metrics_improved})</span>
                    <span className="text-green-600">
                      {Math.round((progressSummary.metrics_improved / (progressSummary.metrics_improved + progressSummary.metrics_declined)) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={(progressSummary.metrics_improved / (progressSummary.metrics_improved + progressSummary.metrics_declined)) * 100} 
                    className="h-1" 
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredMetrics.map((metric) => (
          <Card key={metric.id} className="transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                {metric.icon}
                {metric.name}
                {getTrendIcon(metric.trend)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-end gap-2">
                  <div className="text-2xl font-bold">
                    {metric.current}
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      {metric.unit}
                    </span>
                  </div>
                  <div className={cn("text-sm font-medium", getTrendColor(metric.trend))}>
                    {metric.changePercentage > 0 ? '+' : ''}{metric.changePercentage.toFixed(1)}%
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress to Goal</span>
                    <span>{Math.round((metric.current / metric.target) * 100)}%</span>
                  </div>
                  <Progress 
                    value={Math.min((metric.current / metric.target) * 100, 100)} 
                    className="h-1"
                  />
                </div>
                
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Previous: {metric.previous} {metric.unit}</span>
                  <span>Target: {metric.target} {metric.unit}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Analysis */}
      {progressAnalysis && (
        <Tabs defaultValue="insights" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="insights">Key Insights</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
            <TabsTrigger value="comparison">Comparisons</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>
          
          <TabsContent value="insights" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="h-5 w-5 text-green-600" />
                    Key Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {progressAnalysis.key_achievements.map((achievement, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-green-50 rounded-lg">
                        <CheckCircle className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                        <span className="text-sm">{achievement}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    Areas of Concern
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {progressAnalysis.areas_of_concern.map((concern, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-orange-50 rounded-lg">
                        <AlertTriangle className="h-4 w-4 mt-0.5 text-orange-600 flex-shrink-0" />
                        <span className="text-sm">{concern}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="predictions" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    Goal Achievement Prediction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {progressAnalysis.predictions.goal_achievement_probability}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Probability of achieving goals
                      </div>
                      <Progress value={progressAnalysis.predictions.goal_achievement_probability} className="mt-2" />
                    </div>
                    
                    {progressAnalysis.predictions.estimated_goal_date && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Estimated completion: {new Date(progressAnalysis.predictions.estimated_goal_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Success & Risk Factors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-green-600 mb-2">Success Factors</h4>
                      <div className="space-y-1">
                        {progressAnalysis.predictions.success_factors.map((factor, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            {factor}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-orange-600 mb-2">Risk Factors</h4>
                      <div className="space-y-1">
                        {progressAnalysis.predictions.risk_factors.map((factor, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <AlertTriangle className="h-3 w-3 text-orange-600" />
                            {factor}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="comparison" className="space-y-4">
            {comparisonData && (
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5 text-purple-600" />
                      vs Similar Users
                    </CardTitle>
                    <CardDescription>
                      How you compare to users with similar goals and experience
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Performance</span>
                        <div className="flex items-center gap-2">
                          <span className={cn("font-bold", getPercentileColor(comparisonData.vs_similar_users.performance_percentile))}>
                            {comparisonData.vs_similar_users.performance_percentile}th percentile
                          </span>
                        </div>
                      </div>
                      <Progress value={comparisonData.vs_similar_users.performance_percentile} className="h-1" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Adherence</span>
                        <div className="flex items-center gap-2">
                          <span className={cn("font-bold", getPercentileColor(comparisonData.vs_similar_users.adherence_percentile))}>
                            {comparisonData.vs_similar_users.adherence_percentile}th percentile
                          </span>
                        </div>
                      </div>
                      <Progress value={comparisonData.vs_similar_users.adherence_percentile} className="h-1" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Progress Rate</span>
                        <div className="flex items-center gap-2">
                          <span className={cn("font-bold", getPercentileColor(comparisonData.vs_similar_users.progress_rate_percentile))}>
                            {comparisonData.vs_similar_users.progress_rate_percentile}th percentile
                          </span>
                        </div>
                      </div>
                      <Progress value={comparisonData.vs_similar_users.progress_rate_percentile} className="h-1" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-600" />
                      vs Personal Best
                    </CardTitle>
                    <CardDescription>
                      How your current performance compares to your peak
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-yellow-600 mb-2">
                          {comparisonData.vs_personal_best.current_vs_best_percentage}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          of personal best performance
                        </div>
                        <Progress value={comparisonData.vs_personal_best.current_vs_best_percentage} className="mt-2" />
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Best period:</span>
                          <span className="font-medium">{comparisonData.vs_personal_best.best_period}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Time since best:</span>
                          <span className="font-medium">{comparisonData.vs_personal_best.time_since_best}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="timeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Progress Timeline
                </CardTitle>
                <CardDescription>
                  Visual representation of your progress over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Timeline Visualization</h3>
                  <p className="text-muted-foreground mb-4">
                    Interactive timeline chart would be implemented here with a charting library like Recharts or Chart.js
                  </p>
                  <Button variant="outline">
                    <Eye className="mr-2 h-4 w-4" />
                    View Detailed Timeline
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            AI Recommendations
          </CardTitle>
          <CardDescription>
            Based on your progress analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium">Focus on Sleep Quality</div>
                <div className="text-sm text-muted-foreground">Improve recovery and performance</div>
              </div>
            </Button>
            
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium">Add Cardio Sessions</div>
                <div className="text-sm text-muted-foreground">Balance strength and endurance</div>
              </div>
            </Button>
            
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium">Weekend Meal Prep</div>
                <div className="text-sm text-muted-foreground">Improve nutrition consistency</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}