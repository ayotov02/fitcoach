'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, MessageSquare, TrendingUp, Target, Lightbulb, 
  Activity, BarChart3, AlertTriangle, Users, Settings,
  Zap, RefreshCw, Plus, Eye
} from 'lucide-react'

// Import AI components
import { AIAssistant } from '@/components/ai/AIAssistant'
import { AIInsights } from '@/components/ai/AIInsights'
import { AIRecommendations } from '@/components/ai/AIRecommendations'
import { AIAnalytics } from '@/components/ai/AIAnalytics'
import { AICoachingPrompts } from '@/components/ai/AICoachingPrompts'
import { AIProgressAnalyzer } from '@/components/ai/AIProgressAnalyzer'
import { AIPlateuDetector } from '@/components/ai/AIPlateuDetector'
import { AIGoalOptimizer } from '@/components/ai/AIGoalOptimizer'

interface AISystemStatus {
  insights_generated: number
  recommendations_active: number
  plateaus_detected: number
  coaching_actions: number
  system_health: 'excellent' | 'good' | 'needs_attention' | 'critical'
  last_analysis: string
}

export default function AIAssistantPage() {

  const [activeTab, setActiveTab] = useState('overview')
  const [selectedClient, setSelectedClient] = useState<string | undefined>(undefined)
  const [systemStatus] = useState<AISystemStatus>({
    insights_generated: 23,
    recommendations_active: 7,
    plateaus_detected: 2,
    coaching_actions: 12,
    system_health: 'excellent',
    last_analysis: '2 minutes ago'
  })

  // Mock user data - in real implementation, this would come from authentication
  const currentUser = {
    id: 'user-123',
    role: 'coach' as const,
    name: 'John Coach'
  }

  const handleInsightGenerated = (insight: any) => {
    console.log('New insight generated:', insight)
  }

  const handleRecommendationCreated = (recommendation: any) => {
    console.log('New recommendation created:', recommendation)
  }

  const handleActionExecuted = (actionId: string, result: any) => {
    console.log('Action executed:', actionId, result)
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600 bg-green-50'
      case 'good': return 'text-blue-600 bg-blue-50'
      case 'needs_attention': return 'text-yellow-600 bg-yellow-50'
      case 'critical': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">AI Assistant</h1>
          <p className="text-muted-foreground">
            Intelligent coaching powered by advanced AI
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className={getHealthColor(systemStatus.system_health)}
          >
            System Health: {systemStatus.system_health}
          </Badge>
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* AI System Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Insights Generated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStatus.insights_generated}</div>
            <div className="text-xs text-muted-foreground">This week</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Active Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{systemStatus.recommendations_active}</div>
            <div className="text-xs text-muted-foreground">Pending action</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Plateaus Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{systemStatus.plateaus_detected}</div>
            <div className="text-xs text-muted-foreground">Require intervention</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Coaching Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{systemStatus.coaching_actions}</div>
            <div className="text-xs text-muted-foreground">This week</div>
          </CardContent>
        </Card>
      </div>

      {/* Main AI Interface */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* AI Chat Assistant - Always visible */}
        <div className="lg:col-span-1">
          <AIAssistant
            userId={currentUser.id}
            userRole={currentUser.role}
            clientId={selectedClient}
            onInsightGenerated={handleInsightGenerated}
            onRecommendationCreated={handleRecommendationCreated}
          />
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="automation">Automation</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Quick Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span>Client performance trending upward</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                        <span>2 clients showing plateau signs</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <span>Nutrition adherence improving</span>
                      </div>
                    </div>
                    <Button size="sm" className="mt-3" onClick={() => setActiveTab('insights')}>
                      <Eye className="mr-2 h-3 w-3" />
                      View All Insights
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Coaching Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Check-ins due:</span>
                        <Badge variant="outline">3</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Program updates:</span>
                        <Badge variant="outline">2</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Goal reviews:</span>
                        <Badge variant="outline">1</Badge>
                      </div>
                    </div>
                    <Button size="sm" className="mt-3" onClick={() => setActiveTab('automation')}>
                      <Activity className="mr-2 h-3 w-3" />
                      View Actions
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent AI Activity</CardTitle>
                  <CardDescription>Latest automated insights and recommendations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                      <Brain className="h-4 w-4 text-blue-600" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">Progress analysis completed for Sarah J.</div>
                        <div className="text-xs text-muted-foreground">2 minutes ago</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">Plateau detected for Mike R. - Upper body strength</div>
                        <div className="text-xs text-muted-foreground">15 minutes ago</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                      <Target className="h-4 w-4 text-green-600" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">New recommendation: Increase protein intake for Emma K.</div>
                        <div className="text-xs text-muted-foreground">1 hour ago</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              <Tabs defaultValue="insights" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="insights">Insights</TabsTrigger>
                  <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                  <TabsTrigger value="progress">Progress Analysis</TabsTrigger>
                </TabsList>
                
                <TabsContent value="insights">
                  <AIInsights
                    userId={currentUser.id}
                    userRole={currentUser.role}
                    clientId={selectedClient}
                    onActionItemClick={(actionItem) => console.log('Action item clicked:', actionItem)}
                    onInsightDismiss={(insightId) => console.log('Insight dismissed:', insightId)}
                  />
                </TabsContent>
                
                <TabsContent value="recommendations">
                  <AIRecommendations
                    userId={currentUser.id}
                    userRole={currentUser.role}
                    onRecommendationApplied={(id) => console.log('Recommendation applied:', id)}
                    onRecommendationDeclined={(id) => console.log('Recommendation declined:', id)}
                  />
                </TabsContent>
                
                <TabsContent value="progress">
                  <AIProgressAnalyzer
                    userId={currentUser.id}
                    userRole={currentUser.role}
                    clientId={selectedClient}
                    onRecommendationGenerated={(rec) => console.log('Progress recommendation:', rec)}
                  />
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              <Tabs defaultValue="analytics" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="plateaus">Plateaus</TabsTrigger>
                  <TabsTrigger value="goals">Goals</TabsTrigger>
                </TabsList>
                
                <TabsContent value="analytics">
                  <AIAnalytics
                    userId={currentUser.id}
                    userRole={currentUser.role}
                    clientId={selectedClient}
                  />
                </TabsContent>
                
                <TabsContent value="plateaus">
                  <AIPlateuDetector
                    userId={currentUser.id}
                    userRole={currentUser.role}
                    clientId={selectedClient}
                    onInterventionTriggered={(intervention) => console.log('Intervention:', intervention)}
                  />
                </TabsContent>
                
                <TabsContent value="goals">
                  <AIGoalOptimizer
                    userId={currentUser.id}
                    userRole={currentUser.role}
                    clientId={selectedClient}
                    onGoalUpdated={(id, updates) => console.log('Goal updated:', id, updates)}
                    onGoalOptimized={(optimization) => console.log('Goal optimized:', optimization)}
                  />
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="automation" className="space-y-4">
              <AICoachingPrompts
                coachId={currentUser.id}
                clientId={selectedClient}
                onActionExecuted={handleActionExecuted}
                onPromptCustomized={(id, content) => console.log('Prompt customized:', id, content)}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* System Status Footer */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>AI System Online</span>
              </div>
              <span>Last analysis: {systemStatus.last_analysis}</span>
              <span>Health: {systemStatus.system_health}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Data
              </Button>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Analysis
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}