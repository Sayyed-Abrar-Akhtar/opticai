/**
 * lib/gemini.ts
 * Gemini API wrapper — replaces Anthropic Claude.
 * Uses the FREE tier: https://aistudio.google.com/apikey
 *   - gemini-2.0-flash  → frame classification (vision)
 *   - gemini-2.0-flash  → AI frame generation (text-to-image via Gemini native)
 *
 * Free limits (as of 2025): 15 RPM, 1,000 RPD, vision included at no cost.
 */

import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// Use gemini-2.0-flash — vision support, generous free tier
const MODEL_ID = 'gemini-2.0-flash'

// ─── Frame Classification ────────────────────────────────────────────────────

export interface FrameClassification {
  style: string
  suitableFaceShapes: string[]
  gender: 'unisex' | 'masculine' | 'feminine'
  trendScore: number
  tags: string[]
}

export async function classifyFrame(
  base64Image: string,
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg'
): Promise<FrameClassification> {
  const model = genAI.getGenerativeModel({ model: MODEL_ID })

  const prompt = `You are an expert optician AI. Analyse this eyeglass frame image and:
1. Classify the frame style — choose one from: aviator, round, rectangular, cat-eye, browline, geometric, rimless, oval, oversized
2. List suitable face shapes from: oval, round, square, heart, oblong, diamond
3. Suggest a gender category: unisex, masculine, feminine
4. Rate the trendiness 1-10 for 2025
5. Provide 3-5 short descriptive tags (e.g. "metal", "thin-frame", "classic")

Respond ONLY as valid JSON — no markdown, no code fences, nothing else:
{
  "style": "aviator",
  "suitableFaceShapes": ["oval", "heart", "oblong"],
  "gender": "unisex",
  "trendScore": 8,
  "tags": ["classic", "metal", "thin-frame"]
}`

  const result = await model.generateContent([
    { inlineData: { mimeType, data: base64Image } },
    prompt,
  ])

  const text = result.response.text().replace(/```json|```/g, '').trim()
  return JSON.parse(text) as FrameClassification
}

// ─── AI Frame Image Generation ────────────────────────────────────────────────
// Uses Gemini's native image generation (gemini-2.0-flash-exp-image-generation)
// which is free tier eligible. Falls back to a stable diffusion prompt string
// if native image gen is unavailable.

export async function generateFrameImagePrompt(faceShape: string, style: string): Promise<string> {
  return `Professional product photography of ${style} eyeglass frames, white studio background, ` +
    `luxury optical retail photography, ultra-sharp details, suitable for ${faceShape} face shape, ` +
    `no person, 8k, photorealistic, commercial product shot`
}

/**
 * Attempts to generate a frame image using Gemini's image generation.
 * Returns base64 PNG data if successful, null if the model isn't available on free tier.
 */
export async function generateFrameImage(
  faceShape: string,
  style: string
): Promise<string | null> {
  try {
    // gemini-2.0-flash-exp-image-generation supports responseModalities: IMAGE
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp-image-generation',
    })

    const prompt = await generateFrameImagePrompt(faceShape, style)

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      // @ts-expect-error: generationConfig types may not include responseModalities yet
      generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
    })

    const parts = result.response.candidates?.[0]?.content?.parts ?? []
    for (const part of parts) {
      // @ts-expect-error: inlineData is part of the response shape
      if (part.inlineData?.data) return part.inlineData.data as string
    }
    return null
  } catch (err) {
    console.warn('Gemini image generation unavailable on free tier, using placeholder:', err)
    return null
  }
}
