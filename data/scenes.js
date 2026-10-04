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
//     ships, junks, wheel, skull, wreck (an abandoned wagon), fields
//   Options: side "back" or "front" of the trail, x (position along the
//   trail, 0 is where the wagon stops), and kind-specific settings.
window.WESTWARD = window.WESTWARD || {};

WESTWARD.scenes = {
  town: {
    terrain: "town", sky: "#efe4cc", ground: "#b7b07a", ground2: "#a59f6a", soil: "#8a6c4c", trail: "#c2a57c", light: "gold",
    features: [["town", 1, { x: -6 }], ["wagons", 5, { side: "front", x: 10 }], ["grass", 120], ["oak", 8, { side: "back" }], ["hills", 4]]
  },
  river: {
    terrain: "river", sky: "#e6e2d6", ground: "#92a06e", ground2: "#7f8f60", soil: "#7d6448", trail: "#c2a57c", light: "day", weather: "rain",
    features: [["river", 1, { x: -14, width: 12, color: "#7f9aa3" }], ["cottonwood", 16], ["grass", 120], ["hills", 3], ["rocks", 8]]
  },
  prairie: {
    terrain: "plains", sky: "#f1e4c4", ground: "#b8b475", ground2: "#a8a868", soil: "#8a6f4e", trail: "#cdb98f", light: "gold",
    features: [["grass", 220], ["flowers", 60], ["hills", 5], ["river", 1, { along: true, z: -16, width: 4, color: "#9db0b4" }], ["cottonwood", 5, { side: "back" }], ["bison", 16, { side: "back" }]]
  },
  fort: {
    terrain: "plains", sky: "#f0e1c2", ground: "#bfae7c", ground2: "#ad9d6c", soil: "#8a6c4c", trail: "#cdb38c", light: "gold",
    features: [["fort", 1, { x: -8, side: "back" }], ["tipis", 7, { side: "front", x: -18 }], ["peaks", 2, { snow: true, small: true }], ["grass", 140], ["sage", 30], ["cottonwood", 4, { side: "back", x: 20 }]]
  },
  chimneyrock: {
    terrain: "plains", sky: "#f3dfbd", ground: "#c2b07a", ground2: "#b19f6b", soil: "#8f6a48", trail: "#d2b98e", light: "gold",
    features: [["chimneyrock", 1, { x: -10, side: "back" }], ["bluffs", 5], ["grass", 160], ["sage", 30]]
  },
  independencerock: {
    terrain: "plains", sky: "#f0dcc0", ground: "#b6ac78", ground2: "#a39a68", soil: "#8a6c4c", trail: "#ccb48c", light: "gold",
    features: [["indrock", 1, { x: -10, side: "back" }], ["river", 1, { along: true, z: 15, width: 3, color: "#97aab0" }], ["sage", 70], ["grass", 80], ["peaks", 3, { small: true }]]
  },
  mountains: {
    terrain: "mountains", sky: "#e5e6e2", ground: "#a9a77c", ground2: "#9a9870", soil: "#7d6a52", trail: "#c6b28e", light: "day",
    features: [["peaks", 7, { snow: true }], ["pine", 26], ["sage", 70], ["rocks", 14], ["grass", 60]]
  },
  desert: {
    terrain: "desert", sky: "#f4ead6", ground: "#e2d6b8", ground2: "#ece4d0", soil: "#a88a62", trail: "#d6c4a0", light: "day", honest: true, weather: "heat",
    features: [["hills", 4, { color: "#cbb48c" }], ["wreck", 2], ["wheel", 4], ["skull", 5], ["rocks", 16], ["sage", 18]]
  },
  valley: {
    terrain: "valley", sky: "#e9ecdc", ground: "#9cbc78", ground2: "#88ab68", soil: "#7a6248", trail: "#c9b48c", light: "day",
    features: [["fields", 1], ["peaks", 1, { snow: true, hood: true }], ["oak", 18], ["river", 1, { along: true, z: -14, width: 4, color: "#93b1bd" }], ["fence", 1], ["cabin", 1, { x: -12, side: "back" }], ["flowers", 50], ["grass", 120]]
  },
  goldfields: {
    terrain: "goldfields", sky: "#d9d8d2", ground: "#8f8466", ground2: "#7b7057", soil: "#6a553e", trail: "#a4926f", light: "overcast", honest: true,
    features: [["river", 1, { along: true, z: -10, width: 6, color: "#8c9a94" }], ["sluices", 5], ["tents", 12], ["stump", 40], ["pine", 10, { side: "back" }], ["rocks", 16]]
  },
  rancho: {
    terrain: "valley", sky: "#efe4cc", ground: "#cdb27a", ground2: "#bfa36c", soil: "#8a6c4c", trail: "#d2b98e", light: "gold", honest: true,
    features: [["rancho", 1, { x: -6, side: "back" }], ["oak", 14], ["cattle", 10], ["tents", 4, { side: "front", x: 18 }], ["fence", 1, { side: "front" }], ["hills", 4, { color: "#c4a56c" }], ["grass", 80]]
  },
  harbor: {
    terrain: "town", sky: "#dfe1de", ground: "#c8b98e", ground2: "#b9aa80", soil: "#8a6c4c", trail: "#cdb38c", light: "overcast", honest: true,
    features: [["sea", 1, { front: true }], ["ships", 14], ["hills", 5, { color: "#c2b08a" }], ["town", 1, { x: 4, small: true }], ["tents", 10, { side: "back" }]]
  },
  hongkong: {
    terrain: "sea", sky: "#e8e6d6", ground: "#8fae78", ground2: "#7f9f6a", soil: "#6f5a44", trail: null, light: "day",
    features: [["sea", 1, { front: true }], ["junks", 7], ["peaks", 6, { green: true }], ["oak", 12, { side: "back" }]]
  },
  sea: {
    terrain: "sea", sky: "#dde5e6", ground: "#6f93a4", soil: "#4f6f80", trail: null, light: "day",
    features: [["sea", 1, { all: true }]]
  },
  camp: {
    terrain: "plains", sky: "#2d3442", ground: "#7f7a58", ground2: "#726d4f", soil: "#5e4a36", trail: "#9a8a68", light: "night",
    features: [["wagons", 6, { circle: true, x: -20 }], ["campfire", 1, { x: -20 }], ["grass", 100], ["sage", 20], ["hills", 3]]
  }
};
