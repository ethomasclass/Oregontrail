// Westward readability check: Flesch-Kincaid grade for every student-facing string.
//   node tools/readability.js            (summary by file, plus the 25 hardest strings)
//   node tools/readability.js cards 60   (only data/cards.js, show the 60 hardest)
// Target: 8th grade (FK 8 or lower on average, no single passage far above 10).
// Exact historical quotes are skipped (they must stay word for word); their "plain"
// versions are checked instead.
"use strict";
var fs = require("fs");
var path = require("path");
var vm = require("vm");

var root = path.join(__dirname, "..");
globalThis.window = globalThis;
var FILES = {
  cards: "data/cards.js", events: "data/trail-events.js", voices: "data/voices.js",
  landmarks: "data/landmarks.js", endings: "data/endings.js", rivers: "data/rivers.js",
  stores: "data/stores.js", families: "data/families.js", config: "data/config.js", route: "data/route.js"
};
var only = process.argv[2], show = Number(process.argv[3]) || 25;
var SKIP_KEYS = { id: 1, sources: 1, source: 1, basis: 1, teacherNote: 1, art: 1, scene: 1, color: 1, look: 1, cause: 1, when: 1, pools: 1, minigame: 1, speaker: 1, year: 1 };
var TEXT_KEYS = { text: 1, result: 1, label: 1, title: 1, lead: 0, react: 1, headline: 1, plain: 1, lines: 1, who: 1, blurb: 1, note: 1, desc: 1, intro: 1, hint: 1, story: 1 };

function syllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!word) return 0;
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "");
  var m = word.match(/[aeiouy]{1,2}/g);
  return Math.max(1, m ? m.length : 1);
}
function stats(s) {
  s = s.replace(/\{[a-z]+\}/g, "Sam").replace(/\$?\d[\d,.]*/g, "ten");
  var sentences = s.split(/[.!?]+(?:\s|$)/).filter(function (x) { return /[a-z]/i.test(x); }).length || 1;
  var words = s.split(/\s+/).filter(function (w) { return /[a-z]/i.test(w); });
  var syl = words.reduce(function (n, w) { return n + syllables(w); }, 0);
  return { words: words.length, sentences: sentences, syl: syl };
}
function grade(st) { return st.words ? 0.39 * st.words / st.sentences + 11.8 * st.syl / st.words - 15.59 : 0; }

var rows = [];
function walk(v, where, key, parent) {
  if (typeof v === "string") {
    if (!TEXT_KEYS[key]) return;
    if (parent && parent.quote === true && key === "text") return;   // exact quote
    var st = stats(v);
    if (st.words < 4) return;
    rows.push({ where: where, text: v, st: st, g: grade(st) });
  } else if (Array.isArray(v)) {
    v.forEach(function (x, i) { walk(x, where + "[" + i + "]", key, parent); });
  } else if (v && typeof v === "object") {
    Object.keys(v).forEach(function (k) {
      if (SKIP_KEYS[k]) return;
      if (k === "quote" && typeof v[k] === "string") return;          // landmark exact quote
      walk(v[k], where + (v.id ? "(" + v.id + ")" : "") + "." + k, k, v);
    });
  }
}

Object.keys(FILES).forEach(function (name) {
  if (only && only !== name) return;
  var before = Object.keys(globalThis.WESTWARD || {});
  vm.runInThisContext(fs.readFileSync(path.join(root, FILES[name]), "utf8"), { filename: FILES[name] });
  var W = globalThis.WESTWARD;
  Object.keys(W).forEach(function (k) {
    if (before.indexOf(k) >= 0 && name !== "config") return;
    if (name === "config" && k !== "roles") return;
    var start = rows.length;
    walk(W[k], name + ":" + k, k === "voices" ? "" : "", null);
    rows.slice(start).forEach(function (r) { r.file = name; });
  });
});

var byFile = {};
rows.forEach(function (r) {
  var f = byFile[r.file] = byFile[r.file] || { words: 0, sentences: 0, syl: 0, n: 0, over10: 0 };
  f.words += r.st.words; f.sentences += r.st.sentences; f.syl += r.st.syl; f.n++;
  if (r.g > 10) f.over10++;
});
console.log("Flesch-Kincaid grade by file (target 8 or lower):");
Object.keys(byFile).forEach(function (k) {
  var f = byFile[k];
  console.log("  " + (k + "          ").slice(0, 10) + " grade " + grade(f).toFixed(1) + "  (" + f.n + " passages, " + f.over10 + " above grade 10)");
});
rows.sort(function (a, b) { return b.g - a.g; });
console.log("\nHardest passages:");
rows.slice(0, show).forEach(function (r) { console.log("  " + r.g.toFixed(1) + "  " + r.where + "\n        " + r.text.slice(0, 160)); });
