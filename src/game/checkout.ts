export interface CheckoutDart { label: string; value: number; finish: boolean }
export type CheckoutRoute = CheckoutDart[]

const scoringDarts: CheckoutDart[] = [
  ...Array.from({ length: 20 }, (_, i) => ({ label: 'T' + (i + 1), value: (i + 1) * 3, finish: false })),
  ...Array.from({ length: 20 }, (_, i) => ({ label: 'S' + (i + 1), value: i + 1, finish: false })),
  { label: '25', value: 25, finish: false }, { label: 'BULL', value: 50, finish: false },
]
const finishingDarts: CheckoutDart[] = [
  ...Array.from({ length: 20 }, (_, i) => ({ label: 'D' + (i + 1), value: (i + 1) * 2, finish: true })),
  { label: 'BULL', value: 50, finish: true },
]

export const getCheckoutRoute = (remainingScore: number, dartsRemaining: number, doubleOut = true): CheckoutRoute | null => {
  if (remainingScore < 2 || dartsRemaining < 1 || remainingScore > 170) return null
  const finishers = doubleOut ? finishingDarts : [...finishingDarts, { label: 'S' + remainingScore, value: remainingScore, finish: true }]
  for (const last of finishers) if (last.value === remainingScore) return [last]
  if (dartsRemaining < 2) return null
  for (const first of scoringDarts) for (const last of finishers) if (first.value + last.value === remainingScore) return [first, last]
  if (dartsRemaining < 3) return null
  for (const first of scoringDarts) for (const second of scoringDarts) for (const last of finishers) if (first.value + second.value + last.value === remainingScore) return [first, second, last]
  return null
}
