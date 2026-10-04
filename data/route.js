// Westward: places and the order of stops.
// Mileage and dates are DRAFT until checked against research/trail-facts.md.
//
// Beat types:
//   store     outfitting screen
//   card      a fixed event card (see cards.js)
//   draw      a random card from a pool (pools are listed on each card)
//   landmark  a painting plus a diary excerpt (see landmarks.js)
//   river     a river crossing (see rivers.js)
//   fork      the Fort Hall vote: Oregon or California
//   ending    the "Who Decided?" ledger
//
// Optional beats are skipped automatically when a group runs behind schedule.
// "byFamily" swaps in a different card for one family at that stop.
// "families" limits a beat to the listed families.
// Places with "rations: true" feed travelers on the way (ship passage included food).
// Places with "market" sell food (dollars a pound) when a group runs out: forts charge
// about three times Independence prices, mining camps far more.
// "minutes" (optional) overrides how long a stop usually takes (minigames take longer).
// "target" is the minute (from family pick) a group should reach this beat.
window.WESTWARD = window.WESTWARD || {};

WESTWARD.places = {
  independence: { name: "Independence, Missouri", miles: 0, scene: "town" },
  kansasriver: { name: "Kansas River crossing", miles: 100, scene: "river", weather: "rain" },
  platte: { name: "Platte River valley", miles: 250, scene: "prairie" },
  fortkearny: { market: 0.12, name: "Fort Kearny", miles: 320, scene: "fort" },
  chimneyrock: { name: "Chimney Rock", miles: 570, scene: "chimneyrock" },
  fortlaramie: { market: 0.12, name: "Fort Laramie", miles: 650, scene: "fort" },
  independencerock: { name: "Independence Rock", miles: 830, scene: "independencerock" },
  southpass: { name: "South Pass", miles: 930, scene: "mountains" },
  greenriver: { name: "Green River crossing", miles: 1000, scene: "greenriver" },
  forthall: { market: 0.12, name: "Fort Hall", miles: 1260, scene: "fort" },

  // Oregon branch
  threeisland: { name: "Three Island Crossing, Snake River", miles: 1450, scene: "snake" },
  thedalles: { name: "The Dalles: Columbia River or Barlow Road", miles: 1830, scene: "river" },
  willamette: { name: "Willamette Valley", miles: 1950, scene: "valley" },

  // California branch
  fortymile: { name: "Humboldt River and the Forty Mile Desert", miles: 1700, scene: "desert", weather: "heat" },
  sierra: { name: "Sierra Nevada", miles: 1900, scene: "mountains", weather: "snow" },
  // Sacramento, near Sutter's Fort: overland families came down from the Sierra to buy
  // supplies here; riverboats brought miners up from San Francisco. "miles" is used on the
  // California branch; "days" only when arriving from a place without miles (the sea route).
  sacramento: { name: "Sacramento, on the way to the mines", miles: 1950, scene: "river", days: 4, market: 0.4 },
  goldfields: { name: "California gold fields", miles: 2000, scene: "goldfields", days: 5, market: 0.5 },

  // Sea route (kept for reference; the Chan cousins are no longer playable)
  hongkong: { name: "Hong Kong harbor", scene: "hongkong", days: 0 },
  pacific: { name: "The Pacific crossing", scene: "sea", days: 50, rations: true },
  sanfrancisco: { name: "San Francisco", scene: "harbor", days: 10, market: 0.25 }
};

// Beat targets: card stops take about 2.4 minutes, minigame stops 3.2 (data/config.js).
// The fork is at about minute 28; Oregon ends at 40, California at 42.
WESTWARD.routes = {
  trail: [
    { type: "store", at: "independence", target: 4 },
    { type: "river", at: "kansasriver", river: "kansas", target: 9.5 },
    { type: "draw", at: "fortkearny", pool: "plains", target: 15,
      byFamily: { irish: "nativist-company", black: "free-papers" } },
    { type: "landmark", at: "chimneyrock", landmark: "chimney-rock", target: 17.5, optional: true },
    { type: "card", at: "fortlaramie", card: "fort-laramie-trade", target: 20,
      byFamily: { ohio: "cross-ohio-doyles", irish: "cross-irish-bells", black: "cross-bell-doyles" } },
    { type: "landmark", at: "independencerock", landmark: "independence-rock", target: 22.5, optional: true },
    { type: "draw", at: "southpass", pool: "mountains", target: 24.5,
      byFamily: { ohio: "cross-ohio-bells" } },
    { type: "river", at: "greenriver", river: "green", target: 26.5, optional: true },
    { type: "fork", at: "forthall", target: 28 }
  ],

  oregon: [
    { type: "river", at: "threeisland", river: "snake", target: 30, optional: true },
    { type: "card", at: "thedalles", card: "columbia-or-barlow", target: 32, minutes: 3.2 },
    { type: "card", at: "willamette", card: "oregon-land-claim", target: 35,
      byFamily: { black: "oregon-exclusion" } },
    { type: "card", at: "willamette", card: "kalapuya-neighbors", target: 37 },
    { type: "card", at: "willamette", card: "oregon-irish-welcome", target: 39, families: ["irish"] },
    { type: "card", at: "willamette", card: "oregon-bush-news", target: 39, families: ["black"] },
    { type: "ending", at: "willamette", target: 40 }
  ],

  california: [
    { type: "card", at: "fortymile", card: "forty-mile-desert", target: 30 },
    { type: "card", at: "sierra", card: "sierra-crossing", target: 32, optional: true },
    { type: "card", at: "sacramento", card: "chans-arrive", target: 34 },
    { type: "card", at: "goldfields", card: "making-a-living", target: 36, minutes: 3.2 },
    { type: "card", at: "goldfields", card: "californio-rancho", target: 38 },
    { type: "card", at: "goldfields", card: "militia-news", target: 39, optional: true },
    { type: "card", at: "goldfields", card: "cross-chan-tax", target: 40 },
    { type: "card", at: "goldfields", card: "chans-witness", target: 41, optional: true,
      byFamily: { black: "chans-witness-bell" } },
    { type: "ending", at: "goldfields", target: 42 }
  ],

  // Kept for reference only: no playable family uses the sea route now
  // (the Chan cousins have "playable: false" in families.js).
  sea: [
    { type: "store", at: "hongkong", target: 4 },
    { type: "card", at: "pacific", card: "pacific-voyage", target: 10 },
    { type: "card", at: "sanfrancisco", card: "sf-arrival", target: 13 },
    { type: "landmark", at: "sacramento", landmark: "sacramento-letter", target: 15.5, optional: true },
    { type: "card", at: "goldfields", card: "making-a-living", target: 18.5, minutes: 3.2 },
    { type: "card", at: "goldfields", card: "tax-collector", target: 21.5 },
    { type: "card", at: "goldfields", card: "cross-chan-overlanders", target: 24.5 },
    { type: "card", at: "goldfields", card: "no-testimony", target: 27.5 },
    { type: "card", at: "goldfields", card: "californio-rancho", target: 30.5 },
    { type: "card", at: "goldfields", card: "militia-news", target: 33, optional: true },
    { type: "ending", at: "goldfields", target: 36 }
  ]
};
