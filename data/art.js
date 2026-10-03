// Westward: scene art.
// Each scene is drawn in up to four layers (sky, far, mid, near) so the game can
// move them at different speeds (parallax) while the wagon travels.
// "layers" lists painted image files in assets/art/. While a scene has no
// paintings yet, the game draws placeholder hills from the "palette" colors.
// "honest": true marks the later, less romantic scenes (California, the rancho).
window.WESTWARD = window.WESTWARD || {};

WESTWARD.art = {
  title: { image: null, palette: ["#f3d9a4", "#c98f55", "#7d8a6a", "#4e5a3f"] },
  scenes: {
    town: { palette: ["#f1dcae", "#b9a07a", "#8c7a58", "#5b4a33"], layers: null },
    river: { palette: ["#e9dcc0", "#8fa7b3", "#6f8a6a", "#3f5a44"], water: true, layers: null },
    prairie: { palette: ["#f4ddb0", "#c9b07a", "#a99a5a", "#6f7444"], layers: null },
    fort: { palette: ["#f1d6a8", "#b8916a", "#8f7a55", "#5d4d35"], layers: null },
    rock: { palette: ["#f5d2a0", "#c79a70", "#a77a55", "#6d5a3c"], landmark: true, layers: null },
    mountains: { palette: ["#e4e3dc", "#8c98aa", "#6b7a6a", "#3e4a3c"], layers: null },
    desert: { palette: ["#f6e2b8", "#d6b98a", "#c4a070", "#8d7350"], layers: null },
    valley: { palette: ["#eae4c4", "#9fae8a", "#78935e", "#45603a"], layers: null },
    goldfields: { palette: ["#d9d2c0", "#9c8e78", "#7a6a55", "#4a3e30"], honest: true, layers: null },
    rancho: { palette: ["#e6d6b6", "#b49a78", "#8f7d5c", "#5c4b38"], honest: true, layers: null },
    harbor: { palette: ["#e3ddd0", "#9aa8b0", "#7a8890", "#4a5258"], water: true, layers: null },
    sea: { palette: ["#dfe2dc", "#8fa0aa", "#5f7a88", "#3a5260"], water: true, layers: null },
    camp: { palette: ["#e2c9a0", "#a98a66", "#7f6c4e", "#4f4230"], layers: null },
    trail: { palette: ["#f2dcae", "#bfa57a", "#9a8a5c", "#655c3c"], layers: null }
  }
};
