#!/usr/bin/env node
/**
 * Copies face-api model files from node_modules into public/models/
 * Runs automatically via "postinstall" in package.json.
 * No internet needed — uses files already on disk after npm install.
 */
import { copyFileSync, mkdirSync, existsSync, readdirSync } from 'fs'
import { join } from 'path'

const SRC = join(process.cwd(), 'node_modules', '@vladmandic', 'face-api', 'model')
const DST = join(process.cwd(), 'public', 'models')

if (!existsSync(SRC)) {
  console.log('⚠  face-api not installed yet — skipping model copy (run npm install first)')
  process.exit(0)
}

mkdirSync(DST, { recursive: true })

const needed = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  'face_landmark_68_tiny_model-weights_manifest.json',
  'face_landmark_68_tiny_model-shard1',
]

// Check what's actually in node_modules model folder
const available = readdirSync(SRC)
let copied = 0

for (const file of needed) {
  // Try exact match first, then case-insensitive
  const match = available.find(f => f === file || f.toLowerCase() === file.toLowerCase())
  if (!match) {
    console.warn(`  ⚠  not found in node_modules: ${file}`)
    continue
  }
  copyFileSync(join(SRC, match), join(DST, file))
  console.log(`  ✓ ${file}`)
  copied++
}

if (copied === needed.length) {
  console.log(`\n✅ All ${copied} model files copied to public/models/\n`)
} else {
  console.log(`\n⚠  Copied ${copied}/${needed.length} files. Check node_modules/@vladmandic/face-api/model/`)
  // List what IS there so user can debug
  console.log('\nAvailable in node_modules model folder:')
  available.forEach(f => console.log('  -', f))
}
