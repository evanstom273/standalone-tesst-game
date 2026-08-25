import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

function App() {
  return (
    <main className="app-shell">
      <section className="welcome-card" aria-labelledby="welcome-title">
        <span className="eyebrow">React · Vite · TypeScript</span>
        <h1 id="welcome-title">Your standalone project is ready.</h1>
        <p>
          Start building your game here. The development server provides fast
          feedback, while TypeScript keeps the application logic predictable.
        </p>
        <div className="status-pill" role="status">
          <span className="status-dot" aria-hidden="true" />
          Project initialized
        </div>
      </section>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
