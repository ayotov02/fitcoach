import { aiService } from './ai-service'
import { createClient } from '@/lib/auth/supabase-client'
import {
  AIInsightGenerationRequest,
  AIRecommendationRequest,
  AIAnalysisRequest,
  AICoachingAction,
  AIInsight,
  AIRecommendation
} from '@/lib/types/ai'

export class AIWorkflowService {
  private static instance: AIWorkflowService
  private supabase = createClient()
  private automationRules: Map<string, AutomationRule> = new Map()
  
  public static getInstance(): AIWorkflowService {
    if (!AIWorkflowService.instance) {
      AIWorkflowService.instance = new AIWorkflowService()
    }
    return AIWorkflowService.instance
  }

  constructor() {
    this.initializeWorkflowRules()
  }

  private initializeWorkflowRules() {
    // Define automation rules for different scenarios
    const rules: AutomationRule[] = [
      {
        id: 'weekly_progress_analysis',
        name: 'Weekly Progress Analysis',
        trigger: {
          type: 'schedule',
          schedule: 'weekly',
          dayOfWeek: 1, // Monday
          hour: 6
        },
        conditions: [
          { field: 'client.status', operator: 'equals', value: 'active' },
          { field: 'client.workouts_this_week', operator: 'greaterThan', value: 0 }
        ],
        actions: [
          { type: 'generate_insights', priority: 'medium' },
          { type: 'create_progress_report', priority: 'low' }
        ],
        enabled: true
      },
      {
        id: 'plateau_detection',
        name: 'Plateau Detection',
        trigger: {
          type: 'data_change',
          entity: 'workout',
          field: 'performance_metrics'
        },
        conditions: [
          { field: 'performance.stagnation_weeks', operator: 'greaterThanOrEqual', value: 2 }
        ],
        actions: [
          { type: 'generate_insights', priority: 'high', insightTypes: ['plateau_detection'] },
          { type: 'create_coaching_action', actionType: 'address_plateau', priority: 'urgent' },
          { type: 'notify_coach', priority: 'high' }
        ],
        enabled: true
      },
      {
        id: 'dropout_risk_assessment',
        name: 'Dropout Risk Assessment',
        trigger: {
          type: 'schedule',
          schedule: 'daily',
          hour: 8
        },
        conditions: [
          { field: 'client.last_activity', operator: 'olderThan', value: { days: 3 } },
          { field: 'client.adherence_rate', operator: 'lessThan', value: 70 }
        ],
        actions: [
          { type: 'generate_insights', priority: 'urgent', insightTypes: ['dropout_risk'] },
          { type: 'create_coaching_action', actionType: 'send_check_in', priority: 'urgent' },
          { type: 'generate_recommendations', priority: 'high' }
        ],
        enabled: true
      },
      {
        id: 'goal_achievement_celebration',
        name: 'Goal Achievement Celebration',
        trigger: {
          type: 'data_change',
          entity: 'goal',
          field: 'progress_percentage'
        },
        conditions: [
          { field: 'goal.progress_percentage', operator: 'greaterThanOrEqual', value: 100 }
        ],
        actions: [
          { type: 'create_coaching_action', actionType: 'provide_encouragement', priority: 'medium' },
          { type: 'generate_insights', priority: 'low', insightTypes: ['goal_adjustment'] },
          { type: 'update_goal_status', status: 'completed', priority: 'medium' }
        ],
        enabled: true
      },
      {
        id: 'nutrition_adherence_drop',
        name: 'Nutrition Adherence Drop',
        trigger: {
          type: 'data_change',
          entity: 'nutrition',
          field: 'adherence_rate'
        },
        conditions: [
          { field: 'nutrition.adherence_rate', operator: 'lessThan', value: 75 },
          { field: 'nutrition.adherence_trend', operator: 'equals', value: 'declining' }
        ],
        actions: [
          { type: 'generate_insights', priority: 'medium', insightTypes: ['nutrition_adherence'] },
          { type: 'generate_recommendations', priority: 'medium', contextType: 'nutrition' },
          { type: 'create_coaching_action', actionType: 'modify_nutrition', priority: 'medium' }
        ],
        enabled: true
      }
    ]

    rules.forEach(rule => this.automationRules.set(rule.id, rule))
  }

  // Main automation processor
  async processAutomation(trigger: AutomationTrigger, data: any): Promise<void> {
    try {
      const applicableRules = Array.from(this.automationRules.values()).filter(rule => 
        rule.enabled && this.matchesTrigger(rule.trigger, trigger)
      )

      for (const rule of applicableRules) {
        if (await this.evaluateConditions(rule.conditions, data)) {
          await this.executeActions(rule.actions, data)
          await this.logAutomationExecution(rule.id, data)
        }
      }
    } catch (error) {
      console.error('Automation processing error:', error)
    }
  }

  // Schedule-based automation processor (called by cron job)
  async processScheduledAutomation(): Promise<void> {
    const now = new Date()
    const currentHour = now.getHours()
    const currentDay = now.getDay()

    const scheduledRules = Array.from(this.automationRules.values()).filter(rule => 
      rule.enabled && 
      rule.trigger.type === 'schedule' &&
      rule.trigger.hour === currentHour &&
      (rule.trigger.dayOfWeek === undefined || rule.trigger.dayOfWeek === currentDay)
    )

    for (const rule of scheduledRules) {
      try {
        // Get all active clients/users for scheduled processing
        const { data: activeUsers } = await this.supabase
          .from('users')
          .select('*')
          .eq('status', 'active')

        for (const user of activeUsers || []) {
          const userData = await this.gatherUserData(user.id)
          
          if (await this.evaluateConditions(rule.conditions, userData)) {
            await this.executeActions(rule.actions, userData)
            await this.logAutomationExecution(rule.id, userData)
          }
        }
      } catch (error) {
        console.error(`Error processing scheduled rule ${rule.id}:`, error)
      }
    }
  }

  // Client onboarding automation
  async processClientOnboarding(clientId: string, coachId: string): Promise<void> {
    try {
      const onboardingActions = [
        { type: 'generate_welcome_insights', delay: 0 },
        { type: 'create_initial_recommendations', delay: 3600000 }, // 1 hour
        { type: 'schedule_first_checkin', delay: 86400000 }, // 24 hours
        { type: 'setup_progress_monitoring', delay: 0 }
      ]

      for (const action of onboardingActions) {
        if (action.delay > 0) {
          setTimeout(() => {
            this.executeOnboardingAction(action.type, clientId, coachId)
          }, action.delay)
        } else {
          await this.executeOnboardingAction(action.type, clientId, coachId)
        }
      }
    } catch (error) {
      console.error('Client onboarding automation error:', error)
    }
  }

  private async executeOnboardingAction(actionType: string, clientId: string, coachId: string): Promise<void> {
    switch (actionType) {
      case 'generate_welcome_insights':
        await this.generateWelcomeInsights(clientId, coachId)
        break
      case 'create_initial_recommendations':
        await this.createInitialRecommendations(clientId)
        break
      case 'schedule_first_checkin':
        await this.scheduleFirstCheckin(clientId, coachId)
        break
      case 'setup_progress_monitoring':
        await this.setupProgressMonitoring(clientId)
        break
    }
  }

  private async generateWelcomeInsights(clientId: string, coachId: string): Promise<void> {
    const request: AIInsightGenerationRequest = {
      client_id: clientId,
      coach_id: coachId,
      insight_types: ['initial_assessment', 'goal_setting'],
      data_sources: ['workouts', 'nutrition', 'progress_photos'],
      time_range: {
        start: new Date().toISOString(),
        end: new Date().toISOString()
      },
      auto_generate_actions: true
    }

    await aiService.generateInsights(request)
  }

  private async createInitialRecommendations(clientId: string): Promise<void> {
    const userData = await this.gatherUserData(clientId)
    
    const request: AIRecommendationRequest = {
      user_id: clientId,
      context_type: 'goal_setting',
      current_data: userData,
      goals: userData.goals || [],
      urgency: 'low'
    }

    await aiService.generateRecommendations(request)
  }

  private async scheduleFirstCheckin(clientId: string, coachId: string): Promise<void> {
    const { error } = await this.supabase
      .from('ai_coaching_actions')
      .insert({
        coach_id: coachId,
        client_id: clientId,
        action_type: 'send_check_in',
        ai_suggested: true,
        suggestion_data: {
          reasoning: 'Initial check-in to establish communication and assess client experience',
          urgency: 'medium',
          expected_impact: 'Build rapport and identify early adjustment needs',
          success_probability: 0.9
        },
        priority: 'medium',
        due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })

    if (error) {
      console.error('Error scheduling first check-in:', error)
    }
  }

  private async setupProgressMonitoring(clientId: string): Promise<void> {
    // Set up automated progress monitoring rules for this client
    const monitoringConfig = {
      client_id: clientId,
      monitoring_frequency: 'weekly',
      metrics_to_track: ['strength', 'body_composition', 'adherence', 'motivation'],
      alert_thresholds: {
        plateau_weeks: 2,
        adherence_drop: 20,
        motivation_drop: 2
      },
      created_at: new Date().toISOString()
    }

    // In a real implementation, this would be stored in a monitoring configuration table
    console.log('Progress monitoring setup for client:', monitoringConfig)
  }

  private matchesTrigger(ruleTrigger: AutomationTrigger, eventTrigger: AutomationTrigger): boolean {
    if (ruleTrigger.type !== eventTrigger.type) return false

    switch (ruleTrigger.type) {
      case 'data_change':
        return ruleTrigger.entity === eventTrigger.entity && 
               ruleTrigger.field === eventTrigger.field
      case 'schedule':
        return true // Schedule matching is handled separately
      case 'event':
        return ruleTrigger.event === eventTrigger.event
      default:
        return false
    }
  }

  private async evaluateConditions(conditions: AutomationCondition[], data: any): Promise<boolean> {
    for (const condition of conditions) {
      if (!this.evaluateCondition(condition, data)) {
        return false
      }
    }
    return true
  }

  private evaluateCondition(condition: AutomationCondition, data: any): boolean {
    const fieldValue = this.getNestedValue(data, condition.field)

    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value
      case 'greaterThan':
        return fieldValue > condition.value
      case 'lessThan':
        return fieldValue < condition.value
      case 'greaterThanOrEqual':
        return fieldValue >= condition.value
      case 'lessThanOrEqual':
        return fieldValue <= condition.value
      case 'contains':
        return Array.isArray(fieldValue) ? fieldValue.includes(condition.value) : 
               String(fieldValue).includes(String(condition.value))
      case 'olderThan':
        const threshold = new Date()
        if (condition.value.days) threshold.setDate(threshold.getDate() - condition.value.days)
        if (condition.value.hours) threshold.setHours(threshold.getHours() - condition.value.hours)
        return new Date(fieldValue) < threshold
      default:
        return false
    }
  }

  private async executeActions(actions: AutomationAction[], data: any): Promise<void> {
    for (const action of actions) {
      try {
        await this.executeAction(action, data)
      } catch (error) {
        console.error(`Error executing action ${action.type}:`, error)
      }
    }
  }

  private async executeAction(action: AutomationAction, data: any): Promise<void> {
    switch (action.type) {
      case 'generate_insights':
        await this.executeGenerateInsights(action, data)
        break
      case 'generate_recommendations':
        await this.executeGenerateRecommendations(action, data)
        break
      case 'create_coaching_action':
        await this.executeCreateCoachingAction(action, data)
        break
      case 'notify_coach':
        await this.executeNotifyCoach(action, data)
        break
      case 'create_progress_report':
        await this.executeCreateProgressReport(action, data)
        break
      case 'update_goal_status':
        await this.executeUpdateGoalStatus(action, data)
        break
    }
  }

  private async executeGenerateInsights(action: AutomationAction, data: any): Promise<void> {
    if (!data.client_id || !data.coach_id) return

    const request: AIInsightGenerationRequest = {
      client_id: data.client_id,
      coach_id: data.coach_id,
      insight_types: action.insightTypes || ['progress_analysis'],
      data_sources: ['workouts', 'nutrition', 'progress_photos', 'measurements'],
      time_range: {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString()
      },
      priority_filter: action.priority,
      auto_generate_actions: true
    }

    await aiService.generateInsights(request)
  }

  private async executeGenerateRecommendations(action: AutomationAction, data: any): Promise<void> {
    if (!data.user_id) return

    const request: AIRecommendationRequest = {
      user_id: data.user_id,
      context_type: (action.contextType as 'nutrition' | 'workout' | 'goal_setting' | 'recovery' | 'motivation') || 'workout',
      current_data: data,
      goals: data.goals || [],
      urgency: action.priority
    }

    await aiService.generateRecommendations(request)
  }

  private async executeCreateCoachingAction(action: AutomationAction, data: any): Promise<void> {
    if (!data.client_id || !data.coach_id) return

    const { error } = await this.supabase
      .from('ai_coaching_actions')
      .insert({
        coach_id: data.coach_id,
        client_id: data.client_id,
        action_type: action.actionType,
        ai_suggested: true,
        suggestion_data: {
          reasoning: `Automated action triggered by ${action.actionType} workflow`,
          urgency: action.priority,
          expected_impact: 'Address detected issue or opportunity',
          success_probability: 0.75
        },
        priority: action.priority,
        due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })

    if (error) {
      console.error('Error creating coaching action:', error)
    }
  }

  private async executeNotifyCoach(action: AutomationAction, data: any): Promise<void> {
    // Implementation would send notification to coach
    console.log('Coach notification:', { action, data })
  }

  private async executeCreateProgressReport(action: AutomationAction, data: any): Promise<void> {
    // Implementation would generate and store progress report
    console.log('Progress report creation:', { action, data })
  }

  private async executeUpdateGoalStatus(action: AutomationAction, data: any): Promise<void> {
    if (!data.goal_id) return

    const { error } = await this.supabase
      .from('goals')
      .update({ status: action.status })
      .eq('id', data.goal_id)

    if (error) {
      console.error('Error updating goal status:', error)
    }
  }

  private async gatherUserData(userId: string): Promise<any> {
    // Gather comprehensive user data for condition evaluation
    const { data: user } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (!user) return {}

    // In a real implementation, this would gather more comprehensive data
    return {
      user_id: userId,
      client_id: userId,
      coach_id: user.coach_id,
      goals: [],
      performance: {},
      nutrition: {},
      adherence_rate: 80,
      last_activity: user.last_activity || new Date().toISOString()
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  private async logAutomationExecution(ruleId: string, data: any): Promise<void> {
    const { error } = await this.supabase
      .from('automation_logs')
      .insert({
        rule_id: ruleId,
        executed_at: new Date().toISOString(),
        input_data: data,
        success: true
      })

    if (error) {
      console.error('Error logging automation execution:', error)
    }
  }

  // Public methods for manual triggers
  async triggerDataChange(entity: string, field: string, data: any): Promise<void> {
    await this.processAutomation({ type: 'data_change', entity, field }, data)
  }

  async triggerEvent(event: string, data: any): Promise<void> {
    await this.processAutomation({ type: 'event', event }, data)
  }

  // Rule management
  async addAutomationRule(rule: AutomationRule): Promise<void> {
    this.automationRules.set(rule.id, rule)
  }

  async updateAutomationRule(ruleId: string, updates: Partial<AutomationRule>): Promise<void> {
    const rule = this.automationRules.get(ruleId)
    if (rule) {
      this.automationRules.set(ruleId, { ...rule, ...updates })
    }
  }

  async disableRule(ruleId: string): Promise<void> {
    const rule = this.automationRules.get(ruleId)
    if (rule) {
      rule.enabled = false
    }
  }

  async enableRule(ruleId: string): Promise<void> {
    const rule = this.automationRules.get(ruleId)
    if (rule) {
      rule.enabled = true
    }
  }
}

// Type definitions for automation system
interface AutomationRule {
  id: string
  name: string
  trigger: AutomationTrigger
  conditions: AutomationCondition[]
  actions: AutomationAction[]
  enabled: boolean
}

interface AutomationTrigger {
  type: 'schedule' | 'data_change' | 'event'
  schedule?: 'daily' | 'weekly' | 'monthly'
  dayOfWeek?: number // 0-6, Sunday = 0
  hour?: number // 0-23
  entity?: string
  field?: string
  event?: string
}

interface AutomationCondition {
  field: string
  operator: 'equals' | 'greaterThan' | 'lessThan' | 'greaterThanOrEqual' | 'lessThanOrEqual' | 'contains' | 'olderThan'
  value: any
}

interface AutomationAction {
  type: 'generate_insights' | 'generate_recommendations' | 'create_coaching_action' | 'notify_coach' | 'create_progress_report' | 'update_goal_status'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  insightTypes?: string[]
  contextType?: string
  actionType?: string
  status?: string
}

export const aiWorkflow = AIWorkflowService.getInstance()