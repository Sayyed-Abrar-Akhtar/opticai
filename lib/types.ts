import { ObjectId } from 'mongodb'

export interface Frame {
  _id?: ObjectId | string
  name: string
  brand: string
  price: number
  currency: string
  imageUrl: string
  cloudinaryPublicId?: string
  isAIGenerated: boolean
  style: string
  suitableFaceShapes: string[]
  gender: 'unisex' | 'masculine' | 'feminine'
  tags: string[]
  trendScore: number
  stock: number
  isFeatured: boolean
  description?: string
  createdAt: Date | string
  classifiedAt?: Date | string
}

export interface AdminUser {
  _id?: ObjectId | string
  email: string
  passwordHash: string
  role: 'admin' | 'superadmin'
  createdAt: Date | string
}

export interface FaceScanResult {
  faceShape: string
  confidence: number
  recommendations: Array<{ style: string; reason: string }>
}
