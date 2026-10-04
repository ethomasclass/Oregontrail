// Westward: river crossings. One reusable crossing screen, fed with each river's facts.
// Depth rises after rain. The crossing rules follow the 1985 Oregon Trail:
// fording is safe under 2.5 feet, risky over 3; floating depends on width and current;
// ferries cost money and a wait; a guide cuts the risk by 80 percent.
//   width, depth   feet, on a dry day
//   rainRise       extra feet of depth per recent wet day
//   current        0 (slow) to 1 (very swift)
//   ferry          { cost, wait: [min, max] days, by } or null
//   guide          { cost: { trade: 1 }, alt: { money: n }, by } or null (pay in goods or cash)
window.WESTWARD = window.WESTWARD || {};

WESTWARD.rivers = {
  kansas: {
    name: "the Kansas River",
    width: 620, depth: 2.6, rainRise: 0.5, current: 0.4,
    text: "The Kansas River is the first big river you have to cross. Spring rain has made it high and muddy. You can ford it (drive straight through the water), or caulk the wagon (seal the cracks with tar so it floats) and float it across. You can also pay for a ferry (a flat boat that carries wagons across).",
    ferry: { cost: 1, wait: [0, 1], by: "the Papin family's ferry boat ($1 a wagon)" },
    guide: null,
    sources: ["kansas-river-ferries"]
  },
  green: {
    name: "the Green River",
    width: 400, depth: 3.2, rainRise: 0.3, current: 0.6,
    text: "The Green River runs cold and fast out of the mountains. Several companies run ferries here (flat boats that carry wagons across), and they charge whatever they want. You can also ford it (drive straight through the water), or caulk the wagon (seal the cracks with tar so it floats) and float it across.",
    ferry: { cost: 8, wait: [1, 2], by: "a ferry company's boat ($8 a wagon)" },
    guide: null,
    sources: ["green-river-ferry"]
  },
  snake: {
    name: "the Snake River at Three Island Crossing",
    width: 1000, depth: 4.5, rainRise: 0.2, current: 0.8,
    text: "Here the trail crosses the Snake River by hopping from one gravel island to the next. Between the islands, the water is deep and fast. You can ford it (drive straight through the water), or caulk the wagon (seal the cracks with tar so it floats) and float it across. The Shoshone, a Native nation who live along this river, know the safest path and will guide wagons across.",
    ferry: null,
    guide: { cost: { trade: 1 }, alt: { money: 5 }, by: "a Shoshone man who knows the safe path" },
    sources: ["native-guides"]
  }
};
