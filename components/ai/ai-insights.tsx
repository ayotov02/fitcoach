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
  Brain, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, 
  Eye, Clock, Target, Zap, Users, BarChart3, Activity, 
  Lightbulb, Star, ArrowRight, RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AIInsight, AIActionItem } from '@/lib/types/ai'

interface AIInsightsProps {
  userId: string
  userRole: 'coach' | 'client'
  clientId?: string
  timeRange?: 'week' | 'month' | 'quarter'
  onActionItemClick?: (actionItem: AIActionItem) => void
  onInsightDismiss?: (insightId: string) => void
}

interface InsightCategory {
  id: string
  name: string
  icon: React.ReactNode
  count: number
  priority: 'low' | 'medium' | 'high' | 'urgent'
}

interface InsightFilters {
  priority: 'all' | 'low' | 'medium' | 'high' | 'urgent'
  status: 'all' | 'new' | 'viewed' | 'acted_on' | 'dismissed'
  type: 'all' | 'progress_analysis' | 'plateau_detection' | 'nutrition_adherence' | 'dropout_risk' | 'goal_adjustment'
  timeRange: 'week' | 'month' | 'quarter'
}

export function AIInsights({ 
  userId, 
  userRole, 
  clientId, 
  timeRange = 'week',
  onActionItemClick,
  onInsightDismiss 
}: AIInsightsProps) {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [filteredInsights, setFilteredInsights] = useState<AIInsight[]>([])
  const [filters, setFilters] = useState<InsightFilters>({
    priority: 'all',
    status: 'all',
    type: 'all',
    timeRange: timeRange
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [categories, setCategories] = useState<InsightCategory[]>([])
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null)

  useEffect(() => {
    loadInsights()
  }, [userId, clientId, filters.timeRange])

  useEffect(() => {
    applyFilters()
  }, [insights, filters])

  const loadInsights = async () => {
    try {
      // Mock insights data - in real implementation, this would call your AI service
      const mockInsights: AIInsight[] = [
        {
          id: '1',
          client_id: clientId || userId,
          coach_id: userRole === 'coach' ? userId : 'coach-id',
          insight_type: 'progress_analysis',
          content: {
            title: 'Exceptional Strength Progress',
            summary: 'Client has achieved 18% strength increase across major lifts in the past month',
            details: 'The client has demonstrated consistent progressive overload with particularly strong improvements in squat (+22%) and deadlift (+15%). Recovery metrics indicate excellent adaptation. Current trajectory suggests they\'re ready for increased training volume.',
            data_points: {
              strength_increase: 18,
              squat_improvement: 22,
              deadlift_improvement: 15,
              bench_improvement: 12,
              recovery_score: 8.5
            },
            visualizations: [{
              type: 'chart',
              data: [
                { exercise: 'Squat', improvement: 22 },
                { exercise: 'Deadlift', improvement: 15 },
                { exercise: 'Bench', improvement: 12 }
              ]
            }]
          },
          confidence_score: 0.92,
          priority: 'high',
          status: 'new',
          action_items: [
            {
              id: '1a',
              title: 'Increase Training Volume',
              description: 'Add one additional set to compound exercises',
              priority: 'medium',
              action_type: 'short_term',
              estimated_impact: 'high',
              completion_status: 'pending'
            },
            {
              id: '1b',
              title: 'Progress Photo Review',
              description: 'Schedule progress photo session to document changes',
              priority: 'low',
              action_type: 'immediate',
              estimated_impact: 'medium',
              completion_status: 'pending'
            }
          ],
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          client_id: clientId || userId,
          coach_id: userRole === 'coach' ? userId : 'coach-id',
          insight_type: 'nutrition_adherence',
          content: {
            title: 'Weekend Nutrition Challenges',
            summary: 'Nutrition adherence drops to 65% on weekends vs 89% weekdays',
            details: 'Analysis shows consistent weekday nutrition compliance but significant challenges on weekends. Primary issues: increased social eating, irregular meal timing, and higher alcohol consumption. This pattern is limiting overall progress.',
            data_points: {
              weekend_adherence: 65,
              weekday_adherence: 89,
              social_eating_impact: 23,
              alcohol_frequency: 2.3
            }
          },
          confidence_score: 0.87,
          priority: 'medium',
          status: 'new',
          action_items: [
            {
              id: '2a',
              title: 'Weekend Meal Prep Plan',
              description: 'Create specific weekend meal preparation strategy',
              priority: 'medium',
              action_type: 'short_term',
              estimated_impact: 'high',
              completion_status: 'pending'
            },
            {
              id: '2b',
              title: 'Social Eating Guidelines',
              description: 'Develop strategies for social dining situations',
              priority: 'low',
              action_type: 'long_term',
              estimated_impact: 'medium',
              completion_status: 'pending'
            }
          ],
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          client_id: clientId || userId,
          coach_id: userRole === 'coach' ? userId : 'coach-id',
          insight_type: 'plateau_detection',
          content: {
            title: 'Early Plateau Warning: Upper Body',
            summary: 'Upper body lifts showing stagnation for 2 weeks with declining motivation',
            details: 'Bench press and overhead press have plateaued while lower body continues progressing. Client reports decreased motivation for upper body sessions. Sleep quality has declined (6.2h avg vs 7.1h goal). Stress levels elevated.',
            data_points: {
              plateau_duration: 14,
              motivation_score: 6.2,
              sleep_quality: 6.2,
              stress_level: 7.1,
              upper_body_progress: -2,
              lower_body_progress: 8
            }
          },
          confidence_score: 0.78,
          priority: 'urgent',
          status: 'new',
          action_items: [
            {
              id: '3a',
              title: 'Program Deload Week',
              description: 'Implement deload week focusing on recovery',
              priority: 'high',
              action_type: 'immediate',
              estimated_impact: 'high',
              completion_status: 'pending'
            },
            {
              id: '3b',
              title: 'Sleep Optimization Plan',
              description: 'Address sleep quality issues affecting recovery',
              priority: 'high',
              action_type: 'immediate',
              estimated_impact: 'high',
              completion_status: 'pending'
            }
          ],
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '4',
          client_id: clientId || userId,
          coach_id: userRole === 'coach' ? userId : 'coach-id',
          insight_type: 'dropout_risk',
          content: {
            title: 'Low Engagement Risk Alert',
            summary: 'Client engagement patterns indicate 23% risk of program dropout',
            details: 'Several risk factors identified: declining workout frequency (4.2 to 3.1 per week), reduced app usage (-34%), missed check-ins (2 of last 4), and decreased response time to messages (+127% avg). However, goal commitment remains high.',
            data_points: {
              dropout_risk: 23,
              workout_frequency_decline: 26,
              app_usage_decline: 34,
              missed_checkins: 2,
              response_time_increase: 127,
              goal_commitment: 8.3
            }
          },
          confidence_score: 0.81,
          priority: 'urgent',
          status: 'new',
          action_items: [
            {
              id: '4a',
              title: 'Personal Check-in Call',
              description: 'Schedule immediate 1:1 call to address concerns',
              priority: 'urgent',
              action_type: 'immediate',
              estimated_impact: 'high',
              completion_status: 'pending'
            },
            {
              id: '4b',
              title: 'Program Flexibility Review',
              description: 'Assess if current program fits client\'s current lifestyle',
              priority: 'high',
              action_type: 'short_term',
              estimated_impact: 'high',
              completion_status: 'pending'
            }
          ],
          created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        }
      ]

      setInsights(mockInsights)
      updateCategories(mockInsights)
    } catch (error) {
      console.error('Failed to load AI insights:', error)
    }
  }

  const updateCategories = (insightData: AIInsight[]) => {
    const categoryMap = new Map<string, { count: number; priority: AIInsight['priority'] }>()

    insightData.forEach(insight => {
      const current = categoryMap.get(insight.insight_type) || { count: 0, priority: 'low' as const }
      categoryMap.set(insight.insight_type, {
        count: current.count + 1,
        priority: insight.priority === 'urgent' || current.priority === 'urgent' ? 'urgent' :
               insight.priority === 'high' || current.priority === 'high' ? 'high' :
               insight.priority === 'medium' || current.priority === 'medium' ? 'medium' : 'low'
      })
    })

    const categoryData: InsightCategory[] = [
      {
        id: 'progress_analysis',
        name: 'Progress Analysis',
        icon: <TrendingUp className="h-4 w-4" />,
        count: categoryMap.get('progress_analysis')?.count || 0,
        priority: categoryMap.get('progress_analysis')?.priority || 'low'
      },
      {
        id: 'plateau_detection',
        name: 'Plateau Detection',
        icon: <AlertTriangle className="h-4 w-4" />,
        count: categoryMap.get('plateau_detection')?.count || 0,
        priority: categoryMap.get('plateau_detection')?.priority || 'low'
      },
      {
        id: 'nutrition_adherence',
        name: 'Nutrition Insights',
        icon: <Target className="h-4 w-4" />,
        count: categoryMap.get('nutrition_adherence')?.count || 0,
        priority: categoryMap.get('nutrition_adherence')?.priority || 'low'
      },
      {
        id: 'dropout_risk',
        name: 'Engagement Risk',
        icon: <Users className="h-4 w-4" />,
        count: categoryMap.get('dropout_risk')?.count || 0,
        priority: categoryMap.get('dropout_risk')?.priority || 'low'
      }
    ]

    setCategories(categoryData)
  }

  const applyFilters = () => {
    let filtered = [...insights]

    if (filters.priority !== 'all') {
      filtered = filtered.filter(insight => insight.priority === filters.priority)
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(insight => insight.status === filters.status)
    }

    if (filters.type !== 'all') {
      filtered = filtered.filter(insight => insight.insight_type === filters.type)
    }

    // Sort by priority and date
    filtered.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      if (priorityDiff !== 0) return priorityDiff
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    setFilteredInsights(filtered)
  }

  const generateNewInsights = async () => {
    setIsGenerating(true)
    try {
      // Simulate AI insight generation
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // In real implementation, this would call your AI service to generate new insights
      await loadInsights()
    } catch (error) {
      console.error('Failed to generate insights:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const markInsightAsViewed = async (insightId: string) => {
    setInsights(prev => prev.map(insight => 
      insight.id === insightId 
        ? { ...insight, status: 'viewed' as const }
        : insight
    ))
  }

  const dismissInsight = async (insightId: string) => {
    setInsights(prev => prev.map(insight => 
      insight.id === insightId 
        ? { ...insight, status: 'dismissed' as const }
        : insight
    ))
    onInsightDismiss?.(insightId)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive' as const
      case 'high': return 'default' as const
      case 'medium': return 'secondary' as const
      default: return 'outline' as const
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Insights</h1>
          <p className="text-muted-foreground">
            Automated analysis and coaching recommendations
            {clientId && ' for this client'}
          </p>
        </div>
        
        <Button 
          onClick={generateNewInsights}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Brain className="mr-2 h-4 w-4" />
              Generate Insights
            </>
          )}
        </Button>
      </div>

      {/* Insight Categories Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => (
          <Card 
            key={category.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              filters.type === category.id && "ring-2 ring-primary"
            )}
            onClick={() => setFilters(prev => ({ 
              ...prev, 
              type: prev.type === category.id ? 'all' : category.id as any 
            }))}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {category.icon}
                  {category.name}
                </div>
                <Badge variant={getPriorityBadgeVariant(category.priority)}>
                  {category.count}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                {category.count} insight{category.count !== 1 ? 's' : ''}
                {category.count > 0 && (
                  <span className="ml-1">
                    • Highest: {category.priority}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center flex-wrap">
        <Select
          value={filters.priority}
          onValueChange={(value: any) => setFilters(prev => ({ ...prev, priority: value }))}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.status}
          onValueChange={(value: any) => setFilters(prev => ({ ...prev, status: value }))}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="viewed">Viewed</SelectItem>
            <SelectItem value="acted_on">Acted On</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.timeRange}
          onValueChange={(value: any) => setFilters(prev => ({ ...prev, timeRange: value }))}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
          </SelectContent>
        </Select>

        <div className="text-sm text-muted-foreground">
          Showing {filteredInsights.length} of {insights.length} insights
        </div>
      </div>

      {/* Insights List */}
      <div className="grid gap-4 lg:grid-cols-2">
        {filteredInsights.map((insight) => (
          <Card 
            key={insight.id}
            className={cn(
              "transition-all hover:shadow-md",
              getPriorityColor(insight.priority),
              insight.status === 'new' && "ring-1 ring-primary/20"
            )}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-lg">{insight.content.title}</CardTitle>
                    <Badge variant={getPriorityBadgeVariant(insight.priority)}>
                      {insight.priority}
                    </Badge>
                    {insight.status === 'new' && (
                      <Badge variant="default" className="text-xs">
                        NEW
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-sm">
                    {insight.content.summary}
                  </CardDescription>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Brain className="h-3 w-3" />
                  {Math.round(insight.confidence_score * 100)}% confidence
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(insight.created_at).toLocaleDateString()}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {/* Key Data Points */}
                {Object.keys(insight.content.data_points).length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Key Metrics</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(insight.content.data_points).slice(0, 4).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground">
                            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                          </span>
                          <span className="font-medium">
                            {typeof value === 'number' ? 
                              (key.includes('percentage') || key.includes('score') ? `${value}%` : value) 
                              : String(value)
                            }
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Items */}
                {insight.action_items.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Recommended Actions</h4>
                    <div className="space-y-2">
                      {insight.action_items.slice(0, 2).map((actionItem) => (
                        <div 
                          key={actionItem.id}
                          className="flex items-center justify-between p-2 bg-background/50 rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="text-sm font-medium">{actionItem.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {actionItem.description}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onActionItemClick?.(actionItem)}
                          >
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  {insight.status === 'new' && (
                    <Button
                      size="sm"
                      onClick={() => markInsightAsViewed(insight.id)}
                      className="flex-1"
                    >
                      <Eye className="mr-1 h-3 w-3" />
                      Mark as Viewed
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedInsight(insight)}
                    className="flex-1"
                  >
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => dismissInsight(insight.id)}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredInsights.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Insights Found</h3>
            <p className="text-muted-foreground mb-4">
              No insights match your current filters, or none have been generated yet.
            </p>
            <Button onClick={generateNewInsights} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Generate New Insights
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Detailed Insight Modal would go here */}
      {selectedInsight && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh]">
            <CardHeader>
              <CardTitle>{selectedInsight.content.title}</CardTitle>
              <CardDescription>
                Detailed analysis and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  <p className="text-sm">{selectedInsight.content.details}</p>
                  
                  {/* All action items */}
                  {selectedInsight.action_items.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">All Recommended Actions</h4>
                      <div className="space-y-2">
                        {selectedInsight.action_items.map((actionItem) => (
                          <div key={actionItem.id} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <h5 className="font-medium">{actionItem.title}</h5>
                              <Badge variant={getPriorityBadgeVariant(actionItem.priority)}>
                                {actionItem.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {actionItem.description}
                            </p>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Impact: {actionItem.estimated_impact}</span>
                              <span>Type: {actionItem.action_type.replace('_', ' ')}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              <div className="flex gap-2 mt-4">
                <Button onClick={() => setSelectedInsight(null)}>
                  Close
                </Button>
                <Button variant="outline">
                  Export Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}