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
 "data/landmarks.js", "data/endings.js", "data/scenes.js", "data/trail-events.js", "data/voices.js", "data/rivers.js", "js/engine.js"].forEach(function (f) {
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
W.trailEvents.forEach(function (t) {
  if (ids["ev:" + t.id]) fail("Duplicate trail event id " + t.id);
  ids["ev:" + t.id] = true;
  if (t.choices && !t.choices.some(function (ch) { return !ch.requires; }))
    fail("Trail event " + t.id + " has no choice that is always available");
  if (!t.choices && !t.outcome) fail("Trail event " + t.id + " needs choices or an outcome");
  (t.choices || []).forEach(function (ch) {
    if (ch.outcomes) {
      var sum = ch.outcomes.reduce(function (s, o) { return s + o.chance; }, 0);
      if (Math.abs(sum - 1) > 0.001) fail("Trail event " + t.id + " choice chances add to " + sum);
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
    if (b.type === "river" && !W.rivers[b.river]) fail("Unknown river " + b.river);
  });
});
Object.keys(W.places).forEach(function (k) {
  if (!W.scenes[W.places[k].scene]) fail("Place " + k + " uses unknown scene " + W.places[k].scene);
});
W.cards.forEach(function (c) { if (c.art && !W.scenes[c.art]) fail("Card " + c.id + " uses unknown scene " + c.art); });
Object.keys(W.endings.family).forEach(function (k) {
  if (!W.families.some(function (f) { return k.indexOf(f.id + "-") === 0; })) fail("Ending for unknown family " + k);
});

// Card text slots fill for every family.
W.families.forEach(function (fam) {
  var st = E.create(1); E.chooseFamily(st, fam.id, 0);
  W.cards.forEach(function (c) {
    var all = [c.title, c.text].concat(c.choices.map(function (ch) { return ch.label + " " + (ch.result || "") + (ch.outcomes || []).map(function (o) { return o.result; }).join(" "); }));
    all.forEach(function (t) { if (/\{\w+\}/.test(E.fill(st, t))) fail("Unfilled slot in card " + c.id + ": " + t.slice(0, 60)); });
  });
});

// No em dashes in any shipped text.
["data", "js", "css"].forEach(function (dir) {
  fs.readdirSync(path.join(root, dir)).filter(function (f) { return /\.(js|css)$/.test(f); }).forEach(function (f) {
    var text = fs.readFileSync(path.join(root, dir, f), "utf8");
    if (text.indexOf("—") >= 0) fail("Em dash found in " + dir + "/" + f);
  });
});
if (fs.readFileSync(path.join(root, "index.html"), "utf8").indexOf("—") >= 0) fail("Em dash found in index.html");

// ---------------------------------------------------------------- simulated runs
var stats = {};
W.families.forEach(function (fam) {
  var s = stats[fam.id] = { deathsDaily: 0, hungry: 0, runs: 0, decisions: 0, deaths: 0, oregon: 0, california: 0, maxDecisions: 0, minDecisions: 99, events: 0, minutes: 0, maxMinutes: 0 };
  for (var seed = 1; seed <= runs; seed++) {
    var state = E.create(seed);
    var t0 = 0;
    E.chooseFamily(state, fam.id, t0);
    var decisions = 0, guard = 0, ended = false;
    var now = t0;
    while (!ended && guard++ < 100) {
      // Simulate a group: time at the last stop by its kind, about 0.4 min per trail event.
      var lastBeat = state.beats[state.index] || { type: "store" };
      var span = { store: [2.5, 3.5], river: [1.25, 2], landmark: [0.8, 1.5], fork: [1.5, 2.5] }[lastBeat.type] || [1.75, 3];
      now += (span[0] + E.rand(state) * (span[1] - span[0])) * 60000;
      var trip = E.advance(state, now);
      if (!trip) { fail(fam.id + " seed " + seed + ": ran out of beats without an ending"); break; }
      var trip = state.trip;
      E.pickTripEvents(state, now).forEach(function (ev) {
        if (/\{\w+\}/.test(ev.title + ev.text + JSON.stringify(ev.choices))) fail("Unfilled slot in trail event " + ev.id);
        var okc = E.choices(state, ev).filter(function (x) { return x.ok; });
        E.resolveEvent(state, ev, okc[Math.floor(E.rand(state) * okc.length)].index);
        s.events++;
        now += (0.3 + E.rand(state) * 0.2) * 60000;
      });
      // live the days of the trip; a cautious group switches to meager when food runs low
      while (trip && trip.day < trip.days) {
        if (E.settings(state).foodDays < 40) state.rations = "meager";
        var d = E.stepDay(state, trip);
        s.deathsDaily += d.deaths.length;
      }
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
        var pickC = ok[Math.floor(E.rand(state) * ok.length)].index, chc = c.choices[pickC];
        if (chc.minigame === "raft") E.choose(state, c, pickC, { outcome: E.rand(state) < 0.6 ? 0 : 1 });
        else if (chc.minigame === "pan") E.choose(state, c, pickC, { effects: { gold: Math.round(E.rand(state) * 60) } });
        else E.choose(state, c, pickC);
        decisions++;
      } else if (b.type === "river") {
        var rv = W.rivers[b.river], tries = 0, rr;
        do {
          var ro = E.riverOptions(state, W.rivers[b.river]).filter(function (x) { return x.ok; });
          rr = E.crossRiver(state, rv, ro[Math.floor(E.rand(state) * ro.length)].id);
        } while (!rr.crossed && tries++ < 3);
        if (!rr.crossed) E.crossRiver(state, rv, "ford");
        decisions++;
      } else if (b.type === "ending") {
        ended = true;
      }
    }
    if (!ended) fail(fam.id + " seed " + seed + ": never reached an ending");
    var mins = (now - t0) / 60000 + 1; // when the group reaches the ending (plus the title screen)
    s.minutes += mins; s.maxMinutes = Math.max(s.maxMinutes, mins);
    if (E.alive(state).length < 2) fail(fam.id + " seed " + seed + ": fewer than 2 survivors");
    var L = E.ledger(state);
    if (!L.ending) fail(fam.id + " seed " + seed + ": no ending text for branch " + state.branch);
    s.runs++; s.decisions += decisions; s.deaths += state.deaths;
    if (state.food === 0) s.hungry++;
    s.days = (s.days || 0) + state.days;
    s[state.branch]++;
    s.maxDecisions = Math.max(s.maxDecisions, decisions);
    s.minDecisions = Math.min(s.minDecisions, decisions);
  }
});

Object.keys(stats).forEach(function (k) {
  var s = stats[k];
  console.log(k.padEnd(8) + " runs " + s.runs + "  decisions " + s.minDecisions + "-" + s.maxDecisions +
    " (avg " + (s.decisions / s.runs).toFixed(1) + ")  deaths/run " + (s.deaths / s.runs).toFixed(2) +
    "  oregon " + s.oregon + "  california " + s.california +
    "  trip days " + Math.round(s.days / s.runs) + "  out of food at end " + s.hungry + "  trail events/run " + (s.events / s.runs).toFixed(1) + "  ending reached at min "  + (s.minutes / s.runs).toFixed(1) + " max " + s.maxMinutes.toFixed(1));
});
if (failures.length) {
  var uniq = Array.from(new Set(failures));
  console.log("\nFAILED (" + uniq.length + "):\n  " + uniq.slice(0, 40).join("\n  "));
  process.exit(1);
}
console.log("\nAll checks passed.");
