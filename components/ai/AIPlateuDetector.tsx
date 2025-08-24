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
  AlertTriangle, TrendingDown, Minus, Clock, Zap, RefreshCw,
  Target, Activity, Brain, CheckCircle, ArrowRight, Lightbulb,
  Calendar, BarChart3, Heart, Dumbbell, Utensils, Moon,
  ThermometerSun, Users, Eye, Download, Play, Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AIPlateauDetection } from '@/lib/types/ai'

interface AIPlateuDetectorProps {
  userId: string
  userRole: 'coach' | 'client'
  clientId?: string
  onInterventionTriggered?: (intervention: any) => void
}

interface PlateauAlert {
  id: string
  type: 'strength' | 'weight_loss' | 'muscle_gain' | 'performance' | 'motivation'
  severity: 'mild' | 'moderate' | 'severe'
  duration_weeks: number
  confidence: number
  detected_date: string
  current_value: number
  stagnation_value: number
  last_improvement: string
  primary_causes: string[]
  status: 'active' | 'monitoring' | 'resolved'
}

interface InterventionStrategy {
  id: string
  name: string
  category: 'immediate' | 'short_term' | 'long_term'
  description: string
  success_probability: number
  implementation_difficulty: 'easy' | 'medium' | 'hard'
  time_to_results: string
  required_resources: string[]
  evidence_level: 'high' | 'medium' | 'low'
}

interface PlateauMetric {
  name: string
  current: number
  trend: number[]
  plateau_threshold: number
  weeks_stagnant: number
  last_improvement: string
  icon: React.ReactNode
  unit: string
  target: number
}

export function AIPlateuDetector({
  userId,
  userRole,
  clientId,
  onInterventionTriggered
}: AIPlateuDetectorProps) {
  const [plateauDetection, setPlateauDetection] = useState<AIPlateauDetection | null>(null)
  const [plateauAlerts, setPlateauAlerts] = useState<PlateauAlert[]>([])
  const [interventionStrategies, setInterventionStrategies] = useState<InterventionStrategy[]>([])
  const [plateauMetrics, setPlateauMetrics] = useState<PlateauMetric[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('detection')

  useEffect(() => {
    loadPlateauDetection()
  }, [userId, clientId])

  const loadPlateauDetection = async () => {
    try {
      // Mock plateau detection data
      const mockPlateauAlerts: PlateauAlert[] = [
        {
          id: '1',
          type: 'strength',
          severity: 'moderate',
          duration_weeks: 3,
          confidence: 0.84,
          detected_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          current_value: 95,
          stagnation_value: 95,
          last_improvement: '3 weeks ago',
          primary_causes: ['Training adaptation', 'Insufficient progressive overload', 'Recovery plateau'],
          status: 'active'
        },
        {
          id: '2',
          type: 'weight_loss',
          severity: 'mild',
          duration_weeks: 2,
          confidence: 0.72,
          detected_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          current_value: 68.5,
          stagnation_value: 68.7,
          last_improvement: '2 weeks ago',
          primary_causes: ['Metabolic adaptation', 'Caloric intake adjustment needed'],
          status: 'monitoring'
        },
        {
          id: '3',
          type: 'motivation',
          severity: 'severe',
          duration_weeks: 4,
          confidence: 0.91,
          detected_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          current_value: 5.2,
          stagnation_value: 5.1,
          last_improvement: '4 weeks ago',
          primary_causes: ['Goal fatigue', 'Lack of variety', 'Progress not visible', 'External stressors'],
          status: 'active'
        }
      ]

      const mockInterventions: InterventionStrategy[] = [
        {
          id: 'i1',
          name: 'Deload Week Protocol',
          category: 'immediate',
          description: 'Reduce training volume by 40-50% for one week to promote recovery and break adaptation patterns',
          success_probability: 0.78,
          implementation_difficulty: 'easy',
          time_to_results: '1-2 weeks',
          required_resources: ['Program adjustment', 'Client education'],
          evidence_level: 'high'
        },
        {
          id: 'i2',
          name: 'Exercise Variation Protocol',
          category: 'immediate',
          description: 'Introduce new exercises targeting same muscle groups with different movement patterns',
          success_probability: 0.72,
          implementation_difficulty: 'medium',
          time_to_results: '2-3 weeks',
          required_resources: ['Exercise library access', 'Form instruction'],
          evidence_level: 'high'
        },
        {
          id: 'i3',
          name: 'Periodization Restructure',
          category: 'short_term',
          description: 'Implement new periodization model (linear, undulating, or block periodization)',
          success_probability: 0.85,
          implementation_difficulty: 'hard',
          time_to_results: '4-6 weeks',
          required_resources: ['Program redesign', 'Extended coaching time'],
          evidence_level: 'high'
        },
        {
          id: 'i4',
          name: 'Nutrition Cycling',
          category: 'short_term',
          description: 'Implement refeed days or diet breaks to combat metabolic adaptation',
          success_probability: 0.69,
          implementation_difficulty: 'medium',
          time_to_results: '2-4 weeks',
          required_resources: ['Nutrition planning', 'Metabolic monitoring'],
          evidence_level: 'medium'
        },
        {
          id: 'i5',
          name: 'Goal Restructuring',
          category: 'immediate',
          description: 'Break down long-term goals into smaller, achievable milestones with rewards',
          success_probability: 0.81,
          implementation_difficulty: 'easy',
          time_to_results: '1 week',
          required_resources: ['Goal-setting session', 'Reward system'],
          evidence_level: 'medium'
        }
      ]

      const mockMetrics: PlateauMetric[] = [
        {
          name: 'Bench Press',
          current: 95,
          trend: [92, 93, 94, 95, 95, 95, 95],
          plateau_threshold: 2.5,
          weeks_stagnant: 3,
          last_improvement: '3 weeks ago',
          icon: <Dumbbell className="h-4 w-4" />,
          unit: 'kg',
          target: 100
        },
        {
          name: 'Body Weight',
          current: 68.5,
          trend: [70.2, 69.8, 69.1, 68.7, 68.5, 68.5, 68.7],
          plateau_threshold: 0.3,
          weeks_stagnant: 2,
          last_improvement: '2 weeks ago',
          icon: <Activity className="h-4 w-4" />,
          unit: 'kg',
          target: 65
        },
        {
          name: 'Motivation Score',
          current: 5.2,
          trend: [7.8, 7.2, 6.5, 5.8, 5.2, 5.1, 5.2],
          plateau_threshold: 0.5,
          weeks_stagnant: 4,
          last_improvement: '4 weeks ago',
          icon: <Heart className="h-4 w-4" />,
          unit: '/10',
          target: 8
        }
      ]

      const mockDetection: AIPlateauDetection = {
        plateau_detected: true,
        plateau_type: 'strength',
        duration_weeks: 3,
        severity: 'moderate',
        likely_causes: ['Training adaptation', 'Insufficient progressive overload', 'Recovery plateau'],
        intervention_strategies: {
          immediate: ['Deload week', 'Exercise variation', 'Goal restructuring'],
          short_term: ['Periodization change', 'Nutrition cycling'],
          long_term: ['Complete program overhaul', 'Coach consultation']
        },
        success_probability: 0.78,
        monitoring_metrics: ['Strength index', 'Training volume', 'Recovery markers', 'Motivation levels']
      }

      setPlateauAlerts(mockPlateauAlerts)
      setInterventionStrategies(mockInterventions)
      setPlateauMetrics(mockMetrics)
      setPlateauDetection(mockDetection)
    } catch (error) {
      console.error('Failed to load plateau detection:', error)
    }
  }

  const runPlateauAnalysis = async () => {
    setIsAnalyzing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 3500))
      await loadPlateauDetection()
    } catch (error) {
      console.error('Failed to run plateau analysis:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const implementIntervention = async (intervention: InterventionStrategy) => {
    try {
      // Simulate intervention implementation
      console.log('Implementing intervention:', intervention.name)
      onInterventionTriggered?.(intervention)
    } catch (error) {
      console.error('Failed to implement intervention:', error)
    }
  }

  const resolveAlert = async (alertId: string) => {
    setPlateauAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: 'resolved' as const }
        : alert
    ))
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'severe': return 'text-red-600 bg-red-50 border-red-200'
      case 'moderate': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'mild': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'severe': return <Badge variant="destructive">{severity}</Badge>
      case 'moderate': return <Badge variant="default">{severity}</Badge>
      case 'mild': return <Badge variant="secondary">{severity}</Badge>
      default: return <Badge variant="outline">{severity}</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'strength': return <Dumbbell className="h-4 w-4" />
      case 'weight_loss': return <Activity className="h-4 w-4" />
      case 'muscle_gain': return <Zap className="h-4 w-4" />
      case 'performance': return <BarChart3 className="h-4 w-4" />
      case 'motivation': return <Heart className="h-4 w-4" />
      default: return <Target className="h-4 w-4" />
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

  const filteredAlerts = plateauAlerts.filter(alert => {
    if (selectedSeverity !== 'all' && alert.severity !== selectedSeverity) return false
    if (selectedType !== 'all' && alert.type !== selectedType) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Plateau Detector</h1>
          <p className="text-muted-foreground">
            Advanced stagnation detection with intervention strategies
            {clientId && ' for this client'}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button onClick={runPlateauAnalysis} disabled={isAnalyzing}>
            {isAnalyzing ? (
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

      {/* Plateau Status Overview */}
      {plateauDetection && (
        <Card className={cn(
          "border-2",
          plateauDetection.plateau_detected ? "border-orange-200 bg-orange-50" : "border-green-200 bg-green-50"
        )}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {plateauDetection.plateau_detected ? (
                <>
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                  Plateau Detected
                </>
              ) : (
                <>
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  No Plateau Detected
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {plateauDetection.plateau_detected ? (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Type</div>
                    <div className="font-medium capitalize flex items-center gap-2">
                      {getTypeIcon(plateauDetection.plateau_type)}
                      {plateauDetection.plateau_type.replace('_', ' ')}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Duration</div>
                    <div className="font-medium">{plateauDetection.duration_weeks} weeks</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Severity</div>
                    <div>{getSeverityBadge(plateauDetection.severity)}</div>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium mb-2">Likely Causes</div>
                  <div className="flex flex-wrap gap-2">
                    {plateauDetection.likely_causes.map((cause, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {cause}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Success probability with intervention: </span>
                    <span className="font-bold text-green-600">{Math.round(plateauDetection.success_probability * 100)}%</span>
                  </div>
                  <Progress value={plateauDetection.success_probability * 100} className="flex-1 max-w-xs" />
                </div>
              </div>
            ) : (
              <p className="text-green-700">All metrics are showing healthy progression. Continue current strategy.</p>
            )}
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="detection">Detection</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="interventions">Interventions</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="detection" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4 items-center">
            <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="severe">Severe</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="mild">Mild</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="strength">Strength</SelectItem>
                <SelectItem value="weight_loss">Weight Loss</SelectItem>
                <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="motivation">Motivation</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-muted-foreground">
              {filteredAlerts.length} plateau alerts
            </div>
          </div>

          {/* Plateau Alerts */}
          <div className="grid gap-4">
            {filteredAlerts.map((alert) => (
              <Card key={alert.id} className={cn("transition-all hover:shadow-md", getSeverityColor(alert.severity))}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {getTypeIcon(alert.type)}
                        {alert.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Plateau
                        {getSeverityBadge(alert.severity)}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Detected {new Date(alert.detected_date).toLocaleDateString()} • 
                        Duration: {alert.duration_weeks} weeks • 
                        Confidence: {Math.round(alert.confidence * 100)}%
                      </CardDescription>
                    </div>
                    <Badge variant={alert.status === 'resolved' ? 'default' : 'secondary'}>
                      {alert.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Current Value</div>
                        <div className="text-xl font-bold">
                          {alert.current_value}
                          {alert.type === 'motivation' ? '/10' : 
                           alert.type === 'weight_loss' ? 'kg' : 'kg'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Last Improvement</div>
                        <div className="font-medium">{alert.last_improvement}</div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium mb-2">Primary Causes</div>
                      <div className="flex flex-wrap gap-2">
                        {alert.primary_causes.map((cause, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {cause}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {alert.status === 'active' && (
                        <>
                          <Button size="sm" onClick={() => setActiveTab('interventions')}>
                            <Play className="mr-1 h-3 w-3" />
                            View Interventions
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => resolveAlert(alert.id)}
                          >
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Mark Resolved
                          </Button>
                        </>
                      )}
                      {alert.status === 'monitoring' && (
                        <Button size="sm" variant="outline">
                          <Eye className="mr-1 h-3 w-3" />
                          Continue Monitoring
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredAlerts.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <h3 className="text-lg font-medium mb-2">No Plateaus Detected</h3>
                <p className="text-muted-foreground">
                  All metrics are showing healthy progression. Keep up the great work!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="text-sm text-muted-foreground mb-4">
            Detailed view of key metrics and their progression trends
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {plateauMetrics.map((metric) => (
              <Card key={metric.name} className="transition-all hover:shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    {metric.icon}
                    {metric.name}
                    {metric.weeks_stagnant >= 2 && (
                      <Badge variant="destructive" className="text-xs">
                        {metric.weeks_stagnant}w stagnant
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-end gap-2">
                      <div className="text-2xl font-bold">
                        {metric.current}
                        <span className="text-sm font-normal text-muted-foreground ml-1">
                          {metric.unit}
                        </span>
                      </div>
                      {metric.weeks_stagnant >= 2 ? (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      ) : (
                        <Minus className="h-4 w-4 text-gray-600" />
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress to Target</span>
                        <span>{Math.round((metric.current / metric.target) * 100)}%</span>
                      </div>
                      <Progress 
                        value={Math.min((metric.current / metric.target) * 100, 100)} 
                        className="h-1"
                      />
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      Last improvement: {metric.last_improvement}
                    </div>
                    
                    {/* Mini trend visualization */}
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">7-week trend</div>
                      <div className="flex items-end gap-1 h-8">
                        {metric.trend.map((value, index) => (
                          <div 
                            key={index}
                            className="bg-gray-300 flex-1 min-w-[4px]"
                            style={{ 
                              height: `${(value / Math.max(...metric.trend)) * 100}%`,
                              backgroundColor: index >= metric.trend.length - metric.weeks_stagnant ? '#ef4444' : '#3b82f6'
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="interventions" className="space-y-4">
          <div className="text-sm text-muted-foreground mb-4">
            Evidence-based strategies to break through plateaus
          </div>
          
          <div className="grid gap-4">
            {interventionStrategies.map((intervention) => (
              <Card key={intervention.id} className="transition-all hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Lightbulb className="h-5 w-5" />
                        {intervention.name}
                        <Badge variant={intervention.category === 'immediate' ? 'default' : 'secondary'}>
                          {intervention.category}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {intervention.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Success Rate</div>
                        <div className="flex items-center gap-2">
                          <div className="text-lg font-bold text-green-600">
                            {Math.round(intervention.success_probability * 100)}%
                          </div>
                          <Progress value={intervention.success_probability * 100} className="flex-1" />
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Difficulty</div>
                        <div>{getDifficultyBadge(intervention.implementation_difficulty)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Time to Results</div>
                        <div className="font-medium">{intervention.time_to_results}</div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium mb-2">Required Resources</div>
                      <div className="flex flex-wrap gap-2">
                        {intervention.required_resources.map((resource, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {resource}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Brain className="h-3 w-3" />
                        Evidence level: {intervention.evidence_level}
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => implementIntervention(intervention)}
                      >
                        <ArrowRight className="mr-1 h-3 w-3" />
                        Implement
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Plateau Monitoring Schedule
              </CardTitle>
              <CardDescription>
                Automated monitoring to detect early plateau signs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-2">Monitoring Frequency</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Strength metrics:</span>
                        <span className="font-medium">Every workout</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Body composition:</span>
                        <span className="font-medium">Weekly</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Performance metrics:</span>
                        <span className="font-medium">Bi-weekly</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Motivation/adherence:</span>
                        <span className="font-medium">Daily</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Alert Thresholds</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Mild plateau:</span>
                        <span className="font-medium">2 weeks stagnation</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Moderate plateau:</span>
                        <span className="font-medium">3 weeks stagnation</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Severe plateau:</span>
                        <span className="font-medium">4+ weeks stagnation</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Next Monitoring Check</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Tomorrow at 6:00 AM • Automated analysis will run</span>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full">
                  <Settings className="mr-2 h-4 w-4" />
                  Configure Monitoring Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}