import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/auth-utils'
import { ALL_FEATURE_IDS, type FeatureId } from '@/lib/features/registry'

const ONBOARDING_SYSTEM_PROMPT = `You are an assistant that maps user onboarding answers to a career profile and a set of feature IDs.
Feature IDs: dashboard, people, interactions, follow-ups, papers, events, calendar, network-map, ai-studio, weekly-review, settings.
Return a JSON object with exactly this structure: { "careerPath": "string", "featureIds": ["id1", "id2", ...] }
Rules:
- dashboard, people, interactions, follow-ups, settings are always included.
- papers: include for ML/Research/Engineering roles or if they read papers regularly.
- events, calendar: include for most users; exclude only if event importance is very low.
- network-map: include for networking-focused users.
- ai-studio: include for most users.
- weekly-review: include for users focused on growth or reflection.`

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession()
    const body = await request.json()
    const { answers } = body as { answers: Record<string, unknown> }

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json(
        { error: 'answers object is required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.OPENAI_API_KEY
    let featureIds: FeatureId[] = ALL_FEATURE_IDS

    if (apiKey) {
      try {
        const OpenAI = (await import('openai')).default
        const openai = new OpenAI({ apiKey })

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: ONBOARDING_SYSTEM_PROMPT },
            {
              role: 'user',
              content: JSON.stringify(answers),
            },
          ],
          response_format: { type: 'json_object' },
        })

        const content = completion.choices[0]?.message?.content
        if (content) {
          const parsed = JSON.parse(content) as {
            careerPath?: string
            featureIds?: string[]
          }
          if (Array.isArray(parsed.featureIds)) {
            featureIds = parsed.featureIds.filter((id) =>
              ALL_FEATURE_IDS.includes(id as FeatureId)
            ) as FeatureId[]
            if (featureIds.length === 0) {
              featureIds = ALL_FEATURE_IDS
            }
          }
        }
      } catch (openaiError) {
        console.error('OpenAI onboarding error:', openaiError)
      }
    }

    await prisma.$transaction([
      prisma.userFeature.deleteMany({
        where: { userId: session.user.id },
      }),
      ...featureIds.map((featureId) =>
        prisma.userFeature.create({
          data: {
            userId: session.user.id,
            featureId,
            enabled: true,
          },
        })
      ),
    ])

    return NextResponse.json({ success: true, featureIds })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error processing onboarding:', error)
    return NextResponse.json(
      { error: 'Failed to process onboarding' },
      { status: 500 }
    )
  }
}
