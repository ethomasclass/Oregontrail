// Westward playtest: plays many full runs with random choices and checks the rules.
//   node tools/playtest.js            (all families, 300 seeds each)
//   node tools/playtest.js 50         (50 seeds each)
// Also checks every text file for em dashes (a style rule for this project).
"use strict";
var fs = require("fs");
var path = require("path");
var vm = require("vm");

var root = path.join(__dirname, "..");
globalThis.window = globalThis;
["data/config.js", "data/families.js", "data/route.js", "data/stores.js", "data/cards.js",
 "data/landmarks.js", "data/endings.js", "data/art.js", "js/engine.js"].forEach(function (f) {
  vm.runInThisContext(fs.readFileSync(path.join(root, f), "utf8"), { filename: f });
});

var W = globalThis.WESTWARD, E = W.engine;
var runs = Number(process.argv[2]) || 300;
var failures = [];
function fail(msg) { failures.push(msg); }

// ---------------------------------------------------------------- content checks
var ids = {};
W.cards.forEach(function (c) {
  if (ids[c.id]) fail("Duplicate card id " + c.id);
  ids[c.id] = true;
  if (!c.choices.some(function (ch) { return !ch.requires; }))
    fail("Card " + c.id + " has no choice that is always available");
  c.choices.forEach(function (ch) {
    if (ch.outcomes) {
      var sum = ch.outcomes.reduce(function (s, o) { return s + o.chance; }, 0);
      if (Math.abs(sum - 1) > 0.001) fail("Card " + c.id + " choice '" + ch.label + "' chances add to " + sum);
    }
  });
});
Object.keys(W.routes).forEach(function (r) {
  W.routes[r].forEach(function (b) {
    if (!W.places[b.at]) fail("Route " + r + " uses unknown place " + b.at);
    [b.card].concat(Object.values(b.byFamily || {})).filter(Boolean).forEach(function (id) {
      if (!ids[id]) fail("Route " + r + " uses unknown card " + id);
    });
    if (b.landmark && !W.landmarks[b.landmark]) fail("Unknown landmark " + b.landmark);
  });
});
Object.keys(W.endings.family).forEach(function (k) {
  if (!W.families.some(function (f) { return k.indexOf(f.id + "-") === 0; })) fail("Ending for unknown family " + k);
});

// No em dashes in any shipped text.
["data", "js", "css"].forEach(function (dir) {
  fs.readdirSync(path.join(root, dir)).forEach(function (f) {
    var text = fs.readFileSync(path.join(root, dir, f), "utf8");
    if (text.indexOf("—") >= 0) fail("Em dash found in " + dir + "/" + f);
  });
});
if (fs.readFileSync(path.join(root, "index.html"), "utf8").indexOf("—") >= 0) fail("Em dash found in index.html");

// ---------------------------------------------------------------- simulated runs
var stats = {};
W.families.forEach(function (fam) {
  var s = stats[fam.id] = { runs: 0, decisions: 0, deaths: 0, oregon: 0, california: 0, maxDecisions: 0, minDecisions: 99 };
  for (var seed = 1; seed <= runs; seed++) {
    var state = E.create(seed);
    var t0 = 0;
    E.chooseFamily(state, fam.id, t0);
    var decisions = 0, guard = 0, ended = false;
    var now = t0;
    while (!ended && guard++ < 100) {
      // Simulate a group that takes 2.5 to 4 minutes per stop.
      now += (2.5 + E.rand(state) * 1.5) * 60000;
      var trip = E.advance(state, now);
      if (!trip) { fail(fam.id + " seed " + seed + ": ran out of beats without an ending"); break; }
      var b = E.beat(state);
      if (b.type === "store") {
        var store = E.storeFor(state), cart = {};
        store.items.forEach(function (it) { cart[it.id] = it.recommended || it.min || 0; });
        while (E.cartProblems(state, store, cart).length) {
          var cut = store.items.filter(function (it) { return cart[it.id] > (it.min || 0); }).pop();
          if (!cut) { fail(fam.id + ": can't afford the minimum outfit"); break; }
          cart[cut.id]--;
        }
        E.checkout(state, store, cart);
        decisions++;
      } else if (b.type === "card" || b.type === "draw" || b.type === "fork") {
        var c = E.cardFor(state);
        if (c.families && c.families.indexOf(fam.id) < 0) fail(fam.id + " drew card meant for others: " + c.id);
        var ok = E.choices(state, c).filter(function (x) { return x.ok; });
        if (!ok.length) { fail(fam.id + " seed " + seed + ": no available choice on " + c.id); break; }
        E.choose(state, c, ok[Math.floor(E.rand(state) * ok.length)].index);
        decisions++;
      } else if (b.type === "ending") {
        ended = true;
      }
    }
    if (!ended) fail(fam.id + " seed " + seed + ": never reached an ending");
    if (E.alive(state).length < 2) fail(fam.id + " seed " + seed + ": fewer than 2 survivors");
    var L = E.ledger(state);
    if (!L.ending) fail(fam.id + " seed " + seed + ": no ending text for branch " + state.branch);
    s.runs++; s.decisions += decisions; s.deaths += state.deaths;
    s[state.branch]++;
    s.maxDecisions = Math.max(s.maxDecisions, decisions);
    s.minDecisions = Math.min(s.minDecisions, decisions);
  }
});

Object.keys(stats).forEach(function (k) {
  var s = stats[k];
  console.log(k.padEnd(8) + " runs " + s.runs + "  decisions " + s.minDecisions + "-" + s.maxDecisions +
    " (avg " + (s.decisions / s.runs).toFixed(1) + ")  deaths/run " + (s.deaths / s.runs).toFixed(2) +
    "  oregon " + s.oregon + "  california " + s.california);
});
if (failures.length) {
  var uniq = Array.from(new Set(failures));
  console.log("\nFAILED (" + uniq.length + "):\n  " + uniq.slice(0, 40).join("\n  "));
  process.exit(1);
}
console.log("\nAll checks passed.");
