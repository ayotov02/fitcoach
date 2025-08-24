'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Bot, Send, Mic, MicOff, Image, Paperclip, Settings, Brain, 
  User, MessageSquare, Lightbulb, TrendingUp, Target, Zap, 
  Clock, AlertCircle, CheckCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AIConversation, AIMessage, AIContext, AIInsight, AIRecommendation } from '@/lib/types/ai'

interface AIAssistantProps {
  userId: string
  userRole: 'coach' | 'client'
  clientId?: string | undefined
  contextType?: 'general' | 'workout' | 'nutrition' | 'client_analysis' | 'goal_setting'
  contextData?: Record<string, any>
  onInsightGenerated?: (insight: AIInsight) => void
  onRecommendationCreated?: (recommendation: AIRecommendation) => void
  className?: string
  minimized?: boolean
  onMinimize?: (minimized: boolean) => void
}

interface QuickAction {
  id: string
  label: string
  prompt: string
  icon: React.ReactNode
  category: 'analysis' | 'recommendation' | 'communication' | 'planning'
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'analyze_progress',
    label: 'Analyze Progress',
    prompt: 'Please analyze my recent progress and provide insights',
    icon: <TrendingUp className="h-4 w-4" />,
    category: 'analysis'
  },
  {
    id: 'workout_suggestions',
    label: 'Workout Ideas',
    prompt: 'Suggest workout modifications based on my current program',
    icon: <Zap className="h-4 w-4" />,
    category: 'recommendation'
  },
  {
    id: 'nutrition_help',
    label: 'Nutrition Advice',
    prompt: 'Help me optimize my nutrition plan',
    icon: <Target className="h-4 w-4" />,
    category: 'recommendation'
  },
  {
    id: 'goal_review',
    label: 'Review Goals',
    prompt: 'Let\'s review and potentially adjust my current goals',
    icon: <Target className="h-4 w-4" />,
    category: 'planning'
  }
]

export function AIAssistant({
  userId,
  userRole,
  contextType = 'general',
  contextData,
  onInsightGenerated,
  onRecommendationCreated,
  className,
  minimized = false,
  onMinimize
}: AIAssistantProps) {
  const [conversation, setConversation] = useState<AIConversation | null>(null)
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [context, setContext] = useState<AIContext>({
    user_id: userId,
    user_role: userRole,
    current_context: {
      type: contextType,
      data: contextData
    }
  })
  const [activeTab, setActiveTab] = useState('chat')
  const [recentInsights, setRecentInsights] = useState<AIInsight[]>([])
  const [recentRecommendations, setRecentRecommendations] = useState<AIRecommendation[]>([])

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    initializeConversation()
    loadRecentInsights()
    loadRecentRecommendations()
  }, [userId, contextType])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    setContext(prev => ({
      ...prev,
      current_context: {
        type: contextType,
        data: contextData
      }
    }))
  }, [contextType, contextData])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const initializeConversation = async () => {
    try {
      // In a real implementation, this would load or create a conversation from the database
      const mockConversation: AIConversation = {
        id: crypto.randomUUID(),
        user_id: userId,
        conversation_data: [
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: `Hello! I'm your AI fitness assistant. I'm here to help you ${userRole === 'coach' ? 'coach your clients more effectively' : 'achieve your fitness goals'}. What would you like to work on today?`,
            timestamp: new Date().toISOString()
          }
        ],
        context_type: contextType,
        context_id: contextData?.id,
        metadata: {},
        total_messages: 1,
        last_activity: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      setConversation(mockConversation)
      setMessages(mockConversation.conversation_data)
    } catch (error) {
      console.error('Failed to initialize conversation:', error)
    }
  }

  const loadRecentInsights = async () => {
    // Mock recent insights
    const mockInsights: AIInsight[] = [
      {
        id: '1',
        client_id: userId,
        coach_id: userId,
        insight_type: 'progress_analysis',
        content: {
          title: 'Strong Progress This Week',
          summary: 'Completed all planned workouts with 15% increase in average weight lifted',
          details: 'Your consistency has been excellent this week...',
          data_points: {}
        },
        confidence_score: 0.89,
        priority: 'medium',
        status: 'new',
        action_items: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
    setRecentInsights(mockInsights)
  }

  const loadRecentRecommendations = async () => {
    // Mock recent recommendations
    const mockRecommendations: AIRecommendation[] = [
      {
        id: '1',
        user_id: userId,
        rec_type: 'workout_modification',
        title: 'Increase Training Volume',
        content: {
          description: 'Based on your progress, you\'re ready for increased training volume',
          benefits: ['Faster strength gains', 'Improved muscle growth'],
          implementation_steps: ['Add 1 set to compound exercises', 'Increase frequency by 1 day'],
          expected_outcomes: ['10-15% strength increase in 4 weeks'],
          timeline: '4 weeks'
        },
        reasoning: 'Your recovery markers are excellent and progression has been consistent',
        priority: 'medium',
        status: 'pending',
        category: 'workout',
        implementation_guide: {
          difficulty: 'medium',
          estimated_time: '2 weeks to adapt',
          resources_needed: ['Additional gym time'],
          success_metrics: ['Weight progression', 'Recovery quality']
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
    setRecentRecommendations(mockRecommendations)
  }

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    setIsLoading(true)
    const userMessage: AIMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setCurrentMessage('')

    try {
      // Simulate AI response - in real implementation, this would call your AI service
      await new Promise(resolve => setTimeout(resolve, 1500))

      const aiResponse = await generateAIResponse(content, context)
      
      const assistantMessage: AIMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: aiResponse.content,
        metadata: aiResponse.metadata,
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, assistantMessage])

      // Handle any generated insights or recommendations
      if (aiResponse.insights) {
        aiResponse.insights.forEach(insight => onInsightGenerated?.(insight))
      }
      if (aiResponse.recommendations) {
        aiResponse.recommendations.forEach(rec => onRecommendationCreated?.(rec))
      }

    } catch (error) {
      console.error('Failed to get AI response:', error)
      const errorMessage: AIMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble processing your request right now. Please try again.',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const generateAIResponse = async (userMessage: string, context: AIContext) => {
    // Mock AI response generation based on context and message
    const contextualResponses: Record<string, string[]> = {
      workout: [
        'Based on your current workout program, I notice you\'ve been making great progress on your compound lifts.',
        'Let me analyze your recent training data and suggest some optimizations.',
        'I can help you modify your current routine to address any plateaus or goals.'
      ],
      nutrition: [
        'Looking at your nutrition data, you\'ve been consistent with your macro targets.',
        'I can suggest some meal timing optimizations based on your training schedule.',
        'Let me analyze your recent food logs and identify areas for improvement.'
      ],
      goal_setting: [
        'Let me help you set SMART goals that align with your fitness aspirations.',
        'Based on your progress, I can suggest goal adjustments for better results.',
        'I can analyze your goal achievement patterns and optimize your targets.'
      ],
      general: [
        'I\'m here to help with any aspect of your fitness journey.',
        'Feel free to ask me anything about workout, nutrition, or wellness.',
        'I can provide personalized guidance based on your specific needs.'
      ],
      client_analysis: [
        'I\'ve been monitoring this client\'s progress patterns and have some insights to share.',
        'Based on the client\'s recent data, I can suggest several coaching interventions.',
        'Let me provide you with a comprehensive analysis of this client\'s journey.'
      ]
    }

    const responses = contextualResponses[context.current_context.type] || [
      'I\'m here to help you achieve your fitness goals. What specific area would you like to focus on?',
      'Let me provide you with some personalized recommendations based on your profile.',
      'I can analyze your current situation and suggest the best path forward.'
    ]

    const response = responses[Math.floor(Math.random() * responses.length)]

    return {
      content: response,
      metadata: {
        context_type: context.current_context.type,
        confidence: 0.85,
        processing_time: 1200
      },
      insights: [], // Would contain generated insights
      recommendations: [] // Would contain generated recommendations
    }
  }

  const handleQuickAction = (action: QuickAction) => {
    sendMessage(action.prompt)
  }

  const startVoiceInput = async () => {
    setIsListening(true)
    // Simulate voice recognition
    setTimeout(() => {
      setIsListening(false)
      setCurrentMessage('Analyze my workout progress from last week')
    }, 2000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(currentMessage)
    }
  }

  if (minimized) {
    return (
      <div className={cn("fixed bottom-4 right-4 z-50", className)}>
        <Button 
          onClick={() => onMinimize?.(false)}
          className="rounded-full h-12 w-12 shadow-lg"
        >
          <Bot className="h-6 w-6" />
        </Button>
      </div>
    )
  }

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Bot className="h-6 w-6 text-primary" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Assistant</CardTitle>
              <CardDescription className="text-xs">
                Context: {contextType} • {isLoading ? 'Thinking...' : 'Ready to help'}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => setActiveTab('settings')}>
              <Settings className="h-4 w-4" />
            </Button>
            {onMinimize && (
              <Button variant="ghost" size="sm" onClick={() => onMinimize(true)}>
                <MessageSquare className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 m-3 mb-0">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="m-3 space-y-3">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2">
              {QUICK_ACTIONS.map((action) => (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 text-xs h-8"
                  onClick={() => handleQuickAction(action)}
                  disabled={isLoading}
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))}
            </div>

            {/* Chat Messages */}
            <ScrollArea className="h-80 border rounded-lg p-3">
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-2",
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[85%] rounded-lg p-2 text-sm",
                        message.role === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      )}
                    >
                      {message.content}
                      {message.metadata && (
                        <div className="text-xs opacity-70 mt-1">
                          Confidence: {Math.round((message.metadata.confidence || 0) * 100)}%
                        </div>
                      )}
                    </div>
                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-2 justify-start">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary animate-pulse" />
                    </div>
                    <div className="bg-muted rounded-lg p-2 text-sm">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  placeholder="Ask me anything about fitness..."
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="pr-20"
                />
                <div className="absolute right-1 top-1 flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={startVoiceInput}
                    disabled={isLoading}
                    className={cn(
                      "h-8 w-8 p-0",
                      isListening && "text-red-500"
                    )}
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isLoading}
                    className="h-8 w-8 p-0"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button 
                onClick={() => sendMessage(currentMessage)}
                disabled={isLoading || !currentMessage.trim()}
                className="h-10 w-10 p-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="m-3 space-y-3">
            <div className="text-sm text-muted-foreground mb-3">
              Recent AI-generated insights
            </div>
            <ScrollArea className="h-80">
              <div className="space-y-3">
                {recentInsights.map((insight) => (
                  <div key={insight.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{insight.content.title}</h4>
                      <Badge variant={
                        insight.priority === 'urgent' ? 'destructive' :
                        insight.priority === 'high' ? 'default' :
                        'secondary'
                      }>
                        {insight.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {insight.content.summary}
                    </p>
                    <div className="flex items-center gap-2 text-xs">
                      <Brain className="h-3 w-3" />
                      <span>{Math.round(insight.confidence_score * 100)}% confidence</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="actions" className="m-3 space-y-3">
            <div className="text-sm text-muted-foreground mb-3">
              AI-suggested recommendations
            </div>
            <ScrollArea className="h-80">
              <div className="space-y-3">
                {recentRecommendations.map((rec) => (
                  <div key={rec.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{rec.title}</h4>
                      <Badge variant={rec.status === 'pending' ? 'secondary' : 'default'}>
                        {rec.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {rec.content.description}
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        Apply
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}