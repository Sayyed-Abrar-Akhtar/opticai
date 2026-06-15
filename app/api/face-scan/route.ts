/**
 * /api/face-scan
 * NOTE: Face shape detection is now done 100% IN THE BROWSER via MediaPipe.
 * This endpoint only handles the MongoDB query part — NO AI call needed here.
 *
 * The client sends { faceShape } after local MediaPipe analysis.
 * We return matching frames from inventory.
 */
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { faceShapeFrameMap } from '@/lib/face-shapes'

export async function POST(req: NextRequest) {
  try {
    const { faceShape } = await req.json()
    if (!faceShape) return NextResponse.json({ error: 'No faceShape provided' }, { status: 400 })

    const db = await getDb()
    const recommendedStyles = faceShapeFrameMap[faceShape as keyof typeof faceShapeFrameMap] ?? []

    const frames = await db.collection('frames').find({
      suitableFaceShapes: faceShape,
      stock: { $gt: 0 },
    }).sort({ trendScore: -1 }).limit(12).toArray()

    const coveredStyles = new Set(frames.map((f: Record<string, unknown>) => f.style as string))
    const gapStyles = recommendedStyles.filter(s => !coveredStyles.has(s))

    return NextResponse.json({
      frames: frames.map(f => ({ ...f, _id: f._id.toString() })),
      gapStyles,
      hasGaps: gapStyles.length > 0,
    })
  } catch (err) {
    console.error('face-scan error:', err)
    return NextResponse.json({ error: 'Failed to query frames' }, { status: 500 })
  }
}
