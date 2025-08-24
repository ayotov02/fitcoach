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
  TrendingUp, TrendingDown, BarChart3, Brain, Activity, Users, 
  Target, AlertTriangle, CheckCircle, Clock, Zap, Eye,
  LineChart, PieChart, Calendar, Filter, RefreshCw, Download,
  ArrowUp, ArrowDown, Minus, Lightbulb, Star
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AIAnalytics, AIPattern } from '@/lib/types/ai'

interface AIAnalyticsProps {
  userId: string
  userRole: 'coach' | 'client'
  clientId?: string
  timeRange?: 'week' | 'month' | 'quarter' | 'year'
  analysisType?: 'individual' | 'business' | 'comparative'
}

interface AnalyticsFilters {
  dataType: 'all' | 'performance_trends' | 'adherence_patterns' | 'dropout_risk' | 'success_factors' | 'plateau_detection' | 'goal_achievement'
  timeRange: 'week' | 'month' | 'quarter' | 'year'
  entityType: 'all' | 'user' | 'workout_program' | 'nutrition_plan' | 'business'
  confidenceThreshold: number
}

interface AnalyticsSummary {
  totalAnalyses: number
  highConfidenceFindings: number
  actionableInsights: number
  predictiveAccuracy: number
  patternsDetected: number
  anomaliesFound: number
}

interface TrendData {
  metric: string
  current: number
  previous: number
  change: number
  trend: 'improving' | 'declining' | 'stable'
  significance: 'low' | 'medium' | 'high'
}

export function AIAnalytics({
  userId,
  userRole,
  clientId,
  timeRange = 'month',
  analysisType = 'individual'
}: AIAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AIAnalytics[]>([])
  const [filteredAnalytics, setFilteredAnalytics] = useState<AIAnalytics[]>([])
  const [filters, setFilters] = useState<AnalyticsFilters>({
    dataType: 'all',
    timeRange: timeRange,
    entityType: 'all',
    confidenceThreshold: 0.7
  })
  const [summary, setSummary] = useState<AnalyticsSummary>({
    totalAnalyses: 0,
    highConfidenceFindings: 0,
    actionableInsights: 0,
    predictiveAccuracy: 0,
    patternsDetected: 0,
    anomaliesFound: 0
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedAnalysis, setSelectedAnalysis] = useState<AIAnalytics | null>(null)
  const [trendData, setTrendData] = useState<TrendData[]>([])

  useEffect(() => {
    loadAnalytics()
  }, [userId, clientId, filters.timeRange, filters.entityType])

  useEffect(() => {
    applyFilters()
    calculateSummary()
  }, [analytics, filters])

  const loadAnalytics = async () => {
    try {
      // Mock analytics data - in real implementation, this would call your AI service
      const mockAnalytics: AIAnalytics[] = [
        {
          id: '1',
          entity_type: 'user',
          entity_id: clientId || userId,
          data_type: 'performance_trends',
          analysis_results: {
            summary: 'Strong upward performance trajectory with consistent improvements across all major lifts',
            key_findings: [
              'Average strength increase of 12.3% over the past month',
              'Workout completion rate improved from 78% to 91%',
              'Recovery time decreased by 18% indicating better adaptation',
              'Progressive overload successfully applied in 89% of sessions'
            ],
            trends: [
              {
                metric: 'Strength Index',
                direction: 'improving',
                change_percentage: 12.3,
                significance: 'high'
              },
              {
                metric: 'Workout Adherence',
                direction: 'improving', 
                change_percentage: 16.7,
                significance: 'high'
              },
              {
                metric: 'Recovery Quality',
                direction: 'improving',
                change_percentage: 8.4,
                significance: 'medium'
              }
            ],
            anomalies: [
              {
                type: 'performance_spike',
                description: 'Unusual 25% strength increase in deadlift over 3 sessions',
                severity: 'low',
                detected_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
              }
            ]
          },
          patterns_detected: [
            {
              id: 'p1',
              pattern_type: 'performance',
              description: 'Consistent 3-5% weekly strength improvements on compound movements',
              frequency: 'weekly',
              strength: 0.89,
              first_detected: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
              last_observed: new Date().toISOString(),
              related_factors: ['Progressive overload', 'Adequate recovery', 'Consistent nutrition']
            },
            {
              id: 'p2',
              pattern_type: 'behavioral',
              description: 'Higher performance on Tuesday and Thursday workouts',
              frequency: 'weekly',
              strength: 0.76,
              first_detected: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
              last_observed: new Date().toISOString(),
              related_factors: ['Sleep quality', 'Nutrition timing', 'Work schedule']
            }
          ],
          predictions: [
            {
              metric: 'Goal Achievement Likelihood',
              prediction: 87,
              confidence: 0.84,
              timeframe: '8 weeks',
              factors: ['Current progress rate', 'Adherence consistency', 'Historical patterns']
            },
            {
              metric: 'Plateau Risk',
              prediction: 23,
              confidence: 0.76,
              timeframe: '4-6 weeks',
              factors: ['Adaptation rate', 'Training variety', 'Progressive overload sustainability']
            }
          ],
          confidence_metrics: {
            overall_confidence: 0.85,
            data_quality: 0.91,
            sample_size: 156,
            prediction_accuracy: 0.78
          },
          data_period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          data_period_end: new Date().toISOString(),
          model_version: '2.1.0',
          processing_time_ms: 2340,
          updated_at: new Date().toISOString(),
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          entity_type: 'user',
          entity_id: clientId || userId,
          data_type: 'adherence_patterns',
          analysis_results: {
            summary: 'Strong adherence patterns with identifiable optimization opportunities',
            key_findings: [
              'Overall adherence rate: 84.2% (above average)',
              'Weekend adherence significantly lower: 67% vs 89% weekdays',
              'Nutrition logging consistency: 91% on workout days, 76% rest days',
              'Peak adherence window: 6-8 AM and 6-7 PM'
            ],
            trends: [
              {
                metric: 'Workout Adherence',
                direction: 'stable',
                change_percentage: 2.1,
                significance: 'low'
              },
              {
                metric: 'Nutrition Tracking',
                direction: 'improving',
                change_percentage: 8.7,
                significance: 'medium'
              }
            ],
            anomalies: [
              {
                type: 'adherence_drop',
                description: '3-day period with 0% adherence due to travel',
                severity: 'medium',
                detected_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
              }
            ]
          },
          patterns_detected: [
            {
              id: 'p3',
              pattern_type: 'behavioral',
              description: 'Strong correlation between sleep quality and next-day adherence',
              frequency: 'daily',
              strength: 0.82,
              first_detected: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
              last_observed: new Date().toISOString(),
              related_factors: ['Sleep duration', 'Sleep quality score', 'Stress levels']
            }
          ],
          predictions: [
            {
              metric: 'Weekend Adherence Improvement',
              prediction: 78,
              confidence: 0.71,
              timeframe: '4 weeks',
              factors: ['Pattern consistency', 'Lifestyle factors', 'Motivation levels']
            }
          ],
          confidence_metrics: {
            overall_confidence: 0.79,
            data_quality: 0.88,
            sample_size: 124,
            prediction_accuracy: 0.73
          },
          data_period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          data_period_end: new Date().toISOString(),
          model_version: '2.1.0',
          processing_time_ms: 1890,
          updated_at: new Date().toISOString(),
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          entity_type: 'user',
          entity_id: clientId || userId,
          data_type: 'dropout_risk',
          analysis_results: {
            summary: 'Low dropout risk with strong engagement indicators',
            key_findings: [
              'Dropout risk score: 18% (significantly below average of 31%)',
              'Strong positive indicators: consistent check-ins, goal engagement',
              'Potential risk factors: recent plateau concerns, seasonal motivation dip',
              'Protective factors: strong support system, clear progress visibility'
            ],
            trends: [
              {
                metric: 'Engagement Score',
                direction: 'stable',
                change_percentage: -3.2,
                significance: 'low'
              },
              {
                metric: 'Communication Frequency',
                direction: 'improving',
                change_percentage: 12.8,
                significance: 'medium'
              }
            ],
            anomalies: []
          },
          patterns_detected: [
            {
              id: 'p4',
              pattern_type: 'behavioral',
              description: 'Increased communication frequency correlates with sustained motivation',
              frequency: 'weekly',
              strength: 0.71,
              first_detected: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
              last_observed: new Date().toISOString(),
              related_factors: ['Coach responsiveness', 'Progress acknowledgment', 'Goal setting']
            }
          ],
          predictions: [
            {
              metric: '6-Month Retention Probability',
              prediction: 92,
              confidence: 0.81,
              timeframe: '6 months',
              factors: ['Current engagement', 'Progress satisfaction', 'Goal alignment']
            }
          ],
          confidence_metrics: {
            overall_confidence: 0.82,
            data_quality: 0.86,
            sample_size: 98,
            prediction_accuracy: 0.79
          },
          data_period_start: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          data_period_end: new Date().toISOString(),
          model_version: '2.1.0',
          processing_time_ms: 1560,
          updated_at: new Date().toISOString(),
          created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
        }
      ]

      setAnalytics(mockAnalytics)
      generateTrendData(mockAnalytics)
    } catch (error) {
      console.error('Failed to load analytics:', error)
    }
  }

  const generateTrendData = (analyticsData: AIAnalytics[]) => {
    const trends: TrendData[] = [
      {
        metric: 'Overall Performance',
        current: 87.3,
        previous: 82.1,
        change: 6.3,
        trend: 'improving',
        significance: 'high'
      },
      {
        metric: 'Adherence Rate',
        current: 84.2,
        previous: 81.8,
        change: 2.9,
        trend: 'improving',
        significance: 'medium'
      },
      {
        metric: 'Recovery Quality',
        current: 8.1,
        previous: 7.9,
        change: 2.5,
        trend: 'improving',
        significance: 'low'
      },
      {
        metric: 'Goal Progress',
        current: 73.5,
        previous: 68.2,
        change: 7.8,
        trend: 'improving',
        significance: 'high'
      },
      {
        metric: 'Dropout Risk',
        current: 18.0,
        previous: 22.3,
        change: -19.3,
        trend: 'improving',
        significance: 'medium'
      }
    ]
    
    setTrendData(trends)
  }

  const applyFilters = () => {
    let filtered = [...analytics]

    if (filters.dataType !== 'all') {
      filtered = filtered.filter(analysis => analysis.data_type === filters.dataType)
    }

    if (filters.entityType !== 'all') {
      filtered = filtered.filter(analysis => analysis.entity_type === filters.entityType)
    }

    filtered = filtered.filter(analysis => 
      analysis.confidence_metrics.overall_confidence >= filters.confidenceThreshold
    )

    // Sort by confidence and recency
    filtered.sort((a, b) => {
      const confidenceDiff = b.confidence_metrics.overall_confidence - a.confidence_metrics.overall_confidence
      if (confidenceDiff !== 0) return confidenceDiff
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    })

    setFilteredAnalytics(filtered)
  }

  const calculateSummary = () => {
    const totalAnalyses = analytics.length
    const highConfidenceFindings = analytics.filter(a => a.confidence_metrics.overall_confidence >= 0.8).length
    const actionableInsights = analytics.reduce((acc, a) => acc + a.analysis_results.key_findings.length, 0)
    const patternsDetected = analytics.reduce((acc, a) => acc + a.patterns_detected.length, 0)
    const anomaliesFound = analytics.reduce((acc, a) => acc + a.analysis_results.anomalies.length, 0)
    const avgAccuracy = analytics.reduce((acc, a) => acc + a.confidence_metrics.prediction_accuracy, 0) / totalAnalyses

    setSummary({
      totalAnalyses,
      highConfidenceFindings,
      actionableInsights,
      predictiveAccuracy: avgAccuracy * 100,
      patternsDetected,
      anomaliesFound
    })
  }

  const generateNewAnalysis = async () => {
    setIsGenerating(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 3500))
      await loadAnalytics()
    } catch (error) {
      console.error('Failed to generate analysis:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const exportAnalytics = () => {
    // Implementation for exporting analytics data
    console.log('Exporting analytics data...')
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <ArrowUp className="h-4 w-4 text-green-600" />
      case 'declining': return <ArrowDown className="h-4 w-4 text-red-600" />
      default: return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getSignificanceBadge = (significance: string) => {
    switch (significance) {
      case 'high': return <Badge variant="default">High Impact</Badge>
      case 'medium': return <Badge variant="secondary">Medium Impact</Badge>
      default: return <Badge variant="outline">Low Impact</Badge>
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600'
    if (confidence >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Analytics</h1>
          <p className="text-muted-foreground">
            Pattern recognition, predictions, and performance insights
            {clientId && ' for this client'}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportAnalytics}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={generateNewAnalysis} disabled={isGenerating}>
            {isGenerating ? (
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

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Analyses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalAnalyses}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <BarChart3 className="h-3 w-3 mr-1" />
              Comprehensive
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">High Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary.highConfidenceFindings}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3 mr-1" />
              &gt;80% confidence
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Actionable Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{summary.actionableInsights}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Lightbulb className="h-3 w-3 mr-1" />
              Key findings
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Prediction Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(summary.predictiveAccuracy)}%
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Target className="h-3 w-3 mr-1" />
              Historical accuracy
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Patterns Detected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">{summary.patternsDetected}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Activity className="h-3 w-3 mr-1" />
              Behavioral patterns
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Anomalies Found</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{summary.anomaliesFound}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Requires attention
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Key Trends Overview
          </CardTitle>
          <CardDescription>
            Performance indicators and trend analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {trendData.map((trend) => (
              <div key={trend.metric} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{trend.metric}</span>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(trend.trend)}
                    <span className={cn("text-sm font-medium", getConfidenceColor(0.8))}>
                      {trend.change > 0 ? '+' : ''}{trend.change.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Current: {trend.current}</span>
                  <span>Previous: {trend.previous}</span>
                </div>
                <Progress 
                  value={Math.min(trend.current, 100)} 
                  className="h-1"
                />
                <div className="flex justify-end">
                  {getSignificanceBadge(trend.significance)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex gap-4 items-center flex-wrap">
        <Select
          value={filters.dataType}
          onValueChange={(value: any) => setFilters(prev => ({ ...prev, dataType: value }))}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Data Types</SelectItem>
            <SelectItem value="performance_trends">Performance Trends</SelectItem>
            <SelectItem value="adherence_patterns">Adherence Patterns</SelectItem>
            <SelectItem value="dropout_risk">Dropout Risk</SelectItem>
            <SelectItem value="success_factors">Success Factors</SelectItem>
            <SelectItem value="plateau_detection">Plateau Detection</SelectItem>
            <SelectItem value="goal_achievement">Goal Achievement</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.entityType}
          onValueChange={(value: any) => setFilters(prev => ({ ...prev, entityType: value }))}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Entities</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="workout_program">Workout Program</SelectItem>
            <SelectItem value="nutrition_plan">Nutrition Plan</SelectItem>
            <SelectItem value="business">Business</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <span className="text-sm">Min Confidence:</span>
          <Select
            value={filters.confidenceThreshold.toString()}
            onValueChange={(value) => setFilters(prev => ({ ...prev, confidenceThreshold: parseFloat(value) }))}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0.5">50%</SelectItem>
              <SelectItem value="0.6">60%</SelectItem>
              <SelectItem value="0.7">70%</SelectItem>
              <SelectItem value="0.8">80%</SelectItem>
              <SelectItem value="0.9">90%</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-muted-foreground">
          {filteredAnalytics.length} of {analytics.length} analyses
        </div>
      </div>

      {/* Analytics Results */}
      <div className="grid gap-6">
        {filteredAnalytics.map((analysis) => (
          <Card key={analysis.id} className="transition-all hover:shadow-lg">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl capitalize flex items-center gap-2">
                    {analysis.data_type === 'performance_trends' && <TrendingUp className="h-5 w-5" />}
                    {analysis.data_type === 'adherence_patterns' && <Activity className="h-5 w-5" />}
                    {analysis.data_type === 'dropout_risk' && <AlertTriangle className="h-5 w-5" />}
                    {analysis.data_type === 'success_factors' && <Star className="h-5 w-5" />}
                    {analysis.data_type === 'plateau_detection' && <AlertTriangle className="h-5 w-5" />}
                    {analysis.data_type === 'goal_achievement' && <Target className="h-5 w-5" />}
                    {analysis.data_type.replace(/_/g, ' ')}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {analysis.analysis_results.summary}
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge 
                    variant={analysis.confidence_metrics.overall_confidence >= 0.8 ? 'default' : 'secondary'}
                  >
                    {Math.round(analysis.confidence_metrics.overall_confidence * 100)}% confidence
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(analysis.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <Tabs defaultValue="findings" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="findings">Key Findings</TabsTrigger>
                  <TabsTrigger value="patterns">Patterns</TabsTrigger>
                  <TabsTrigger value="predictions">Predictions</TabsTrigger>
                  <TabsTrigger value="metrics">Metrics</TabsTrigger>
                </TabsList>
                
                <TabsContent value="findings" className="space-y-3 mt-4">
                  <div className="space-y-2">
                    {analysis.analysis_results.key_findings.map((finding, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-muted/50 rounded-lg">
                        <CheckCircle className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                        <span className="text-sm">{finding}</span>
                      </div>
                    ))}
                  </div>
                  
                  {analysis.analysis_results.anomalies.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        Anomalies Detected
                      </h4>
                      <div className="space-y-2">
                        {analysis.analysis_results.anomalies.map((anomaly, index) => (
                          <div key={index} className="p-2 border border-orange-200 bg-orange-50 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium capitalize">
                                {anomaly.type.replace('_', ' ')}
                              </span>
                              <Badge variant={
                                anomaly.severity === 'high' ? 'destructive' :
                                anomaly.severity === 'medium' ? 'default' : 'secondary'
                              }>
                                {anomaly.severity}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{anomaly.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="patterns" className="space-y-3 mt-4">
                  {analysis.patterns_detected.map((pattern) => (
                    <div key={pattern.id} className="p-3 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium capitalize">{pattern.pattern_type} Pattern</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{pattern.frequency}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {Math.round(pattern.strength * 100)}% confidence
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{pattern.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {pattern.related_factors.map((factor, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                      <Progress value={pattern.strength * 100} className="h-1" />
                    </div>
                  ))}
                </TabsContent>
                
                <TabsContent value="predictions" className="space-y-3 mt-4">
                  {analysis.predictions.map((prediction, index) => (
                    <div key={index} className="p-3 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{prediction.metric}</h4>
                        <Badge 
                          variant={prediction.confidence >= 0.8 ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {Math.round(prediction.confidence * 100)}% confidence
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-2xl font-bold text-primary">
                          {typeof prediction.prediction === 'number' 
                            ? `${prediction.prediction}%` 
                            : prediction.prediction}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Timeframe: {prediction.timeframe}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {prediction.factors.map((factor, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </TabsContent>
                
                <TabsContent value="metrics" className="space-y-3 mt-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Analysis Quality</div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Overall Confidence</span>
                          <span className={getConfidenceColor(analysis.confidence_metrics.overall_confidence)}>
                            {Math.round(analysis.confidence_metrics.overall_confidence * 100)}%
                          </span>
                        </div>
                        <Progress value={analysis.confidence_metrics.overall_confidence * 100} className="h-1" />
                        
                        <div className="flex justify-between text-xs">
                          <span>Data Quality</span>
                          <span>{Math.round(analysis.confidence_metrics.data_quality * 100)}%</span>
                        </div>
                        <Progress value={analysis.confidence_metrics.data_quality * 100} className="h-1" />
                        
                        <div className="flex justify-between text-xs">
                          <span>Prediction Accuracy</span>
                          <span>{Math.round(analysis.confidence_metrics.prediction_accuracy * 100)}%</span>
                        </div>
                        <Progress value={analysis.confidence_metrics.prediction_accuracy * 100} className="h-1" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Processing Details</div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Sample Size</span>
                          <span>{analysis.confidence_metrics.sample_size} data points</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Processing Time</span>
                          <span>{analysis.processing_time_ms}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Model Version</span>
                          <span>{analysis.model_version}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Analysis Period</span>
                          <span>
                            {analysis.data_period_start && analysis.data_period_end
                              ? `${Math.ceil((new Date(analysis.data_period_end).getTime() - new Date(analysis.data_period_start).getTime()) / (1000 * 60 * 60 * 24))} days`
                              : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex gap-2 mt-4 pt-4 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedAnalysis(analysis)}
                >
                  <Eye className="mr-1 h-3 w-3" />
                  View Details
                </Button>
                <Button size="sm" variant="ghost">
                  <Download className="mr-1 h-3 w-3" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAnalytics.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Analytics Available</h3>
            <p className="text-muted-foreground mb-4">
              No analyses match your current filters, or none have been generated yet.
            </p>
            <Button onClick={generateNewAnalysis} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Run New Analysis
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Detailed Analysis Modal would go here */}
      {selectedAnalysis && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl max-h-[90vh]">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="capitalize">
                  {selectedAnalysis.data_type.replace(/_/g, ' ')} - Detailed Analysis
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedAnalysis(null)}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Complete Analysis Summary</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedAnalysis.analysis_results.summary}
                    </p>
                  </div>
                  
                  {/* Additional detailed content would be rendered here */}
                </div>
              </ScrollArea>
              
              <div className="flex gap-2 mt-4">
                <Button onClick={() => setSelectedAnalysis(null)}>
                  Close
                </Button>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export Full Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}