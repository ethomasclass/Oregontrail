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
      return { name: m.name, role: m.role, age: m.age, look: m.look, color: m.color, alive: true, sick: null, cause: null, epitaph: null };
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
    state.pace = "steady";
    state.rations = "filling";
    state.H = 0;            // hidden party health: 0 is best, 140 is the threshold of death
    state.FS = 0;           // starvation and exposure build-up
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
    // Skip an optional stop if the group is late for it, or if the rest of the
    // journey would run past the ending target.
    while (next < state.beats.length - 1 && state.beats[next].optional &&
           (minutes > state.beats[next].target + W.config.slackMinutes || projectedEnd(state, next, minutes) > endTargetOf(state))) {
      skipped.push(place(state.beats[next].at).name);
      next++;
    }
    if (next >= state.beats.length) return null;
    var trip = travel(state, state.beats[next].at);
    state.index = next;
    state.place = state.beats[next].at;
    state.trip = trip;
    trip.skipped = skipped;
    return trip;
  }

  // ---------------------------------------------------------------- the daily model
  // After the 1985 Oregon Trail (R. Philip Bouchard's design; see research/oregon-trail-teardown.md):
  // one hidden party health number H, 0 (best) to 140 (death). Every day H recovers 10%,
  // then takes on loads from pace, rations, weather, sickness, and hardship. A steady
  // daily load S settles H at about 10 x S, so choices show up a few days later.
  var PACES = {
    steady: { speed: 1, load: 2, name: "Steady", text: "About 8 hours a day, with frequent rests." },
    strenuous: { speed: 1.5, load: 4, name: "Strenuous", text: "About 12 hours a day. Everyone ends the day very tired." },
    grueling: { speed: 2, load: 6, name: "Grueling", text: "About 16 hours a day, before sunrise until dark. Health suffers." }
  };
  var RATIONS = {
    filling: { lb: 3, load: 0, name: "Filling", text: "Meals are large and generous. 3 lb of food per person a day." },
    meager: { lb: 2, load: 2, name: "Meager", text: "Meals are small, but adequate. 2 lb per person a day." },
    bare: { lb: 1, load: 4, name: "Bare bones", text: "Meals are very small; everyone stays hungry. 1 lb per person a day." }
  };
  var ILLNESS = {
    trail: ["exhaustion", "typhoid", "cholera", "measles", "dysentery", "a fever"],
    sea: ["a fever", "dysentery", "exhaustion"],
    walk: ["a fever", "dysentery", "exhaustion"]
  };
  var TEMPS = ["very cold", "cold", "cool", "warm", "hot", "very hot"];

  function healthLabel(H) { return H < 35 ? "good" : H < 70 ? "fair" : H < 105 ? "poor" : "very poor"; }

  // Weather for one day: temperature class from month and land, plus rain or snow.
  function weatherFor(state) {
    var month = dateOf(state).getUTCMonth(), terrain = terrainOf(state.place);
    var base = [1, 1, 2, 2, 3, 4, 4, 4, 3, 2, 1, 0][month];
    if (terrain === "mountains") base -= 1;
    if (terrain === "desert" || terrain === "goldfields") base += 1;
    if (terrain === "sea" || terrain === "valley") base = Math.min(base, 3);
    var t = Math.max(0, Math.min(5, base + (rand(state) < 0.2 ? (rand(state) < 0.5 ? -1 : 1) : 0)));
    var wetChance = [0.1, 0.1, 0.15, 0.25, 0.25, 0.15, 0.08, 0.06, 0.08, 0.12, 0.15, 0.1][month];
    if (terrain === "desert") wetChance *= 0.2;
    var r = rand(state), wet = r < wetChance * 0.3 ? 2 : r < wetChance ? 1 : 0;
    var snow = wet && t <= 1;
    var label = wet ? (wet === 2 ? (snow ? "very snowy" : "very rainy") : (snow ? "snowy" : "rainy")) : TEMPS[t];
    return { temp: t, wet: wet, snow: snow, label: label, kind: wet ? (snow ? "snow" : "rain") : null };
  }

  // Set up a trip; the days are lived one at a time with stepDay().
  function travel(state, toId) {
    var from = place(state.place), to = place(toId);
    var trip = { from: from.name, to: to.name, toId: toId, miles: 0, days: 0, day: 0, notes: [], mpd: 0, provisioned: !!to.rations };
    if (state.index < 0) return trip; // the first beat is where you start
    if (from === to) {
      trip.days = 3;
    } else if (typeof from.miles === "number" && typeof to.miles === "number") {
      trip.miles = Math.max(0, to.miles - from.miles);
      trip.mpd = speed(state, to);
      trip.days = Math.max(1, Math.ceil(trip.miles / trip.mpd));
      if (state.oxen < W.config.minOxen) trip.notes.push("Too few oxen. The wagon moves slowly.");
    } else {
      trip.days = to.days || 3;
    }
    trip.startMiles = state.miles;
    trip.endMiles = state.miles + trip.miles;
    return trip;
  }

  // Miles a day: 20 on the plains, 12 in the mountains and beyond (the 1985 game's
  // numbers), times pace, oxen (4 needed for full speed), and 10% off per sick person.
  function speed(state, to) {
    var base = (to.miles || 0) <= 650 ? W.config.milesPerDayPlains : W.config.milesPerDayMountains;
    var oxen = Math.min(1, state.oxen / 4);
    var sick = alive(state).filter(function (m) { return m.sick; }).length;
    return Math.max(4, base * PACES[state.pace].speed * oxen * (1 - 0.1 * sick));
  }

  // Live one day. Returns what happened: weather, messages, and any deaths.
  function stepDay(state, trip, resting) {
    var day = { messages: [], deaths: [], sick: [] };
    var w = weatherFor(state);
    day.weather = w;
    state.weather = w.label;
    state.rain = (state.rain || 0) * 0.8 + w.wet;
    state.days += 1;
    if (trip && !resting) {
      trip.day += 1;
      var m = trip.days ? Math.round(trip.startMiles + (trip.endMiles - trip.startMiles) * trip.day / trip.days) : state.miles;
      state.miles = Math.min(trip.endMiles, m);
    }
    // food
    var living = alive(state);
    var need = (trip && trip.provisioned) ? 0 : living.length * RATIONS[state.rations].lb;
    if (state.food < need && W.places[state.place] && W.places[state.place].market) buyFood(state, need - state.food, day);
    var fed = state.food >= need;
    state.food = Math.max(0, state.food - need);
    // health
    var load = (resting ? 0 : PACES[state.pace].load) + (fed ? RATIONS[state.rations].load : 8);
    load += [2, 1, 0, 0, 1, 2][w.temp] + w.wet;
    state.FS = fed ? state.FS / 2 : state.FS + 0.8;
    load += state.FS;
    living.forEach(function (p) {
      if (!p.sick) return;
      load += 1;
      p.sick.days -= 1;
      if (p.sick.days <= 0) { day.messages.push(p.name + " is well again."); p.sick = null; }
    });
    state.H = 0.9 * state.H + load;
    // illness: about 1% a day in good health, 10% in very poor health
    var c = W.config;
    if (!resting && rand(state) < c.illnessBase + Math.min(state.H, 139) / c.illnessPerH) illness(state, day);
    if (state.H >= 140) illness(state, day);
    state.H = Math.min(state.H, 139);
    day.health = healthLabel(state.H);
    return day;
  }

  function buyFood(state, lb, day) {
    var price = W.places[state.place].market, pounds = Math.ceil(lb / 10) * 10 + 40;
    var cost = Math.ceil(pounds * price);
    var pay = Math.min(cost, state.money + state.gold);
    if (pay <= 0) return;
    var fromGold = Math.min(state.gold, pay);
    state.gold -= fromGold; state.money -= pay - fromGold;
    state.food += Math.floor(pay / price);
    day.messages.push("Out of food. You buy " + Math.floor(pay / price) + " lb at " + place(state.place).name.split(",")[0] + " prices: $" + pay + ".");
  }

  function routeIllness(state) { return ILLNESS[routeKind(state, state.place)] || ILLNESS.trail; }

  // Someone falls ill; anyone who falls ill while already sick may die.
  function illness(state, day, cause) {
    var living = alive(state);
    var who = pick(state, living);
    state.H += W.config.illnessHardship;
    if (who.sick) {
      if (state.deaths < W.config.maxDeaths && living.length > 2) {
        die(state, who, who.sick.cause, day);
        state.H = Math.min(state.H, 105); // the original's mercy rule
        return;
      }
      who.sick.days = 10;
      return;
    }
    who.sick = { cause: cause || pick(state, routeIllness(state)), days: 10 };
    day.sick.push(who);
    day.messages.push(who.name + " has " + who.sick.cause + ".");
  }

  function die(state, who, cause, report) {
    who.alive = false;
    who.sick = null;
    who.cause = cause;
    state.deaths++;
    who.epitaph = "Here lies " + who.name + (surname(state) ? " " + surname(state) : "") + ", age " + who.age +
      ". Died of " + cause + " near " + place(state.place).name.split(":")[0] + ", " + formatDate(dateOf(state)) + ".";
    report.deaths.push(who);
  }

  // Stop to rest: no travel, no new illness, the pace load disappears.
  function rest(state, days) {
    var out = [];
    for (var i = 0; i < days; i++) out.push(stepDay(state, null, true));
    return out;
  }

  // ---------------------------------------------------------------- rivers
  function riverDepth(state, r) { return Math.round((r.depth + r.rainRise * (state.rain || 0)) * 10) / 10; }

  function riverOptions(state, r) {
    var o = [
      { id: "ford", label: "Ford the river", role: "navigator" },
      { id: "float", label: "Caulk the wagon and float it", role: "navigator" }
    ];
    if (r.ferry) o.push({ id: "ferry", label: "Take " + r.ferry.by, role: "quartermaster", requires: { money: r.ferry.cost } });
    if (r.guide) {
      o.push({ id: "guide", label: "Hire " + r.guide.by + " (trade goods)", role: "quartermaster", requires: r.guide.cost });
      if (r.guide.alt) o.push({ id: "guideCash", label: "Hire " + r.guide.by + " ($" + r.guide.alt.money + ")", role: "quartermaster", requires: r.guide.alt });
    }
    o.push({ id: "wait", label: "Wait a day to see if the river drops", role: "doctor" });
    return o.map(function (x) { x.ok = meets(state, x.requires); return x; });
  }

  // Cross (or wait). Returns { result, changes, deaths, sick, crossed }.
  function crossRiver(state, r, how) {
    var depth = riverDepth(state, r), report = { changes: [], deaths: [], sick: [], crossed: true };
    function pay(cost) { Object.keys(cost).forEach(function (k) { state[k] -= cost[k]; report.changes.push({ stat: k, amount: -cost[k] }); }); }
    function waitDays(n) { for (var i = 0; i < n; i++) { var d = stepDay(state, null, true); d.deaths.forEach(function (m) { report.deaths.push(m); }); } if (n) report.changes.push({ stat: "days", amount: n }); }
    function upset(scale) {
      report.upset = true;
      var lost = Math.round(state.food * (0.15 + 0.25 * rand(state)) * scale);
      state.food -= lost; report.changes.push({ stat: "food", amount: -lost });
      var text = "The wagon tips in the current. You lose " + lost + " lb of food";
      if (rand(state) < 0.4 * scale && state.oxen > 2) { state.oxen--; report.changes.push({ stat: "oxen", amount: -1 }); text += " and an ox is swept away"; }
      if (rand(state) < 0.3 * scale && state.parts > 0) { state.parts--; report.changes.push({ stat: "parts", amount: -1 }); }
      text += ".";
      if (rand(state) < 0.3 * scale) {
        var living = alive(state);
        var who = pick(state, living);
        if (state.deaths < W.config.maxDeaths && living.length > 2) { die(state, who, "drowning", report); text += " " + who.name + " is pulled under by the current."; }
        else { who.sick = { cause: "a near drowning", days: 10 }; report.sick.push(who); text += " " + who.name + " is pulled out of the water half-drowned."; }
      }
      return text;
    }
    var tip;
    if (how === "wait") {
      waitDays(1);
      report.crossed = false;
      report.result = "You camp on the bank for a day. The river is now " + riverDepth(state, r) + " feet deep.";
      return report;
    }
    if (how === "ford") {
      if (depth < 2.5) report.result = "The water barely reaches the wagon bed. You ford easily.";
      else if (depth < 3) { waitDays(1); report.result = "Water slops into the wagon. You lose a day drying everything out."; }
      else { tip = Math.min(0.85, 0.25 + (depth - 3) * 0.25); report.result = rand(state) < tip ? upset(1) : "The water is over the wheels, but the oxen keep their footing. You make it across."; }
    } else if (how === "float") {
      tip = Math.min(0.7, 0.08 + r.current * 0.25 + r.width / 8000);
      report.result = depth < 1.5 ? "Too shallow to float; you drag the wagon across." : rand(state) < tip ? upset(0.8) : "Sealed with tar, the wagon floats like a boat. You pole across safely.";
      waitDays(1);
    } else if (how === "ferry") {
      pay({ money: r.ferry.cost });
      var wait = r.ferry.wait[0] + Math.floor(rand(state) * (r.ferry.wait[1] - r.ferry.wait[0] + 1));
      waitDays(wait);
      report.result = (wait ? "You wait " + wait + " day" + (wait > 1 ? "s" : "") + " for your turn. " : "") + "The ferry carries you across safely.";
    } else if (how === "guide" || how === "guideCash") {
      pay(how === "guide" ? r.guide.cost : r.guide.alt);
      tip = Math.min(0.7, 0.08 + r.current * 0.25 + r.width / 8000) * 0.2;
      report.result = rand(state) < tip ? upset(0.5) : "Your guide leads the wagon from island to island on the shallow gravel bars. You cross safely.";
      waitDays(1);
    }
    state.log.push({ kind: "river", river: r.name, how: how, result: report.result });
    return report;
  }

  function settings(state) {
    var living = alive(state);
    var perDay = living.length * RATIONS[state.rations].lb;
    return {
      pace: PACES[state.pace].name, rations: RATIONS[state.rations].name,
      health: healthLabel(state.H), weather: state.weather || "cool",
      foodDays: perDay ? Math.floor(state.food / perDay) : 99,
      sick: living.filter(function (m) { return m.sick; })
    };
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
      return { index: i, label: fill(state, ch.label), ok: meets(state, ch.requires) };
    });
  }

  // Card text can name the player's own family by role: {navigator}, {doctor}...
  function fill(state, str) {
    if (str == null || !state.members) return str;
    return String(str).replace(/\{(navigator|quartermaster|journal|doctor)\}/g, function (m, r) {
      var who = state.members.filter(function (x) { return x.role === r; })[0];
      if (who && !who.alive) who = alive(state)[0] || who;
      return who ? who.name : m;
    });
  }

  // force (from a minigame): { outcome: index into outcomes, effects: extra effects }
  function choose(state, c, index, force) {
    var ch = c.choices[index];
    var outcome = ch;
    if (ch.outcomes && force && force.outcome != null) {
      outcome = ch.outcomes[Math.min(force.outcome, ch.outcomes.length - 1)];
    } else if (ch.outcomes) {
      var r = rand(state), acc = 0;
      outcome = ch.outcomes[ch.outcomes.length - 1];
      for (var i = 0; i < ch.outcomes.length; i++) {
        acc += ch.outcomes[i].chance;
        if (r < acc) { outcome = ch.outcomes[i]; break; }
      }
    }
    var fx = Object.assign({}, outcome.effects || {});
    if (force && force.effects) Object.keys(force.effects).forEach(function (k) { fx[k] = (fx[k] || 0) + force.effects[k]; });
    var report = applyEffects(state, fx);
    report.result = fill(state, outcome.result) + (force && force.note ? " " + force.note : "");
    report.choice = fill(state, ch.label);
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
      var sickOne = alive(state).filter(function (m) { return m.sick; })[0];
      if (sickOne) sickOne.sick.days = Math.max(1, sickOne.sick.days - 5);
      state.H = Math.max(0, state.H - 10);
    }
    if (fx.sick && rand(state) < fx.sick.chance) sicken(state, fx.sick.cause, report);
    return report;
  }

  function sicken(state, cause, report) {
    var day = { messages: [], deaths: [], sick: [] };
    illness(state, day, cause);
    day.deaths.forEach(function (d) { report.deaths.push(d); });
    day.sick.forEach(function (d) { report.sick.push(d); });
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

  // ---------------------------------------------------------------- the clock
  function endTargetOf(state) {
    var end = state.beats[state.beats.length - 1];
    return end.type === "ending" ? end.target : W.routes.california[W.routes.california.length - 1].target;
  }
  function stopCost(list) {
    var c = W.config;
    return list.reduce(function (sum, x) { return sum + (x.minutes || c.minutesByType[x.type] || 0) + c.travelMinutesPerLeg; }, 0);
  }
  // When the group would reach the ending if it takes every stop from "from" on.
  function projectedEnd(state, from, minutes) {
    var rest = stopCost(state.beats.slice(from));
    if (state.beats[state.beats.length - 1].type !== "ending") {
      rest += Math.max(stopCost(beatsFor(state, "oregon")), stopCost(beatsFor(state, "california")));
    }
    return minutes + rest;
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
    function cost(list) {
      return list.reduce(function (sum, x) { return sum + (x.minutes || c.minutesByType[x.type] || 0) + c.travelMinutesPerLeg; }, 0);
    }
    var needed = cost(state.beats.slice(state.index));
    if (end.type !== "ending") {
      // the branch after the fork is not chosen yet: plan for the longer one
      needed += Math.max(cost(beatsFor(state, "oregon")), cost(beatsFor(state, "california")));
    }
    var elapsed = elapsedMinutes(state, now);
    var slack = Math.min(b.target - elapsed, endTarget - elapsed - needed) - c.eventReserveMinutes;
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
    return { id: t.id, headline: fill(t.headline || t.title), title: fill(t.title), text: fill(t.text), lead: t.lead || "navigator", react: t.react || "stop",
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
    pickTripEvents: pickTripEvents, resolveEvent: resolveEvent,
    stepDay: stepDay, rest: rest, settings: settings, healthLabel: healthLabel,
    PACES: PACES, RATIONS: RATIONS,
    fill: fill, riverDepth: riverDepth, riverOptions: riverOptions, crossRiver: crossRiver
  };
})(typeof window !== "undefined" ? window : globalThis);
