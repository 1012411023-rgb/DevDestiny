import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="DevDestiny illustration" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>DevDestiny Dashboard</h1>
          <p>
            Inspect and monitor visual quality with a fast React + Vite frontend connected to your Flask backend.
          </p>
          <button className="counter" onClick={() => setCount((count) => count + 1)}>
            Count is {count}
          </button>
        </div>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <h2>Next steps</h2>
          <p>Customize the dashboard, wire the backend API, and display quality inspection insights in the UI.</p>
        </div>
        <div>
          <h2>Local development</h2>
          <p>Run <code>npm run dev</code> and edit <code>src/App.jsx</code> to update app behavior immediately.</p>
        </div>
      </section>
    </>
  )
}

export default App
