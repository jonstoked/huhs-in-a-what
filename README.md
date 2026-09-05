# Huhs in a What?

Absurd unit conversions for length, volume and weight. How many hot dogs long is a
sperm whale? How many sticks of Juicy Fruit is it from Kansas City to St. Louis?
How many chicken nuggets is the Moon?

- **Huh?** and **What?** are swipe strips — flick left/right (or drag with a mouse,
  or use the arrow keys) to pick a unit. Tap a neighbouring card to jump to it.
- 🎲 rolls a fresh question: random metric, two random units.
- Opens on Tilda the dog (65 lb GSP mix) against a random opponent.
- ⇅ flips the question around, 🔗 shares the current one.
- The whole state lives in the URL (`?c=length&h=spermwhale&w=hotdog`), so links are shareable.

## Data

All units live in [`src/data/units.json`](src/data/units.json) — no database, no API.
There is one roster of 75 things, and every one of them carries all three
measurements: `length` in meters, `volume` in liters, `weight` in kilograms. That is
why switching Length → Volume → Weight keeps whatever you had selected — the metric
tabs just change which number gets divided.

Conventions, such as they are: length is the object's longest dimension, containers
are measured full (a bathtub is its water, a keg is its beer), and hollow things are
measured hollow. Units that only make sense as a distance (Kansas City to St. Louis,
a trip to the Moon) are gone, since they have no honest weight.

The list is sorted alphabetically at load, so if you remember a unit you like you can
swipe toward where it lives. `id` values are what share links point at, so keep them
stable when editing.

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
