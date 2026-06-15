import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export const MODEL = 'claude-sonnet-4-20250514'

// ─── Face Shape Detection ─────────────────────────────────────────────────────

export interface FaceScanResult {
  faceShape: 'oval' | 'round' | 'square' | 'heart' | 'oblong' | 'diamond'
  confidence: number
  recommendations: Array<{
    style: string
    reason: string
  }>
}

export async function detectFaceShape(base64Image: string, mediaType = 'image/jpeg'): Promise<FaceScanResult> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/webp',
              data: base64Image,
            },
          },
          {
            type: 'text',
            text: `You are an expert optician AI. Analyse the face in this image and:
1. Classify the face shape as exactly one of: oval, round, square, heart, oblong, diamond
2. Provide a confidence score 0-100
3. List the top 3 eyeglass frame styles that suit this face shape, ordered by suitability
4. For each style, name the style (e.g. "aviator", "rectangular", "round") and explain in one sentence why it suits this face

Respond ONLY as valid JSON with no markdown, no code fences:
{
  "faceShape": "oval",
  "confidence": 87,
  "recommendations": [
    {"style": "aviator", "reason": "..."},
    {"style": "rectangular", "reason": "..."},
    {"style": "round", "reason": "..."}
  ]
}`,
          },
        ],
      },
    ],
  })

  const text = response.content.find(b => b.type === 'text')?.text ?? '{}'
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean) as FaceScanResult
}

// ─── Frame Classification ─────────────────────────────────────────────────────

export interface FrameClassification {
  style: string
  suitableFaceShapes: string[]
  gender: 'unisex' | 'masculine' | 'feminine'
  trendScore: number
  tags: string[]
}

export async function classifyFrame(base64Image: string, mediaType = 'image/jpeg'): Promise<FrameClassification> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/webp',
              data: base64Image,
            },
          },
          {
            type: 'text',
            text: `You are an expert optician AI. Analyse this eyeglass frame image and:
1. Classify the frame style (aviator, round, rectangular, cat-eye, browline, geometric, rimless, oval)
2. List suitable face shapes from: oval, round, square, heart, oblong, diamond
3. Suggest a gender category: unisex, masculine, feminine
4. Rate the trendiness 1-10 for 2025
5. Provide 3-5 descriptive tags (e.g. "metal", "thin-frame", "classic")

Respond ONLY as valid JSON with no markdown, no code fences:
{
  "style": "aviator",
  "suitableFaceShapes": ["oval", "heart", "oblong"],
  "gender": "unisex",
  "trendScore": 8,
  "tags": ["classic", "metal", "thin-frame"]
}`,
          },
        ],
      },
    ],
  })

  const text = response.content.find(b => b.type === 'text')?.text ?? '{}'
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean) as FrameClassification
}
