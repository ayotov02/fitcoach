import OpenAI from 'openai'
import { createClient } from '@/lib/auth/supabase-client'
import {
  AIConversation,
  AIMessage,
  AIInsight,
  AIRecommendation,
  AIAnalytics,
  AIContext,
  AIProgressAnalysis,
  AIPlateauDetection,
  AIGoalOptimization,
  AIInsightGenerationRequest,
  AIRecommendationRequest,
  AIAnalysisRequest,
  AIModelInteraction
} from '@/lib/types/ai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export class AIService {
  private static instance: AIService
  private supabase = createClient()
  private modelConfig = {
    default: { model: 'gpt-4', temperature: 0.7, maxTokens: 1000 },
    analysis: { model: 'gpt-4', temperature: 0.3, maxTokens: 1500 },
    creative: { model: 'gpt-4', temperature: 0.9, maxTokens: 800 },
    precise: { model: 'gpt-4', temperature: 0.1, maxTokens: 1200 }
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }

  async generateConversationResponse(
    message: string,
    context: AIContext,
    conversationHistory: AIMessage[] = []
  ): Promise<{ 
    content: string
    metadata: Record<string, any>
    insights?: AIInsight[]
    recommendations?: AIRecommendation[]
  }> {
    const startTime = Date.now()
    const config = this.modelConfig.default

    try {
      const systemPrompt = this.buildSystemPrompt(context)
      const messages = this.buildMessageHistory(systemPrompt, conversationHistory, message)

      const completion = await openai.chat.completions.create({
        model: config.model,
        messages,
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        functions: [
          {
            name: 'generate_insight',
            description: 'Generate an insight about the client based on analysis',
            parameters: {
              type: 'object',
              properties: {
                insight_type: { type: 'string' },
                title: { type: 'string' },
                summary: { type: 'string' },
                priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
                confidence_score: { type: 'number', minimum: 0, maximum: 1 }
              }
            }
          },
          {
            name: 'create_recommendation',
            description: 'Create a personalized recommendation',
            parameters: {
              type: 'object',
              properties: {
                rec_type: { type: 'string' },
                title: { type: 'string' },
                description: { type: 'string' },
                benefits: { type: 'array', items: { type: 'string' } },
                priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] }
              }
            }
          }
        ]
      })

      const processingTime = Date.now() - startTime
      const response = completion.choices[0]

      await this.logModelInteraction({
        user_id: context.user_id,
        model_name: 'gpt-4',
        interaction_type: 'chat',
        input_data: { message, context: context.current_context },
        output_data: { response: response.message.content },
        tokens_used: completion.usage?.total_tokens,
        processing_time_ms: processingTime,
        cost_usd: this.calculateCost(completion.usage?.total_tokens || 0),
        success: true
      })

      return {
        content: response.message.content || 'I apologize, but I could not generate a response.',
        metadata: {
          model: config.model,
          tokens_used: completion.usage?.total_tokens,
          processing_time: processingTime,
          confidence: 0.85
        }
      }
    } catch (error) {
      console.error('Error generating AI response:', error)
      
      await this.logModelInteraction({
        user_id: context.user_id,
        model_name: 'gpt-4',
        interaction_type: 'chat',
        input_data: { message, context: context.current_context },
        output_data: {},
        processing_time_ms: Date.now() - startTime,
        success: false,
        error_message: error instanceof Error ? error.message : 'Unknown error'
      })

      throw error
    }
  }

  async generateInsights(request: AIInsightGenerationRequest): Promise<AIInsight[]> {
    const startTime = Date.now()
    const config = this.modelConfig.analysis

    try {
      const clientData = await this.gatherClientData(request.client_id, request.data_sources, request.time_range)
      const systemPrompt = this.buildInsightPrompt(request, clientData)

      const completion = await openai.chat.completions.create({
        model: config.model,
        messages: [{ role: 'system', content: systemPrompt }],
        temperature: config.temperature,
        max_tokens: config.maxTokens
      })

      const insights = this.parseInsightsFromResponse(completion.choices[0].message.content || '', request)
      
      for (const insight of insights) {
        await this.saveInsight(insight)
      }

      await this.logModelInteraction({
        model_name: 'gpt-4',
        interaction_type: 'analysis',
        input_data: { request, clientData },
        output_data: { insights },
        tokens_used: completion.usage?.total_tokens,
        processing_time_ms: Date.now() - startTime,
        cost_usd: this.calculateCost(completion.usage?.total_tokens || 0),
        success: true
      })

      return insights
    } catch (error) {
      console.error('Error generating insights:', error)
      await this.logModelInteraction({
        model_name: 'gpt-4',
        interaction_type: 'analysis',
        input_data: { request },
        output_data: {},
        processing_time_ms: Date.now() - startTime,
        success: false,
        error_message: error instanceof Error ? error.message : 'Unknown error'
      })
      throw error
    }
  }

  async generateRecommendations(request: AIRecommendationRequest): Promise<AIRecommendation[]> {
    const startTime = Date.now()
    const config = this.modelConfig.default

    try {
      const systemPrompt = this.buildRecommendationPrompt(request)

      const completion = await openai.chat.completions.create({
        model: config.model,
        messages: [{ role: 'system', content: systemPrompt }],
        temperature: config.temperature,
        max_tokens: config.maxTokens
      })

      const recommendations = this.parseRecommendationsFromResponse(
        completion.choices[0].message.content || '', 
        request
      )
      
      for (const rec of recommendations) {
        await this.saveRecommendation(rec)
      }

      await this.logModelInteraction({
        user_id: request.user_id,
        model_name: 'gpt-4',
        interaction_type: 'recommendation',
        input_data: { request },
        output_data: { recommendations },
        tokens_used: completion.usage?.total_tokens,
        processing_time_ms: Date.now() - startTime,
        cost_usd: this.calculateCost(completion.usage?.total_tokens || 0),
        success: true
      })

      return recommendations
    } catch (error) {
      console.error('Error generating recommendations:', error)
      throw error
    }
  }

  async analyzeProgress(clientId: string, timeRange: { start: string; end: string }): Promise<AIProgressAnalysis> {
    const config = this.modelConfig.analysis

    try {
      const progressData = await this.gatherProgressData(clientId, timeRange)
      const systemPrompt = `
        You are an AI fitness coach analyzing client progress. Provide a comprehensive analysis based on this data:
        ${JSON.stringify(progressData, null, 2)}
        
        Analyze:
        1. Overall progress trend and score (0-100)
        2. Key achievements and concerning areas
        3. Immediate, short-term, and long-term recommendations
        4. Goal achievement probability and timeline predictions
        5. Comparative analysis vs similar users and personal bests
        
        Return structured JSON analysis.
      `

      const completion = await openai.chat.completions.create({
        model: config.model,
        messages: [{ role: 'system', content: systemPrompt }],
        temperature: config.temperature,
        max_tokens: 1500
      })

      return this.parseProgressAnalysis(completion.choices[0].message.content || '')
    } catch (error) {
      console.error('Error analyzing progress:', error)
      throw error
    }
  }

  async detectPlateaus(clientId: string, timeRange: { start: string; end: string }): Promise<AIPlateauDetection> {
    const config = this.modelConfig.analysis

    try {
      const performanceData = await this.gatherPerformanceData(clientId, timeRange)
      const systemPrompt = `
        Analyze this fitness data for plateaus:
        ${JSON.stringify(performanceData, null, 2)}
        
        Detect:
        1. Whether a plateau exists and its type
        2. Duration and severity
        3. Likely causes
        4. Intervention strategies (immediate, short-term, long-term)
        5. Success probability for breaking the plateau
        
        Return structured JSON analysis.
      `

      const completion = await openai.chat.completions.create({
        model: config.model,
        messages: [{ role: 'system', content: systemPrompt }],
        temperature: config.temperature,
        max_tokens: 1000
      })

      return this.parsePlateauDetection(completion.choices[0].message.content || '')
    } catch (error) {
      console.error('Error detecting plateaus:', error)
      throw error
    }
  }

  async optimizeGoals(clientId: string): Promise<AIGoalOptimization> {
    const config = this.modelConfig.analysis

    try {
      const goalData = await this.gatherGoalData(clientId)
      const systemPrompt = `
        Analyze and optimize these fitness goals:
        ${JSON.stringify(goalData, null, 2)}
        
        Provide:
        1. Current goals with progress assessment
        2. Optimized goals (modify/add/remove/extend)
        3. Goal conflict identification and resolutions
        4. Resource allocation recommendations
        
        Return structured JSON optimization plan.
      `

      const completion = await openai.chat.completions.create({
        model: config.model,
        messages: [{ role: 'system', content: systemPrompt }],
        temperature: config.temperature,
        max_tokens: 1200
      })

      return this.parseGoalOptimization(completion.choices[0].message.content || '')
    } catch (error) {
      console.error('Error optimizing goals:', error)
      throw error
    }
  }

  async analyzeImage(imageUrl: string, analysisType: 'progress_photo' | 'food' | 'form_check'): Promise<any> {
    const config = this.modelConfig.analysis

    try {
      const systemPrompts = {
        progress_photo: 'Analyze this progress photo for body composition changes, muscle development, and visual improvements. Provide objective assessment.',
        food: 'Analyze this food image. Identify the foods, estimate portions, calculate approximate calories and macronutrients.',
        form_check: 'Analyze this exercise form. Identify any technique issues, provide corrections, and suggest improvements for safety and effectiveness.'
      }

      const completion = await openai.chat.completions.create({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'system',
            content: systemPrompts[analysisType]
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: imageUrl }
              }
            ]
          }
        ],
        temperature: config.temperature,
        max_tokens: config.maxTokens
      })

      return {
        analysis: completion.choices[0].message.content,
        type: analysisType,
        confidence: 0.8
      }
    } catch (error) {
      console.error('Error analyzing image:', error)
      throw error
    }
  }

  // Private helper methods

  private buildSystemPrompt(context: AIContext): string {
    const basePrompt = `You are an AI fitness assistant helping ${context.user_role === 'coach' ? 'coaches manage their clients' : 'users achieve their fitness goals'}.`
    
    const contextPrompts = {
      general: 'Provide helpful, personalized fitness guidance.',
      workout: 'Focus on workout planning, exercise selection, and training optimization.',
      nutrition: 'Focus on nutrition planning, meal suggestions, and dietary guidance.',
      client_analysis: 'Analyze client data and provide coaching insights.',
      goal_setting: 'Help with setting realistic, achievable fitness goals.'
    }

    // Safely access context type with fallback
    const contextType = context.current_context?.type || 'general'
    const contextPrompt = contextPrompts[contextType as keyof typeof contextPrompts] || contextPrompts.general

    return `${basePrompt} ${contextPrompt} Always provide actionable, evidence-based advice.`
  }

  private buildMessageHistory(systemPrompt: string, history: AIMessage[], newMessage: string) {
    const messages: any[] = [{ role: 'system', content: systemPrompt }]
    
    history.slice(-10).forEach(msg => {
      messages.push({
        role: msg.role,
        content: msg.content
      })
    })

    messages.push({ role: 'user', content: newMessage })
    return messages
  }

  private buildInsightPrompt(request: AIInsightGenerationRequest, clientData: any): string {
    return `
      Analyze this client data and generate insights:
      
      Client ID: ${request.client_id}
      Coach ID: ${request.coach_id}
      Time Range: ${request.time_range.start} to ${request.time_range.end}
      Data Sources: ${request.data_sources.join(', ')}
      
      Client Data:
      ${JSON.stringify(clientData, null, 2)}
      
      Generate insights for: ${request.insight_types.join(', ')}
      
      Focus on actionable insights that will help the coach better support this client.
      Rate each insight's confidence and priority level.
    `
  }

  private buildRecommendationPrompt(request: AIRecommendationRequest): string {
    return `
      Generate personalized recommendations for this user:
      
      User ID: ${request.user_id}
      Context: ${request.context_type}
      Goals: ${request.goals.join(', ')}
      Constraints: ${request.constraints?.join(', ') || 'None'}
      Urgency: ${request.urgency || 'medium'}
      
      Current Data:
      ${JSON.stringify(request.current_data, null, 2)}
      
      Preferences:
      ${JSON.stringify(request.preferences, null, 2)}
      
      Provide specific, actionable recommendations with clear implementation steps.
    `
  }

  private async gatherClientData(clientId: string, dataSources: string[], timeRange: any): Promise<any> {
    // Implementation would gather data from database based on sources
    // This is a simplified version
    return {
      workouts: [],
      nutrition: [],
      progress: [],
      measurements: []
    }
  }

  private async gatherProgressData(clientId: string, timeRange: any): Promise<any> {
    // Implementation would gather comprehensive progress data
    return {
      workouts: [],
      measurements: [],
      photos: [],
      nutrition: []
    }
  }

  private async gatherPerformanceData(clientId: string, timeRange: any): Promise<any> {
    // Implementation would gather performance metrics
    return {
      strength_metrics: [],
      cardio_metrics: [],
      body_composition: [],
      recovery_data: []
    }
  }

  private async gatherGoalData(clientId: string): Promise<any> {
    // Implementation would gather current goals and progress
    return {
      current_goals: [],
      progress_history: [],
      constraints: [],
      preferences: []
    }
  }

  private parseInsightsFromResponse(response: string, request: AIInsightGenerationRequest): AIInsight[] {
    // Implementation would parse AI response and create structured insights
    // This is a simplified version that would need proper JSON parsing
    return []
  }

  private parseRecommendationsFromResponse(response: string, request: AIRecommendationRequest): AIRecommendation[] {
    // Implementation would parse AI response and create structured recommendations
    return []
  }

  private parseProgressAnalysis(response: string): AIProgressAnalysis {
    // Implementation would parse AI response into structured progress analysis
    return {
      overall_score: 75,
      trend_direction: 'improving',
      key_achievements: [],
      areas_of_concern: [],
      recommendations: { immediate: [], short_term: [], long_term: [] },
      predictions: {
        goal_achievement_probability: 0.8,
        risk_factors: [],
        success_factors: []
      },
      comparative_analysis: {
        vs_similar_users: { performance_percentile: 70, adherence_percentile: 80 },
        vs_personal_best: { current_vs_best_percentage: 90, time_since_best: '2 weeks' }
      }
    }
  }

  private parsePlateauDetection(response: string): AIPlateauDetection {
    // Implementation would parse plateau detection results
    return {
      plateau_detected: false,
      plateau_type: 'strength',
      duration_weeks: 0,
      severity: 'mild',
      likely_causes: [],
      intervention_strategies: { immediate: [], short_term: [], long_term: [] },
      success_probability: 0.8,
      monitoring_metrics: []
    }
  }

  private parseGoalOptimization(response: string): AIGoalOptimization {
    // Implementation would parse goal optimization results
    return {
      current_goals: [],
      optimized_goals: [],
      goal_conflicts: [],
      resource_allocation: { time_distribution: {}, priority_ranking: [] }
    }
  }

  private async saveInsight(insight: AIInsight): Promise<void> {
    const { error } = await this.supabase
      .from('ai_insights')
      .insert({
        client_id: insight.client_id,
        coach_id: insight.coach_id,
        insight_type: insight.insight_type,
        content: insight.content,
        confidence_score: insight.confidence_score,
        priority: insight.priority,
        action_items: insight.action_items
      })

    if (error) {
      console.error('Error saving insight:', error)
      throw error
    }
  }

  private async saveRecommendation(recommendation: AIRecommendation): Promise<void> {
    const { error } = await this.supabase
      .from('ai_recommendations')
      .insert({
        user_id: recommendation.user_id,
        rec_type: recommendation.rec_type,
        title: recommendation.title,
        content: recommendation.content,
        reasoning: recommendation.reasoning,
        priority: recommendation.priority,
        category: recommendation.category,
        target_data: recommendation.target_data,
        implementation_guide: recommendation.implementation_guide
      })

    if (error) {
      console.error('Error saving recommendation:', error)
      throw error
    }
  }

  private async logModelInteraction(interaction: Omit<AIModelInteraction, 'id' | 'created_at'>): Promise<void> {
    const { error } = await this.supabase
      .from('ai_model_performance')
      .insert({
        model_type: interaction.model_name,
        model_version: '1.0',
        task_type: interaction.interaction_type,
        response_time_ms: interaction.processing_time_ms || 0,
        usage_count: 1,
        success_rate: interaction.success ? 1.0 : 0.0,
        error_count: interaction.success ? 0 : 1
      })

    if (error) {
      console.error('Error logging model interaction:', error)
    }
  }

  private calculateCost(tokens: number): number {
    // GPT-4 pricing (approximate)
    const costPerToken = 0.00003 // $0.03 per 1K tokens
    return tokens * costPerToken
  }
}

export const aiService = AIService.getInstance()