'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Target, TrendingUp, Calendar, Clock, Zap, AlertTriangle, 
  CheckCircle, RefreshCw, Brain, ArrowRight, Edit3, Save,
  Plus, Minus, Users, BarChart3, Lightbulb, Star,
  Activity, Dumbbell, Scale, Heart, Award, Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AIGoalOptimization } from '@/lib/types/ai'

interface AIGoalOptimizerProps {
  userId: string
  userRole: 'coach' | 'client'
  clientId?: string
  onGoalUpdated?: (goalId: string, updates: any) => void
  onGoalOptimized?: (optimization: AIGoalOptimization) => void
}

interface Goal {
  id: string
  title: string
  description: string
  category: 'strength' | 'weight_loss' | 'muscle_gain' | 'endurance' | 'performance' | 'lifestyle'
  target_value: number
  current_value: number
  unit: string
  target_date: string
  created_date: string
  priority: 'high' | 'medium' | 'low'
  status: 'active' | 'paused' | 'completed' | 'cancelled'
  progress_percentage: number
  estimated_completion: string
  realistic_score: number
  conflict_score: number
  icon: React.ReactNode
}

interface GoalOptimization {
  goal_id?: string
  type: 'modify' | 'add' | 'remove' | 'extend'
  title: string
  description: string
  reasoning: string
  expected_impact: string
  difficulty_adjustment: number
  timeline_adjustment?: string
  success_probability: number
  implementation_complexity: 'easy' | 'medium' | 'hard'
  priority: 'high' | 'medium' | 'low'
}

interface GoalConflict {
  conflicting_goals: string[]
  conflict_type: 'timeline' | 'resource' | 'biological' | 'motivational'
  severity: 'high' | 'medium' | 'low'
  resolution_strategy: string
  impact_assessment: string
}

interface ResourceAllocation {
  goal_id: string
  goal_title: string
  time_percentage: number
  effort_level: number
  resources_needed: string[]
  priority_rank: number
}

export function AIGoalOptimizer({
  userId,
  userRole,
  clientId,
  onGoalUpdated,
  onGoalOptimized
}: AIGoalOptimizerProps) {
  const [currentGoals, setCurrentGoals] = useState<Goal[]>([])
  const [goalOptimizations, setGoalOptimizations] = useState<GoalOptimization[]>([])
  const [goalConflicts, setGoalConflicts] = useState<GoalConflict[]>([])
  const [resourceAllocation, setResourceAllocation] = useState<ResourceAllocation[]>([])
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [activeTab, setActiveTab] = useState('current')

  useEffect(() => {
    loadGoalData()
  }, [userId, clientId])

  const loadGoalData = async () => {
    try {
      // Mock current goals
      const mockGoals: Goal[] = [
        {
          id: '1',
          title: 'Lose 15 lbs',
          description: 'Achieve target weight through balanced nutrition and exercise',
          category: 'weight_loss',
          target_value: 65,
          current_value: 70.5,
          unit: 'kg',
          target_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          created_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          priority: 'high',
          status: 'active',
          progress_percentage: 36.7,
          estimated_completion: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString(),
          realistic_score: 8.2,
          conflict_score: 3.1,
          icon: <Scale className="h-4 w-4" />
        },
        {
          id: '2',
          title: 'Squat 100kg',
          description: 'Achieve bodyweight squat milestone',
          category: 'strength',
          target_value: 100,
          current_value: 87.5,
          unit: 'kg',
          target_date: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
          created_date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          priority: 'medium',
          status: 'active',
          progress_percentage: 87.5,
          estimated_completion: new Date(Date.now() + 95 * 24 * 60 * 60 * 1000).toISOString(),
          realistic_score: 9.1,
          conflict_score: 2.3,
          icon: <Dumbbell className="h-4 w-4" />
        },
        {
          id: '3',
          title: 'Run 5K under 25 minutes',
          description: 'Improve cardiovascular endurance and running speed',
          category: 'endurance',
          target_value: 25,
          current_value: 28.5,
          unit: 'minutes',
          target_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          created_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          priority: 'medium',
          status: 'active',
          progress_percentage: 42.9,
          estimated_completion: new Date(Date.now() + 85 * 24 * 60 * 60 * 1000).toISOString(),
          realistic_score: 7.8,
          conflict_score: 4.2,
          icon: <Activity className="h-4 w-4" />
        },
        {
          id: '4',
          title: 'Sleep 8+ hours nightly',
          description: 'Establish consistent sleep schedule for recovery',
          category: 'lifestyle',
          target_value: 8,
          current_value: 6.8,
          unit: 'hours',
          target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          created_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          priority: 'high',
          status: 'active',
          progress_percentage: 85,
          estimated_completion: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
          realistic_score: 6.9,
          conflict_score: 5.8,
          icon: <Clock className="h-4 w-4" />
        }
      ]

      const mockOptimizations: GoalOptimization[] = [
        {
          goal_id: '1',
          type: 'modify',
          title: 'Adjust Weight Loss Timeline',
          description: 'Extend weight loss goal by 3 weeks for more sustainable approach',
          reasoning: 'Current pace of 1.2kg/week is aggressive and may lead to muscle loss or rebound. Slower rate of 0.7kg/week is more sustainable.',
          expected_impact: 'Improved adherence, better muscle retention, reduced stress',
          difficulty_adjustment: -2,
          timeline_adjustment: '+3 weeks',
          success_probability: 0.87,
          implementation_complexity: 'easy',
          priority: 'high'
        },
        {
          goal_id: '3',
          type: 'extend',
          title: 'Extend 5K Goal Timeline',
          description: 'Move 5K time goal to allow for progressive endurance building',
          reasoning: 'Current timeline conflicts with strength goals. Extending allows for balanced training approach.',
          expected_impact: 'Reduced training conflicts, better recovery, improved performance in both areas',
          difficulty_adjustment: -1,
          timeline_adjustment: '+4 weeks',
          success_probability: 0.78,
          implementation_complexity: 'easy',
          priority: 'medium'
        },
        {
          type: 'add',
          title: 'Add Progressive Strength Goal',
          description: 'Add intermediate strength milestone: Bench press 70kg',
          reasoning: 'Gap between current strength and squat goal. Intermediate milestone will build confidence and momentum.',
          expected_impact: 'Improved motivation, better progression tracking, reduced risk of plateau',
          difficulty_adjustment: 0,
          success_probability: 0.82,
          implementation_complexity: 'medium',
          priority: 'medium'
        },
        {
          goal_id: '4',
          type: 'modify',
          title: 'Split Sleep Goal into Phases',
          description: 'Phase 1: 7+ hours (2 weeks), Phase 2: 7.5+ hours (2 weeks), Phase 3: 8+ hours',
          reasoning: 'Dramatic sleep change is difficult to maintain. Gradual progression increases success likelihood.',
          expected_impact: 'Higher success rate, sustainable habit formation, better compliance',
          difficulty_adjustment: -3,
          success_probability: 0.91,
          implementation_complexity: 'easy',
          priority: 'high'
        }
      ]

      const mockConflicts: GoalConflict[] = [
        {
          conflicting_goals: ['Lose 15 lbs', 'Squat 100kg'],
          conflict_type: 'biological',
          severity: 'medium',
          resolution_strategy: 'Prioritize strength maintenance during weight loss phase, then focus on strength gains',
          impact_assessment: 'May slow progress on both goals but prevents muscle loss'
        },
        {
          conflicting_goals: ['Run 5K under 25 minutes', 'Squat 100kg'],
          conflict_type: 'resource',
          severity: 'high',
          resolution_strategy: 'Alternate focus periods: 4 weeks endurance, 4 weeks strength, with maintenance phases',
          impact_assessment: 'Requires timeline extensions but improves overall success probability'
        }
      ]

      const mockResourceAllocation: ResourceAllocation[] = [
        {
          goal_id: '1',
          goal_title: 'Lose 15 lbs',
          time_percentage: 35,
          effort_level: 8,
          resources_needed: ['Nutrition tracking', 'Meal prep', 'Cardio time'],
          priority_rank: 1
        },
        {
          goal_id: '2',
          goal_title: 'Squat 100kg',
          time_percentage: 30,
          effort_level: 7,
          resources_needed: ['Gym access', 'Progressive weights', 'Recovery time'],
          priority_rank: 2
        },
        {
          goal_id: '3',
          goal_title: 'Run 5K under 25 minutes',
          time_percentage: 20,
          effort_level: 6,
          resources_needed: ['Running space', 'Cardio equipment', 'Running shoes'],
          priority_rank: 3
        },
        {
          goal_id: '4',
          goal_title: 'Sleep 8+ hours nightly',
          time_percentage: 15,
          effort_level: 5,
          resources_needed: ['Sleep schedule', 'Sleep environment', 'Evening routine'],
          priority_rank: 4
        }
      ]

      setCurrentGoals(mockGoals)
      setGoalOptimizations(mockOptimizations)
      setGoalConflicts(mockConflicts)
      setResourceAllocation(mockResourceAllocation)
    } catch (error) {
      console.error('Failed to load goal data:', error)
    }
  }

  const runOptimization = async () => {
    setIsOptimizing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 3500))
      await loadGoalData()
      
      const optimization: AIGoalOptimization = {
        current_goals: currentGoals.map(g => ({
          id: g.id,
          description: g.title,
          target_date: g.target_date,
          progress_percentage: g.progress_percentage
        })),
        optimized_goals: goalOptimizations,
        goal_conflicts: goalConflicts.map(c => ({
          conflicting_goals: c.conflicting_goals,
          resolution_strategy: c.resolution_strategy
        })),
        resource_allocation: {
          time_distribution: resourceAllocation.reduce((acc, r) => {
            acc[r.goal_title] = r.time_percentage
            return acc
          }, {} as Record<string, number>),
          priority_ranking: resourceAllocation.sort((a, b) => a.priority_rank - b.priority_rank).map(r => r.goal_title)
        }
      }
      
      onGoalOptimized?.(optimization)
    } catch (error) {
      console.error('Failed to run optimization:', error)
    } finally {
      setIsOptimizing(false)
    }
  }

  const applyOptimization = async (optimization: GoalOptimization) => {
    try {
      if (optimization.goal_id) {
        const goal = currentGoals.find(g => g.id === optimization.goal_id)
        if (goal) {
          // Apply optimization to existing goal
          const updatedGoal = { ...goal }
          if (optimization.timeline_adjustment) {
            const adjustment = parseInt(optimization.timeline_adjustment.replace(/[^\d]/g, ''))
            const newDate = new Date(goal.target_date)
            newDate.setDate(newDate.getDate() + adjustment * 7)
            updatedGoal.target_date = newDate.toISOString()
          }
          
          setCurrentGoals(prev => prev.map(g => g.id === goal.id ? updatedGoal : g))
          onGoalUpdated?.(goal.id, updatedGoal)
        }
      }
      
      // Remove applied optimization
      setGoalOptimizations(prev => prev.filter(opt => opt !== optimization))
    } catch (error) {
      console.error('Failed to apply optimization:', error)
    }
  }

  const updateGoal = async (goal: Goal) => {
    try {
      setCurrentGoals(prev => prev.map(g => g.id === goal.id ? goal : g))
      onGoalUpdated?.(goal.id, goal)
      setEditingGoal(null)
    } catch (error) {
      console.error('Failed to update goal:', error)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'strength': return <Dumbbell className="h-4 w-4" />
      case 'weight_loss': return <Scale className="h-4 w-4" />
      case 'muscle_gain': return <Zap className="h-4 w-4" />
      case 'endurance': return <Activity className="h-4 w-4" />
      case 'performance': return <BarChart3 className="h-4 w-4" />
      case 'lifestyle': return <Heart className="h-4 w-4" />
      default: return <Target className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50'
      case 'medium': return 'border-yellow-200 bg-yellow-50'
      case 'low': return 'border-green-200 bg-green-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge variant="default" className="bg-green-600">Completed</Badge>
      case 'active': return <Badge variant="secondary">Active</Badge>
      case 'paused': return <Badge variant="outline">Paused</Badge>
      case 'cancelled': return <Badge variant="destructive">Cancelled</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  const getOptimizationTypeIcon = (type: string) => {
    switch (type) {
      case 'modify': return <Edit3 className="h-4 w-4" />
      case 'add': return <Plus className="h-4 w-4" />
      case 'remove': return <Minus className="h-4 w-4" />
      case 'extend': return <Calendar className="h-4 w-4" />
      case 'split': return <Target className="h-4 w-4" />
      default: return <Lightbulb className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Goal Optimizer</h1>
          <p className="text-muted-foreground">
            Smart goal adjustment and optimization recommendations
            {clientId && ' for this client'}
          </p>
        </div>
        
        <Button onClick={runOptimization} disabled={isOptimizing}>
          {isOptimizing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Optimizing...
            </>
          ) : (
            <>
              <Brain className="mr-2 h-4 w-4" />
              Optimize Goals
            </>
          )}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="current">Current Goals</TabsTrigger>
          <TabsTrigger value="optimizations">Optimizations</TabsTrigger>
          <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          <div className="text-sm text-muted-foreground mb-4">
            {currentGoals.filter(g => g.status === 'active').length} active goals
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            {currentGoals.map((goal) => (
              <Card key={goal.id} className={cn("transition-all hover:shadow-md", getPriorityColor(goal.priority))}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {goal.icon}
                        {goal.title}
                        <Badge variant="outline" className="text-xs capitalize">
                          {goal.priority}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {goal.description}
                      </CardDescription>
                    </div>
                    {getStatusBadge(goal.status)}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">{goal.progress_percentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={goal.progress_percentage} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Current: {goal.current_value} {goal.unit}</span>
                        <span>Target: {goal.target_value} {goal.unit}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground mb-1">Target Date</div>
                        <div className="font-medium">
                          {new Date(goal.target_date).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">Est. Completion</div>
                        <div className="font-medium">
                          {new Date(goal.estimated_completion).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground mb-1">Realistic Score</div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{goal.realistic_score}/10</span>
                          <Progress value={goal.realistic_score * 10} className="flex-1 h-1" />
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">Conflict Score</div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{goal.conflict_score}/10</span>
                          <Progress 
                            value={goal.conflict_score * 10} 
                            className="flex-1 h-1"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setEditingGoal(goal)}
                      >
                        <Edit3 className="mr-1 h-3 w-3" />
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => setSelectedGoal(goal)}
                      >
                        Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="optimizations" className="space-y-4">
          <div className="text-sm text-muted-foreground mb-4">
            {goalOptimizations.length} AI-generated optimization recommendations
          </div>
          
          <div className="grid gap-4">
            {goalOptimizations.map((optimization, index) => (
              <Card key={index} className="transition-all hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {getOptimizationTypeIcon(optimization.type)}
                        {optimization.title}
                        <Badge variant="outline" className="text-xs capitalize">
                          {optimization.type}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {optimization.description}
                      </CardDescription>
                    </div>
                    <Badge variant={optimization.priority === 'high' ? 'default' : 'secondary'}>
                      {Math.round(optimization.success_probability * 100)}% success
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-1">Reasoning</h4>
                      <p className="text-sm text-muted-foreground">{optimization.reasoning}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-1">Expected Impact</h4>
                      <p className="text-sm text-muted-foreground">{optimization.expected_impact}</p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      {optimization.difficulty_adjustment !== 0 && (
                        <div>
                          <div className="text-muted-foreground mb-1">Difficulty Change</div>
                          <div className={cn("font-medium", 
                            optimization.difficulty_adjustment < 0 ? "text-green-600" : "text-red-600"
                          )}>
                            {optimization.difficulty_adjustment > 0 ? '+' : ''}{optimization.difficulty_adjustment}
                          </div>
                        </div>
                      )}
                      {optimization.timeline_adjustment && (
                        <div>
                          <div className="text-muted-foreground mb-1">Timeline Change</div>
                          <div className="font-medium">{optimization.timeline_adjustment}</div>
                        </div>
                      )}
                      <div>
                        <div className="text-muted-foreground mb-1">Implementation</div>
                        <Badge variant="outline" className="text-xs capitalize">
                          {optimization.implementation_complexity}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm"
                        onClick={() => applyOptimization(optimization)}
                      >
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Apply
                      </Button>
                      <Button size="sm" variant="outline">
                        <ArrowRight className="mr-1 h-3 w-3" />
                        Preview
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {goalOptimizations.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Target className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <h3 className="text-lg font-medium mb-2">Goals Are Well Optimized</h3>
                <p className="text-muted-foreground">
                  Your current goals appear to be well-balanced and realistic. Keep up the great work!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="conflicts" className="space-y-4">
          <div className="text-sm text-muted-foreground mb-4">
            {goalConflicts.length} potential goal conflicts detected
          </div>
          
          <div className="grid gap-4">
            {goalConflicts.map((conflict, index) => (
              <Card key={index} className="transition-all hover:shadow-md border-orange-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    Goal Conflict Detected
                    <Badge variant={
                      conflict.severity === 'high' ? 'destructive' :
                      conflict.severity === 'medium' ? 'default' : 'secondary'
                    }>
                      {conflict.severity}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {conflict.conflict_type} conflict between goals
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Conflicting Goals</h4>
                      <div className="flex flex-wrap gap-2">
                        {conflict.conflicting_goals.map((goalTitle, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {goalTitle}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-1">Resolution Strategy</h4>
                      <p className="text-sm text-muted-foreground">{conflict.resolution_strategy}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-1">Impact Assessment</h4>
                      <p className="text-sm text-muted-foreground">{conflict.impact_assessment}</p>
                    </div>
                    
                    <Button size="sm" variant="outline">
                      <Settings className="mr-1 h-3 w-3" />
                      Resolve Conflict
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {goalConflicts.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <h3 className="text-lg font-medium mb-2">No Goal Conflicts</h3>
                <p className="text-muted-foreground">
                  Your goals are well-aligned and don't conflict with each other.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Resource Allocation
              </CardTitle>
              <CardDescription>
                Optimal distribution of time and effort across your goals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {resourceAllocation.map((resource) => (
                  <div key={resource.goal_id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{resource.goal_title}</span>
                        <Badge variant="outline" className="text-xs">
                          Rank #{resource.priority_rank}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {resource.time_percentage}% time allocation
                      </span>
                    </div>
                    <Progress value={resource.time_percentage} className="h-2" />
                    
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Effort Level:</span>
                        <span className="font-medium">{resource.effort_level}/10</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {resource.resources_needed.slice(0, 2).map((res, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {res}
                          </Badge>
                        ))}
                        {resource.resources_needed.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{resource.resources_needed.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentGoals.length}</div>
                <div className="text-xs text-muted-foreground">
                  {currentGoals.filter(g => g.status === 'active').length} active
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(currentGoals.reduce((acc, g) => acc + g.progress_percentage, 0) / currentGoals.length)}%
                </div>
                <div className="text-xs text-muted-foreground">Across all goals</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Realistic Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(currentGoals.reduce((acc, g) => acc + g.realistic_score, 0) / currentGoals.length).toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">Average rating</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Optimization Potential</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {goalOptimizations.length}
                </div>
                <div className="text-xs text-muted-foreground">Recommendations</div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Goal Category Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(
                  currentGoals.reduce((acc, goal) => {
                    acc[goal.category] = (acc[goal.category] || 0) + 1
                    return acc
                  }, {} as Record<string, number>)
                ).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(category)}
                      <span className="capitalize">{category.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{count} goals</span>
                      <Progress 
                        value={(count / currentGoals.length) * 100} 
                        className="w-20 h-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Goal Modal */}
      {editingGoal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Edit Goal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={editingGoal.title}
                  onChange={(e) => setEditingGoal({...editingGoal, title: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="target_value">Target Value</Label>
                <Input
                  id="target_value"
                  type="number"
                  value={editingGoal.target_value}
                  onChange={(e) => setEditingGoal({...editingGoal, target_value: parseFloat(e.target.value)})}
                />
              </div>
              
              <div>
                <Label htmlFor="target_date">Target Date</Label>
                <Input
                  id="target_date"
                  type="date"
                  value={editingGoal.target_date.split('T')[0]}
                  onChange={(e) => setEditingGoal({...editingGoal, target_date: new Date(e.target.value).toISOString()})}
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={() => updateGoal(editingGoal)}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditingGoal(null)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}