import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/auth-utils'
import { ALL_FEATURE_IDS, type FeatureId } from '@/lib/features/registry'

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession()

    const userFeatures = await prisma.userFeature.findMany({
      where: { userId: session.user.id, enabled: true },
      select: { featureId: true },
    })

    const featureIds = userFeatures.map((f) => f.featureId as FeatureId)

    if (featureIds.length === 0) {
      return NextResponse.json({ featureIds: ALL_FEATURE_IDS })
    }

    return NextResponse.json({ featureIds })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching features:', error)
    return NextResponse.json(
      { error: 'Failed to fetch features' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireSession()
    const body = await request.json()
    const { featureIds } = body as { featureIds: string[] }

    if (!Array.isArray(featureIds)) {
      return NextResponse.json(
        { error: 'featureIds must be an array' },
        { status: 400 }
      )
    }

    const validIds = featureIds.filter((id) =>
      ALL_FEATURE_IDS.includes(id as FeatureId)
    )

    await prisma.$transaction([
      prisma.userFeature.deleteMany({
        where: { userId: session.user.id },
      }),
      ...validIds.map((featureId) =>
        prisma.userFeature.create({
          data: {
            userId: session.user.id,
            featureId,
            enabled: true,
          },
        })
      ),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error updating features:', error)
    return NextResponse.json(
      { error: 'Failed to update features' },
      { status: 500 }
    )
  }
}
