import { useCallback, useEffect, useMemo, useState } from 'react'
import data from './data/units.json'
import Picker from './components/Picker.jsx'
import { article, formatResult, unitLabel } from './format.js'

const CATS = data.categories
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const catById = (id) => CATS.find((c) => c.id === id) || CATS[0]

// A fresh absurd question: random category, two different units.
function roll(catId) {
  const cat = catId ? catById(catId) : pick(CATS)
  const huh = pick(cat.units)
  const what = pick(cat.units.filter((u) => u.id !== huh.id))
  return { cat: cat.id, huh: huh.id, what: what.id }
}

const FALLBACK = { cat: 'length', huh: 'spermwhale', what: 'hotdog' }

function fromUrl() {
  if (typeof window === 'undefined') return FALLBACK
  const p = new URLSearchParams(window.location.search)
  if (!p.get('h') && !p.get('c')) return FALLBACK
  const cat = catById(p.get('c'))
  const has = (id) => cat.units.some((u) => u.id === id)
  const h = p.get('h')
  const w = p.get('w')
  return {
    cat: cat.id,
    huh: has(h) ? h : cat.units[0].id,
    what: has(w) ? w : cat.units[1].id,
  }
}

export default function App() {
  const [state, setState] = useState(fromUrl)
  const [toast, setToast] = useState('')
  const [spin, setSpin] = useState(0)

  const cat = catById(state.cat)
  const units = cat.units
  const huhIndex = Math.max(0, units.findIndex((u) => u.id === state.huh))
  const whatIndex = Math.max(0, units.findIndex((u) => u.id === state.what))
  const huh = units[huhIndex]
  const what = units[whatIndex]

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return ''
    const p = new URLSearchParams({ c: cat.id, h: huh.id, w: what.id })
    return `${window.location.origin}${window.location.pathname}?${p}`
  }, [cat.id, huh.id, what.id])

  useEffect(() => {
    if (shareUrl) window.history.replaceState(null, '', shareUrl)
  }, [shareUrl])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 2200)
    return () => clearTimeout(t)
  }, [toast])

  const ratio = huh.v / what.v
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
        {CATS.map((c) => (
          <button
            key={c.id}
            className={'cat' + (c.id === cat.id ? ' on' : '')}
            onClick={() => c.id !== cat.id && setState(roll(c.id))}
          >
            <span aria-hidden="true">{c.emoji}</span> {c.label}
          </button>
        ))}
      </nav>

      <section className="field huh">
        <div className="row">
          <span className="lab">Huh?</span>
          <span className="swipehint">swipe ›</span>
        </div>
        <Picker
          items={units}
          index={huhIndex}
          label="Huh"
          onIndex={(i) => setState((s) => ({ ...s, huh: units[i].id }))}
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
          items={units}
          index={whatIndex}
          label="What"
          onIndex={(i) => setState((s) => ({ ...s, what: units[i].id }))}
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
        <p className="foot">{cat.line}</p>
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
