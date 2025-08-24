'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Target,
  Activity,
  Eye,
  EyeOff,
  MoreHorizontal,
  Filter,
  RefreshCw,
  Sparkles,
  Heart,
  Utensils,
  Dumbbell
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AIInsight, AIActionItem } from '@/lib/types/ai'

interface AIInsightsProps {
  clientId?: string
  coachId: string
  timeRange?: { start: string; end: string }
  autoRefresh?: boolean
  showOnlyPriority?: boolean
}

interface InsightCategory {
  id: string
  label: string
  icon: React.ReactNode
  count: number
  priority_count: { [key: string]: number }
}

export function AIInsights({ 
  clientId, 
  coachId, 
  timeRange,
  autoRefresh = true,
  showOnlyPriority = false
}: AIInsightsProps) {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const categories: InsightCategory[] = [
    {
      id: 'all',
      label: 'All Insights',
      icon: <Brain className="h-4 w-4" />,
      count: insights.length,
      priority_count: insights.reduce((acc, insight) => {
        acc[insight.priority] = (acc[insight.priority] || 0) + 1
        return acc
      }, {} as { [key: string]: number })
    },
    {
      id: 'progress_analysis',
      label: 'Progress',
      icon: <TrendingUp className="h-4 w-4" />,
      count: insights.filter(i => i.insight_type === 'progress_analysis').length,
      priority_count: insights.filter(i => i.insight_type === 'progress_analysis').reduce((acc, insight) => {
        acc[insight.priority] = (acc[insight.priority] || 0) + 1
        return acc
      }, {} as { [key: string]: number })
    },
    {
      id: 'plateau_detection',
      label: 'Plateaus',
      icon: <Activity className="h-4 w-4" />,
      count: insights.filter(i => i.insight_type === 'plateau_detection').length,
      priority_count: insights.filter(i => i.insight_type === 'plateau_detection').reduce((acc, insight) => {
        acc[insight.priority] = (acc[insight.priority] || 0) + 1
        return acc
      }, {} as { [key: string]: number })
    },
    {
      id: 'nutrition_adherence',
      label: 'Nutrition',
      icon: <Utensils className="h-4 w-4" />,
      count: insights.filter(i => i.insight_type === 'nutrition_adherence').length,
      priority_count: insights.filter(i => i.insight_type === 'nutrition_adherence').reduce((acc, insight) => {
        acc[insight.priority] = (acc[insight.priority] || 0) + 1
        return acc
      }, {} as { [key: string]: number })
    },
    {
      id: 'dropout_risk',
      label: 'Risk Alerts',
      icon: <AlertTriangle className="h-4 w-4" />,
      count: insights.filter(i => i.insight_type === 'dropout_risk').length,
      priority_count: insights.filter(i => i.insight_type === 'dropout_risk').reduce((acc, insight) => {
        acc[insight.priority] = (acc[insight.priority] || 0) + 1
        return acc
      }, {} as { [key: string]: number })
    }
  ]

  useEffect(() => {
    loadInsights()
  }, [clientId, coachId, timeRange])

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadInsights()
      }, 300000) // Refresh every 5 minutes

      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const loadInsights = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        coach_id: coachId,
        ...(clientId && { client_id: clientId }),
        ...(timeRange && { 
          start_date: timeRange.start, 
          end_date: timeRange.end 
        })
      })

      const response = await fetch(`/api/ai/insights?${params}`)
      if (response.ok) {
        const data = await response.json()
        setInsights(data.insights || [])
        setLastRefresh(new Date())
      }
    } catch (error) {
      console.error('Failed to load AI insights:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInsightAction = async (insightId: string, action: 'acknowledge' | 'act_upon' | 'dismiss') => {
    try {
      await fetch(`/api/ai/insights/${insightId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action === 'act_upon' ? 'acted_upon' : action + 'd' })
      })

      setInsights(prev => prev.map(insight => 
        insight.id === insightId 
          ? { ...insight, status: action === 'act_upon' ? 'acted_upon' : (action + 'd' as any) }
          : insight
      ))
    } catch (error) {
      console.error('Failed to update insight:', error)
    }
  }

  const generateNewInsights = async () => {
    try {
      const response = await fetch('/api/ai/insights/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coach_id: coachId,
          client_id: clientId,
          insight_types: ['progress_analysis', 'plateau_detection', 'nutrition_adherence', 'dropout_risk'],
          auto_generate_actions: true
        })
      })

      if (response.ok) {
        await loadInsights()
      }
    } catch (error) {
      console.error('Failed to generate insights:', error)
    }
  }

  const filteredInsights = insights.filter(insight => {
    if (selectedCategory !== 'all' && insight.insight_type !== selectedCategory) {
      return false
    }
    if (selectedPriority !== 'all' && insight.priority !== selectedPriority) {
      return false
    }
    if (showOnlyPriority && !['high', 'urgent'].includes(insight.priority)) {
      return false
    }
    return true
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white'
      case 'high': return 'bg-orange-500 text-white'
      case 'medium': return 'bg-yellow-500 text-black'
      case 'low': return 'bg-green-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <Sparkles className="h-4 w-4 text-blue-500" />
      case 'viewed': return <Eye className="h-4 w-4 text-gray-500" />
      case 'acted_on': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'dismissed': return <EyeOff className="h-4 w-4 text-gray-400" />
      default: return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            <CardTitle>AI Insights</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">AI Insights</h2>
            <p className="text-sm text-muted-foreground">
              Last updated {lastRefresh.toLocaleTimeString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => loadInsights()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="default" size="sm" onClick={generateNewInsights}>
            <Zap className="h-4 w-4 mr-2" />
            Generate
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.slice(1).map((category) => (
          <Card key={category.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                {category.icon}
                <div className="flex-1">
                  <p className="text-sm font-medium">{category.label}</p>
                  <p className="text-2xl font-bold">{category.count}</p>
                </div>
              </div>
              {category.priority_count.urgent && (
                <Badge variant="destructive" className="mt-2 text-xs">
                  {category.priority_count.urgent} urgent
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Detailed Insights</CardTitle>
              <CardDescription>
                {filteredInsights.length} insights found
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label} ({category.count})
                  </option>
                ))}
              </select>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {filteredInsights.map((insight) => (
                <Card key={insight.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(insight.status)}
                      <div>
                        <h4 className="font-medium">{insight.content.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {insight.content.summary}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(insight.priority)}>
                        {insight.priority}
                      </Badge>
                      <Badge variant="outline">
                        {Math.round(insight.confidence_score * 100)}% confidence
                      </Badge>
                    </div>
                  </div>

                  {/* Confidence Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span>Confidence Score</span>
                      <span>{Math.round(insight.confidence_score * 100)}%</span>
                    </div>
                    <Progress value={insight.confidence_score * 100} className="h-2" />
                  </div>

                  {/* Details */}
                  <div className="mb-4">
                    <p className="text-sm">{insight.content.details}</p>
                  </div>

                  {/* Visualizations */}
                  {insight.content.visualizations && insight.content.visualizations.length > 0 && (
                    <div className="mb-4 p-3 bg-muted rounded-lg">
                      <p className="text-xs font-medium mb-2">Data Visualization</p>
                      {insight.content.visualizations.map((viz, index) => (
                        <div key={index} className="text-xs text-muted-foreground">
                          {viz.type}: {viz.data.length} data points
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Items */}
                  {insight.action_items.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">Recommended Actions:</p>
                      <div className="space-y-2">
                        {insight.action_items.map((action, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm">
                            <Target className="h-4 w-4 mt-0.5 text-blue-500" />
                            <div className="flex-1">
                              <p className="font-medium">{action.title}</p>
                              <p className="text-muted-foreground">{action.description}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {action.priority}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {action.action_type.replace('_', ' ')}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {action.estimated_impact} impact
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="text-xs text-muted-foreground">
                      Generated {new Date(insight.created_at).toLocaleString()}
                    </div>
                    {insight.status === 'new' && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleInsightAction(insight.id, 'dismiss')}
                        >
                          Dismiss
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleInsightAction(insight.id, 'acknowledge')}
                        >
                          Acknowledge
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleInsightAction(insight.id, 'act_upon')}
                        >
                          Take Action
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
              
              {filteredInsights.length === 0 && (
                <div className="text-center py-12">
                  <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No insights found matching your filters.</p>
                  <Button onClick={generateNewInsights} className="mt-4">
                    Generate New Insights
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}