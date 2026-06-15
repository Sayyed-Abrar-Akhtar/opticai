#!/usr/bin/env node
/**
 * Seed script — creates the first admin user
 * Usage: node scripts/seed.mjs
 * Make sure MONGODB_URI is in .env.local first
 */
import { createHash } from 'crypto'
import { MongoClient } from 'mongodb'
import { readFileSync } from 'fs'

// Load .env.local
try {
  const env = readFileSync('.env.local', 'utf8')
  env.split('\n').forEach(line => {
    const [key, ...vals] = line.split('=')
    if (key && !key.startsWith('#') && key.trim()) {
      process.env[key.trim()] = vals.join('=').trim()
    }
  })
} catch {
  console.log('No .env.local found, using existing env vars')
}

const uri = process.env.MONGODB_URI
if (!uri) {
  console.error('❌ MONGODB_URI not set in .env.local')
  process.exit(1)
}

const ADMIN_EMAIL    = process.env.SEED_EMAIL    || 'admin@opticai.com'
const ADMIN_PASSWORD = process.env.SEED_PASSWORD || 'opticai2025!'

function hashPassword(password) {
  return createHash('sha256').update(password).digest('hex')
}

const client = new MongoClient(uri)

async function seed() {
  await client.connect()
  const db = client.db('opticai')

  // Ensure indexes
  await db.collection('frames').createIndex({ suitableFaceShapes: 1, stock: 1 })
  await db.collection('frames').createIndex({ isFeatured: 1, trendScore: -1 })
  await db.collection('admin_users').createIndex({ email: 1 }, { unique: true })

  // Create admin user
  const existing = await db.collection('admin_users').findOne({ email: ADMIN_EMAIL })
  if (existing) {
    console.log(`⚠️  Admin user already exists: ${ADMIN_EMAIL}`)
  } else {
    await db.collection('admin_users').insertOne({
      email:        ADMIN_EMAIL,
      passwordHash: hashPassword(ADMIN_PASSWORD),
      role:         'superadmin',
      createdAt:    new Date(),
    })
    console.log(`✅ Admin user created: ${ADMIN_EMAIL}`)
    console.log(`   Password: ${ADMIN_PASSWORD}`)
  }

  // Seed sample frames (no images, just data for testing)
  const count = await db.collection('frames').countDocuments()
  if (count === 0) {
    const sampleFrames = [
      {
        name: 'Apex Aviator', brand: 'OpticAI', price: 5500,
        currency: 'NPR', imageUrl: '', cloudinaryPublicId: '',
        isAIGenerated: false, style: 'aviator',
        suitableFaceShapes: ['oval', 'heart', 'oblong'],
        gender: 'unisex', tags: ['metal', 'classic', 'thin-frame'],
        trendScore: 9, stock: 12, isFeatured: true,
        description: 'Timeless aviator style with a modern thin metal frame.',
        createdAt: new Date(), classifiedAt: new Date(),
      },
      {
        name: 'Nova Round', brand: 'OpticAI', price: 4200,
        currency: 'NPR', imageUrl: '', cloudinaryPublicId: '',
        isAIGenerated: false, style: 'round',
        suitableFaceShapes: ['square', 'oval', 'diamond'],
        gender: 'unisex', tags: ['acetate', 'retro', 'classic'],
        trendScore: 8, stock: 8, isFeatured: true,
        description: 'Vintage-inspired round frames with a contemporary acetate finish.',
        createdAt: new Date(), classifiedAt: new Date(),
      },
      {
        name: 'Edge Rectangular', brand: 'OpticAI', price: 3800,
        currency: 'NPR', imageUrl: '', cloudinaryPublicId: '',
        isAIGenerated: false, style: 'rectangular',
        suitableFaceShapes: ['round', 'oval', 'heart'],
        gender: 'unisex', tags: ['slim', 'professional', 'lightweight'],
        trendScore: 7, stock: 15, isFeatured: false,
        description: 'Clean rectangular frames perfect for professional settings.',
        createdAt: new Date(), classifiedAt: new Date(),
      },
    ]
    await db.collection('frames').insertMany(sampleFrames)
    console.log(`✅ Seeded ${sampleFrames.length} sample frames`)
  } else {
    console.log(`ℹ️  Frames collection already has ${count} documents — skipping sample frames`)
  }

  await client.close()
  console.log('\n🚀 Seed complete! You can now log in at http://localhost:3000/admin/login')
}

seed().catch(err => {
  console.error('Seed failed:', err)
  client.close()
  process.exit(1)
})
