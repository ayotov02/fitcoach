import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/lib/services/ai-service'

export async function POST(request: NextRequest) {
  try {
    const { analysisType, clientId, timeRange, ...params } = await request.json()

    if (!analysisType || !clientId) {
      return NextResponse.json(
        { error: 'Analysis type and client ID are required' },
        { status: 400 }
      )
    }

    let result

    switch (analysisType) {
      case 'progress':
        result = await aiService.analyzeProgress(clientId, timeRange)
        break
      case 'plateau':
        result = await aiService.detectPlateaus(clientId, timeRange)
        break
      case 'goals':
        result = await aiService.optimizeGoals(clientId)
        break
      case 'image':
        if (!params.imageUrl || !params.imageType) {
          return NextResponse.json(
            { error: 'Image URL and type are required for image analysis' },
            { status: 400 }
          )
        }
        result = await aiService.analyzeImage(params.imageUrl, params.imageType)
        break
      default:
        return NextResponse.json(
          { error: 'Invalid analysis type' },
          { status: 400 }
        )
    }

    return NextResponse.json({ result, analysisType })
  } catch (error) {
    console.error('AI analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to perform analysis' },
      { status: 500 }
    )
  }
}