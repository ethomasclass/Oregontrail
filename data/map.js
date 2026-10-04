// Westward: the travel map. Real latitude and longitude for every point, so the map
// is drawn to scale (simplified by hand from public domain map data).
//   places   [lat, lon, labelDx, labelDy, anchor]  where each stop sits and where its name goes
//            (anchor: "start" puts the name to the right, "end" to the left)
//   names    short names for the map, where a stop's full name is long
//   paths    the routes, as lists of [lat, lon] or [lat, lon, placeId]
//   rivers, ranges (mountains), lakes, coast
//   nations  Native nations whose homelands the routes crossed around 1849, placed
//            roughly at the heart of their lands. Borders moved and overlapped, and
//            the U.S. was already forcing some nations (Shawnee, Delaware) west, so
//            the map shows names, not lines. Sources: Smithsonian Handbook of North
//            American Indians; NPS Oregon and California National Historic Trails.
//   regions  what the U.S. called these lands in 1849
window.WESTWARD = window.WESTWARD || {};

WESTWARD.mapData = {
  west: {
    bounds: { lon: [-125.6, -92.2], lat: [35.8, 48.3], midLat: 42 },
    names: { kansasriver: "Kansas River", threeisland: "Three Island Crossing", thedalles: "The Dalles", willamette: "Willamette Valley",
             fortymile: "Forty Mile Desert", sierra: "Sierra crossing", goldfields: "Gold fields", greenriver: "Green River" },
    places: {
      independence: [39.09, -94.42, 0, -11],
      kansasriver: [39.06, -95.68, -4, 20, "end"],
      fortkearny: [40.64, -99.0, 0, 18],
      chimneyrock: [41.70, -103.35, 6, 19, "start"],
      fortlaramie: [42.20, -104.56, 10, -9, "start"],
      independencerock: [42.49, -107.13, 0, -12],
      southpass: [42.35, -108.92, -8, -9, "end"],
      greenriver: [41.95, -110.05, 0, 20],
      forthall: [43.03, -112.43, 10, -10],
      threeisland: [42.95, -115.31, 0, 18],
      thedalles: [45.60, -121.18, 8, -9, "start"],
      willamette: [45.10, -122.85, 8, 20, "start"],
      fortymile: [39.90, -118.70, 10, 5, "start"],
      sierra: [39.32, -120.33, -6, -10, "end"],
      goldfields: [38.80, -120.89, 10, 6, "start"],
      sacramento: [38.58, -121.49, -9, 5, "end"],
      sanfrancisco: [37.78, -122.42, -8, 18, "end"]
    },
    paths: {
      main: [[39.09, -94.42, "independence"], [38.95, -95.05], [39.06, -95.68, "kansasriver"], [39.6, -96.5], [40.0, -96.9], [40.4, -98.2],
             [40.64, -99.0, "fortkearny"], [40.75, -100.3], [41.1, -101.0], [41.3, -102.1], [41.70, -103.35, "chimneyrock"], [41.83, -103.7],
             [42.20, -104.56, "fortlaramie"], [42.5, -105.4], [42.85, -106.3], [42.49, -107.13, "independencerock"], [42.55, -108.0],
             [42.35, -108.92, "southpass"], [42.1, -109.5], [41.95, -110.05, "greenriver"], [42.25, -110.9], [42.65, -111.6], [43.03, -112.43, "forthall"]],
      oregon: [[43.03, -112.43, "forthall"], [42.6, -113.9], [42.75, -114.6], [42.95, -115.31, "threeisland"], [43.65, -116.6], [44.0, -117.0],
               [44.8, -117.8], [45.67, -118.79], [45.7, -120.0], [45.60, -121.18, "thedalles"], [45.35, -122.0], [45.10, -122.85, "willamette"]],
      california: [[43.03, -112.43, "forthall"], [42.3, -113.2], [42.05, -113.7], [41.4, -114.9], [41.1, -115.4], [40.85, -116.2],
                   [40.95, -117.6], [40.5, -118.4], [39.90, -118.70, "fortymile"], [39.55, -119.6], [39.32, -120.33, "sierra"], [39.05, -120.85],
                   [38.85, -121.2], [38.58, -121.49, "sacramento"], [38.7, -121.2], [38.80, -120.89, "goldfields"]],
      bay: [[37.78, -122.42, "sanfrancisco"], [38.05, -122.1], [38.15, -121.7], [38.58, -121.49, "sacramento"], [38.7, -121.2], [38.80, -120.89, "goldfields"]]
    },
    coast: [[48.4, -124.7], [47.9, -124.6], [46.9, -124.15], [46.25, -124.05], [45.5, -123.95], [44.6, -124.05], [43.4, -124.25], [42.8, -124.5],
            [42.0, -124.2], [41.0, -124.1], [40.4, -124.4], [39.8, -123.85], [38.95, -123.7], [38.3, -123.05], [37.8, -122.52], [37.5, -122.5],
            [36.95, -122.05], [36.6, -121.9], [35.8, -121.4]],
    lakes: [{ at: [41.1, -112.55], rx: 0.45, ry: 0.55, name: "Great Salt Lake" }, { at: [39.1, -120.04], rx: 0.1, ry: 0.2 }],
    rivers: [
      { name: "Missouri River", width: 2.4, pts: [[47.9, -106.5], [47.8, -104.0], [47.3, -101.4], [46.8, -100.8], [45.5, -100.4], [44.4, -100.4], [43.0, -99.0], [42.8, -97.4], [42.5, -96.4], [41.3, -95.9], [40.0, -95.2], [39.1, -94.6], [38.8, -92.5]] },
      { name: "Kansas River", pts: [[39.1, -94.6], [39.0, -95.7], [39.2, -96.6], [39.05, -96.8], [38.9, -97.6]] },
      { name: "Platte River", width: 2, pts: [[41.0, -95.9], [41.2, -97.0], [40.7, -98.4], [40.7, -99.7], [41.1, -100.8]] },
      { name: "North Platte", pts: [[41.1, -100.8], [41.25, -101.8], [41.55, -102.9], [41.83, -103.7], [42.2, -104.5], [42.75, -105.4], [42.85, -106.3], [42.4, -106.8], [41.8, -106.9]] },
      { pts: [[41.1, -100.8], [40.9, -102.0], [40.5, -103.6], [40.1, -104.6], [39.7, -105.0]] },
      { name: "Sweetwater", labelAt: [42.85, -107.7], pts: [[42.45, -106.9], [42.49, -107.13], [42.55, -108.0], [42.45, -108.8]] },
      { name: "Green River", pts: [[43.0, -110.1], [42.2, -110.1], [41.5, -109.5], [40.9, -109.4], [39.9, -110.0], [38.9, -110.1]] },
      { name: "Snake River", width: 2, pts: [[43.5, -110.8], [43.3, -111.9], [43.0, -112.4], [42.6, -113.9], [42.75, -114.5], [42.95, -115.3], [43.7, -116.9], [44.5, -117.2], [45.5, -116.8], [46.4, -117.0], [46.6, -118.0], [46.2, -119.0]] },
      { name: "Columbia River", labelAt: [46.95, -119.7], width: 2.4, pts: [[48.3, -118.3], [48.0, -118.6], [47.0, -119.9], [46.2, -119.1], [45.95, -119.3], [45.7, -120.6], [45.6, -121.2], [45.7, -122.4], [46.1, -122.9], [46.25, -124.05]] },
      { name: "Willamette", pts: [[45.6, -122.75], [45.35, -122.6], [44.95, -123.05], [44.55, -123.25], [44.05, -123.05]] },
      { name: "Humboldt River", pts: [[41.1, -115.1], [40.85, -116.0], [40.95, -117.7], [40.6, -118.3], [40.1, -118.6]] },
      { name: "Sacramento River", pts: [[40.6, -122.4], [39.7, -121.9], [38.58, -121.5], [38.05, -121.9], [37.95, -122.3]] },
      { pts: [[38.8, -120.9], [38.6, -121.5]] },
      { pts: [[39.3, -120.2], [39.5, -119.8], [39.9, -119.4]] }
    ],
    ranges: [
      { name: "Rocky Mountains", pts: [[47.6, -112.8], [46.5, -112.5], [45.5, -111.5], [44.6, -110.6], [43.6, -110.3]] },
      { pts: [[43.3, -109.8], [42.65, -109.1]] },
      { pts: [[44.8, -107.4], [43.9, -106.9]] },
      { pts: [[42.6, -105.6], [41.2, -105.3]] },
      { pts: [[41.0, -105.7], [40.0, -105.7], [39.0, -105.9], [38.0, -106.0], [36.6, -106.0]] },
      { pts: [[40.8, -111.0], [40.7, -109.8]] },
      { pts: [[41.9, -111.7], [40.0, -111.6], [39.0, -111.5]] },
      { name: "Blue Mountains", pts: [[45.6, -118.1], [44.6, -118.8]] },
      { name: "Cascade Mountains", labelAt: [43.0, -121.2], pts: [[48.3, -121.3], [47.0, -121.5], [46.2, -121.5], [45.4, -121.7], [44.3, -121.8], [43.0, -122.1], [42.0, -122.2], [41.4, -122.2]] },
      { name: "Sierra Nevada", labelAt: [37.4, -118.2], pts: [[40.3, -121.5], [39.6, -120.6], [39.0, -120.2], [38.5, -119.9], [37.5, -119.0], [36.3, -118.3]] }
    ],
    nations: [
      { name: "Shawnee, Delaware", at: [37.55, -97.0], note: "moved here by the U.S. in the 1830s" },
      { name: "Kaw (Kansa)", at: [38.3, -98.7] },
      { name: "Pawnee", at: [41.55, -98.6] },
      { name: "Lakota", at: [43.4, -102.4] },
      { name: "Cheyenne, Arapaho", at: [40.05, -102.9] },
      { name: "Crow", at: [45.3, -108.2] },
      { name: "Shoshone", at: [43.5, -108.7] },
      { name: "Ute", at: [39.5, -108.4] },
      { name: "Shoshone, Bannock", at: [44.1, -113.8] },
      { name: "Western Shoshone", at: [39.1, -116.8] },
      { name: "Northern Paiute", at: [42.3, -118.6] },
      { name: "Nez Perce", at: [45.75, -115.6] },
      { name: "Cayuse, Umatilla", at: [46.55, -118.4] },
      { name: "Chinookan peoples", at: [46.45, -122.7] },
      { name: "Kalapuya", at: [43.85, -123.3] },
      { name: "Washoe", at: [38.7, -119.55] },
      { name: "Nisenan, Miwok", at: [37.55, -121.2] }
    ],
    regions: [
      { name: "Missouri", note: "a state, slavery legal", at: [37.4, -92.35], anchor: "end" },
      { name: "Oregon Territory", note: "U.S. since 1848", at: [47.3, -116.0] },
      { name: "California", note: "taken from Mexico, 1848", at: [36.5, -120.6] },
      { name: "Pacific Ocean", at: [41.5, -125.05], sea: true, rotate: -90 }
    ]
  },

  // The Chan cousins' California: San Francisco Bay to the gold country.
  california: {
    bounds: { lon: [-124.4, -118.5], lat: [36.9, 40.2], midLat: 38.6 },
    width: 620,   // a smaller drawing, so names read larger on this close-up map
    names: { goldfields: "Gold fields (Coloma)" },
    places: {
      sanfrancisco: [37.78, -122.42, -10, 18, "end"],
      sacramento: [38.58, -121.49, -10, 5, "end"],
      goldfields: [38.80, -120.89, 10, 6, "start"]
    },
    paths: {
      bay: [[37.78, -122.42, "sanfrancisco"], [37.95, -122.33], [38.06, -122.12], [38.05, -121.85], [38.25, -121.6], [38.58, -121.49, "sacramento"],
            [38.62, -121.25], [38.72, -121.05], [38.80, -120.89, "goldfields"]]
    },
    coast: [[40.5, -124.38], [40.4, -124.4], [39.8, -123.85], [39.3, -123.8], [38.95, -123.7], [38.3, -123.05], [38.0, -122.95], [37.8, -122.52],
            [37.5, -122.5], [37.1, -122.3], [36.95, -122.05], [36.8, -121.8], [36.6, -121.9]],
    bays: [[[37.81, -122.48], [37.9, -122.42], [38.05, -122.45], [38.12, -122.28], [38.06, -122.05], [38.03, -121.9], [38.07, -122.2], [37.92, -122.32],
            [37.6, -122.15], [37.45, -122.05], [37.55, -122.25], [37.8, -122.38]]],
    lakes: [{ at: [39.1, -120.04], rx: 0.1, ry: 0.2, name: "Lake Tahoe" }],
    rivers: [
      { name: "Sacramento River", width: 2.2, labelAt: [39.55, -122.05], pts: [[40.5, -122.4], [39.7, -121.95], [39.15, -121.8], [38.58, -121.5], [38.25, -121.55], [38.05, -121.85], [38.05, -122.0]] },
      { name: "American River", labelAt: [38.62, -121.05], pts: [[38.95, -120.55], [38.8, -120.9], [38.6, -121.3], [38.58, -121.5]] },
      { name: "Feather River", labelAt: [39.75, -121.15], pts: [[39.9, -121.2], [39.5, -121.55], [39.1, -121.6], [38.8, -121.6]] },
      { pts: [[39.45, -120.9], [39.15, -121.6]] },
      { name: "San Joaquin River", width: 2, pts: [[36.8, -119.7], [37.4, -120.7], [37.8, -121.3], [38.05, -121.8]] },
      { pts: [[37.95, -120.3], [37.65, -121.0]] },
      { pts: [[38.2, -120.4], [38.0, -121.2]] }
    ],
    ranges: [
      { name: "Sierra Nevada", labelAt: [37.65, -119.55], pts: [[40.4, -121.3], [39.8, -120.6], [39.3, -120.3], [38.7, -120.0], [38.2, -119.7], [37.6, -119.3], [36.8, -118.9]] },
      { name: "Coast Ranges", labelAt: [39.6, -123.05], pts: [[40.4, -123.4], [39.6, -122.85], [38.8, -122.45], [38.2, -122.15], [37.5, -121.75], [36.8, -121.3]] }
    ],
    nations: [
      { name: "Nisenan", at: [39.05, -121.05] },
      { name: "Maidu", at: [40.0, -121.0] },
      { name: "Miwok", at: [37.95, -120.55] },
      { name: "Coast Miwok", at: [38.3, -122.75] },
      { name: "Ohlone", at: [37.25, -121.85] },
      { name: "Patwin", at: [38.95, -122.2] },
      { name: "Pomo", at: [39.2, -123.3] },
      { name: "Yokuts", at: [37.05, -120.45] },
      { name: "Washoe", at: [39.6, -119.35] }
    ],
    regions: [
      { name: "Pacific Ocean", at: [38.4, -123.75], sea: true, rotate: -90 },
      { name: "Gold country", note: "where gold was found in 1848", at: [38.35, -120.25] },
      { name: "Central Valley", at: [39.35, -122.5] }
    ]
  },

  sea: {
    bounds: { lon: [107, 239], lat: [14, 52], midLat: 33 },
    places: {
      hongkong: [22.3, 114.17, 0, 22],
      pacific: [38.5, 178.0, 0, -14],
      sanfrancisco: [37.78, 237.58, -8, 22, "end"]
    },
    paths: {
      sea: [[22.3, 114.17, "hongkong"], [21.0, 120.5], [24.5, 126.0], [30.0, 140.0], [35.0, 155.0], [38.0, 168.0], [38.5, 178.0, "pacific"], [39.5, 192.0],
            [40.0, 205.0], [39.5, 218.0], [38.6, 230.0], [37.78, 237.58, "sanfrancisco"]]
    },
    land: [
      { name: "China", pts: [[52, 107], [52, 121], [41, 122], [40, 121.5], [39, 118], [37.5, 119], [37, 122.5], [35, 119.5], [32, 121.5], [30.5, 122], [28, 121.5], [25.5, 119.6], [23.5, 117], [22.5, 114.5], [21.6, 111], [20.2, 110], [21.5, 108.5], [14, 108.5], [14, 107], [52, 107]] },
      { name: "Korea", pts: [[43.0, 130.0], [42.0, 130.7], [39.5, 127.5], [37.5, 129.4], [35.1, 129.1], [34.6, 126.4], [37.0, 126.6], [37.8, 125.0], [39.8, 124.3], [40.5, 124.4]] },
      { name: "Taiwan", pts: [[25.2, 121.6], [23.0, 121.4], [22.0, 120.8], [23.0, 120.1], [25.0, 121.0]] },
      { name: "Japan", pts: [[41.5, 140.0], [40.5, 141.5], [38.3, 141.5], [36.0, 140.8], [35.0, 139.8], [34.6, 138.2], [33.6, 135.4], [33.2, 132.4], [31.2, 130.6], [33.5, 129.8], [34.4, 131.0], [35.5, 133.2], [36.8, 136.8], [38.5, 139.5]] },
      { name: "Philippines", pts: [[18.5, 120.6], [18.4, 122.2], [16.0, 122.0], [14.0, 122.5], [14, 120.0], [16.2, 119.8]] },
      { name: "North America", pts: [[52, 239], [52, 231.5], [50.0, 232.5], [48.4, 235.3], [46.2, 236.0], [42.0, 235.8], [40.4, 235.6], [37.8, 237.5], [36.0, 238.5], [34.5, 239], [14, 239], [52, 239]] }
    ],
    islands: [[21.3, 202.2], [20.8, 203.7], [19.6, 204.5], [22.0, 200.5]],
    regions: [
      { name: "Pacific Ocean", at: [28.0, 178.0], sea: true },
      { name: "Guangdong", note: "the Chans' home province", at: [26.6, 108.6], anchor: "start" },
      { name: "Kingdom of Hawaii", at: [24.2, 203.5] },
      { name: "California", at: [40.5, 238.0], right: true }
    ]
  }
};
