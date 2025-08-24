'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Lightbulb, CheckCircle, XCircle, Clock, Target, Zap, 
  TrendingUp, Activity, Utensils, Moon, Brain, ArrowRight,
  ThumbsUp, ThumbsDown, Star, AlertCircle, Calendar,
  Settings, RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AIRecommendation } from '@/lib/types/ai'

interface AIRecommendationsProps {
  userId: string
  userRole: 'coach' | 'client'
  contextType?: 'workout' | 'nutrition' | 'recovery' | 'goal_setting' | 'all'
  onRecommendationApplied?: (recommendationId: string) => void
  onRecommendationDeclined?: (recommendationId: string, reason?: string) => void
}

interface RecommendationFilters {
  category: 'all' | 'workout' | 'nutrition' | 'recovery' | 'goal_setting' | 'engagement'
  priority: 'all' | 'low' | 'medium' | 'high' | 'urgent'
  status: 'all' | 'pending' | 'accepted' | 'declined' | 'expired'
  difficulty: 'all' | 'easy' | 'medium' | 'hard'
}

interface RecommendationStats {
  total: number
  pending: number
  accepted: number
  success_rate: number
  avg_impact_score: number
}

export function AIRecommendations({
  userId,
  userRole,
  contextType = 'all',
  onRecommendationApplied,
  onRecommendationDeclined
}: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [filteredRecommendations, setFilteredRecommendations] = useState<AIRecommendation[]>([])
  const [filters, setFilters] = useState<RecommendationFilters>({
    category: contextType === 'all' ? 'all' : contextType as any,
    priority: 'all',
    status: 'all',
    difficulty: 'all'
  })
  const [stats, setStats] = useState<RecommendationStats>({
    total: 0,
    pending: 0,
    accepted: 0,
    success_rate: 0,
    avg_impact_score: 0
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedRecommendation, setSelectedRecommendation] = useState<AIRecommendation | null>(null)

  useEffect(() => {
    loadRecommendations()
  }, [userId, contextType])

  useEffect(() => {
    applyFilters()
    calculateStats()
  }, [recommendations, filters])

  const loadRecommendations = async () => {
    try {
      // Mock recommendations data - in real implementation, this would call your AI service
      const mockRecommendations: AIRecommendation[] = [
        {
          id: '1',
          user_id: userId,
          rec_type: 'workout_modification',
          title: 'Increase Progressive Overload',
          content: {
            description: 'Based on your recent performance, you\'re ready to increase training intensity. Your strength has plateaued for 2 weeks, indicating adaptation.',
            benefits: [
              'Break through current strength plateau',
              'Stimulate new muscle growth',
              'Improve training efficiency',
              'Enhanced metabolic response'
            ],
            implementation_steps: [
              'Increase weight by 2.5-5% on compound exercises',
              'Add 1 additional set to primary movements',
              'Reduce rest periods by 10-15 seconds',
              'Monitor recovery and adjust as needed'
            ],
            expected_outcomes: [
              '10-15% strength increase in 4-6 weeks',
              'Improved muscle definition',
              'Better training momentum',
              'Enhanced confidence'
            ],
            timeline: '4-6 weeks implementation period'
          },
          reasoning: 'Analysis of your training logs shows consistent performance at current weights for 14 days, combined with excellent recovery metrics (8.2/10 avg) and progressive sleep quality improvement. Your body is ready for increased stimulus.',
          priority: 'high',
          status: 'pending',
          category: 'workout',
          implementation_guide: {
            difficulty: 'medium',
            estimated_time: '2-3 weeks to fully adapt',
            resources_needed: [
              'Access to progressive weight increments',
              'Workout tracking app or journal',
              'Recovery monitoring tools'
            ],
            success_metrics: [
              'Weight progression on key lifts',
              'Maintained or improved form',
              'Recovery quality score >7/10',
              'Subjective energy levels'
            ]
          },
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          user_id: userId,
          rec_type: 'nutrition_adjustment',
          title: 'Optimize Pre-Workout Nutrition',
          content: {
            description: 'Your energy levels during afternoon workouts are suboptimal. Adjusting pre-workout nutrition timing and composition could improve performance.',
            benefits: [
              'Improved workout energy and focus',
              'Better exercise performance',
              'Enhanced recovery',
              'More consistent training quality'
            ],
            implementation_steps: [
              'Eat 30-45g carbs 60-90 minutes before workout',
              'Include 10-15g protein with pre-workout meal',
              'Stay hydrated: 16-20oz water 2 hours prior',
              'Avoid high-fat/fiber foods within 2 hours'
            ],
            expected_outcomes: [
              'Increased workout energy by 20-30%',
              'Better focus during training',
              'Improved exercise performance metrics',
              'Faster post-workout recovery'
            ],
            timeline: '1-2 weeks to notice improvements'
          },
          reasoning: 'Workout performance data shows 23% lower energy ratings for afternoon sessions vs morning. Blood glucose patterns and meal timing analysis indicates suboptimal fueling strategy.',
          priority: 'medium',
          status: 'pending',
          category: 'nutrition',
          implementation_guide: {
            difficulty: 'easy',
            estimated_time: '1 week to establish routine',
            resources_needed: [
              'Meal planning tools',
              'Portable snack options',
              'Hydration tracking'
            ],
            success_metrics: [
              'Subjective energy ratings >7/10',
              'Workout completion rates',
              'Exercise volume/intensity maintenance',
              'Post-workout recovery speed'
            ]
          },
          expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          user_id: userId,
          rec_type: 'recovery_protocol',
          title: 'Implement Active Recovery Days',
          content: {
            description: 'Your recovery between intense training sessions could be optimized. Adding structured active recovery will improve adaptation and reduce injury risk.',
            benefits: [
              'Enhanced recovery between sessions',
              'Reduced muscle soreness',
              'Improved flexibility and mobility',
              'Lower injury risk',
              'Better training consistency'
            ],
            implementation_steps: [
              'Add 20-30 minute walks on rest days',
              'Include 10 minutes of dynamic stretching',
              'Light yoga or mobility work 2x per week',
              'Focus on problem areas (hips, shoulders)'
            ],
            expected_outcomes: [
              'Reduced muscle stiffness by 40%',
              'Improved range of motion',
              'Better sleep quality',
              'Faster between-session recovery'
            ],
            timeline: '2-3 weeks to see full benefits'
          },
          reasoning: 'Recovery metrics show elevated muscle tension scores and declining mobility assessments. Heart rate variability indicates incomplete recovery between intense sessions.',
          priority: 'medium',
          status: 'pending',
          category: 'recovery',
          implementation_guide: {
            difficulty: 'easy',
            estimated_time: '30 minutes per rest day',
            resources_needed: [
              'Comfortable walking route',
              'Yoga mat or similar',
              'Mobility app or routine guide'
            ],
            success_metrics: [
              'Improved flexibility assessments',
              'Reduced morning stiffness',
              'Better sleep quality scores',
              'Enhanced workout readiness'
            ]
          },
          expires_at: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '4',
          user_id: userId,
          rec_type: 'goal_change',
          title: 'Adjust Body Composition Goals',
          content: {
            description: 'Your current rate of progress suggests your body composition goals may be too aggressive. A slight adjustment could improve adherence and long-term success.',
            benefits: [
              'More sustainable progress rate',
              'Improved diet adherence',
              'Better training performance',
              'Reduced stress and pressure',
              'Higher long-term success probability'
            ],
            implementation_steps: [
              'Adjust weekly fat loss target from 0.7kg to 0.5kg',
              'Increase daily calories by 150-200',
              'Focus on strength maintenance vs aggressive cutting',
              'Extend timeline by 3-4 weeks'
            ],
            expected_outcomes: [
              'Improved adherence to nutrition plan',
              'Better energy levels for training',
              'Reduced hunger and cravings',
              'More consistent progress'
            ],
            timeline: 'Immediate adjustment with 2-week assessment'
          },
          reasoning: 'Adherence to current caloric deficit has declined to 73% over past 2 weeks. Energy levels and training performance showing negative trends. Psychological stress indicators elevated.',
          priority: 'high',
          status: 'pending',
          category: 'goal_setting',
          implementation_guide: {
            difficulty: 'easy',
            estimated_time: 'Immediate implementation',
            resources_needed: [
              'Updated nutrition targets',
              'Revised timeline expectations',
              'Progress tracking adjustments'
            ],
            success_metrics: [
              'Improved adherence >85%',
              'Stable energy levels',
              'Consistent training performance',
              'Reduced stress indicators'
            ]
          },
          expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        }
      ]

      setRecommendations(mockRecommendations)
    } catch (error) {
      console.error('Failed to load recommendations:', error)
    }
  }

  const applyFilters = () => {
    let filtered = [...recommendations]

    if (filters.category !== 'all') {
      filtered = filtered.filter(rec => rec.category === filters.category)
    }

    if (filters.priority !== 'all') {
      filtered = filtered.filter(rec => rec.priority === filters.priority)
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(rec => rec.status === filters.status)
    }

    if (filters.difficulty !== 'all') {
      filtered = filtered.filter(rec => rec.implementation_guide.difficulty === filters.difficulty)
    }

    // Sort by priority and date
    filtered.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      if (priorityDiff !== 0) return priorityDiff
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    setFilteredRecommendations(filtered)
  }

  const calculateStats = () => {
    const total = recommendations.length
    const pending = recommendations.filter(r => r.status === 'pending').length
    const accepted = recommendations.filter(r => r.status === 'accepted').length
    const success_rate = total > 0 ? (accepted / total) * 100 : 0
    
    setStats({
      total,
      pending,
      accepted,
      success_rate,
      avg_impact_score: 8.2 // Mock average impact score
    })
  }

  const generateNewRecommendations = async () => {
    setIsGenerating(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2500))
      await loadRecommendations()
    } catch (error) {
      console.error('Failed to generate recommendations:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const applyRecommendation = async (recommendationId: string) => {
    try {
      setRecommendations(prev => prev.map(rec => 
        rec.id === recommendationId 
          ? { 
              ...rec, 
              status: 'accepted' as const, 
              applied_at: new Date().toISOString() 
            }
          : rec
      ))
      
      onRecommendationApplied?.(recommendationId)
    } catch (error) {
      console.error('Failed to apply recommendation:', error)
    }
  }

  const declineRecommendation = async (recommendationId: string, reason?: string) => {
    try {
      setRecommendations(prev => prev.map(rec => 
        rec.id === recommendationId 
          ? { ...rec, status: 'declined' as const }
          : rec
      ))
      
      onRecommendationDeclined?.(recommendationId, reason)
    } catch (error) {
      console.error('Failed to decline recommendation:', error)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'workout': return <Activity className="h-4 w-4" />
      case 'nutrition': return <Utensils className="h-4 w-4" />
      case 'recovery': return <Moon className="h-4 w-4" />
      case 'goal_setting': return <Target className="h-4 w-4" />
      case 'engagement': return <Zap className="h-4 w-4" />
      default: return <Lightbulb className="h-4 w-4" />
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent': return <Badge variant="destructive">{priority}</Badge>
      case 'high': return <Badge variant="default">{priority}</Badge>
      case 'medium': return <Badge variant="secondary">{priority}</Badge>
      default: return <Badge variant="outline">{priority}</Badge>
    }
  }

  const getDifficultyBadge = (difficulty: string) => {
    const colors = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800'
    }
    
    return (
      <Badge className={colors[difficulty as keyof typeof colors] || colors.medium}>
        {difficulty}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Recommendations</h1>
          <p className="text-muted-foreground">
            Personalized suggestions to optimize your fitness journey
          </p>
        </div>
        
        <Button 
          onClick={generateNewRecommendations}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Lightbulb className="mr-2 h-4 w-4" />
              Get New Recommendations
            </>
          )}
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.success_rate)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center flex-wrap">
        <select
          value={filters.category}
          onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value as any }))}
          className="px-3 py-2 border rounded-md"
        >
          <option value="all">All Categories</option>
          <option value="workout">Workout</option>
          <option value="nutrition">Nutrition</option>
          <option value="recovery">Recovery</option>
          <option value="goal_setting">Goal Setting</option>
          <option value="engagement">Engagement</option>
        </select>

        <select
          value={filters.priority}
          onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value as any }))}
          className="px-3 py-2 border rounded-md"
        >
          <option value="all">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
          className="px-3 py-2 border rounded-md"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="declined">Declined</option>
        </select>

        <div className="text-sm text-muted-foreground">
          {filteredRecommendations.length} recommendations
        </div>
      </div>

      {/* Recommendations Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {filteredRecommendations.map((recommendation) => (
          <Card 
            key={recommendation.id}
            className={cn(
              "transition-all hover:shadow-lg",
              recommendation.status === 'pending' && "ring-1 ring-primary/20",
              recommendation.priority === 'urgent' && "border-red-200",
              recommendation.priority === 'high' && "border-orange-200"
            )}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getCategoryIcon(recommendation.category)}
                    <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                    {getPriorityBadge(recommendation.priority)}
                  </div>
                  <CardDescription className="text-sm">
                    {recommendation.content.description}
                  </CardDescription>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-2">
                {getDifficultyBadge(recommendation.implementation_guide.difficulty)}
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {recommendation.implementation_guide.estimated_time}
                </Badge>
                {recommendation.expires_at && (
                  <Badge variant="outline" className="text-xs">
                    <Calendar className="h-3 w-3 mr-1" />
                    Expires {new Date(recommendation.expires_at).toLocaleDateString()}
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="benefits">Benefits</TabsTrigger>
                  <TabsTrigger value="steps">Steps</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-3 mt-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Expected Outcomes</h4>
                    <div className="text-xs text-muted-foreground space-y-1">
                      {recommendation.content.expected_outcomes.slice(0, 2).map((outcome, index) => (
                        <div key={index} className="flex items-start gap-1">
                          <CheckCircle className="h-3 w-3 mt-0.5 text-green-600" />
                          {outcome}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">Timeline</h4>
                    <p className="text-xs text-muted-foreground">
                      {recommendation.content.timeline}
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="benefits" className="space-y-2 mt-4">
                  {recommendation.content.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Star className="h-3 w-3 mt-0.5 text-yellow-500" />
                      <span className="text-xs">{benefit}</span>
                    </div>
                  ))}
                </TabsContent>
                
                <TabsContent value="steps" className="space-y-2 mt-4">
                  {recommendation.content.implementation_steps.map((step, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium mt-0.5">
                        {index + 1}
                      </div>
                      <span className="text-xs">{step}</span>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>

              {recommendation.status === 'pending' && (
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    onClick={() => applyRecommendation(recommendation.id)}
                    className="flex-1"
                  >
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Apply
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedRecommendation(recommendation)}
                    className="flex-1"
                  >
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => declineRecommendation(recommendation.id)}
                  >
                    <XCircle className="h-3 w-3" />
                  </Button>
                </div>
              )}

              {recommendation.status === 'accepted' && (
                <div className="flex items-center gap-2 mt-4 p-2 bg-green-50 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">Applied</span>
                  {recommendation.applied_at && (
                    <span className="text-xs text-green-600 ml-auto">
                      {new Date(recommendation.applied_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}

              {recommendation.status === 'declined' && (
                <div className="flex items-center gap-2 mt-4 p-2 bg-red-50 rounded-lg">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-800">Declined</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRecommendations.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Recommendations Available</h3>
            <p className="text-muted-foreground mb-4">
              No recommendations match your current filters.
            </p>
            <Button onClick={generateNewRecommendations} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Generate Recommendations
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Detailed Recommendation Modal */}
      {selectedRecommendation && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-3xl max-h-[90vh]">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {getCategoryIcon(selectedRecommendation.category)}
                    {selectedRecommendation.title}
                    {getPriorityBadge(selectedRecommendation.priority)}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {selectedRecommendation.content.description}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedRecommendation(null)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Reasoning</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedRecommendation.reasoning}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">All Benefits</h4>
                    <div className="grid gap-2">
                      {selectedRecommendation.content.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Star className="h-4 w-4 mt-0.5 text-yellow-500" />
                          <span className="text-sm">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Implementation Steps</h4>
                    <div className="space-y-3">
                      {selectedRecommendation.content.implementation_steps.map((step, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium flex-shrink-0">
                            {index + 1}
                          </div>
                          <span className="text-sm">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Success Metrics</h4>
                    <div className="grid gap-2">
                      {selectedRecommendation.implementation_guide.success_metrics.map((metric, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Target className="h-4 w-4 mt-0.5 text-primary" />
                          <span className="text-sm">{metric}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Resources Needed</h4>
                    <div className="grid gap-2">
                      {selectedRecommendation.implementation_guide.resources_needed.map((resource, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Settings className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <span className="text-sm">{resource}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
              
              {selectedRecommendation.status === 'pending' && (
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button 
                    onClick={() => {
                      applyRecommendation(selectedRecommendation.id)
                      setSelectedRecommendation(null)
                    }}
                    className="flex-1"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Apply Recommendation
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      declineRecommendation(selectedRecommendation.id)
                      setSelectedRecommendation(null)
                    }}
                    className="flex-1"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Decline
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}