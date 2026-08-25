import type { BoardPoint } from './dartboardGeometry'
export type ThrowPhase = 'vertical' | 'horizontal' | 'accuracy' | 'resolving' | 'result'
export interface SkillProfile { scanSpeed: number; wobble: number; accuracy: number; variance: number }
export interface ThrowResult { intendedTarget: BoardPoint; lockedX: number; lockedY: number; accuracy: number; finalPoint: BoardPoint }
export const pingPong = (time: number, speed: number) => (Math.sin(time * speed) + 1) / 2
export const smoothWobble = (time: number, amplitude: number, phase = 0) => Math.sin(time * 1.7 + phase) * amplitude + Math.sin(time * .71 + phase * 1.7) * amplitude * .35
export const scanPosition = (time: number, skill: SkillProfile, phase: 'x' | 'y') => Math.max(0, Math.min(1, pingPong(time, skill.scanSpeed) + smoothWobble(time, skill.wobble, phase === 'x' ? 1.2 : .4) / 600))
export const accuracyError = (accuracy: number, skill: SkillProfile) => { const quality = Math.max(0, Math.min(1, 1 - Math.abs(accuracy - .5) * 2)); return (1 - Math.pow(quality, 1.15) * skill.accuracy) * skill.variance }
export const finalImpact = (target: BoardPoint, accuracy: number, skill: SkillProfile, time: number): ThrowResult => { const error = accuracyError(accuracy, skill); const angle = time * .37; return { intendedTarget: target, lockedX: target.x, lockedY: target.y, accuracy, finalPoint: { x: target.x + Math.cos(angle) * error + smoothWobble(time, skill.wobble, 1.2), y: target.y + Math.sin(angle) * error + smoothWobble(time, skill.wobble, .4) } } }
