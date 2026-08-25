export const SECTORS = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5] as const
export const CX = 300
export const CY = 300
export const BOARD_RADIUS = 273
export const DOUBLE_INNER = 227
export const DOUBLE_OUTER = 247
export const TREBLE_INNER = 148
export const TREBLE_OUTER = 168
export const OUTER_BULL = 49
export const INNER_BULL = 19
export type RegionKind = 'miss' | 'single' | 'double' | 'treble' | 'outerBull' | 'innerBull'
export interface ScoringRegion { kind: RegionKind; label: string; value: number; multiplier: number; score: number; sectorIndex: number | null }
export interface BoardPoint { x: number; y: number }
export const polarPoint = (radius: number, angle: number): BoardPoint => { const r = angle * Math.PI / 180; return { x: CX + radius * Math.sin(r), y: CY - radius * Math.cos(r) } }
export const annularSectorPath = (inner: number, outer: number, start: number, end: number) => { const os = polarPoint(outer, start); const oe = polarPoint(outer, end); const ie = polarPoint(inner, end); const ins = polarPoint(inner, start); return `M ${os.x} ${os.y} A ${outer} ${outer} 0 0 1 ${oe.x} ${oe.y} L ${ie.x} ${ie.y} A ${inner} ${inner} 0 0 0 ${ins.x} ${ins.y} Z` }
export const scorePoint = ({ x, y }: BoardPoint): ScoringRegion => {
  const dx = x - CX; const dy = y - CY; const radius = Math.hypot(dx, dy); const angle = (Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360; const sectorIndex = Math.floor((angle + 9) / 18) % 20; const value = SECTORS[sectorIndex]
  if (radius <= INNER_BULL) return { kind: 'innerBull', label: 'INNER BULL', value: 50, multiplier: 1, score: 50, sectorIndex: null }
  if (radius <= OUTER_BULL) return { kind: 'outerBull', label: 'OUTER BULL', value: 25, multiplier: 1, score: 25, sectorIndex: null }
  if (radius > DOUBLE_OUTER) return { kind: 'miss', label: 'MISS', value: 0, multiplier: 0, score: 0, sectorIndex: null }
  if (radius >= DOUBLE_INNER) return { kind: 'double', label: `DOUBLE ${value}`, value, multiplier: 2, score: value * 2, sectorIndex }
  if (radius >= TREBLE_INNER && radius <= TREBLE_OUTER) return { kind: 'treble', label: `TREBLE ${value}`, value, multiplier: 3, score: value * 3, sectorIndex }
  return { kind: 'single', label: `SINGLE ${value}`, value, multiplier: 1, score: value, sectorIndex }
}
export const boardPointFromClient = (clientX: number, clientY: number, rect: DOMRect): BoardPoint => { const scale = 600 / Math.min(rect.width, rect.height); return { x: CX + (clientX - (rect.left + rect.width / 2)) * scale, y: CY + (clientY - (rect.top + rect.height / 2)) * scale } }
