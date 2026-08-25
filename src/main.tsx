import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

const sectors = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5]
const quickScores = [60, 57, 54, 51, 50, 48]

function Dartboard() {
  return (
    <section className="board-stage" aria-label="Dartboard">
      <div className="board-shadow" />
      <div className="dartboard">
        <div className="board-number-ring">
          {sectors.map((sector, index) => (
            <span key={sector} style={{ transform: `rotate(${index * 18}deg)` }}>
              <b style={{ transform: `rotate(${-index * 18}deg)` }}>{sector}</b>
            </span>
          ))}
        </div>
        <div className="board-face">
          <div className="double-ring" />
          <div className="triple-ring" />
          <div className="bull-outer" />
          <div className="bull-inner" />
          <div className="wire wire-vertical" />
          <div className="wire wire-horizontal" />
          {Array.from({ length: 10 }, (_, index) => (
            <div key={index} className="spoke" style={{ transform: `rotate(${index * 18}deg)` }} />
          ))}
        </div>
      </div>
      <div className="board-caption"><span>WINMAU</span><small>PROFESSIONAL</small></div>
    </section>
  )
}

function Scoreboard() {
  const [active, setActive] = useState(0)
  const [legs, setLegs] = useState([2, 1])
  const [scores, setScores] = useState([301, 347])

  const addScore = (points: number) => {
    setScores((current) => current.map((score, index) => index === active ? Math.max(0, score - points) : score))
    setActive((current) => (current + 1) % 2)
  }

  return (
    <section className="scoreboard-shell" aria-label="Match scoreboard">
      <div className="scoreboard-topline"><span className="live-dot" /> LIVE MATCH <span className="topline-divider" /> ROUND 1 · FIRST TO 3</div>
      <div className="players-header"><span>PLAYER</span><span>LEGS</span><span>REMAINING</span></div>
      <button className={`player-row ${active === 0 ? 'is-active' : ''}`} onClick={() => setActive(0)}>
        <span className="player-name"><i /> ANDERSON <em>🏴</em></span><strong>{legs[0]}</strong><b>{scores[0]}</b>
      </button>
      <button className={`player-row ${active === 1 ? 'is-active' : ''}`} onClick={() => setActive(1)}>
        <span className="player-name">ZONNEVELD <em>🇳🇱</em></span><strong>{legs[1]}</strong><b>{scores[1]}</b>
      </button>
      <div className="scoreboard-footer"><span>2026 WINMAU WORLD MASTERS</span><span className="sets">SETS <b>0</b> <i /> LEGS <b>{legs[0] + legs[1]}</b></span></div>
      <div className="checkout-panel">
        <div className="checkout-heading"><span>QUICK SCORE</span><small>TURN: {active === 0 ? 'ANDERSON' : 'ZONNEVELD'}</small></div>
        <div className="quick-score-grid">{quickScores.map((score) => <button key={score} onClick={() => addScore(score)}>{score}</button>)}</div>
        <div className="checkout-row"><span>CHECKOUT</span><b>{scores[active] <= 170 ? scores[active] : '—'}</b><button onClick={() => setLegs((current) => current.map((leg, index) => index === active ? leg + 1 : leg))}>WIN LEG</button></div>
      </div>
    </section>
  )
}

function App() {
  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="brand-mark"><span>501</span><small>DARTS</small></div>
        <div><p className="event-kicker">PROFESSIONAL DARTS CORPORATION</p><h1>THE BIG STAGE</h1></div>
        <div className="match-meta"><span className="live-pill">● LIVE</span><span>LEG 4 · 01:42</span></div>
      </header>
      <div className="game-layout"><Scoreboard /><Dartboard /></div>
      <footer className="app-footer"><span>STANDALONE TEST GAME</span><span>BEST OF 5 LEGS <i /> DOUBLE OUT</span></footer>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
