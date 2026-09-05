# Huhs in a What?

Absurd unit conversions for length, volume and weight. How many hot dogs long is a
sperm whale? How many sticks of Juicy Fruit is it from Kansas City to St. Louis?
How many chicken nuggets is the Moon?

- **Huh?** and **What?** are swipe strips — flick left/right (or drag with a mouse,
  or use the arrow keys) to pick a unit. Tap a neighbouring card to jump to it.
- 🎲 rolls a fresh question: random category, two random units.
- ⇅ flips the question around, 🔗 shares the current one.
- The whole state lives in the URL (`?c=length&h=spermwhale&w=hotdog`), so links are shareable.

## Data

All units live in [`src/data/units.json`](src/data/units.json) — no database, no API.
Each category holds a flat `units` list, and every unit is stored as `v`, its size in
that category's base unit (meters, liters, kilograms). Adding a unit is one JSON
object; `id` values are what share links point at, so keep them stable.

Nothing in here is a sensible unit of measure. That is the point.

## Local

```bash
npm install
npm run dev
```

## Deploy (Vercel)

```bash
npx vercel --prod
```

Zero config beyond `vercel.json`: Vite build, `dist/` output, everything rewritten to
`/` so a shared link with query params always resolves.
