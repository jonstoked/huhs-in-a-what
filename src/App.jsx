import { useCallback, useEffect, useMemo, useState } from 'react'
import data from './data/units.json'
import Picker from './components/Picker.jsx'
import { article, formatResult, unitLabel } from './format.js'

const METRICS = data.metrics
// One roster, three measurements each — so switching metric keeps your units.
const UNITS = [...data.units].sort((a, b) =>
  a.name.localeCompare(b.name, 'en', { sensitivity: 'base' })
)

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const metricById = (id) => METRICS.find((m) => m.id === id) || METRICS[0]
const otherThan = (id) => pick(UNITS.filter((u) => u.id !== id))

function roll() {
  const huh = pick(UNITS)
  return { metric: pick(METRICS).id, huh: huh.id, what: otherThan(huh.id).id }
}

// Tilda opens the show; her opponent is a different surprise every time.
function openingQuestion() {
  const huh = UNITS.some((u) => u.id === 'tilda') ? 'tilda' : UNITS[0].id
  return { metric: pick(METRICS).id, huh, what: otherThan(huh).id }
}

function fromUrl() {
  if (typeof window === 'undefined') return openingQuestion()
  const p = new URLSearchParams(window.location.search)
  if (!p.get('h') && !p.get('c')) return openingQuestion()
  const has = (id) => UNITS.some((u) => u.id === id)
  const huh = has(p.get('h')) ? p.get('h') : 'tilda'
  return {
    metric: metricById(p.get('c')).id,
    huh,
    what: has(p.get('w')) && p.get('w') !== huh ? p.get('w') : otherThan(huh).id,
  }
}

export default function App() {
  const [state, setState] = useState(fromUrl)
  const [toast, setToast] = useState('')
  const [spin, setSpin] = useState(0)

  const metric = metricById(state.metric)
  const huhIndex = Math.max(0, UNITS.findIndex((u) => u.id === state.huh))
  const whatIndex = Math.max(0, UNITS.findIndex((u) => u.id === state.what))
  const huh = UNITS[huhIndex]
  const what = UNITS[whatIndex]

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return ''
    const p = new URLSearchParams({ c: metric.id, h: huh.id, w: what.id })
    return `${window.location.origin}${window.location.pathname}?${p}`
  }, [metric.id, huh.id, what.id])

  useEffect(() => {
    if (shareUrl) window.history.replaceState(null, '', shareUrl)
  }, [shareUrl])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 2200)
    return () => clearTimeout(t)
  }, [toast])

  const ratio = huh[metric.id] / what[metric.id]
  const result = formatResult(ratio)
  const resultUnit = result.flipped
    ? `of ${article(what.name)} ${what.name}`
    : unitLabel(what, ratio === 1 ? 1 : 2)

  const shuffle = useCallback(() => {
    setSpin((s) => s + 1)
    setState(roll())
  }, [])

  const share = async () => {
    const text = `1 ${huh.name} = ${result.text} ${resultUnit}`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Huhs in a What?', text, url: shareUrl })
        return
      }
      await navigator.clipboard.writeText(shareUrl)
      setToast('Link copied')
    } catch (err) {
      if (err && err.name === 'AbortError') return
      setToast(shareUrl)
    }
  }

  return (
    <div className="app">
      <header className="head">
        <h1>
          Huhs <span className="in">in a</span> What?
        </h1>
        <p className="tag">Absurd conversions, honestly calculated.</p>
      </header>

      <nav className="cats" aria-label="What are we measuring?">
        {METRICS.map((m) => (
          <button
            key={m.id}
            className={'cat' + (m.id === metric.id ? ' on' : '')}
            onClick={() => setState((s) => ({ ...s, metric: m.id }))}
          >
            <span aria-hidden="true">{m.emoji}</span> {m.label}
          </button>
        ))}
      </nav>

      <section className="field huh">
        <div className="row">
          <span className="lab">Huh?</span>
          <span className="swipehint">swipe ›</span>
        </div>
        <Picker
          items={UNITS}
          index={huhIndex}
          label="Huh"
          onIndex={(i) => setState((s) => ({ ...s, huh: UNITS[i].id }))}
        />
      </section>

      <div className="swapline">
        <button
          className="swap"
          onClick={() => setState((s) => ({ ...s, huh: s.what, what: s.huh }))}
          aria-label="Flip the question around"
          title="Flip it around"
        >
          ⇅
        </button>
      </div>

      <section className="field what">
        <div className="row">
          <span className="lab">What?</span>
          <span className="swipehint">swipe ›</span>
        </div>
        <Picker
          items={UNITS}
          index={whatIndex}
          label="What"
          onIndex={(i) => setState((s) => ({ ...s, what: UNITS[i].id }))}
        />
      </section>

      <section className="answer" aria-live="polite">
        <p className="q">
          1 {huh.emoji} {huh.name} is
        </p>
        <p className={'big' + (result.text.length > 11 ? ' long' : '')}>{result.text}</p>
        <p className="u">
          {what.emoji} {resultUnit}
        </p>
        <p className="foot">{metric.line}</p>
      </section>

      <div className="bar">
        <button className="share" onClick={share} aria-label="Share this conversion">
          🔗
        </button>
        <button
          key={spin}
          className="dice"
          onClick={shuffle}
          aria-label="Give me a different absurd question"
          title="Ask me something else"
        >
          🎲
        </button>
        <span className="barhint">Ask me something else</span>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
