# OpticAI — AI-Powered Eyewear Store
> 100% free AI stack. Face detection runs on-device with no CDN calls.

## Quick Start

```bash
# 1. Unzip and install (postinstall auto-copies face-api models)
unzip opticai.zip
cd opticai
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local — see below

# 3. Seed the database
node scripts/seed.mjs

# 4. Run
npm run dev
```

Open **http://localhost:3000**

---

## Why npm install fixes the 404s

`npm install` triggers `postinstall` → `node scripts/copy-models.mjs`

This copies 4 model files from:
```
node_modules/@vladmandic/face-api/model/
```
into:
```
public/models/
```

The app then loads them from your own server — no CDN, no SSL issues.

**If models are still 404 after npm install, run manually:**
```bash
node scripts/copy-models.mjs
```

---

## Environment Variables (.env.local)

```bash
# FREE Gemini key — https://aistudio.google.com/apikey (no credit card)
GEMINI_API_KEY=your-key-here

# Free MongoDB Atlas M0 — https://cloud.mongodb.com
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/opticai

# Generate: openssl rand -base64 32
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000

# Optional — Cloudinary free tier for image hosting
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

---

## Free AI Stack

| Feature | How | Cost |
|---------|-----|------|
| Face shape detection | face-api.js in browser | Free forever |
| AR try-on | face-api.js in browser | Free forever |
| Frame classification | Gemini 2.0 Flash API | Free (1000 req/day) |
| Frame image generation | Gemini image gen | Free |
| Images | Cloudinary free tier | Free (25GB/mo) |
| Database | MongoDB Atlas M0 | Free forever |

## Admin Login
- URL: http://localhost:3000/admin/login
- Email: `admin@opticai.com`
- Password: `opticai2025!`

## Production
```bash
npm run build
vercel --prod   # or any Node.js host
```
