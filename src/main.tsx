import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

const SECTORS = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5]
const QUICK_SCORES = [60, 57, 54, 51, 50, 48]
const CX = 300
const CY = 300
const BOARD_RADIUS = 273
const DOUBLE_INNER = 227
const DOUBLE_OUTER = 247
const TREBLE_INNER = 148
const TREBLE_OUTER = 168
const OUTER_BULL = 49
const INNER_BULL = 19

type ScoringRegion = { label: string; score: number; multiplier: number }

const polarPoint = (radius: number, angle: number) => {
  const radians = (angle * Math.PI) / 180
  return { x: CX + radius * Math.sin(radians), y: CY - radius * Math.cos(radians) }
}

const annularSectorPath = (innerRadius: number, outerRadius: number, startAngle: number, endAngle: number) => {
  const outerStart = polarPoint(outerRadius, startAngle)
  const outerEnd = polarPoint(outerRadius, endAngle)
  const innerEnd = polarPoint(innerRadius, endAngle)
  const innerStart = polarPoint(innerRadius, startAngle)
  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 0 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 0 0 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ')
}

const resolveRegion = (clientX: number, clientY: number, rect: DOMRect): ScoringRegion => {
  const scale = 600 / Math.min(rect.width, rect.height)
  const x = (clientX - rect.left - rect.width / 2) * scale + CX
  const y = (clientY - rect.top - rect.height / 2) * scale + CY
  const dx = x - CX
  const dy = y - CY
  const radius = Math.sqrt(dx * dx + dy * dy)
  const angle = (Math.atan2(dx, -dy) * 180) / Math.PI
  const clockwiseAngle = (angle + 360) % 360
  const sectorIndex = Math.floor((clockwiseAngle + 9) / 18) % 20
  const value = SECTORS[sectorIndex]

  if (radius <= INNER_BULL) return { label: 'INNER BULL', score: 50, multiplier: 1 }
  if (radius <= OUTER_BULL) return { label: 'OUTER BULL', score: 25, multiplier: 1 }
  if (radius <= TREBLE_INNER) return { label: `SINGLE ${value}`, score: value, multiplier: 1 }
  if (radius <= TREBLE_OUTER) return { label: `TREBLE ${value}`, score: value * 3, multiplier: 3 }
  if (radius <= DOUBLE_INNER) return { label: `SINGLE ${value}`, score: value, multiplier: 1 }
  if (radius <= DOUBLE_OUTER) return { label: `DOUBLE ${value}`, score: value * 2, multiplier: 2 }
  return { label: 'MISS', score: 0, multiplier: 0 }
}

function Dartboard() {
  const [lastThrow, setLastThrow] = useState<ScoringRegion>({ label: 'READY TO THROW', score: 0, multiplier: 0 })

  const handlePointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    setLastThrow(resolveRegion(event.clientX, event.clientY, event.currentTarget.getBoundingClientRect()))
  }

  return (
    <section className="board-stage" aria-label="Interactive dartboard">
      <div className="board-shadow" />
      <div className="dartboard-wrap">
        <svg className="dartboard-svg" viewBox="0 0 600 600" role="img" aria-label="20-sector dartboard" onPointerDown={handlePointerDown}>
          <circle cx={CX} cy={CY} r={BOARD_RADIUS} className="board-surround" />
          <circle cx={CX} cy={CY} r={DOUBLE_OUTER} className="board-face" />
          {SECTORS.map((value, index) => {
            const centreAngle = index * 18
            const startAngle = centreAngle - 9
            const endAngle = centreAngle + 9
            const dark = index % 2 === 1
            return (
              <g key={value}>
                <path d={annularSectorPath(OUTER_BULL, TREBLE_INNER, startAngle, endAngle)} className={dark ? 'single-dark' : 'single-light'} />
                <path d={annularSectorPath(TREBLE_INNER, TREBLE_OUTER, startAngle, endAngle)} className={dark ? 'ring-green' : 'ring-red'} />
                <path d={annularSectorPath(TREBLE_OUTER, DOUBLE_INNER, startAngle, endAngle)} className={dark ? 'single-dark' : 'single-light'} />
                <path d={annularSectorPath(DOUBLE_INNER, DOUBLE_OUTER, startAngle, endAngle)} className={dark ? 'ring-green' : 'ring-red'} />
                <line x1={CX} y1={CY - OUTER_BULL} x2={CX} y2={CY - DOUBLE_OUTER} className="sector-wire" transform={`rotate(${startAngle} ${CX} ${CY})`} />
                <text x={polarPoint(262, centreAngle).x} y={polarPoint(262, centreAngle).y} className="board-number" textAnchor="middle" dominantBaseline="middle">{value}</text>
              </g>
            )
          })}
          <circle cx={CX} cy={CY} r={OUTER_BULL} className="outer-bull" />
          <circle cx={CX} cy={CY} r={INNER_BULL} className="inner-bull" />
          <circle cx={CX} cy={CY} r={DOUBLE_INNER} className="ring-wire" />
          <circle cx={CX} cy={CY} r={DOUBLE_OUTER} className="ring-wire" />
          <circle cx={CX} cy={CY} r={TREBLE_INNER} className="ring-wire" />
          <circle cx={CX} cy={CY} r={TREBLE_OUTER} className="ring-wire" />
        </svg>
        <div className="board-caption"><span>WINMAU</span><small>PROFESSIONAL</small></div>
      </div>
      <div className="throw-result" aria-live="polite"><span>LAST THROW</span><b>{lastThrow.label}</b>{lastThrow.score > 0 && <em>{lastThrow.score}</em>}</div>
    </section>
  )
}

function Scoreboard() {
  const [active, setActive] = useState(0)
  const [legs, setLegs] = useState([2, 1])
  const [scores, setScores] = useState([301, 347])
  const addScore = (points: number) => { setScores((current) => current.map((score, index) => index === active ? Math.max(0, score - points) : score)); setActive((current) => (current + 1) % 2) }

  return (
    <section className="scoreboard-shell" aria-label="Match scoreboard">
      <div className="scoreboard-topline"><span className="live-dot" /> LIVE MATCH <span className="topline-divider" /> ROUND 1 · FIRST TO 3</div>
      <div className="players-header"><span>PLAYER</span><span>LEGS</span><span>REMAINING</span></div>
      <button className={`player-row ${active === 0 ? 'is-active' : ''}`} onClick={() => setActive(0)}><span className="player-name"><i /> ANDERSON <em>🏴</em></span><strong>{legs[0]}</strong><b>{scores[0]}</b></button>
      <button className={`player-row ${active === 1 ? 'is-active' : ''}`} onClick={() => setActive(1)}><span className="player-name">ZONNEVELD <em>🇳🇱</em></span><strong>{legs[1]}</strong><b>{scores[1]}</b></button>
      <div className="scoreboard-footer"><span>2026 WINMAU WORLD MASTERS</span><span className="sets">SETS <b>0</b> <i /> LEGS <b>{legs[0] + legs[1]}</b></span></div>
      <div className="checkout-panel"><div className="checkout-heading"><span>QUICK SCORE</span><small>TURN: {active === 0 ? 'ANDERSON' : 'ZONNEVELD'}</small></div><div className="quick-score-grid">{QUICK_SCORES.map((score) => <button key={score} onClick={() => addScore(score)}>{score}</button>)}</div><div className="checkout-row"><span>CHECKOUT</span><b>{scores[active] <= 170 ? scores[active] : '—'}</b><button onClick={() => setLegs((current) => current.map((leg, index) => index === active ? leg + 1 : leg))}>WIN LEG</button></div></div>
    </section>
  )
}

function App() {
  return <main className="app-shell"><header className="app-header"><div className="brand-mark"><span>501</span><small>DARTS</small></div><div><p className="event-kicker">PROFESSIONAL DARTS CORPORATION</p><h1>THE BIG STAGE</h1></div><div className="match-meta"><span className="live-pill">● LIVE</span><span>LEG 4 · 01:42</span></div></header><div className="game-layout"><Scoreboard /><Dartboard /></div><footer className="app-footer"><span>STANDALONE TEST GAME</span><span>BEST OF 5 LEGS <i /> DOUBLE OUT</span></footer></main>
}

createRoot(document.getElementById('root')!).render(<App />)
