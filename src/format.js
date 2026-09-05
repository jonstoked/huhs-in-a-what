const BIG = [
  [1e33, 'decillion'],
  [1e30, 'nonillion'],
  [1e27, 'octillion'],
  [1e24, 'septillion'],
  [1e21, 'sextillion'],
  [1e18, 'quintillion'],
  [1e15, 'quadrillion'],
  [1e12, 'trillion'],
  [1e9, 'billion'],
  [1e6, 'million'],
]

const group = (n, maxFrac) =>
  n.toLocaleString('en-US', { maximumFractionDigits: maxFrac })

// A readable, human-sized rendering of any positive number.
export function pretty(n) {
  if (!isFinite(n) || n <= 0) return '0'
  if (n >= 1e36) {
    const exp = Math.floor(Math.log10(n))
    return `${(n / 10 ** exp).toFixed(1)} × 10^${exp}`
  }
  for (const [size, word] of BIG) {
    if (n >= size) {
      const scaled = n / size
      return `${group(scaled, scaled < 10 ? 2 : scaled < 100 ? 1 : 0)} ${word}`
    }
  }
  if (n >= 1000) return group(Math.round(n), 0)
  if (n >= 100) return group(n, 1)
  if (n >= 10) return group(n, 2)
  if (n >= 1) return group(n, 2)
  return group(n, 3)
}

// The headline result. Tiny answers read better upside down:
// "1 ⁄ 4,300 of a school bus" beats "0.000232 school buses".
export function formatResult(n) {
  if (!isFinite(n) || n <= 0) return { text: '0', flipped: false }
  if (n < 0.02) {
    const denom = 1 / n
    return { text: `1 ⁄ ${pretty(denom < 1e6 ? Math.round(denom) : denom)}`, flipped: true }
  }
  return { text: pretty(n), flipped: false }
}

export function unitLabel(unit, qty) {
  return qty === 1 ? unit.name : unit.plural
}

export function article(name) {
  return /^[aeiou]/i.test(name) ? 'an' : 'a'
}
