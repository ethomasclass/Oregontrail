# Westward painting guide

Every scene in Westward is painted with claude-paint, a physical oil-paint
simulator, so the whole game reads as one series of 19th-century oil paintings.
The engine's full manual is `tools/paint/claude-paint/notes/easel_guide.md`; the
technique notes in `tools/paint/claude-paint/notes/lab/*.md` (especially `sky.md`)
are worth reading before painting.

## The look

- **Trail scenes (Missouri to Oregon, and the voyage):** idealized American Romantic
  landscape in the spirit of Albert Bierstadt, Thomas Moran, and the Hudson River
  School. Golden-hour light, big luminous skies (often 60 to 70 percent of the
  height), glowing haze, distant blue mountains, a sense of promise. This is how
  the West was advertised.
- **California scenes (gold fields, rancho, desert):** the paintings turn honest.
  Grayer light, churned mud, cut stumps, muddied water, crowded tents, less glow.
  Same hand and materials, colder truth.
- Never draw people as targets, and never depict violence. People, if any, are
  small, distant, and dignified. Native peoples appear as communities (lodges,
  horses, smoke from a camp), never as threats.
- No text, no frames, no modern objects.

## Format

- Canvas: `canvas{style="friedrich", aspect=2.4, size=900, seed=<n>}` (1000 x 417 units).
  The "friedrich" box has no green tubes: mix greens from yellow ochre with cobalt,
  pale smalt, or bone black, the way period painters did.
- Palettes (define in `00-canvas.lua`, as in `scenes/prairie/`):
  `skypal = pal:only{"lead white","pale smalt","cobalt blue","yellow ochre","raw umber","red earth","chrome yellow"}`
  `landpal = pal:only{"lead white","yellow ochre","raw umber","red earth","chrome yellow","pale smalt","cobalt blue","bone black"}`
- Composition bands (the game shows the wagon standing on the near layer, about
  y = 375 to 395, near the lower-left third of the screen):
  - sky: everything, painted first
  - far: crest around y = 240 to 290 (mountains can rise higher)
  - mid: crest around y = 285 to 330
  - near: crest around y = 345 to 365; this is the ground the wagon stands on.
    Keep the near band fairly quiet where the wagon stands (x = 150 to 500).
- Leave the center-top of the sky calmer; the game prints the place name there.

## How a scene is built

A scene is a folder `tools/paint/scenes/<name>/` with Lua files run in name order:

| file | layer | rule |
|---|---|---|
| `00-canvas.lua` | (setup) | canvas, palettes, shared numbers like `HZ` and `SUNX` |
| `10-sky.lua` | sky | paint the whole sky and a little below the horizon |
| `20-far.lua` | far | everything from its crest **down to the bottom edge** |
| `30-mid.lua` | mid | same: from its crest down to the bottom edge |
| `40-near.lua` | near | same |

Each layer must be painted all the way down to the bottom edge (use
`below(crest)` masks): the game slides layers at different speeds, and a layer
that stops short leaves a gap. The renderer cuts each layer out by where its
paint changed the canvas, column by column, from its top edge down.

End every layer file except the last with `wait(24*60)`, so the next layer
goes over set paint and does not pick up the wet layer below it (that makes
chalky, muddy passages).

Shared helpers `curve(pts)` and `ridge(pts, amp, period, seed)` are in
`scenes/_common.lua`; global names set in one file are visible to later files.

## Technique that works

- Sky: one sitting of thin horizontal bands, `hand="broad"`, a `color=` function
  built from `gradient{...}` plus a glow term, `coverage` about 4.5, `fill=true`,
  `medium` 0.35, then a level `blend`. Thin coverage lets the toned ground show
  as red specks.
- Clouds: masses from noise masks laid into the wet sky, unclipped, `hug=false`,
  long strokes, lit undersides only toward the light, then blend the tops away.
  See `scenes/prairie/10-sky.lua`.
- Land: `hand="body"`, `clip=true`, `fill=true` (gaps show as pale specks in the game), `color=` functions that darken and cool with
  depth (aerial perspective: far is bluer and lighter, near is darker and warmer).
  Coverage 3.5 to 4.5, `medium` around 0.15.
- Details (a fort wall, a tent, a rock spire): build masks with `poly`, `outline`,
  `ellipse`, `rect`, and paint them in the layer they stand in, after that
  layer's ground. Keep them simple and painterly; suggest, do not draw.
- Light: decide where the sun is (`SUNX`) and keep every layer consistent with it.

## Rendering

From the repository root:

```sh
tools/paint/render.sh --preview <scene>      # 800 px wide, about 1.5 minutes
tools/paint/render.sh --width=2000 <scene>   # final, a few minutes
```

Look at `tools/paint/work/<scene>/NN-<layer>.png` (the last one is the whole
painting) and iterate. Only re-run what changed; unchanged stages are cached.
Output goes to `assets/art/<scene>/{sky,far,mid,near,full}.webp`.
