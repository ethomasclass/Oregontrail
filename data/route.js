// Westward: places and the order of stops.
// Mileage and dates are DRAFT until checked against research/trail-facts.md.
//
// Beat types:
//   store     outfitting screen
//   card      a fixed event card (see cards.js)
//   draw      a random card from a pool (pools are listed on each card)
//   landmark  a painting plus a diary excerpt (see landmarks.js)
//   fork      the Fort Hall vote: Oregon or California
//   ending    the "Who Decided?" ledger
//
// Optional beats are skipped automatically when a group runs behind schedule.
// "byFamily" swaps in a different card for one family at that stop.
// "families" limits a beat to the listed families.
// "target" is the minute (from family pick) a group should reach this beat.
window.WESTWARD = window.WESTWARD || {};

WESTWARD.places = {
  independence: { name: "Independence, Missouri", miles: 0, scene: "town" },
  kansasriver: { name: "Kansas River crossing", miles: 100, scene: "river" },
  platte: { name: "Platte River valley", miles: 250, scene: "prairie" },
  fortkearny: { name: "Fort Kearny", miles: 320, scene: "fort" },
  chimneyrock: { name: "Chimney Rock", miles: 570, scene: "rock" },
  fortlaramie: { name: "Fort Laramie", miles: 650, scene: "fort" },
  independencerock: { name: "Independence Rock", miles: 830, scene: "rock" },
  southpass: { name: "South Pass", miles: 930, scene: "mountains" },
  forthall: { name: "Fort Hall", miles: 1260, scene: "fort" },

  // Oregon branch
  thedalles: { name: "The Dalles: Columbia River or Barlow Road", miles: 1830, scene: "river" },
  willamette: { name: "Willamette Valley", miles: 1950, scene: "valley" },

  // California branch
  fortymile: { name: "Humboldt River and the Forty Mile Desert", miles: 1700, scene: "desert" },
  sierra: { name: "Sierra Nevada", miles: 1900, scene: "mountains" },
  goldfields: { name: "California gold fields", miles: 2000, scene: "goldfields" },

  // Sea route (the Chan cousins)
  hongkong: { name: "Hong Kong harbor", scene: "harbor" },
  pacific: { name: "The Pacific crossing", scene: "sea" },
  sanfrancisco: { name: "San Francisco", scene: "harbor" },
  sacramento: { name: "Sacramento, on the way to the mines", scene: "river" }
};

WESTWARD.routes = {
  trail: [
    { type: "store", at: "independence", target: 4 },
    { type: "card", at: "kansasriver", card: "kansas-crossing", target: 9 },
    { type: "draw", at: "platte", pool: "plains", target: 11.5, optional: true },
    { type: "draw", at: "fortkearny", pool: "plains", target: 14,
      byFamily: { irish: "nativist-company", black: "free-papers" } },
    { type: "landmark", at: "chimneyrock", landmark: "chimney-rock", target: 16, optional: true },
    { type: "card", at: "fortlaramie", card: "fort-laramie-trade", target: 18.5,
      byFamily: { ohio: "cross-ohio-doyles", irish: "cross-irish-bells", black: "cross-bell-doyles" } },
    { type: "landmark", at: "independencerock", landmark: "independence-rock", target: 21, optional: true },
    { type: "draw", at: "southpass", pool: "mountains", target: 23.5,
      byFamily: { ohio: "cross-ohio-bells" } },
    { type: "fork", at: "forthall", target: 26 }
  ],

  oregon: [
    { type: "card", at: "thedalles", card: "columbia-or-barlow", target: 28.5 },
    { type: "card", at: "willamette", card: "oregon-land-claim", target: 31,
      byFamily: { black: "oregon-exclusion" } },
    { type: "card", at: "willamette", card: "kalapuya-neighbors", target: 33 },
    { type: "card", at: "willamette", card: "oregon-irish-welcome", target: 35, families: ["irish"] },
    { type: "card", at: "willamette", card: "oregon-bush-news", target: 35, families: ["black"] },
    { type: "ending", at: "willamette", target: 36 }
  ],

  california: [
    { type: "card", at: "fortymile", card: "forty-mile-desert", target: 28 },
    { type: "card", at: "sierra", card: "sierra-crossing", target: 30, optional: true },
    { type: "card", at: "goldfields", card: "making-a-living", target: 32 },
    { type: "card", at: "goldfields", card: "californio-rancho", target: 33.5 },
    { type: "card", at: "goldfields", card: "militia-news", target: 34.5, optional: true },
    { type: "card", at: "goldfields", card: "cross-chan-tax", target: 35.5 },
    { type: "ending", at: "goldfields", target: 36 }
  ],

  sea: [
    { type: "store", at: "hongkong", target: 4 },
    { type: "card", at: "pacific", card: "pacific-voyage", target: 10 },
    { type: "card", at: "sanfrancisco", card: "sf-arrival", target: 13 },
    { type: "landmark", at: "sacramento", landmark: "sacramento-letter", target: 15.5, optional: true },
    { type: "card", at: "goldfields", card: "making-a-living", target: 18.5 },
    { type: "card", at: "goldfields", card: "tax-collector", target: 21.5 },
    { type: "card", at: "goldfields", card: "cross-chan-overlanders", target: 24.5 },
    { type: "card", at: "goldfields", card: "no-testimony", target: 27.5 },
    { type: "card", at: "goldfields", card: "californio-rancho", target: 30.5 },
    { type: "card", at: "goldfields", card: "militia-news", target: 33, optional: true },
    { type: "ending", at: "goldfields", target: 36 }
  ]
};
