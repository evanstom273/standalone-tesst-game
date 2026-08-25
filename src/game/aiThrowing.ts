import { polarPoint, scorePoint, type BoardPoint, type ScoringRegion } from './dartboardGeometry'
import { finalImpact, type SkillProfile, type ThrowResult } from './throwMechanic'
export interface AiProfile extends SkillProfile { name: string }
export const normalSample = (mean = 0, deviation = 1) => { const u = 1 - Math.random(); const v = 1 - Math.random(); return mean + deviation * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) }
export const chooseAiTarget = (remaining: number): BoardPoint => { if (remaining <= 50 && remaining % 2 === 0) return polarPoint(238, 20 * 18); if (remaining <= 170 && remaining >= 40) return polarPoint(158, remaining > 100 ? 0 : 19 * 18); return polarPoint(158, 0) }
export const simulateAiThrow = (lockedIntersection: BoardPoint, skill: AiProfile, time: number, accuracy = .5 + normalSample(0, .15)): { result: ThrowResult; region: ScoringRegion } => { const result = finalImpact(lockedIntersection, accuracy, skill, time); return { result, region: scorePoint(result.finalPoint) } }
