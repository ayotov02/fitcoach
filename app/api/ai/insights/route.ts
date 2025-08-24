import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/lib/services/ai-service'
import { AIInsightGenerationRequest } from '@/lib/types/ai'

export async function POST(request: NextRequest) {
  try {
    const body: AIInsightGenerationRequest = await request.json()

    if (!body.client_id || !body.coach_id || !body.insight_types || !body.data_sources) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const insights = await aiService.generateInsights(body)

    return NextResponse.json({ insights })
  } catch (error) {
    console.error('AI insights error:', error)
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const clientId = searchParams.get('client_id')
    const coachId = searchParams.get('coach_id')
    const status = searchParams.get('status') || 'new'
    const priority = searchParams.get('priority')

    // TODO: Implement getting insights from database
    // This would query the ai_insights table with filters

    return NextResponse.json({ insights: [] })
  } catch (error) {
    console.error('Error fetching insights:', error)
    return NextResponse.json(
      { error: 'Failed to fetch insights' },
      { status: 500 }
    )
  }
}