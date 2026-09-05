import { useCallback, useEffect, useRef } from 'react'

const IDLE = 170 // ms of quiet before we consider a swipe finished

// A swipe-to-choose strip. Native scroll-snap does the physics on touch;
// pointer drag is bolted on so a mouse can fling it too.
export default function Picker({ items, index, onIndex, label }) {
  const trackRef = useRef(null)
  const touching = useRef(false)
  const lastScroll = useRef(0)
  const programmaticUntil = useRef(0)
  const retry = useRef(0)
  const drag = useRef(null)
  const prevItems = useRef(null)

  const nearestIndex = useCallback(() => {
    const el = trackRef.current
    if (!el) return 0
    const mid = el.scrollLeft + el.clientWidth / 2
    let best = 0
    let bestDist = Infinity
    for (let i = 0; i < el.children.length; i++) {
      const c = el.children[i]
      const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid)
      if (d < bestDist) {
        bestDist = d
        best = i
      }
    }
    return best
  }, [])

  const busy = () => touching.current || Date.now() - lastScroll.current < IDLE

  // Park the strip on the selected card, but never while a finger is on it.
  const settle = useCallback((i, behavior) => {
    clearTimeout(retry.current)
    if (busy()) {
      retry.current = setTimeout(() => settle(i, behavior), IDLE)
      return
    }
    const el = trackRef.current
    const child = el && el.children[i]
    if (!child) return
    const left = child.offsetLeft + child.offsetWidth / 2 - el.clientWidth / 2
    if (Math.abs(el.scrollLeft - left) < 2) return
    programmaticUntil.current = Date.now() + (behavior === 'smooth' ? 650 : 120)
    el.scrollTo({ left, behavior })
    if (behavior === 'smooth') {
      // If the animation gets eaten (a re-snap, a backgrounded tab), land it anyway.
      clearTimeout(retry.current)
      retry.current = setTimeout(() => {
        if (!busy() && Math.abs(el.scrollLeft - left) > 4) el.scrollTo({ left, behavior: 'auto' })
      }, 700)
    }
  }, [])

  useEffect(() => {
    const first = prevItems.current === null
    const swapped = prevItems.current !== items
    prevItems.current = items
    settle(index, first || swapped ? 'auto' : 'smooth')
    if (first) {
      // Late-loading fonts can re-snap the strip out from under us.
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => settle(index, 'auto'))
      }
    }
  }, [index, items, settle])

  useEffect(() => {
    const onResize = () => settle(index, 'auto')
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      clearTimeout(retry.current)
    }
  }, [index, settle])

  const onScroll = () => {
    if (Date.now() < programmaticUntil.current) return
    lastScroll.current = Date.now()
    const i = nearestIndex()
    if (i !== index) onIndex(i)
  }

  const takeOver = () => {
    programmaticUntil.current = 0
    lastScroll.current = Date.now()
  }

  const onPointerDown = (e) => {
    touching.current = true
    takeOver()
    if (e.pointerType === 'touch') return
    const el = trackRef.current
    drag.current = { x: e.clientX, left: el.scrollLeft, moved: 0 }
    el.style.scrollSnapType = 'none'
    el.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e) => {
    if (!drag.current) return
    const el = trackRef.current
    const dx = e.clientX - drag.current.x
    drag.current.moved = Math.max(drag.current.moved, Math.abs(dx))
    el.scrollLeft = drag.current.left - dx
  }

  const endPointer = () => {
    touching.current = false
    if (!drag.current) return
    const el = trackRef.current
    el.style.scrollSnapType = ''
    const i = nearestIndex()
    lastScroll.current = 0
    if (i !== index) onIndex(i)
    else settle(index, 'smooth')
    setTimeout(() => (drag.current = null), 0)
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      onIndex(Math.min(items.length - 1, index + 1))
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      onIndex(Math.max(0, index - 1))
    }
  }

  return (
    <div className="picker">
      <div
        className="track"
        ref={trackRef}
        role="listbox"
        aria-label={label}
        tabIndex={0}
        onScroll={onScroll}
        onTouchStart={takeOver}
        onTouchEnd={() => (touching.current = false)}
        onWheel={takeOver}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
      >
        {items.map((u, i) => (
          <div
            key={u.id}
            className={'card' + (i === index ? ' is-on' : '')}
            role="option"
            aria-selected={i === index}
            onClick={() => {
              if (drag.current && drag.current.moved > 6) return
              onIndex(i)
            }}
          >
            <span className="card-emoji">{u.emoji}</span>
            <span className="card-name">{u.name}</span>
            <span className="card-note">{u.note}</span>
          </div>
        ))}
      </div>
      <div className="dots" aria-hidden="true">
        {items.map((u, i) => (
          <span key={u.id} className={'dot' + (i === index ? ' on' : '')} />
        ))}
      </div>
    </div>
  )
}
