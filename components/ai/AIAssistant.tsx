'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  MessageCircle, 
  Send, 
  Minimize2, 
  Maximize2, 
  X, 
  Bot, 
  User, 
  Mic, 
  MicOff,
  Image as ImageIcon,
  FileText,
  Zap,
  Brain,
  Target,
  TrendingUp,
  Clock,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AIConversation, AIMessage, AIContext } from '@/lib/types/ai'

interface AIAssistantProps {
  contextType?: 'dashboard' | 'client' | 'workout' | 'nutrition' | 'general'
  clientId?: string
  initialMessage?: string
  minimized?: boolean
  onContextChange?: (context: any) => void
}

interface QuickAction {
  id: string
  label: string
  icon: React.ReactNode
  prompt: string
  category: 'analysis' | 'recommendations' | 'communication' | 'planning'
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'analyze_progress',
    label: 'Analyze Progress',
    icon: <TrendingUp className="h-4 w-4" />,
    prompt: 'Analyze this client\'s progress this week',
    category: 'analysis'
  },
  {
    id: 'workout_modification',
    label: 'Modify Workout',
    icon: <Target className="h-4 w-4" />,
    prompt: 'Suggest workout modifications based on recent performance',
    category: 'recommendations'
  },
  {
    id: 'nutrition_plan',
    label: 'Nutrition Help',
    icon: <Sparkles className="h-4 w-4" />,
    prompt: 'Create a meal plan for this client\'s goals',
    category: 'planning'
  },
  {
    id: 'check_in_message',
    label: 'Check-in Message',
    icon: <MessageCircle className="h-4 w-4" />,
    prompt: 'Generate a personalized check-in message',
    category: 'communication'
  },
  {
    id: 'plateau_help',
    label: 'Plateau Analysis',
    icon: <Brain className="h-4 w-4" />,
    prompt: 'Why is this client not making progress?',
    category: 'analysis'
  },
  {
    id: 'goal_adjustment',
    label: 'Goal Review',
    icon: <Clock className="h-4 w-4" />,
    prompt: 'Review and adjust client goals based on progress',
    category: 'planning'
  }
]

export function AIAssistant({ 
  contextType = 'general',
  clientId,
  initialMessage,
  minimized = false,
  onContextChange
}: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(!minimized)
  const [isMinimized, setIsMinimized] = useState(minimized)
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string>()
  const [currentContext, setCurrentContext] = useState<AIContext | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string>()

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Initialize conversation with context
  useEffect(() => {
    if (clientId || initialMessage) {
      initializeConversation()
    }
  }, [clientId, initialMessage])

  const initializeConversation = async () => {
    try {
      // Load context information
      if (clientId) {
        await loadClientContext(clientId)
      }

      // Add initial system message with context
      const systemMessage: AIMessage = {
        id: generateId(),
        role: 'system',
        content: getSystemPrompt(),
        timestamp: new Date().toISOString()
      }

      setMessages([systemMessage])

      // Add initial message if provided
      if (initialMessage) {
        await sendMessage(initialMessage)
      }
    } catch (error) {
      console.error('Failed to initialize conversation:', error)
      setError('Failed to initialize AI assistant')
    }
  }

  const loadClientContext = async (clientId: string) => {
    try {
      // This would fetch client data from the API
      const response = await fetch(`/api/clients/${clientId}/context`)
      if (response.ok) {
        const context = await response.json()
        setCurrentContext(context)
        onContextChange?.(context)
      }
    } catch (error) {
      console.error('Failed to load client context:', error)
    }
  }

  const getSystemPrompt = () => {
    const basePrompt = `You are an AI fitness coaching assistant. You help fitness coaches with client management, workout planning, nutrition guidance, and progress analysis. You have access to comprehensive client data including workouts, nutrition, measurements, and progress photos.

Context: ${contextType}
${clientId ? `Current Client ID: ${clientId}` : ''}
${currentContext ? `Client Data: ${JSON.stringify(currentContext, null, 2)}` : ''}

Guidelines:
- Provide specific, actionable advice based on the data available
- Always consider individual client needs, preferences, and limitations  
- Reference specific data points when making recommendations
- Be encouraging and motivational while being realistic
- Suggest follow-up actions when appropriate
- Flag any safety concerns or need for professional medical advice
- Keep responses concise but comprehensive
- Use fitness industry terminology appropriately`

    return basePrompt
  }

  const sendMessage = async (message: string) => {
    if (!message.trim()) return

    setIsLoading(true)
    setError(undefined)

    // Add user message
    const userMessage: AIMessage = {
      id: generateId(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')

    try {
      // Send to AI API
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          conversation_id: conversationId,
          context: {
            type: contextType,
            client_id: clientId,
            data: currentContext
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()

      // Add AI response
      const aiMessage: AIMessage = {
        id: generateId(),
        role: 'assistant',
        content: data.message,
        metadata: {
          tokens_used: data.metadata?.tokens_used,
          processing_time: data.metadata?.processing_time,
          model_version: data.metadata?.model_version
        },
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, aiMessage])
      setConversationId(data.conversation_id)

      // Update context if recommendations were generated
      if (data.recommendations) {
        // Handle recommendations
      }

    } catch (error) {
      console.error('Failed to send message:', error)
      setError('Failed to get AI response. Please try again.')
      
      const errorMessage: AIMessage = {
        id: generateId(),
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting right now. Please try again in a moment.',
        timestamp: new Date().toISOString()
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickAction = (action: QuickAction) => {
    let prompt = action.prompt
    
    // Personalize prompt based on context
    if (currentContext?.client_context) {
      prompt = prompt.replace('this client', currentContext.client_context.name)
    }
    
    sendMessage(prompt)
  }

  const generateId = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  const startVoiceInput = () => {
    // Voice input implementation would go here
    setIsListening(true)
    // For now, just simulate voice input
    setTimeout(() => {
      setIsListening(false)
    }, 3000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(inputMessage)
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        size="icon"
      >
        <Bot className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <Card className={cn(
      "fixed bottom-6 right-6 z-50 shadow-2xl transition-all duration-300",
      isMinimized ? "h-16 w-80" : "h-[600px] w-96"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600">
                  <Bot className="h-4 w-4 text-white" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
            </div>
            <div>
              <CardTitle className="text-sm">AI Coach Assistant</CardTitle>
              <p className="text-xs text-muted-foreground">
                {isLoading ? 'Thinking...' : 'Ready to help'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="p-0 flex flex-col h-[calc(100%-80px)]">
          {/* Quick Actions */}
          <div className="px-4 pb-3 border-b">
            <div className="grid grid-cols-3 gap-2">
              {QUICK_ACTIONS.slice(0, 3).map((action) => (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs p-2"
                  onClick={() => handleQuickAction(action)}
                  disabled={isLoading}
                >
                  {action.icon}
                  <span className="ml-1 hidden sm:inline">{action.label.split(' ')[0]}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-4 py-4">
              {messages.filter(m => m.role !== 'system').map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600">
                        <Bot className="h-4 w-4 text-white" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={cn(
                    "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground ml-auto'
                      : 'bg-muted'
                  )}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {message.metadata?.processing_time && (
                      <p className="text-xs opacity-70 mt-1">
                        {message.metadata.processing_time}ms
                      </p>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600">
                      <Bot className="h-4 w-4 text-white" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg px-3 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t">
            {error && (
              <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                {error}
              </div>
            )}
            
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about fitness coaching..."
                  className="min-h-[40px] max-h-[120px] resize-none pr-12"
                  disabled={isLoading}
                />
                <div className="absolute right-2 bottom-2 flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={startVoiceInput}
                    disabled={isLoading}
                  >
                    {isListening ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
              <Button
                onClick={() => sendMessage(inputMessage)}
                disabled={isLoading || !inputMessage.trim()}
                size="icon"
                className="h-10 w-10 shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Quick Actions Row */}
            <div className="flex gap-1 mt-2 flex-wrap">
              {QUICK_ACTIONS.slice(3).map((action) => (
                <Button
                  key={action.id}
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs px-2"
                  onClick={() => handleQuickAction(action)}
                  disabled={isLoading}
                >
                  {action.icon}
                  <span className="ml-1">{action.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}