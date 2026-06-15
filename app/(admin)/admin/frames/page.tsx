'use client'
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'
import { Upload, Sparkles, Check, X, Tag } from 'lucide-react'
import NeonButton from '@/components/ui/NeonButton'
import GlassCard from '@/components/ui/GlassCard'

interface ClassificationResult {
  _id: string
  name: string
  imageUrl: string
  style: string
  suitableFaceShapes: string[]
  gender: string
  trendScore: number
  tags: string[]
}

export default function AdminFramesPage() {
  const [preview,    setPreview]    = useState<string | null>(null)
  const [base64,     setBase64]     = useState<string>('')
  const [mediaType,  setMediaType]  = useState('image/jpeg')
  const [name,       setName]       = useState('')
  const [brand,      setBrand]      = useState('')
  const [price,      setPrice]      = useState('')
  const [stock,      setStock]      = useState('1')
  const [loading,    setLoading]    = useState(false)
  const [result,     setResult]     = useState<ClassificationResult | null>(null)
  const [error,      setError]      = useState('')
  const [featured,   setFeatured]   = useState(false)

  const onDrop = useCallback((files: File[]) => {
    const file = files[0]
    if (!file) return
    setMediaType(file.type)
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      setPreview(dataUrl)
      setBase64(dataUrl.split(',')[1])
    }
    reader.readAsDataURL(file)
    setResult(null)
    setError('')
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 1,
  })

  const handleClassify = async () => {
    if (!base64) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/classify', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ image: base64, mediaType, name, brand, price: parseFloat(price) || 0, stock: parseInt(stock) || 1 }),
      })
      if (!res.ok) throw new Error('Classification failed')
      const data = await res.json()
      setResult(data)
      // Mark as featured if checked
      if (featured && data._id) {
        await fetch(`/api/frames?id=${data._id}`, {
          method:  'PUT',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ isFeatured: true }),
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setPreview(null); setBase64(''); setResult(null); setError('')
    setName(''); setBrand(''); setPrice(''); setStock('1')
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="font-display font-black text-2xl text-text-primary">Upload Frame</h1>
        <p className="text-text-muted text-sm font-mono mt-1">AI will automatically classify the frame style and suitable face types</p>
      </div>

      {!result ? (
        <div className="space-y-5">
          {/* Drop zone */}
          <div {...getRootProps()}
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
              ${isDragActive
                ? 'border-accent-violet bg-accent-violet/10'
                : preview ? 'border-white/20 bg-bg-elevated' : 'border-white/10 bg-bg-surface hover:border-accent-violet/40 hover:bg-accent-violet/5'
              }`}>
            <input {...getInputProps()} />
            {preview ? (
              <div className="relative">
                <div className="relative w-48 h-48 mx-auto rounded-xl overflow-hidden">
                  <Image src={preview} alt="Preview" fill className="object-cover" />
                </div>
                <p className="text-xs text-text-muted mt-3 font-mono">Click or drop to replace</p>
              </div>
            ) : (
              <div>
                <Upload className="w-10 h-10 text-text-muted mx-auto mb-3" />
                <p className="font-display font-semibold text-text-primary mb-1">Drop frame image here</p>
                <p className="text-xs text-text-muted">JPG, PNG, WebP up to 10MB</p>
              </div>
            )}
          </div>

          {/* Metadata */}
          <GlassCard hover={false} className="space-y-4">
            <p className="font-display font-semibold text-sm text-text-secondary">Frame Details</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Frame Name',  value: name,  set: setName,  placeholder: 'Classic Aviator', type: 'text'   },
                { label: 'Brand',       value: brand, set: setBrand, placeholder: 'Ray-Ban',          type: 'text'   },
                { label: 'Price (NPR)', value: price, set: setPrice, placeholder: '4500',             type: 'number' },
                { label: 'Stock',       value: stock, set: setStock, placeholder: '10',               type: 'number' },
              ].map(({ label, value, set, placeholder, type }) => (
                <div key={label}>
                  <label className="block text-xs font-mono text-text-muted mb-1 uppercase tracking-wider">{label}</label>
                  <input
                    type={type}
                    value={value}
                    onChange={e => set(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-bg-elevated border border-white/10 rounded-xl px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-violet/50 focus:outline-none transition-all"
                  />
                </div>
              ))}
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)}
                className="w-4 h-4 rounded accent-violet-600" />
              <span className="text-sm text-text-secondary">Feature on homepage</span>
            </label>
          </GlassCard>

          {error && (
            <p className="text-xs text-red-400 font-mono bg-red-500/10 rounded-xl px-4 py-3 border border-red-500/20">{error}</p>
          )}

          <NeonButton
            variant="violet" size="lg" className="w-full"
            disabled={!base64} loading={loading}
            onClick={handleClassify}>
            <Sparkles className="w-4 h-4" />
            Classify with AI & Upload
          </NeonButton>
        </div>
      ) : (
        // Success state
        <div className="space-y-5 animate-fade-up">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-green-500/10 border border-green-500/30">
            <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
            <div>
              <p className="font-display font-semibold text-sm text-green-300">Frame classified & uploaded!</p>
              <p className="text-xs text-green-400/70 font-mono">Saved to inventory and Cloudinary</p>
            </div>
          </div>

          <GlassCard hover={false}>
            <div className="flex gap-4">
              {result.imageUrl && (
                <div className="relative w-28 h-20 rounded-xl overflow-hidden flex-shrink-0">
                  <Image src={result.imageUrl} alt={result.name} fill className="object-cover" />
                </div>
              )}
              <div className="space-y-2 min-w-0">
                <p className="font-display font-semibold text-text-primary">{result.name || 'Untitled Frame'}</p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="badge bg-accent-violet/20 text-accent-violet border-accent-violet/30 capitalize">{result.style}</span>
                  <span className="badge bg-white/10 text-text-secondary border-white/10">{result.gender}</span>
                  <span className="badge bg-accent-cyan/20 text-accent-cyan border-accent-cyan/30">Trend {result.trendScore}/10</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3 h-3 text-text-muted" />
                  <span className="text-xs text-text-muted font-mono">Fits: {result.suitableFaceShapes.join(', ')}</span>
                </div>
              </div>
            </div>
          </GlassCard>

          <div className="flex gap-3">
            <NeonButton variant="violet" onClick={reset} className="flex-1">Upload Another</NeonButton>
            <NeonButton variant="ghost" onClick={() => window.location.href = '/admin/inventory'}>
              View Inventory
            </NeonButton>
          </div>
        </div>
      )}
    </div>
  )
}
