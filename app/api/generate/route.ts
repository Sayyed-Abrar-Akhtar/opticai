/**
 * /api/generate
 * Generates an AI concept frame image using Gemini (free tier).
 * Falls back to a beautiful SVG placeholder if Gemini image gen is unavailable.
 */
import { NextRequest, NextResponse } from 'next/server'
import { generateFrameImage, generateFrameImagePrompt } from '@/lib/gemini'
import { uploadImage } from '@/lib/cloudinary'
import { getDb } from '@/lib/mongodb'
import { faceShapeDescriptions } from '@/lib/face-shapes'

export async function POST(req: NextRequest) {
  try {
    const { faceShape, style } = await req.json()
    if (!faceShape || !style) {
      return NextResponse.json({ error: 'faceShape and style required' }, { status: 400 })
    }

    // 1. Try Gemini image generation (free tier)
    let imageUrl = ''
    let cloudinaryPublicId = ''
    let isGenerated = false

    const base64 = await generateFrameImage(faceShape, style)

    if (base64 && process.env.CLOUDINARY_CLOUD_NAME) {
      const uploaded = await uploadImage(base64, 'opticai/ai-generated')
      imageUrl = uploaded.url
      cloudinaryPublicId = uploaded.publicId
      isGenerated = true
    } else if (base64) {
      // Return as data URL if no Cloudinary
      imageUrl = `data:image/png;base64,${base64}`
      isGenerated = true
    }
    // If no image generated, imageUrl stays '' — frontend shows SVG placeholder

    // 2. Save to MongoDB
    const db = await getDb()
    const doc = {
      name:               `AI Concept — ${style.charAt(0).toUpperCase() + style.slice(1)} for ${faceShape} face`,
      brand:              'OpticAI Concept',
      price:              0,
      currency:           'NPR',
      imageUrl,
      cloudinaryPublicId,
      isAIGenerated:      true,
      style,
      suitableFaceShapes: [faceShape],
      gender:             'unisex',
      tags:               ['ai-generated', 'concept', style],
      trendScore:         7,
      stock:              0,
      isFeatured:         false,
      description:        `AI-generated concept. Ask our optician to source this ${style} style.`,
      aiPrompt:           await generateFrameImagePrompt(faceShape, style),
      createdAt:          new Date(),
      classifiedAt:       new Date(),
    }
    const result = await db.collection('frames').insertOne(doc)

    return NextResponse.json({
      _id: result.insertedId.toString(),
      ...doc,
      imageGenerated: isGenerated,
    })
  } catch (err) {
    console.error('generate error:', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
