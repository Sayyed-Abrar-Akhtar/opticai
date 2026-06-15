import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// GET /api/frames — list frames with optional filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const faceShape = searchParams.get('faceShape')
    const featured  = searchParams.get('featured')
    const style     = searchParams.get('style')
    const limit     = parseInt(searchParams.get('limit') ?? '20')

    const db = await getDb()
    const query: Record<string, unknown> = {}
    if (faceShape) query.suitableFaceShapes = faceShape
    if (featured === 'true') query.isFeatured = true
    if (style) query.style = style

    const frames = await db.collection('frames')
      .find(query)
      .sort({ trendScore: -1, createdAt: -1 })
      .limit(limit)
      .toArray()

    return NextResponse.json(frames.map(f => ({ ...f, _id: f._id.toString() })))
  } catch (err) {
    console.error('frames GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch frames' }, { status: 500 })
  }
}

// POST /api/frames — create a new frame (admin only in practice, guarded by middleware)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const db = await getDb()
    const doc = {
      ...body,
      createdAt: new Date(),
      stock:      body.stock ?? 0,
      isFeatured: body.isFeatured ?? false,
      currency:   body.currency ?? 'NPR',
    }
    const result = await db.collection('frames').insertOne(doc)
    return NextResponse.json({ _id: result.insertedId.toString(), ...doc }, { status: 201 })
  } catch (err) {
    console.error('frames POST error:', err)
    return NextResponse.json({ error: 'Failed to create frame' }, { status: 500 })
  }
}

// PUT /api/frames — update by id (?id=xxx)
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    const body = await req.json()
    const db = await getDb()
    await db.collection('frames').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...body, updatedAt: new Date() } }
    )
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('frames PUT error:', err)
    return NextResponse.json({ error: 'Failed to update frame' }, { status: 500 })
  }
}

// DELETE /api/frames?id=xxx
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    const db = await getDb()
    await db.collection('frames').deleteOne({ _id: new ObjectId(id) })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('frames DELETE error:', err)
    return NextResponse.json({ error: 'Failed to delete frame' }, { status: 500 })
  }
}
