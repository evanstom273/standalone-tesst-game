import type { ScoringRegion } from './dartboardGeometry'
import type { ThrowResult } from './throwMechanic'
export type Side = 'player' | 'ai'

export interface MatchFormat { startingScore: number; legsToWinSet: number; setsToWinMatch: number; doubleOut: boolean; showSets: boolean }
export interface RecordedDart { result: ThrowResult; region: ScoringRegion }
export interface MatchStats { darts: number; visits: number; totalScore: number; firstNineScore: number; checkoutAttempts: number; checkoutHits: number; highestCheckout: number; scores100: number; scores140: number; scores180: number; doublesHit: number; doublesAttempted: number; treblelessVisits: number }
export interface MatchState { playerScore: number; aiScore: number; playerLegs: number; aiLegs: number; playerSets: number; aiSets: number; activeSide: Side; visitStartScore: number; visit: RecordedDart[]; lastVisitTotal: number; lastVisitBust: boolean; lastCheckout: number; history: RecordedDart[]; stats: MatchStats; matchComplete: boolean; message: string }
export const DEFAULT_FORMAT: MatchFormat = { startingScore: 501, legsToWinSet: 3, setsToWinMatch: 1, doubleOut: true, showSets: true }
export const initialMatch = (format: MatchFormat = DEFAULT_FORMAT): MatchState => ({ playerScore: format.startingScore, aiScore: format.startingScore, playerLegs: 0, aiLegs: 0, playerSets: 0, aiSets: 0, activeSide: 'player', visitStartScore: format.startingScore, visit: [], lastVisitTotal: 0, lastVisitBust: false, lastCheckout: 0, history: [], stats: { darts: 0, visits: 0, totalScore: 0, firstNineScore: 0, checkoutAttempts: 0, checkoutHits: 0, highestCheckout: 0, scores100: 0, scores140: 0, scores180: 0, doublesHit: 0, doublesAttempted: 0, treblelessVisits: 0 }, matchComplete: false, message: 'LOCK VERTICAL AIM' })

const scoreFor = (state: MatchState, side: Side) => side === 'player' ? state.playerScore : state.aiScore
const withScore = (state: MatchState, side: Side, score: number) => side === 'player' ? { ...state, playerScore: score } : { ...state, aiScore: score }
const isCheckout = (remaining: number, last: ScoringRegion | undefined, format: MatchFormat) => remaining === 0 && (!format.doubleOut || last?.multiplier === 2 || last?.kind === 'innerBull')

export const recordDart = (state: MatchState, dart: RecordedDart, format: MatchFormat = DEFAULT_FORMAT): MatchState => {
  if (state.matchComplete) return state
  const side = state.activeSide; const visit = [...state.visit, dart]; const total = visit.reduce((sum, item) => sum + item.region.score, 0); const remaining = state.visitStartScore - total; const bust = remaining < 0 || remaining === 1 || (remaining === 0 && !isCheckout(remaining, dart.region, format)); const checkout = !bust && isCheckout(remaining, dart.region, format); const shouldEnd = bust || checkout || visit.length >= 3
  let next = withScore({ ...state, visit, lastVisitTotal: total, lastVisitBust: bust, message: bust ? 'BUST — VISIT RESET' : checkout ? 'LEG WON' : 'LOCK VERTICAL AIM' }, side, bust ? state.visitStartScore : remaining)
  if (!shouldEnd) return next
  const isScoringVisit = state.visitStartScore > 100 && !checkout && !bust
  const stats = { ...state.stats, darts: state.stats.darts + visit.length, visits: state.stats.visits + 1, totalScore: state.stats.totalScore + (bust ? 0 : total), firstNineScore: state.stats.firstNineScore + (state.stats.visits < 3 && !bust ? total : 0), checkoutAttempts: state.stats.checkoutAttempts + (state.visitStartScore <= 170 ? 1 : 0), checkoutHits: state.stats.checkoutHits + (checkout ? 1 : 0), highestCheckout: Math.max(state.stats.highestCheckout, checkout ? state.visitStartScore : 0), scores100: state.stats.scores100 + (!bust && total >= 100 ? 1 : 0), scores140: state.stats.scores140 + (!bust && total >= 140 ? 1 : 0), scores180: state.stats.scores180 + (!bust && total === 180 ? 1 : 0), doublesHit: state.stats.doublesHit + visit.filter((item) => item.region.multiplier === 2).length, doublesAttempted: state.stats.doublesAttempted + visit.filter((item) => item.region.kind === 'double' || (state.visitStartScore <= 170 && item === visit[visit.length - 1])).length, treblelessVisits: state.stats.treblelessVisits + (isScoringVisit && !visit.some((item) => item.region.kind === 'treble') ? 1 : 0) }
  const history = [...state.history, ...visit];
  if (checkout) {
    const playerLegs = side === 'player' ? state.playerLegs + 1 : state.playerLegs; const aiLegs = side === 'ai' ? state.aiLegs + 1 : state.aiLegs; const setWon = playerLegs >= format.legsToWinSet || aiLegs >= format.legsToWinSet; const playerSets = playerLegs >= format.legsToWinSet ? state.playerSets + 1 : state.playerSets; const aiSets = aiLegs >= format.legsToWinSet ? state.aiSets + 1 : state.aiSets; const matchComplete = playerSets >= format.setsToWinMatch || aiSets >= format.setsToWinMatch; return { ...next, playerScore: format.startingScore, aiScore: format.startingScore, playerLegs: setWon ? 0 : playerLegs, aiLegs: setWon ? 0 : aiLegs, playerSets, aiSets, activeSide: side === 'player' ? 'ai' : 'player', visitStartScore: format.startingScore, visit: [], lastCheckout: state.visitStartScore, history, stats, matchComplete, message: matchComplete ? 'MATCH COMPLETE' : 'LEG COMPLETE' }
  }
  return { ...next, activeSide: side === 'player' ? 'ai' : 'player', visitStartScore: scoreFor(next, side === 'player' ? 'ai' : 'player'), visit: [], history, stats, message: bust ? 'BUST — VISIT RESET' : 'NEXT TURN' }
}
