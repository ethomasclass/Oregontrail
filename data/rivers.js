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
    text: "The Kansas River is the first big crossing. Spring rain has it running high and brown.",
    ferry: { cost: 1, wait: [0, 1], by: "the Papin family's ferry ($1 a wagon)" },
    guide: null,
    sources: ["kansas-river-ferries"]
  },
  green: {
    name: "the Green River",
    width: 400, depth: 3.2, rainRise: 0.3, current: 0.6,
    text: "The Green River runs cold and fast out of the mountains. Several companies run ferries here, and they charge what they like.",
    ferry: { cost: 8, wait: [1, 2], by: "a ferry company ($8 a wagon)" },
    guide: null,
    sources: ["green-river-ferry"]
  },
  snake: {
    name: "the Snake River at Three Island Crossing",
    width: 1000, depth: 4.5, rainRise: 0.2, current: 0.8,
    text: "Here the trail crosses the Snake River by hopping across gravel islands. The water is deep and swift between them.",
    ferry: null,
    guide: { cost: { trade: 1 }, alt: { money: 5 }, by: "a Shoshone man who knows the ford" },
    sources: ["native-guides"]
  }
};
