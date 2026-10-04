// Westward: scene art.
// Every scene is an oil painting made with claude-paint (see tools/paint/), cut
// into four layers (sky, far, mid, near) that slide at different speeds while
// the wagon travels. Set "painted: true" once assets/art/<scene>/ holds the
// layers; until then the game draws placeholder hills from "palette".
// "honest": true marks the later, less romantic scenes (California).
window.WESTWARD = window.WESTWARD || {};

WESTWARD.art = {
  title: { image: null, palette: ["#f3d9a4", "#c98f55", "#7d8a6a", "#4e5a3f"] },
  scenes: {
    town: { palette: ["#f1dcae", "#b9a07a", "#8c7a58", "#5b4a33"] },
    river: { palette: ["#e9dcc0", "#8fa7b3", "#6f8a6a", "#3f5a44"], water: true },
    prairie: { palette: ["#f4ddb0", "#c9b07a", "#a99a5a", "#6f7444"], painted: true },
    fort: { palette: ["#f1d6a8", "#b8916a", "#8f7a55", "#5d4d35"] },
    chimneyrock: { palette: ["#f5d2a0", "#c79a70", "#a77a55", "#6d5a3c"] },
    independencerock: { palette: ["#f5d2a0", "#c79a70", "#a77a55", "#6d5a3c"] },
    mountains: { palette: ["#e4e3dc", "#8c98aa", "#6b7a6a", "#3e4a3c"] },
    desert: { palette: ["#f6e2b8", "#d6b98a", "#c4a070", "#8d7350"], honest: true },
    valley: { palette: ["#eae4c4", "#9fae8a", "#78935e", "#45603a"] },
    goldfields: { palette: ["#d9d2c0", "#9c8e78", "#7a6a55", "#4a3e30"], honest: true },
    rancho: { palette: ["#e6d6b6", "#b49a78", "#8f7d5c", "#5c4b38"], honest: true },
    harbor: { palette: ["#e3ddd0", "#9aa8b0", "#7a8890", "#4a5258"], water: true },
    hongkong: { palette: ["#e8e2cc", "#8fa58f", "#6f8a80", "#3f5a58"], water: true },
    sea: { palette: ["#dfe2dc", "#8fa0aa", "#5f7a88", "#3a5260"], water: true },
    camp: { palette: ["#e2c9a0", "#a98a66", "#7f6c4e", "#4f4230"] }
  }
};
