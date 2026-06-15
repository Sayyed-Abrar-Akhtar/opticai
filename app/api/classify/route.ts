/**
 * /api/classify
 * Uses Gemini 2.0 Flash (FREE tier) to classify uploaded frame images.
 * Get your free API key at: https://aistudio.google.com/apikey
 */
import { NextRequest, NextResponse } from 'next/server'
import { classifyFrame } from '@/lib/gemini'
import { uploadImage } from '@/lib/cloudinary'
import { getDb } from '@/lib/mongodb'

export async function POST(req: NextRequest) {
  try {
    const { image, mediaType, name, brand, price, stock } = await req.json()
    if (!image) return NextResponse.json({ error: 'No image provided' }, { status: 400 })

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not set. Get a free key at https://aistudio.google.com/apikey' },
        { status: 500 }
      )
    }

    // 1. Classify with Gemini Vision (free)
    const classification = await classifyFrame(image, mediaType ?? 'image/jpeg')

    // 2. Upload image to Cloudinary (free tier: 25GB)
    let imageUrl = ''
    let cloudinaryPublicId = ''
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      const uploaded = await uploadImage(image, 'opticai/frames')
      imageUrl = uploaded.url
      cloudinaryPublicId = uploaded.publicId
    }

    // 3. Save to MongoDB
    const db = await getDb()
    const doc = {
      name:               name ?? 'Untitled Frame',
      brand:              brand ?? 'Unknown',
      price:              parseFloat(price) || 0,
      currency:           'NPR',
      imageUrl,
      cloudinaryPublicId,
      isAIGenerated:      false,
      style:              classification.style,
      suitableFaceShapes: classification.suitableFaceShapes,
      gender:             classification.gender,
      tags:               classification.tags,
      trendScore:         classification.trendScore,
      stock:              parseInt(stock) || 1,
      isFeatured:         false,
      createdAt:          new Date(),
      classifiedAt:       new Date(),
    }
    const result = await db.collection('frames').insertOne(doc)

    return NextResponse.json({
      _id: result.insertedId.toString(),
      ...doc,
      classification,
    }, { status: 201 })
  } catch (err) {
    console.error('classify error:', err)
    const msg = err instanceof Error ? err.message : 'Classification failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
