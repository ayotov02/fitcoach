import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/lib/services/ai-service'
import { AIContext } from '@/lib/types/ai'

export async function POST(request: NextRequest) {
  try {
    const { message, context, conversationHistory } = await request.json()

    if (!message || !context) {
      return NextResponse.json({ error: 'Message and context are required' }, { status: 400 })
    }

    const aiContext: AIContext = {
      user_id: context.user_id,
      user_role: context.user_role,
      current_context: context.current_context,
      user_profile: context.user_profile,
      client_context: context.client_context
    }

    const response = await aiService.generateConversationResponse(
      message,
      aiContext,
      conversationHistory || []
    )

    return NextResponse.json(response)
  } catch (error) {
    console.error('AI chat error:', error)
    return NextResponse.json(
      { error: 'Failed to generate AI response' },
      { status: 500 }
    )
  }
}