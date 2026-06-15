export type FaceShape = 'oval' | 'round' | 'square' | 'heart' | 'oblong' | 'diamond'
export type FrameStyle = string

export const faceShapeFrameMap: Record<FaceShape, FrameStyle[]> = {
  oval:    ['aviator', 'rectangular', 'cat-eye', 'geometric', 'round'],
  round:   ['rectangular', 'square', 'geometric', 'browline', 'rimless'],
  square:  ['round', 'oval', 'aviator', 'rimless', 'cat-eye'],
  heart:   ['aviator', 'round', 'rimless', 'cat-eye', 'rectangular'],
  oblong:  ['oversized', 'round', 'square', 'geometric', 'aviator'],
  diamond: ['cat-eye', 'oval', 'rimless', 'browline', 'aviator'],
}

export const faceShapeDescriptions: Record<FaceShape, string> = {
  oval:    'Balanced proportions with a gently rounded jaw. Almost any frame style works well.',
  round:   'Soft curves with similar width and length. Angular frames add definition.',
  square:  'Strong jaw and broad forehead. Rounded frames soften the angles beautifully.',
  heart:   'Wider forehead tapering to a narrow chin. Bottom-heavy frames balance the face.',
  oblong:  'Face length greater than width. Wider, deeper frames create visual balance.',
  diamond: 'Narrow forehead and jaw with wide cheekbones. Frames with detail on top work best.',
}

export const faceShapeEmoji: Record<FaceShape, string> = {
  oval:    '⬭',
  round:   '○',
  square:  '□',
  heart:   '♡',
  oblong:  '▭',
  diamond: '◇',
}

export const frameStyleLabels: Record<string, string> = {
  aviator:    'Aviator',
  rectangular:'Rectangular',
  'cat-eye':  'Cat Eye',
  geometric:  'Geometric',
  round:      'Round',
  square:     'Square',
  browline:   'Browline',
  rimless:    'Rimless',
  oversized:  'Oversized',
  oval:       'Oval',
}
