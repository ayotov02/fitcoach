'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  MessageSquare, Send, Clock, CheckCircle, XCircle, User, 
  Target, AlertTriangle, Heart, Zap, TrendingUp, Calendar,
  ThumbsUp, ThumbsDown, Star, RefreshCw, Plus, Edit3,
  Copy, Save, Wand2, Brain, Users, Activity, Utensils
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AICoachingAction } from '@/lib/types/ai'

interface AICoachingPromptsProps {
  coachId: string
  clientId?: string
  onActionExecuted?: (actionId: string, result: any) => void
  onPromptCustomized?: (promptId: string, customContent: string) => void
}

interface CoachingPrompt {
  id: string
  title: string
  category: 'check_in' | 'motivation' | 'adjustment' | 'education' | 'celebration' | 'concern'
  template: string
  variables: string[]
  usage_count: number
  success_rate: number
  ai_suggested: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
  triggers: string[]
  effectiveness_score: number
}

interface PromptFilters {
  category: 'all' | 'check_in' | 'motivation' | 'adjustment' | 'education' | 'celebration' | 'concern'
  priority: 'all' | 'low' | 'medium' | 'high' | 'urgent'
  aiSuggested: 'all' | 'ai_only' | 'manual_only'
  effectiveness: number
}

interface ClientContext {
  name: string
  recent_progress: any
  current_goals: string[]
  last_interaction: string
  motivation_level: number
  adherence_rate: number
  plateau_risk: number
  dropout_risk: number
}

export function AICoachingPrompts({
  coachId,
  clientId,
  onActionExecuted,
  onPromptCustomized
}: AICoachingPromptsProps) {
  const [suggestedActions, setSuggestedActions] = useState<AICoachingAction[]>([])
  const [coachingPrompts, setCoachingPrompts] = useState<CoachingPrompt[]>([])
  const [filteredPrompts, setFilteredPrompts] = useState<CoachingPrompt[]>([])
  const [filters, setFilters] = useState<PromptFilters>({
    category: 'all',
    priority: 'all',
    aiSuggested: 'all',
    effectiveness: 0.5
  })
  const [clientContext, setClientContext] = useState<ClientContext | null>(null)
  const [selectedPrompt, setSelectedPrompt] = useState<CoachingPrompt | null>(null)
  const [customizedMessage, setCustomizedMessage] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState('suggested')

  useEffect(() => {
    loadSuggestedActions()
    loadCoachingPrompts()
    if (clientId) {
      loadClientContext()
    }
  }, [coachId, clientId])

  useEffect(() => {
    applyFilters()
  }, [coachingPrompts, filters])

  const loadSuggestedActions = async () => {
    try {
      // Mock suggested actions data
      const mockActions: AICoachingAction[] = [
        {
          id: '1',
          coach_id: coachId,
          client_id: clientId || 'client-123',
          action_type: 'send_check_in',
          ai_suggested: true,
          suggestion_data: {
            reasoning: 'Client has missed 2 workouts this week and response time to messages has increased by 40%. Early intervention recommended.',
            urgency: 'high',
            expected_impact: 'Re-engage client and identify potential barriers',
            success_probability: 0.78
          },
          priority: 'high',
          status: 'pending',
          due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          coach_id: coachId,
          client_id: clientId || 'client-123',
          action_type: 'provide_encouragement',
          ai_suggested: true,
          suggestion_data: {
            reasoning: 'Client achieved 18% strength increase this month but may not recognize the significance. Positive reinforcement will boost motivation.',
            urgency: 'medium',
            expected_impact: 'Increase motivation and goal commitment',
            success_probability: 0.85
          },
          priority: 'medium',
          status: 'pending',
          due_date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          coach_id: coachId,
          client_id: clientId || 'client-123',
          action_type: 'adjust_workout',
          ai_suggested: true,
          suggestion_data: {
            reasoning: 'Upper body plateau detected for 2 weeks. Program modification needed to break through stagnation.',
            urgency: 'medium',
            expected_impact: 'Break plateau and continue progress',
            success_probability: 0.72
          },
          priority: 'medium',
          status: 'pending',
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        }
      ]

      setSuggestedActions(mockActions)
    } catch (error) {
      console.error('Failed to load suggested actions:', error)
    }
  }

  const loadCoachingPrompts = async () => {
    try {
      // Mock coaching prompts data
      const mockPrompts: CoachingPrompt[] = [
        {
          id: 'p1',
          title: 'Weekly Progress Check-in',
          category: 'check_in',
          template: `Hi {{client_name}}! 👋

How was your week? I noticed you completed {{workouts_completed}} out of {{planned_workouts}} workouts - that's {{adherence_rate}}%!

Quick check-in:
• How are you feeling about your progress?
• Any challenges or wins to share?
• Energy levels on a scale of 1-10?
• Sleep quality this week?

Looking forward to hearing from you!`,
          variables: ['client_name', 'workouts_completed', 'planned_workouts', 'adherence_rate'],
          usage_count: 245,
          success_rate: 0.87,
          ai_suggested: true,
          priority: 'medium',
          triggers: ['weekly_review', 'adherence_drop'],
          effectiveness_score: 8.7
        },
        {
          id: 'p2',
          title: 'Plateau Breaking Motivation',
          category: 'motivation',
          template: `Hey {{client_name}}! 💪

I've been analyzing your progress, and while it might feel like you've hit a wall, the data tells a different story. You've actually improved {{improvement_metric}} by {{improvement_percentage}}% over the past {{timeframe}}.

Plateaus are actually a sign that your body is adapting - it means you're getting stronger! Here's what we're going to do:

🎯 {{specific_adjustment}}
⚡ {{motivation_boost}}
📈 Expected result: {{expected_outcome}}

Trust the process - you've got this! 🚀`,
          variables: ['client_name', 'improvement_metric', 'improvement_percentage', 'timeframe', 'specific_adjustment', 'motivation_boost', 'expected_outcome'],
          usage_count: 89,
          success_rate: 0.73,
          ai_suggested: true,
          priority: 'high',
          triggers: ['plateau_detected', 'motivation_drop'],
          effectiveness_score: 7.8
        },
        {
          id: 'p3',
          title: 'Program Adjustment Explanation',
          category: 'adjustment',
          template: `Hi {{client_name}},

I'm making some strategic adjustments to your program based on your recent progress:

🔄 **Changes:**
{{program_changes}}

📊 **Why:**
{{reasoning}}

🎯 **Expected Benefits:**
{{expected_benefits}}

⏱️ **Timeline:**
Give it {{adaptation_time}} to see the full effects.

Any questions? I'm here to explain the science behind it! 🧠`,
          variables: ['client_name', 'program_changes', 'reasoning', 'expected_benefits', 'adaptation_time'],
          usage_count: 156,
          success_rate: 0.91,
          ai_suggested: true,
          priority: 'medium',
          triggers: ['program_update', 'plateau_intervention'],
          effectiveness_score: 9.1
        },
        {
          id: 'p4',
          title: 'Achievement Celebration',
          category: 'celebration',
          template: `🎉 INCREDIBLE WORK, {{client_name}}! 🎉

I just reviewed your progress and WOW - you've achieved something amazing:

⭐ {{achievement_description}}
📈 That's a {{improvement_percentage}}% improvement!
🔥 You're now in the top {{percentile}}% of clients at your level!

This didn't happen by accident - it's the result of:
✅ {{success_factor_1}}
✅ {{success_factor_2}}
✅ {{success_factor_3}}

Take a moment to celebrate this win! You've earned it! 🥳

What goal should we conquer next? 🎯`,
          variables: ['client_name', 'achievement_description', 'improvement_percentage', 'percentile', 'success_factor_1', 'success_factor_2', 'success_factor_3'],
          usage_count: 67,
          success_rate: 0.95,
          ai_suggested: true,
          priority: 'low',
          triggers: ['goal_achieved', 'milestone_reached'],
          effectiveness_score: 9.5
        },
        {
          id: 'p5',
          title: 'Gentle Accountability Check',
          category: 'concern',
          template: `Hi {{client_name}},

I hope everything is going well! I noticed we haven't connected in {{days_since_contact}} days, and I wanted to reach out.

No judgment here - life happens! 🤗

I'm checking in because:
• Your last workout was {{last_workout_date}}
• I want to make sure you're okay
• See if there's anything I can help with

Whether it's:
🏃‍♀️ Getting back on track
🔧 Adjusting your program
💬 Just needing someone to talk to

I'm here for you. What do you need right now?`,
          variables: ['client_name', 'days_since_contact', 'last_workout_date'],
          usage_count: 34,
          success_rate: 0.68,
          ai_suggested: true,
          priority: 'high',
          triggers: ['extended_absence', 'dropout_risk'],
          effectiveness_score: 7.2
        },
        {
          id: 'p6',
          title: 'Educational Nutrition Tip',
          category: 'education',
          template: `💡 Nutrition Insight for {{client_name}}

Based on your recent progress, here's a science-backed tip that could help:

🧬 **The Science:**
{{scientific_explanation}}

🍽️ **Practical Application:**
{{practical_advice}}

📊 **Expected Impact:**
{{expected_results}}

⚡ **Pro Tip:**
{{bonus_tip}}

Try this for {{trial_period}} and let me know how you feel! 

Questions? Fire away! 🚀`,
          variables: ['client_name', 'scientific_explanation', 'practical_advice', 'expected_results', 'bonus_tip', 'trial_period'],
          usage_count: 178,
          success_rate: 0.79,
          ai_suggested: false,
          priority: 'low',
          triggers: ['nutrition_opportunity', 'education_moment'],
          effectiveness_score: 8.3
        }
      ]

      setCoachingPrompts(mockPrompts)
    } catch (error) {
      console.error('Failed to load coaching prompts:', error)
    }
  }

  const loadClientContext = async () => {
    try {
      // Mock client context
      const mockContext: ClientContext = {
        name: 'Sarah Johnson',
        recent_progress: {
          strength_improvement: 18.3,
          adherence_rate: 84.2,
          workout_streak: 12
        },
        current_goals: ['Lose 15 lbs', 'Squat bodyweight', 'Improve energy levels'],
        last_interaction: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        motivation_level: 7.2,
        adherence_rate: 84.2,
        plateau_risk: 23,
        dropout_risk: 18
      }

      setClientContext(mockContext)
    } catch (error) {
      console.error('Failed to load client context:', error)
    }
  }

  const applyFilters = () => {
    let filtered = [...coachingPrompts]

    if (filters.category !== 'all') {
      filtered = filtered.filter(prompt => prompt.category === filters.category)
    }

    if (filters.priority !== 'all') {
      filtered = filtered.filter(prompt => prompt.priority === filters.priority)
    }

    if (filters.aiSuggested !== 'all') {
      const isAiSuggested = filters.aiSuggested === 'ai_only'
      filtered = filtered.filter(prompt => prompt.ai_suggested === isAiSuggested)
    }

    filtered = filtered.filter(prompt => 
      (prompt.effectiveness_score / 10) >= filters.effectiveness
    )

    // Sort by effectiveness and usage
    filtered.sort((a, b) => {
      const effectivenessDiff = b.effectiveness_score - a.effectiveness_score
      if (effectivenessDiff !== 0) return effectivenessDiff
      return b.usage_count - a.usage_count
    })

    setFilteredPrompts(filtered)
  }

  const generateAIPrompts = async () => {
    setIsGenerating(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2500))
      await loadCoachingPrompts()
    } catch (error) {
      console.error('Failed to generate AI prompts:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const executeAction = async (actionId: string) => {
    try {
      setSuggestedActions(prev => prev.map(action => 
        action.id === actionId 
          ? { ...action, status: 'in_progress' as const }
          : action
      ))

      // Simulate action execution
      await new Promise(resolve => setTimeout(resolve, 1000))

      setSuggestedActions(prev => prev.map(action => 
        action.id === actionId 
          ? { 
              ...action, 
              status: 'completed' as const,
              completed_at: new Date().toISOString()
            }
          : action
      ))

      onActionExecuted?.(actionId, { success: true })
    } catch (error) {
      console.error('Failed to execute action:', error)
    }
  }

  const usePrompt = async (prompt: CoachingPrompt) => {
    if (!clientContext) return

    // Replace variables in template with actual values
    let message = prompt.template
    prompt.variables.forEach(variable => {
      const value = getVariableValue(variable)
      message = message.replace(new RegExp(`{{${variable}}}`, 'g'), value)
    })

    setSelectedPrompt(prompt)
    setCustomizedMessage(message)
  }

  const getVariableValue = (variable: string): string => {
    if (!clientContext) return `{{${variable}}}`

    const valueMap: Record<string, string> = {
      'client_name': clientContext.name,
      'adherence_rate': `${clientContext.adherence_rate}`,
      'workouts_completed': '4',
      'planned_workouts': '5',
      'improvement_percentage': '18.3',
      'timeframe': '4 weeks',
      'days_since_contact': '3',
      'last_workout_date': 'Monday',
      'improvement_metric': 'strength',
      'percentile': '85'
    }

    return valueMap[variable] || `{{${variable}}}`
  }

  const sendMessage = async () => {
    if (!customizedMessage.trim()) return

    try {
      // Simulate sending message
      await new Promise(resolve => setTimeout(resolve, 500))
      
      if (selectedPrompt) {
        // Update prompt usage stats
        setCoachingPrompts(prev => prev.map(prompt => 
          prompt.id === selectedPrompt.id 
            ? { ...prompt, usage_count: prompt.usage_count + 1 }
            : prompt
        ))
      }

      setCustomizedMessage('')
      setSelectedPrompt(null)
      
      // Could trigger onPromptCustomized callback here
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'check_in': return <MessageSquare className="h-4 w-4" />
      case 'motivation': return <Zap className="h-4 w-4" />
      case 'adjustment': return <Edit3 className="h-4 w-4" />
      case 'education': return <Brain className="h-4 w-4" />
      case 'celebration': return <Star className="h-4 w-4" />
      case 'concern': return <AlertTriangle className="h-4 w-4" />
      default: return <MessageSquare className="h-4 w-4" />
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

  const getActionTypeIcon = (actionType: string) => {
    switch (actionType) {
      case 'send_check_in': return <MessageSquare className="h-4 w-4" />
      case 'adjust_workout': return <Activity className="h-4 w-4" />
      case 'modify_nutrition': return <Utensils className="h-4 w-4" />
      case 'provide_encouragement': return <Heart className="h-4 w-4" />
      case 'schedule_meeting': return <Calendar className="h-4 w-4" />
      default: return <Target className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Coaching Prompts</h1>
          <p className="text-muted-foreground">
            Smart suggestions and templates for effective client communication
            {clientContext && ` • Coaching ${clientContext.name}`}
          </p>
        </div>
        
        <Button onClick={generateAIPrompts} disabled={isGenerating}>
          {isGenerating ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              Generate AI Prompts
            </>
          )}
        </Button>
      </div>

      {clientContext && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Client Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {clientContext.motivation_level}/10
                </div>
                <div className="text-xs text-muted-foreground">Motivation Level</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {clientContext.adherence_rate}%
                </div>
                <div className="text-xs text-muted-foreground">Adherence Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {clientContext.plateau_risk}%
                </div>
                <div className="text-xs text-muted-foreground">Plateau Risk</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {clientContext.dropout_risk}%
                </div>
                <div className="text-xs text-muted-foreground">Dropout Risk</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="suggested">AI Suggestions</TabsTrigger>
          <TabsTrigger value="templates">Prompt Templates</TabsTrigger>
          <TabsTrigger value="composer">Message Composer</TabsTrigger>
        </TabsList>

        <TabsContent value="suggested" className="space-y-4">
          <div className="text-sm text-muted-foreground mb-4">
            {suggestedActions.length} AI-suggested actions based on client data
          </div>
          
          <div className="grid gap-4">
            {suggestedActions.map((action) => (
              <Card key={action.id} className="transition-all hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {getActionTypeIcon(action.action_type)}
                        {action.action_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        {getPriorityBadge(action.priority)}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {action.suggestion_data?.reasoning}
                      </CardDescription>
                    </div>
                    {action.suggestion_data && (
                      <Badge variant="outline" className="ml-2">
                        {Math.round(action.suggestion_data.success_probability * 100)}% success
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <strong>Expected Impact:</strong> {action.suggestion_data?.expected_impact}
                    </div>
                    
                    {action.due_date && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Due: {new Date(action.due_date).toLocaleDateString()}
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      {action.status === 'pending' && (
                        <>
                          <Button 
                            size="sm"
                            onClick={() => executeAction(action.id)}
                          >
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Execute Action
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit3 className="mr-1 h-3 w-3" />
                            Customize
                          </Button>
                        </>
                      )}
                      
                      {action.status === 'in_progress' && (
                        <Badge variant="secondary">
                          <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                          In Progress
                        </Badge>
                      )}
                      
                      {action.status === 'completed' && (
                        <Badge variant="default">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4 items-center flex-wrap">
            <Select
              value={filters.category}
              onValueChange={(value: any) => setFilters(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="check_in">Check-in</SelectItem>
                <SelectItem value="motivation">Motivation</SelectItem>
                <SelectItem value="adjustment">Adjustment</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="celebration">Celebration</SelectItem>
                <SelectItem value="concern">Concern</SelectItem>
              </SelectContent>
            </Select>

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
              value={filters.aiSuggested}
              onValueChange={(value: any) => setFilters(prev => ({ ...prev, aiSuggested: value }))}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="ai_only">AI Only</SelectItem>
                <SelectItem value="manual_only">Manual Only</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-muted-foreground">
              {filteredPrompts.length} templates
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {filteredPrompts.map((prompt) => (
              <Card key={prompt.id} className="transition-all hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {getCategoryIcon(prompt.category)}
                        {prompt.title}
                        {prompt.ai_suggested && <Badge variant="outline" className="text-xs">AI</Badge>}
                      </CardTitle>
                    </div>
                    {getPriorityBadge(prompt.priority)}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="text-xs text-muted-foreground line-clamp-4">
                        {prompt.template.substring(0, 200)}...
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-xs text-center">
                      <div>
                        <div className="font-medium">{prompt.usage_count}</div>
                        <div className="text-muted-foreground">Uses</div>
                      </div>
                      <div>
                        <div className="font-medium">{Math.round(prompt.success_rate * 100)}%</div>
                        <div className="text-muted-foreground">Success</div>
                      </div>
                      <div>
                        <div className="font-medium">{prompt.effectiveness_score}/10</div>
                        <div className="text-muted-foreground">Rating</div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm"
                        onClick={() => usePrompt(prompt)}
                        disabled={!clientContext}
                      >
                        <Send className="mr-1 h-3 w-3" />
                        Use Template
                      </Button>
                      <Button size="sm" variant="outline">
                        <Copy className="mr-1 h-3 w-3" />
                        Copy
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="composer" className="space-y-4">
          {selectedPrompt && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit3 className="h-5 w-5" />
                  Compose Message - {selectedPrompt.title}
                </CardTitle>
                <CardDescription>
                  Customize your message before sending
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={customizedMessage}
                  onChange={(e) => setCustomizedMessage(e.target.value)}
                  rows={10}
                  placeholder="Your message will appear here..."
                />
                
                <div className="flex gap-2">
                  <Button onClick={sendMessage} disabled={!customizedMessage.trim()}>
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedPrompt(null)}>
                    Cancel
                  </Button>
                  <Button variant="outline">
                    <Save className="mr-2 h-4 w-4" />
                    Save as Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {!selectedPrompt && (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Select a Template to Start</h3>
                <p className="text-muted-foreground mb-4">
                  Choose from AI suggestions or templates to compose your message
                </p>
                <Button onClick={() => setActiveTab('templates')}>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Browse Templates
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}