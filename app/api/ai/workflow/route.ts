import { NextRequest, NextResponse } from 'next/server'
import { aiWorkflow } from '@/lib/services/ai-workflow'

export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json()

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 })
    }

    let result

    switch (action) {
      case 'trigger_data_change':
        await aiWorkflow.triggerDataChange(data.entity, data.field, data)
        result = { success: true, message: 'Data change trigger processed' }
        break

      case 'trigger_event':
        await aiWorkflow.triggerEvent(data.event, data)
        result = { success: true, message: 'Event trigger processed' }
        break

      case 'process_client_onboarding':
        if (!data.clientId || !data.coachId) {
          return NextResponse.json({ error: 'clientId and coachId are required' }, { status: 400 })
        }
        await aiWorkflow.processClientOnboarding(data.clientId, data.coachId)
        result = { success: true, message: 'Client onboarding automation started' }
        break

      case 'run_scheduled_automation':
        await aiWorkflow.processScheduledAutomation()
        result = { success: true, message: 'Scheduled automation processed' }
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('AI workflow error:', error)
    return NextResponse.json(
      { error: 'Failed to process workflow action' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get('action')

    if (action === 'health_check') {
      return NextResponse.json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'ai-workflow'
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('AI workflow health check error:', error)
    return NextResponse.json(
      { error: 'Health check failed' },
      { status: 500 }
    )
  }
}