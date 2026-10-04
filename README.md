# Westward

A 40-minute classroom game about westward expansion (1849 to 1854), built for
Unit 4, Lesson 1 of 9th-grade US History. Four groups each play a different
family on the same journey, then compare endings in the "Who Decided?" ledger.

**Status: playable draft.** Every screen works from start to finish in a low-poly
3D diorama style (matching the Lowell mill game). Text is still marked DRAFT
until every fact is verified (see `research/`).

## Play it

- **Online:** turn on GitHub Pages for this repo (Settings, Pages, deploy from the branch, root folder).
- **Offline:** download the repo and double-click `index.html`. No server needed.

## For the teacher

| Want to... | Do this |
|---|---|
| Change wording on a card | Edit `data/cards.js`. Each card is a block of plain text fields. |
| Change families, money, start dates | `data/families.js` |
| Change stops, order, or pacing targets | `data/route.js` |
| Change store prices | `data/stores.js` |
| Change endings and the ledger | `data/endings.js` |
| Change diary quotes and the poster | `data/landmarks.js` |
| Change timing, death limit, travel speed | `data/config.js` |
| Change how a place looks (trees, rivers, forts, colors, light) | `data/scenes.js` |
| Add the title painting (Gast, *American Progress*) | Put the image in `assets/` and set `titleImage` in `data/config.js` |

Keep text free of em dashes (project style rule). `node tools/playtest.js` checks this.

### Teacher panel

Press **Ctrl+Shift+T** (or open `index.html?teacher`). It shows the seed and the
group's clock, and lets you jump to any stop, restart with the same seed, or
pretend the group is 5 minutes behind (to test the soft timer).

`index.html?seed=1234` replays the same luck, which helps when a group reports a problem.

### In class

- One laptop per group of four. Each student claims a job: Navigator, Quartermaster, Journal keeper, Family doctor.
- The card on screen says whose turn it is at the mouse, and when the group must vote.
- Number keys pick choices; Enter continues. Progress saves automatically if the page is refreshed.
- **Soft timer:** optional stops are skipped automatically when a group falls behind, so every group reaches the ending by minute 40.

## How it is built

Plain HTML, CSS, and JavaScript, with no build step.

- `js/engine.js` holds the rules and state (no browser code, so it can be tested in Node).
- `js/diorama.js` is the low-poly 3D world (Three.js, flat shaded, isometric camera). Each
  place is a diorama slab built from `data/scenes.js`; the next one slides in under the
  wagon as the group travels. The ox team walks, wheels turn, the family walks beside the
  wagon (members who die are no longer there), cloud shadows drift, dust rises, smoke curls
  from chimneys and fires, water moves, and rain or snow falls. On a slow computer it drops
  shadows and resolution automatically.
- `js/scene.js` is a simple 2D fallback for computers without WebGL.
- `js/ui.js` holds the screens and the teacher panel.
- Content lives in `data/*.js` (plain data files, so the game works when opened from disk).
- `js/vendor/three.min.js` is Three.js r149 (MIT), included so the game also runs offline.

## Tests

```sh
node tools/playtest.js          # 1,200 simulated runs: every family reaches an ending, content checks, no em dashes
node tools/browser-test.js      # plays every family in Chromium at Chromebook size and saves screenshots (needs Playwright)
```
