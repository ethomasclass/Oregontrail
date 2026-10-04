// Westward: game rules and state. No DOM code here, so the same file runs in
// the browser and in the Node playtest (tools/playtest.js).
(function (root) {
  "use strict";

  var W = root.WESTWARD;
  var STATS = ["money", "food", "oxen", "parts", "medicine", "trade", "gold", "land", "days"];
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"];

  // ---------------------------------------------------------------- random
  // mulberry32: small, fast, and its whole state is one integer we can save.
  function rand(state) {
    var t = (state.rng = (state.rng + 0x6d2b79f5) | 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  function pick(state, list) {
    return list[Math.floor(rand(state) * list.length)];
  }

  // ---------------------------------------------------------------- lookups
  function family(state) {
    return W.families.filter(function (f) { return f.id === state.familyId; })[0];
  }
  function card(id) {
    var c = W.cards.filter(function (c) { return c.id === id; })[0];
    if (!c) throw new Error("No card with id " + id);
    return c;
  }
  function place(id) { return W.places[id]; }
  function alive(state) { return state.members.filter(function (m) { return m.alive; }); }

  function dateOf(state) {
    var d = new Date(state.startDate + "T12:00:00Z");
    d.setUTCDate(d.getUTCDate() + state.days);
    return d;
  }
  function formatDate(d) {
    return MONTHS[d.getUTCMonth()] + " " + d.getUTCDate() + ", " + d.getUTCFullYear();
  }

  // ---------------------------------------------------------------- setup
  function create(seed) {
    seed = (seed === undefined || seed === null || seed === "") ?
      Math.floor(Math.random() * 1e9) : Number(seed);
    return { seed: seed, rng: seed, screen: "title" };
  }

  function chooseFamily(state, familyId, now) {
    state.familyId = familyId;
    var f = family(state);
    state.members = f.members.map(function (m) {
      return { name: m.name, role: m.role, age: m.age, look: m.look, color: m.color, health: 3, alive: true, cause: null, epitaph: null };
    });
    state.students = {};
    state.money = f.money;
    state.food = 0; state.oxen = 0; state.parts = 0; state.medicine = 0;
    state.trade = 0; state.gold = 0; state.land = 0; state.days = 0;
    state.miles = 0;
    state.startDate = f.startDate;
    state.flags = {};
    state.branch = f.route === "sea" ? "california" : null;
    state.deaths = 0;
    state.used = {};
    state.log = [];
    state.beats = beatsFor(state, f.route);
    state.index = -1;
    state.startedAt = now != null ? now : Date.now();
    state.place = f.startPlace;
    return state;
  }

  function beatsFor(state, routeName) {
    return W.routes[routeName]
      .filter(function (b) { return !b.families || b.families.indexOf(state.familyId) >= 0; })
      .map(function (b) { return Object.assign({}, b); });
  }

  // ---------------------------------------------------------------- store
  function storeFor(state) {
    return W.stores[state.beats[state.index].at];
  }
  function cartTotal(store, cart) {
    return store.items.reduce(function (sum, it) { return sum + (cart[it.id] || 0) * it.price; }, 0);
  }
  function cartProblems(state, store, cart) {
    var problems = [];
    if (cartTotal(store, cart) > state.money) problems.push("You can't spend more than you have.");
    store.items.forEach(function (it) {
      if (it.min && (cart[it.id] || 0) < it.min) problems.push("You need at least " + it.min + " of: " + it.name + ".");
    });
    return problems;
  }
  function checkout(state, store, cart) {
    state.money -= cartTotal(store, cart);
    store.items.forEach(function (it) {
      state[it.stat] = (state[it.stat] || 0) + (cart[it.id] || 0) * it.per;
    });
    state.log.push({ kind: "store", text: "Outfitted at " + place(state.beats[state.index].at).name });
    // the oxen get names, the way emigrants named theirs
    var names = (W.oxNames || []).slice();
    state.oxNames = [];
    for (var i = 0; i < state.oxen && names.length; i++) state.oxNames.push(names.splice(Math.floor(rand(state) * names.length), 1)[0]);
  }

  // ---------------------------------------------------------------- travel
  function elapsedMinutes(state, now) {
    return ((now || Date.now()) - state.startedAt) / 60000;
  }

  // Move to the next beat: skip optional beats if behind schedule, then travel.
  function advance(state, now) {
    var minutes = elapsedMinutes(state, now);
    var skipped = [];
    var next = state.index + 1;
    while (next < state.beats.length - 1 && state.beats[next].optional &&
           minutes > state.beats[next].target + W.config.slackMinutes) {
      skipped.push(place(state.beats[next].at).name);
      next++;
    }
    if (next >= state.beats.length) return null;
    var trip = travel(state, state.beats[next].at);
    state.index = next;
    state.place = state.beats[next].at;
    trip.skipped = skipped;
    return trip;
  }

  function travel(state, toId) {
    var from = place(state.place), to = place(toId);
    var trip = { from: from.name, to: to.name, miles: 0, days: 0, notes: [] };
    if (state.index < 0) return trip; // the first beat is where you start
    if (from === to) {
      trip.days = 7;
    } else if (typeof from.miles === "number" && typeof to.miles === "number") {
      trip.miles = Math.max(0, to.miles - from.miles);
      var speed = W.config.milesPerDay * (state.oxen >= W.config.minOxen ? 1 : 0.75);
      trip.days = Math.ceil(trip.miles / speed);
      if (state.oxen < W.config.minOxen) trip.notes.push("Too few oxen. The wagon moves slowly.");
    } else {
      trip.days = to.days || 3;
    }
    state.miles += trip.miles;
    state.days += trip.days;

    // Food and recovery along the way.
    var need = to.rations ? 0 : trip.days * alive(state).length * W.config.foodPerPersonPerDay;
    if (state.food >= need) {
      state.food -= need;
      alive(state).forEach(function (m) { if (m.health < 3) m.health++; });
    } else {
      state.food = 0;
      trip.notes.push("Food ran out. You traded and foraged, but everyone is weaker.");
      alive(state).forEach(function (m) { if (m.health > 1) m.health--; });
    }
    return trip;
  }

  function beat(state) { return state.beats[state.index]; }

  // ---------------------------------------------------------------- cards
  function cardFor(state) {
    var b = beat(state);
    if (b.type === "fork") return card("fork");
    if (b._card) return card(b._card);
    var id = (b.byFamily && b.byFamily[state.familyId]) || b.card;
    if (!id && b.type === "draw") {
      var options = W.cards.filter(function (c) {
        return c.pools && c.pools.indexOf(b.pool) >= 0 && !state.used[c.id] &&
          (!c.families || c.families.indexOf(state.familyId) >= 0);
      });
      if (!options.length) options = W.cards.filter(function (c) { return c.pools && c.pools.indexOf(b.pool) >= 0; });
      id = pick(state, options).id;
    }
    b._card = id;
    state.used[id] = true;
    return card(id);
  }

  function meets(state, requires) {
    if (!requires) return true;
    return Object.keys(requires).every(function (k) {
      if (STATS.indexOf(k) >= 0) return (state[k] || 0) >= requires[k];
      return !!state.flags[k] === !!requires[k];
    });
  }

  function choices(state, c) {
    return c.choices.map(function (ch, i) {
      return { index: i, label: ch.label, ok: meets(state, ch.requires) };
    });
  }

  function choose(state, c, index) {
    var ch = c.choices[index];
    var outcome = ch;
    if (ch.outcomes) {
      var r = rand(state), acc = 0;
      outcome = ch.outcomes[ch.outcomes.length - 1];
      for (var i = 0; i < ch.outcomes.length; i++) {
        acc += ch.outcomes[i].chance;
        if (r < acc) { outcome = ch.outcomes[i]; break; }
      }
    }
    var report = applyEffects(state, outcome.effects || {});
    report.result = outcome.result;
    report.choice = ch.label;
    state.log.push({ kind: c.slots ? "event" : "card", card: c.id, choice: ch.label, result: outcome.result });
    return report;
  }

  function applyEffects(state, fx) {
    var report = { changes: [], deaths: [], sick: [] };
    STATS.forEach(function (k) {
      if (typeof fx[k] !== "number" || fx[k] === 0) return;
      var before = state[k] || 0;
      state[k] = Math.max(k === "days" ? -9999 : 0, before + fx[k]);
      if (k === "days") state.days = Math.max(0, state.days);
      report.changes.push({ stat: k, amount: state[k] - before });
    });
    if (state.oxen < 2 && family(state).route === "trail") {
      report.changes.push({ stat: "oxen", amount: 2 - state.oxen, note: "You trade for worn-out oxen to keep moving." });
      state.oxen = 2;
    }
    if (fx.flags) {
      Object.keys(fx.flags).forEach(function (k) {
        state.flags[k] = fx.flags[k];
        if (k === "branch") setBranch(state, fx.flags[k]);
      });
    }
    if (fx.heal) {
      var sickest = alive(state).sort(function (a, b) { return a.health - b.health; })[0];
      if (sickest && sickest.health < 3) sickest.health++;
    }
    if (fx.sick && rand(state) < fx.sick.chance) sicken(state, fx.sick.cause, report);
    return report;
  }

  function sicken(state, cause, report) {
    var who = pick(state, alive(state));
    var canDie = state.deaths < W.config.maxDeaths && alive(state).length > 2;
    if (canDie && (who.health < 3 || rand(state) < 0.3)) {
      who.alive = false;
      who.health = 0;
      who.cause = cause;
      state.deaths++;
      who.epitaph = "Here lies " + who.name + " " + surname(state) + ", age " + who.age +
        ". Died of " + cause + " near " + place(state.place).name + ", " + formatDate(dateOf(state)) + ".";
      report.deaths.push(who);
    } else {
      who.health = 1;
      report.sick.push(who);
    }
  }

  function surname(state) {
    var f = family(state);
    if (f.id === "chinese") return "";
    return f.name.replace(/^The /, "").replace(/ family$/, "");
  }

  function setBranch(state, branch) {
    state.branch = branch;
    state.beats = state.beats.slice(0, state.index + 1).concat(beatsFor(state, branch));
  }

  // ---------------------------------------------------------------- trail events
  // Events on the way between stops, generated from templates in trail-events.js.
  // The clock decides how many: time a group has in hand becomes trail life.
  function terrainOf(placeId) {
    var sc = W.scenes && W.scenes[place(placeId).scene];
    return (sc && sc.terrain) || "plains";
  }
  function routeKind(state, placeId) {
    var f = family(state);
    if (f.route === "trail") return "trail";
    return ["hongkong", "pacific", "sanfrancisco"].indexOf(placeId) >= 0 ? "sea" : "walk";
  }
  function eventCount(state, now) {
    var b = beat(state), c = W.config;
    if (!b || state.index <= 0 || b.type === "ending") return 0;
    // Budget against the whole rest of the journey: time left until the ending,
    // minus the stops still required. Only the true surplus becomes trail life.
    var end = state.beats[state.beats.length - 1];
    var endTarget = end.type === "ending" ? end.target : W.routes.california[W.routes.california.length - 1].target;
    var required = state.beats.slice(state.index).filter(function (x) { return !x.optional && x.type !== "ending"; }).length;
    if (end.type !== "ending") required += 4; // the branch after the fork is not added yet
    var elapsed = elapsedMinutes(state, now);
    var slack = Math.min(b.target - elapsed, endTarget - elapsed - required * c.minutesPerStop) - c.eventReserveMinutes;
    var left = c.maxEventsPerRun - Object.keys(state.eventsSeen || {}).length;
    var n = Math.max(0, Math.min(c.maxTripEvents, left, Math.floor(slack / c.eventMinutes)));
    var out = 0;
    for (var i = 0; i < n; i++) if (rand(state) < c.eventChance) out++;
    return out;
  }
  function eligible(state, t, terrain, route, month) {
    var w = t.when || {};
    if (w.route && w.route !== route) return false;
    if (w.terrain && w.terrain.indexOf(terrain) < 0) return false;
    if (w.months && w.months.indexOf(month) < 0) return false;
    if (w.has && !meets(state, w.has)) return false;
    return true;
  }
  function pickTripEvents(state, now) {
    var n = eventCount(state, now);
    var terrain = terrainOf(state.place), route = routeKind(state, state.place), month = dateOf(state).getUTCMonth();
    state.eventsSeen = state.eventsSeen || {};
    var picked = [];
    for (var i = 0; i < n; i++) {
      var pool = (W.trailEvents || []).filter(function (t) {
        return eligible(state, t, terrain, route, month) && !state.eventsSeen[t.id] && picked.indexOf(t) < 0;
      });
      if (!pool.length) break;
      var total = pool.reduce(function (s, t) { return s + (t.weight || 1); }, 0), r = rand(state) * total, chosen = pool[0];
      for (var j = 0; j < pool.length; j++) { r -= pool[j].weight || 1; if (r <= 0) { chosen = pool[j]; break; } }
      state.eventsSeen[chosen.id] = true;
      picked.push(chosen);
    }
    return picked.map(function (t) { return instantiate(state, t); });
  }
  // Fill a template's slots: who, which ox, where.
  function instantiate(state, t) {
    var living = alive(state);
    var member = pick(state, living);
    var child = living.slice().sort(function (a, b) { return a.age - b.age; })[0];
    var doctor = living.filter(function (m) { return m.role === "doctor"; })[0] || member;
    var ox = state.oxNames && state.oxNames.length ? pick(state, state.oxNames) : "the lead ox";
    var next = state.beats[state.index] ? place(state.beats[state.index].at).name.split(":")[0].split(",")[0] : "the next stop";
    var slots = { member: member.name, child: child.name, doctor: doctor.name, ox: ox, next: next, family: family(state).short };
    function fill(str) { return String(str).replace(/\{(\w+)\}/g, function (m, k) { return slots[k] != null ? slots[k] : m; }); }
    function fillChoice(ch) {
      var o = Object.assign({}, ch, { label: fill(ch.label), result: ch.result && fill(ch.result) });
      if (ch.outcomes) o.outcomes = ch.outcomes.map(function (x) { return Object.assign({}, x, { result: fill(x.result) }); });
      return o;
    }
    var choices = t.choices ? t.choices.map(fillChoice) : [fillChoice(Object.assign({ label: "Continue" }, t.outcome))];
    return { id: t.id, title: fill(t.title), text: fill(t.text), lead: t.lead || "navigator", react: t.react || "stop",
      choices: choices, slots: slots, quick: !t.choices, draft: true };
  }
  function resolveEvent(state, ev, index) {
    var before = state.oxen;
    var report = choose(state, ev, index);
    // the named ox is the one lost
    if (state.oxen < before && state.oxNames) {
      var i = state.oxNames.indexOf(ev.slots.ox);
      if (i >= 0) state.oxNames.splice(i, 1); else state.oxNames.pop();
    }
    return report;
  }

  // ---------------------------------------------------------------- teacher
  function jumpTo(state, i) {
    var target = state.beats[i];
    state.index = i;
    state.place = target.at;
    if (typeof place(target.at).miles === "number") state.miles = place(target.at).miles;
  }

  // ---------------------------------------------------------------- ending
  function ledger(state) {
    var f = family(state);
    var key = f.id + "-" + (state.branch || "oregon");
    var E = W.endings;
    return {
      family: f,
      ending: E.family[key],
      survivors: alive(state),
      lost: state.members.filter(function (m) { return !m.alive; }),
      money: state.money,
      gold: state.gold,
      land: state.land,
      flagLines: Object.keys(E.flagLines).filter(function (k) { return state.flags[k]; })
        .map(function (k) { return E.flagLines[k]; }),
      others: E.others[state.branch || "oregon"],
      date: formatDate(dateOf(state)),
      miles: state.miles
    };
  }

  W.engine = {
    create: create, chooseFamily: chooseFamily, family: family, place: place, alive: alive,
    storeFor: storeFor, cartTotal: cartTotal, cartProblems: cartProblems, checkout: checkout,
    advance: advance, beat: beat, cardFor: cardFor, choices: choices, choose: choose,
    elapsedMinutes: elapsedMinutes, dateOf: dateOf, formatDate: formatDate,
    jumpTo: jumpTo, ledger: ledger, rand: rand, card: card,
    pickTripEvents: pickTripEvents, resolveEvent: resolveEvent
  };
})(typeof window !== "undefined" ? window : globalThis);
