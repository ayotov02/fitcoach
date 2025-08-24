'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { 
  Lightbulb,
  Target,
  Clock,
  CheckCircle,
  X,
  ThumbsUp,
  ThumbsDown,
  Star,
  TrendingUp,
  Zap,
  AlertCircle,
  PlayCircle,
  Pause,
  RotateCcw,
  Filter,
  Calendar,
  Users,
  Activity,
  Heart,
  Utensils,
  Moon,
  Award,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AIRecommendation } from '@/lib/types/ai'

interface AIRecommendationsProps {
  userId: string
  clientId?: string
  contextType?: 'workout' | 'nutrition' | 'recovery' | 'goal_setting' | 'engagement' | 'all'
  showAppliedRecommendations?: boolean
  autoRefresh?: boolean
}

interface RecommendationCategory {
  id: string
  label: string
  icon: React.ReactNode
  count: number
  description: string
}

export function AIRecommendations({ 
  userId,
  clientId,
  contextType = 'all',
  showAppliedRecommendations = false,
  autoRefresh = true
}: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>(contextType)
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [expandedRecommendation, setExpandedRecommendation] = useState<string | null>(null)
  const [applyingRecommendation, setApplyingRecommendation] = useState<string | null>(null)

  const categories: RecommendationCategory[] = [
    {
      id: 'all',
      label: 'All Recommendations',
      icon: <Lightbulb className="h-4 w-4" />,
      count: recommendations.length,
      description: 'All personalized recommendations'
    },
    {
      id: 'workout',
      label: 'Workout',
      icon: <Activity className="h-4 w-4" />,
      count: recommendations.filter(r => r.category === 'workout').length,
      description: 'Exercise and training recommendations'
    },
    {
      id: 'nutrition',
      label: 'Nutrition',
      icon: <Utensils className="h-4 w-4" />,
      count: recommendations.filter(r => r.category === 'nutrition').length,
      description: 'Diet and meal planning suggestions'
    },
    {
      id: 'recovery',
      label: 'Recovery',
      icon: <Moon className="h-4 w-4" />,
      count: recommendations.filter(r => r.category === 'recovery').length,
      description: 'Rest and recovery optimization'
    },
    {
      id: 'goal_setting',
      label: 'Goals',
      icon: <Target className="h-4 w-4" />,
      count: recommendations.filter(r => r.category === 'goal_setting').length,
      description: 'Goal adjustments and timeline optimization'
    },
    {
      id: 'engagement',
      label: 'Engagement',
      icon: <Heart className="h-4 w-4" />,
      count: recommendations.filter(r => r.category === 'engagement').length,
      description: 'Motivation and adherence improvements'
    }
  ]

  useEffect(() => {
    loadRecommendations()
  }, [userId, clientId, contextType, showAppliedRecommendations])

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(loadRecommendations, 300000) // 5 minutes
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const loadRecommendations = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        user_id: userId,
        ...(clientId && { client_id: clientId }),
        ...(contextType !== 'all' && { category: contextType }),
        include_applied: showAppliedRecommendations.toString()
      })

      const response = await fetch(`/api/ai/recommendations?${params}`)
      if (response.ok) {
        const data = await response.json()
        setRecommendations(data.recommendations || [])
      }
    } catch (error) {
      console.error('Failed to load recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateRecommendations = async () => {
    try {
      const response = await fetch('/api/ai/recommendations/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          client_id: clientId,
          context_type: contextType,
          urgency: 'medium'
        })
      })

      if (response.ok) {
        await loadRecommendations()
      }
    } catch (error) {
      console.error('Failed to generate recommendations:', error)
    }
  }

  const applyRecommendation = async (recommendationId: string) => {
    setApplyingRecommendation(recommendationId)
    try {
      const response = await fetch(`/api/ai/recommendations/${recommendationId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        setRecommendations(prev => prev.map(rec => 
          rec.id === recommendationId 
            ? { ...rec, status: 'accepted', applied_at: new Date().toISOString() }
            : rec
        ))
      }
    } catch (error) {
      console.error('Failed to apply recommendation:', error)
    } finally {
      setApplyingRecommendation(null)
    }
  }

  const declineRecommendation = async (recommendationId: string) => {
    try {
      const response = await fetch(`/api/ai/recommendations/${recommendationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'declined' })
      })

      if (response.ok) {
        setRecommendations(prev => prev.map(rec => 
          rec.id === recommendationId 
            ? { ...rec, status: 'declined' }
            : rec
        ))
      }
    } catch (error) {
      console.error('Failed to decline recommendation:', error)
    }
  }

  const rateRecommendation = async (recommendationId: string, helpful: boolean) => {
    try {
      await fetch(`/api/ai/recommendations/${recommendationId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ helpful })
      })
    } catch (error) {
      console.error('Failed to rate recommendation:', error)
    }
  }

  const filteredRecommendations = recommendations.filter(rec => {
    if (selectedCategory !== 'all' && rec.category !== selectedCategory) {
      return false
    }
    if (selectedPriority !== 'all' && rec.priority !== selectedPriority) {
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
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'accepted': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'declined': return <X className="h-4 w-4 text-red-500" />
      case 'expired': return <AlertCircle className="h-4 w-4 text-gray-400" />
      default: return <Lightbulb className="h-4 w-4 text-blue-500" />
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50 border-green-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'hard': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            <CardTitle>AI Recommendations</CardTitle>
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
          <div className="p-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg">
            <Lightbulb className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">AI Recommendations</h2>
            <p className="text-sm text-muted-foreground">
              Personalized suggestions to optimize performance
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadRecommendations}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" onClick={generateRecommendations}>
            <Zap className="h-4 w-4 mr-2" />
            Generate New
          </Button>
        </div>
      </div>

      {/* Category Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((category) => (
          <Card 
            key={category.id}
            className={cn(
              "cursor-pointer transition-colors",
              selectedCategory === category.id ? "ring-2 ring-primary" : ""
            )}
            onClick={() => setSelectedCategory(category.id)}
          >
            <CardContent className="p-3 text-center">
              <div className="flex flex-col items-center gap-2">
                {category.icon}
                <div>
                  <p className="font-medium text-sm">{category.label}</p>
                  <p className="text-xl font-bold">{category.count}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Recommendations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recommendations</CardTitle>
              <CardDescription>
                {filteredRecommendations.length} recommendations
              </CardDescription>
            </div>
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
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[700px]">
            <div className="space-y-4">
              {filteredRecommendations.map((recommendation) => (
                <Card key={recommendation.id} className="p-4">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(recommendation.status)}
                        <div className="flex-1">
                          <h4 className="font-semibold">{recommendation.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {recommendation.content.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(recommendation.priority)}>
                          {recommendation.priority}
                        </Badge>
                        <Badge variant="outline">
                          {recommendation.category.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>

                    {/* Implementation Guide */}
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="font-medium">Difficulty</p>
                          <Badge className={getDifficultyColor(recommendation.implementation_guide.difficulty)}>
                            {recommendation.implementation_guide.difficulty}
                          </Badge>
                        </div>
                        <div>
                          <p className="font-medium">Time Required</p>
                          <p className="text-muted-foreground">{recommendation.implementation_guide.estimated_time}</p>
                        </div>
                        <div>
                          <p className="font-medium">Expected Timeline</p>
                          <p className="text-muted-foreground">{recommendation.content.timeline}</p>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Content */}
                    <div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedRecommendation(
                          expandedRecommendation === recommendation.id ? null : recommendation.id
                        )}
                        className="mb-2"
                      >
                        {expandedRecommendation === recommendation.id ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-2" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-2" />
                            Show Details
                          </>
                        )}
                      </Button>

                      {expandedRecommendation === recommendation.id && (
                        <div className="space-y-4 border-l-2 border-primary pl-4">
                          {/* Benefits */}
                          <div>
                            <h5 className="font-medium mb-2">Expected Benefits:</h5>
                            <ul className="list-disc list-inside text-sm space-y-1">
                              {recommendation.content.benefits.map((benefit, index) => (
                                <li key={index}>{benefit}</li>
                              ))}
                            </ul>
                          </div>

                          {/* Implementation Steps */}
                          <div>
                            <h5 className="font-medium mb-2">Implementation Steps:</h5>
                            <ol className="list-decimal list-inside text-sm space-y-1">
                              {recommendation.content.implementation_steps.map((step, index) => (
                                <li key={index}>{step}</li>
                              ))}
                            </ol>
                          </div>

                          {/* Expected Outcomes */}
                          <div>
                            <h5 className="font-medium mb-2">Expected Outcomes:</h5>
                            <ul className="list-disc list-inside text-sm space-y-1">
                              {recommendation.content.expected_outcomes.map((outcome, index) => (
                                <li key={index}>{outcome}</li>
                              ))}
                            </ul>
                          </div>

                          {/* Resources Needed */}
                          <div>
                            <h5 className="font-medium mb-2">Resources Needed:</h5>
                            <div className="flex flex-wrap gap-1">
                              {recommendation.implementation_guide.resources_needed.map((resource, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {resource}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Success Metrics */}
                          <div>
                            <h5 className="font-medium mb-2">Success Metrics:</h5>
                            <ul className="list-disc list-inside text-sm space-y-1">
                              {recommendation.implementation_guide.success_metrics.map((metric, index) => (
                                <li key={index}>{metric}</li>
                              ))}
                            </ul>
                          </div>

                          {/* AI Reasoning */}
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <h5 className="font-medium mb-2 text-blue-900">AI Reasoning:</h5>
                            <p className="text-sm text-blue-800">{recommendation.reasoning}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="text-xs text-muted-foreground">
                        Generated {new Date(recommendation.created_at).toLocaleString()}
                        {recommendation.expires_at && (
                          <> • Expires {new Date(recommendation.expires_at).toLocaleDateString()}</>
                        )}
                      </div>
                      
                      {recommendation.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => rateRecommendation(recommendation.id, false)}
                            >
                              <ThumbsDown className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => rateRecommendation(recommendation.id, true)}
                            >
                              <ThumbsUp className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => declineRecommendation(recommendation.id)}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Decline
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => applyRecommendation(recommendation.id)}
                            disabled={applyingRecommendation === recommendation.id}
                          >
                            {applyingRecommendation === recommendation.id ? (
                              <>
                                <Pause className="h-4 w-4 mr-2 animate-spin" />
                                Applying...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Apply
                              </>
                            )}
                          </Button>
                        </div>
                      )}

                      {recommendation.status === 'accepted' && (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm">
                            Applied {new Date(recommendation.applied_at!).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      {recommendation.status === 'declined' && (
                        <div className="flex items-center gap-2 text-red-600">
                          <X className="h-4 w-4" />
                          <span className="text-sm">Declined</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
              
              {filteredRecommendations.length === 0 && (
                <div className="text-center py-12">
                  <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No recommendations found matching your filters.
                  </p>
                  <Button onClick={generateRecommendations}>
                    <Zap className="h-4 w-4 mr-2" />
                    Generate Recommendations
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