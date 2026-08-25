import type { ScoringRegion } from './dartboardGeometry'
import type { ThrowResult } from './throwMechanic'
export type Side = 'player' | 'ai'
export interface RecordedDart { result: ThrowResult; region: ScoringRegion }
export interface MatchState { playerScore: number; aiScore: number; activeSide: Side; visit: RecordedDart[]; lastVisitTotal: number; message: string }
export const initialMatch = (): MatchState => ({ playerScore: 501, aiScore: 501, activeSide: 'player', visit: [], lastVisitTotal: 0, message: 'LOCK VERTICAL AIM' })
export const scoreVisit = (state: MatchState, side: Side, darts: RecordedDart[]): MatchState => { const start = side === 'player' ? state.playerScore : state.aiScore; const total = darts.reduce((sum, dart) => sum + dart.region.score, 0); const last = darts[darts.length - 1]?.region; const remaining = start - total; const bust = remaining < 0 || remaining === 1 || (remaining === 0 && last?.multiplier !== 2 && last?.kind !== 'innerBull'); const nextScore = bust ? start : Math.max(0, remaining); const nextSide: Side = side === 'player' ? 'ai' : 'player'; return { ...state, playerScore: side === 'player' ? nextScore : state.playerScore, aiScore: side === 'ai' ? nextScore : state.aiScore, activeSide: nextSide, visit: [], lastVisitTotal: bust ? 0 : total, message: bust ? 'BUST — VISIT RESET' : 'LOCK VERTICAL AIM' } }
