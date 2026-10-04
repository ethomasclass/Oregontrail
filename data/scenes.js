// Westward: the diorama for each place, built in low-poly 3D by js/diorama.js.
//
// Each scene is a slab of land the wagon crosses. Colors are hex strings.
//   terrain  the kind of land, used to pick trail events (plains, river, mountains,
//            desert, valley, goldfields, sea, town)
//   sky      background color behind the diorama
//   ground   main ground color; ground2 is a second color for patches
//   soil     the cut edge of the slab
//   trail    the wagon road (null for no road, like the open sea)
//   light    "gold" (low warm sun), "day", "overcast", "dusk", or "night"
//   honest   true for the California scenes: grayer, harsher light
//   features a list of [kind, count, options]. Kinds:
//     grass, flowers, sage, rocks, cottonwood, oak, pine, stump, hills, bluffs,
//     peaks, river, sea, bison, cattle, tipis, tents, wagons, campfire,
//     town, fort, chimneyrock, indrock, sluices, rancho, fence, cabin,
//     ships, junks, wheel, skull, wreck (an abandoned wagon), fields,
//     people   { kinds: [...], act or acts: [...], side, x, z, spread, range, speed }
//              kinds: emigrant, emigrantwoman, emigrantchild, native, nativewoman,
//              kalapuya, kalapuyawoman, soldier, trader, townsman, townswoman, miner,
//              chineseminer, californio, vaquero, dockworker
//              acts: idle, talk, walk, work, pan, sit, wave, carry, dance
//              ring: place them in a circle of this radius around x, z (a campfire)
//     riders   people on horseback who ride back and forth
//     train    another family's wagon rolling along a road behind the trail
//   Options: side "back" or "front" of the trail, x (position along the
//   trail, 0 is where the wagon stops), and kind-specific settings.
window.WESTWARD = window.WESTWARD || {};

WESTWARD.scenes = {
  town: {
    terrain: "town", sky: "#efe4cc", ground: "#b7b07a", ground2: "#a59f6a", soil: "#8a6c4c", trail: "#c2a57c", light: "gold",
    features: [["town", 1, { x: -6 }], ["wagons", 5, { side: "front", x: 10 }], ["grass", 120], ["oak", 8, { side: "back" }], ["hills", 4], ["people", 5, { kinds: ["townsman", "townswoman", "emigrant", "emigrantchild"], act: "walk", side: "back", x: -6 }], ["people", 4, { kinds: ["emigrant", "emigrantwoman", "emigrant"], acts: ["carry", "talk", "idle"], side: "front", x: 10 }], ["people", 2, { kinds: ["trader", "townsman"], act: "talk", side: "front", x: -14 }]]
  },
  river: {
    terrain: "river", sky: "#e6e2d6", ground: "#92a06e", ground2: "#7f8f60", soil: "#7d6448", trail: "#c2a57c", light: "day", weather: "rain",
    features: [["river", 1, { x: -26, width: 26, color: "#6f8a86", current: 0.4, depth: 3 }], ["cottonwood", 16], ["grass", 120], ["hills", 3], ["rocks", 8], ["people", 3, { kinds: ["emigrant", "emigrantwoman", "emigrantchild"], acts: ["idle", "talk", "wave"], side: "front", x: 12 }], ["people", 2, { kinds: ["native", "nativewoman"], act: "talk", side: "back", x: 16 }]]
  },
  greenriver: {
    terrain: "river", sky: "#e9e6dc", ground: "#aaa77e", ground2: "#9b9870", soil: "#7d6a52", trail: "#c6b28e", light: "day",
    features: [["river", 1, { x: -24, width: 22, color: "#5f8fa6", current: 0.6, depth: 3.5 }], ["bluffs", 4], ["sage", 70], ["cottonwood", 6], ["rocks", 10], ["people", 2, { kinds: ["trader", "emigrant"], act: "talk", side: "front", x: 12 }], ["train", 1, { z: -7 }]]
  },
  snake: {
    terrain: "river", sky: "#ece6d8", ground: "#a49c78", ground2: "#958d6c", soil: "#5f5546", trail: "#c0aa86", light: "gold",
    features: [["river", 1, { x: -28, width: 30, color: "#4f7f94", current: 0.85, depth: 4.5 }], ["rocks", 30], ["sage", 60], ["bluffs", 3], ["people", 3, { kinds: ["native", "nativewoman", "native"], acts: ["idle", "talk", "work"], side: "back", x: 14 }], ["riders", 1, { kinds: ["native"], side: "front", x: 6 }]]
  },
  prairie: {
    terrain: "plains", sky: "#f1e4c4", ground: "#b8b475", ground2: "#a8a868", soil: "#8a6f4e", trail: "#cdb98f", light: "gold",
    features: [["grass", 220], ["flowers", 60], ["hills", 5], ["river", 1, { along: true, z: -16, width: 4, color: "#9db0b4" }], ["cottonwood", 5, { side: "back" }], ["bison", 16, { side: "back" }], ["train", 2, { z: -7 }], ["riders", 3, { kinds: ["native"], side: "back", x: 20, range: 14 }]]
  },
  fort: {
    terrain: "plains", sky: "#f0e1c2", ground: "#bfae7c", ground2: "#ad9d6c", soil: "#8a6c4c", trail: "#cdb38c", light: "gold",
    features: [["fort", 1, { x: -8, side: "back" }], ["tipis", 7, { side: "front", x: -18 }], ["peaks", 2, { snow: true, small: true }], ["grass", 140], ["sage", 30], ["cottonwood", 4, { side: "back", x: 20 }], ["people", 3, { kinds: ["soldier"], act: "walk", side: "back", x: 4, range: 5 }], ["people", 4, { kinds: ["native", "nativewoman", "nativewoman", "native"], acts: ["talk", "idle", "work", "sit"], side: "front", x: -16 }], ["people", 3, { kinds: ["trader", "emigrant", "emigrantwoman"], act: "talk", side: "front", x: 10 }], ["riders", 2, { kinds: ["native"], side: "front", x: -26, range: 8 }]]
  },
  chimneyrock: {
    terrain: "plains", sky: "#f3dfbd", ground: "#c2b07a", ground2: "#b19f6b", soil: "#8f6a48", trail: "#d2b98e", light: "gold",
    features: [["chimneyrock", 1, { x: -10, side: "back" }], ["bluffs", 5], ["grass", 160], ["sage", 30], ["train", 2, { z: -7 }], ["people", 2, { kinds: ["emigrant", "emigrantchild"], acts: ["idle", "walk"], side: "front", x: 10 }]]
  },
  independencerock: {
    terrain: "plains", sky: "#f0dcc0", ground: "#b6ac78", ground2: "#a39a68", soil: "#8a6c4c", trail: "#ccb48c", light: "gold",
    features: [["indrock", 1, { x: -10, side: "back" }], ["river", 1, { along: true, z: 15, width: 3, color: "#97aab0" }], ["sage", 70], ["grass", 80], ["peaks", 3, { small: true }], ["people", 4, { kinds: ["emigrant", "emigrantwoman", "emigrantchild", "emigrant"], acts: ["work", "talk", "dance", "idle"], x: -12, z: 5, faceZ: -12, spread: 2.5 }], ["train", 1, { z: -7 }]]
  },
  mountains: {
    terrain: "mountains", sky: "#e5e6e2", ground: "#a9a77c", ground2: "#9a9870", soil: "#7d6a52", trail: "#c6b28e", light: "day",
    features: [["peaks", 7, { snow: true }], ["pine", 26], ["sage", 70], ["rocks", 14], ["grass", 60], ["train", 1, { z: -7, speed: 0.8 }], ["riders", 2, { kinds: ["native"], side: "back", x: 18 }]]
  },
  desert: {
    terrain: "desert", sky: "#f4ead6", ground: "#e2d6b8", ground2: "#ece4d0", soil: "#a88a62", trail: "#d6c4a0", light: "day", honest: true, weather: "heat",
    features: [["hills", 4, { color: "#cbb48c" }], ["wreck", 2], ["wheel", 4], ["skull", 5], ["rocks", 16], ["sage", 18], ["people", 3, { kinds: ["emigrant", "emigrantwoman", "emigrant"], act: "walk", side: "front", x: 6, speed: 0.6 }]]
  },
  valley: {
    terrain: "valley", sky: "#e9ecdc", ground: "#9cbc78", ground2: "#88ab68", soil: "#7a6248", trail: "#c9b48c", light: "day",
    features: [["fields", 1], ["peaks", 1, { snow: true, hood: true }], ["oak", 18], ["river", 1, { along: true, z: -14, width: 4, color: "#93b1bd" }], ["fence", 1], ["cabin", 1, { x: -12, side: "back" }], ["flowers", 50], ["grass", 120], ["people", 3, { kinds: ["emigrant", "emigrantwoman", "emigrantchild"], acts: ["work", "work", "idle"], side: "front", x: -20 }], ["people", 3, { kinds: ["kalapuya", "kalapuyawoman", "kalapuyawoman"], acts: ["talk", "work", "idle"], side: "back", x: 18 }]]
  },
  goldfields: {
    terrain: "goldfields", sky: "#d9d8d2", ground: "#8f8466", ground2: "#7b7057", soil: "#6a553e", trail: "#a4926f", light: "overcast", honest: true,
    features: [["river", 1, { along: true, z: -10, width: 6, color: "#8c9a94" }], ["sluices", 5], ["tents", 12], ["stump", 40], ["pine", 10, { side: "back" }], ["rocks", 16], ["people", 5, { kinds: ["miner", "chineseminer", "miner", "chineseminer", "miner"], act: "pan", x: 0, z: -6.2, faceZ: -10, xspread: 10, zspread: 0.4, onTrail: true }], ["people", 4, { kinds: ["miner", "chineseminer", "miner", "californio"], acts: ["work", "work", "walk", "talk"], side: "front" }]]
  },
  rancho: {
    terrain: "valley", sky: "#efe4cc", ground: "#cdb27a", ground2: "#bfa36c", soil: "#8a6c4c", trail: "#d2b98e", light: "gold", honest: true,
    features: [["rancho", 1, { x: -6, side: "back" }], ["oak", 14], ["cattle", 10], ["tents", 4, { side: "front", x: 18 }], ["fence", 1, { side: "front" }], ["hills", 4, { color: "#c4a56c" }], ["grass", 80], ["riders", 3, { kinds: ["vaquero"], side: "front", x: -14, range: 12 }], ["people", 3, { kinds: ["californio", "townswoman", "emigrantchild"], acts: ["talk", "talk", "dance"], x: -6, z: -7.5 }]]
  },
  harbor: {
    terrain: "town", sky: "#dfe1de", ground: "#c8b98e", ground2: "#b9aa80", soil: "#8a6c4c", trail: "#cdb38c", light: "overcast", honest: true,
    features: [["sea", 1, { front: true }], ["ships", 14], ["hills", 5, { color: "#c2b08a" }], ["town", 1, { x: 4, small: true }], ["tents", 10, { side: "back" }], ["people", 6, { kinds: ["dockworker", "miner", "dockworker", "chineseminer"], acts: ["carry", "walk", "carry", "idle", "talk", "walk"], side: "back", x: 0, spread: 8 }]]
  },
  hongkong: {
    terrain: "sea", sky: "#e8e6d6", ground: "#8fae78", ground2: "#7f9f6a", soil: "#6f5a44", trail: null, light: "day",
    features: [["sea", 1, { front: true }], ["junks", 7], ["peaks", 6, { green: true }], ["oak", 12, { side: "back" }], ["people", 5, { kinds: ["dockworker", "chineseminer", "dockworker"], acts: ["carry", "talk", "carry", "idle", "walk"], side: "back", x: 0, spread: 8 }]]
  },
  sea: {
    terrain: "sea", sky: "#dde5e6", ground: "#6f93a4", soil: "#4f6f80", trail: null, light: "day",
    features: [["sea", 1, { all: true }]]
  },
  camp: {
    terrain: "plains", sky: "#2d3442", ground: "#7f7a58", ground2: "#726d4f", soil: "#5e4a36", trail: "#9a8a68", light: "night",
    features: [["wagons", 6, { circle: true, x: -20 }], ["campfire", 1, { x: -20 }], ["grass", 100], ["sage", 20], ["hills", 3], ["people", 5, { kinds: ["emigrant", "emigrantwoman", "emigrantchild", "emigrant", "emigrantwoman"], acts: ["sit", "sit", "dance", "talk", "sit"], x: -20, z: -12, ring: 2.3 }]]
  }
};
