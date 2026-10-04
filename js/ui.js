// Westward: screens and flow.
// Keyboard: number keys pick a choice, Enter continues.
// Teacher panel: Ctrl+Shift+T, or open the page with ?teacher in the URL.
(function () {
  "use strict";
  var W = window.WESTWARD, E = W.engine, scene = W.scene;
  var app = document.getElementById("app");
  var teacherEl = document.getElementById("teacher");
  var SAVE_KEY = "westward-save-v1";
  var params = new URLSearchParams(location.search);
  var S = E.create(params.get("seed"));
  var screenName = "title";
  var keyHandlers = {};

  var panel = document.createElement("div");
  panel.className = "panel";
  panel.hidden = true;
  document.body.appendChild(panel);

  // ------------------------------------------------------------ helpers
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function role(id) { return W.roles.filter(function (r) { return r.id === id; })[0]; }
  function roleLabel(id) {
    var r = role(id), who = S.students && S.students[id];
    return r.name + (who ? " (" + esc(who) + ")" : "");
  }
  function draftChip(obj) {
    return obj && obj.draft && W.config.showDraftStamps ? '<span class="chip draft" title="Not yet checked against sources">Draft</span>' : "";
  }
  function show(html, opts) {
    opts = opts || {};
    keyHandlers = {};
    app.className = "app" + (opts.panel ? "" : " no-panel") + (opts.top ? " top" : "") + (opts.still ? " still" : "");
    panel.hidden = !opts.panel;
    document.body.classList.toggle("has-panel", !!opts.panel);
    app.innerHTML = html;
    app.scrollTop = 0;
    if (opts.panel) renderPanel();
    var first = app.querySelector("[data-autofocus]") || app.querySelector("button:not([disabled])");
    if (first) first.focus({ preventScroll: true });
    save();
  }
  function on(sel, fn) {
    app.querySelectorAll(sel).forEach(function (el) {
      el.addEventListener("click", function (ev) { fn(el, ev); });
    });
  }
  function month() { return S.startDate ? E.dateOf(S).getUTCMonth() : 4; }
  // What travels with the group: a wagon and ox team, the ship, or the cousins on foot.
  function vehicle() {
    var f = E.family(S);
    if (!f) return "wagon";
    if (f.route === "sea") return ["hongkong", "pacific", "sanfrancisco"].indexOf(S.place) >= 0 ? "ship" : "walkers";
    return "wagon";
  }
  function sceneOpts(extra) {
    var p = E.place(S.place) || {};
    return Object.assign({ weather: p.weather, month: month(), vehicle: vehicle(), party: S.members, family: S.familyId }, extra || {});
  }
  function setScene(placeId, opts) {
    scene.set(E.place(placeId).scene, sceneOpts(opts));
  }

  // ------------------------------------------------------------ save / resume
  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify({ S: S, screen: screenName })); } catch (e) { /* private mode */ }
  }
  function loadSave() {
    try { var raw = localStorage.getItem(SAVE_KEY); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
  }
  function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ } }

  // ------------------------------------------------------------ title
  function title() {
    screenName = "title";
    var saved = loadSave();
    var img = W.config.titleImage;
    scene.set("prairie", { vehicle: "wagon", month: 4, showcase: true, party: W.families[0].members, family: "ohio" });
    show(
      (img ? '<div class="title-art" style="background-image:url(\'' + img + '\')"></div>' : "") +
      '<div class="title-screen"><div class="stack">' +
      '<div class="eyebrow" style="color:#fff">1849 to 1854</div>' +
      "<h1>" + esc(W.config.title) + "</h1>" +
      '<p class="sub">' + esc(W.config.subtitle) + "</p>" +
      '<div class="actions" style="justify-content:center">' +
      '<button class="primary" id="start" data-autofocus>Start</button>' +
      (saved && saved.S && saved.S.familyId && saved.screen !== "ending" ? '<button id="resume">Continue saved game</button>' : "") +
      "</div></div></div>",
      { top: true }
    );
    on("#start", function () { clearSave(); S = E.create(params.get("seed")); families(); });
    on("#resume", function () { resume(saved); });
    keyHandlers = {};
  }

  function resume(saved) {
    S = saved.S;
    var s = saved.screen;
    if (s === "roles") return roles();
    if (s === "poster") return poster();
    if (s === "store") return store();
    if (S.index >= 0 && ["card", "landmark", "ending"].indexOf(s) >= 0) return beatScreen();
    travelScreen();
  }

  // ------------------------------------------------------------ families
  function families() {
    screenName = "families";
    show(
      '<div class="card wide"><div class="eyebrow">Step 1</div><h2>Which family did your teacher give you?</h2>' +
      "<p>Every group travels west in the same years, under different rules. Pick the family on your assignment.</p></div>" +
      '<div class="grid" style="margin-top:18px">' +
      W.families.map(function (f) {
        return '<button class="family-card" data-family="' + f.id + '"><strong>' + esc(f.name) + "</strong>" +
          '<span class="meta">' + esc(f.from) + "</span><span>" + esc(f.summary) + "</span></button>";
      }).join("") + "</div>",
      { top: true }
    );
    on("[data-family]", function (el) { confirmFamily(el.getAttribute("data-family")); });
  }

  function confirmFamily(id) {
    var f = W.families.filter(function (x) { return x.id === id; })[0];
    show(
      '<div class="card narrow"><div class="chips">' + draftChip(f) + "</div>" +
      '<div class="eyebrow">' + esc(f.from) + "</div><h2>" + esc(f.name) + "</h2>" +
      "<p>" + esc(f.summary) + "</p><p><strong>Your rules:</strong> " + esc(f.rules) + "</p>" +
      '<div class="portraits">' + f.members.map(function (m) {
        return '<div class="portrait"><div class="face">' + esc(m.name[0]) + "</div>" + esc(m.name) + ", " + m.age + "</div>";
      }).join("") + "</div>" +
      '<div class="actions"><button class="primary" id="yes">This is our family</button><button id="back">Back</button></div></div>'
    );
    on("#yes", function () { E.chooseFamily(S, id, Date.now()); roles(); });
    on("#back", families);
  }

  // ------------------------------------------------------------ roles
  function roles() {
    screenName = "roles";
    show(
      '<div class="card wide"><div class="eyebrow">Step 2</div><h2>Claim your jobs</h2>' +
      "<p>One laptop, four jobs. The mouse moves to whoever's job is up. Big decisions need a group vote.</p>" +
      '<div class="portraits">' + S.members.map(function (m) {
        var r = role(m.role);
        return '<div class="portrait"><div class="face">' + esc(m.name[0]) + '</div><div class="role-name">' + esc(r.name) + "</div>" +
          "<div>" + esc(m.name) + "</div><p style=\"font-size:0.9em;color:var(--muted)\">" + esc(r.job) + "</p>" +
          '<label class="sr-only" for="st-' + m.role + '">Student name for ' + esc(r.name) + "</label>" +
          '<input id="st-' + m.role + '" placeholder="Student name" value="' + esc(S.students[m.role] || "") + '"></div>';
      }).join("") + "</div>" +
      '<div class="actions"><button class="primary" id="go">We are ready</button></div></div>',
      { top: true }
    );
    on("#go", function () {
      S.members.forEach(function (m) {
        var v = document.getElementById("st-" + m.role).value.trim();
        if (v) S.students[m.role] = v.slice(0, 20);
      });
      poster();
    });
  }

  // ------------------------------------------------------------ poster
  function poster() {
    screenName = "poster";
    var sea = E.family(S).route === "sea";
    var P = sea ? W.seaPoster : W.poster;
    scene.set(sea ? "hongkong" : "town", sceneOpts({ vehicle: sea ? "ship" : "wagon" }));
    scene.dim("soft");
    show(
      '<div class="poster"><div class="chips" style="justify-content:center">' + draftChip(P) + "</div>" +
      '<div class="big">' + esc(P.headline) + "</div>" +
      (P.quote ? "<blockquote>“" + esc(P.quote) + "”</blockquote><div>" + esc(P.speaker) + "</div>" : "") +
      '<div class="rule"></div>' + P.lines.map(function (l) { return '<div class="line">' + esc(l) + "</div>"; }).join("") +
      '<div class="rule"></div><p><em>' + esc(P.question) + "</em></p>" +
      '<button class="primary" id="go" data-autofocus>' + (sea ? "Go to the harbor" : "Go to the outfitters") + "</button></div>"
    );
    on("#go", function () { scene.dim(null); E.advance(S, Date.now()); store(); });
  }

  // ------------------------------------------------------------ store
  function store() {
    screenName = "store";
    var st = E.storeFor(S), cart = S.cart || {};
    st.items.forEach(function (it) { if (cart[it.id] == null) cart[it.id] = it.min || 0; });
    S.cart = cart;
    setScene(S.place);
    scene.dim("soft");
    var redraw = false;
    function draw() {
      var total = E.cartTotal(st, cart), probs = E.cartProblems(S, st, cart);
      show(
        '<div class="card"><div class="chips"><span class="chip lead">Mouse: ' + roleLabel("quartermaster") + "</span>" + draftChip(st) + "</div>" +
        "<h2>" + esc(st.title) + "</h2><p>" + esc(st.intro) + "</p>" +
        st.items.map(function (it) {
          return '<div class="store-row"><div>' + esc(it.name) + '<div class="price">$' + it.price + " each" +
            (it.recommended ? " · guidebook says " + it.recommended : "") + "</div></div>" +
            '<div class="qty"><button data-minus="' + it.id + '" aria-label="One less ' + esc(it.name) + '">−</button>' +
            "<output>" + cart[it.id] + '</output><button data-plus="' + it.id + '" aria-label="One more ' + esc(it.name) + '">+</button></div>' +
            "<div>$" + cart[it.id] * it.price + "</div></div>";
        }).join("") +
        '<div class="budget"><span>Spent: $' + total + "</span><span>Left: $" + (S.money - total) + "</span></div>" +
        probs.map(function (p) { return '<div class="problem">' + esc(p) + "</div>"; }).join("") +
        '<div class="actions"><button class="primary" id="done"' + (probs.length ? " disabled" : "") + ">" +
        (E.family(S).route === "sea" ? "Board the ship" : "Leave town") + "</button></div></div>",
        { top: true, still: redraw }
      );
      redraw = true;
      on("[data-plus]", function (el) {
        var it = st.items.filter(function (x) { return x.id === el.getAttribute("data-plus"); })[0];
        if (cart[it.id] < (it.max || 99)) cart[it.id]++;
        draw(); focusSame("[data-plus='" + it.id + "']");
      });
      on("[data-minus]", function (el) {
        var it = st.items.filter(function (x) { return x.id === el.getAttribute("data-minus"); })[0];
        if (cart[it.id] > 0) cart[it.id]--;
        draw(); focusSame("[data-minus='" + it.id + "']");
      });
      on("#done", function () { E.checkout(S, st, cart); delete S.cart; scene.dim(null); travelScreen(); });
    }
    draw();
  }
  function focusSame(sel) { var el = app.querySelector(sel); if (el) el.focus({ preventScroll: true }); }

  // ------------------------------------------------------------ panel
  function healthWord(m) { return !m.alive ? "Died" : m.health >= 3 ? "Good" : m.health === 2 ? "Fair" : "Sick"; }
  function weatherWord() {
    var p = E.place(S.place) || {};
    if (p.weather === "rain") return "Rain";
    if (p.weather === "snow") return "Snow";
    if (p.weather === "heat") return "Very hot";
    var mo = month();
    return mo >= 10 || mo <= 1 ? "Cold" : mo >= 6 && mo <= 8 ? "Hot" : "Fair";
  }
  function renderPanel() {
    if (!S.familyId) return;
    var sea = E.family(S).route === "sea";
    var stats = [
      ["Date", E.formatDate(E.dateOf(S))],
      [sea ? "Place" : "Miles", sea ? E.place(S.place).name.split(",")[0] : '<span id="miles">' + S.miles + "</span>"],
      ["Weather", weatherWord()],
      ["Food", S.food + " lb"],
      sea ? ["Gold", "$" + S.gold] : ["Oxen", S.oxen],
      ["Money", "$" + (S.money + (sea ? 0 : S.gold))]
    ];
    panel.innerHTML = stats.map(function (s) {
      return '<div class="stat"><span class="label">' + s[0] + '</span><span class="val">' + s[1] + "</span></div>";
    }).join("") +
      '<div class="family">' + S.members.map(function (m) {
        return '<div class="mini' + (!m.alive ? " dead" : m.health < 3 ? " sick" : "") + '"><div class="face">' + esc(m.name[0]) + "</div>" +
          esc(m.name) + '<div class="health">' + healthWord(m) + "</div></div>";
      }).join("") + "</div>";
  }

  // ------------------------------------------------------------ travel
  function nextBeatPreview() { return S.beats[S.index + 1]; }

  function travelScreen(trip) {
    screenName = "travel";
    var next = nextBeatPreview();
    setScene(S.place);
    if (next) scene.preload(E.place(next.at).scene);
    scene.dim(null);
    var sea = E.family(S).route === "sea";
    var notes = trip ? trip.notes.concat(trip.skipped.length ? ["Running behind: the wagon presses on past " + trip.skipped.join(" and ") + "."] : []) : [];
    show(
      '<div class="travel-box">' +
      notes.map(function (n) { return '<div class="note">' + esc(n) + "</div><br>"; }).join("") +
      '<div class="next">Next stop</div><h2>' + esc(next ? E.place(next.at).name : "") + "</h2>" +
      '<button class="primary" id="go" data-autofocus>' + (sea && vehicle() === "ship" ? "Continue the voyage" : "Continue on the trail") + "</button></div>",
      { panel: true }
    );
    on("#go", go);
    keyHandlers = { Enter: go };
  }

  var busy = false;
  // How long the crossing takes on screen: longer legs take longer.
  function travelMs(trip) {
    var c = W.config.travelSeconds;
    var sec = trip.miles ? c.min + trip.miles / 100 * c.per100Miles : c.min + Math.min(4, trip.days / 15);
    return Math.round(Math.min(c.max, sec) * 1000);
  }
  function go() {
    if (busy) return;
    busy = true;
    var startMiles = S.miles;
    var trip = E.advance(S, Date.now());
    if (!trip) { busy = false; return; }
    var events = E.pickTripEvents(S, Date.now());
    var stops = events.length === 1 ? [0.45] : events.length === 2 ? [0.32, 0.68] : [];
    var ms = travelMs(trip);
    screenName = "travel";
    function rolling() {
      app.className = "app";
      app.innerHTML = '<div class="travel-box"><div class="next">Traveling to</div><h2>' + esc(trip.to) + "</h2></div>";
    }
    rolling();
    renderPanel();
    var milesEl = function () { return document.getElementById("miles"); };
    var travelling = scene.travelTo(E.place(S.place).scene, sceneOpts(), ms, {
      stops: stops,
      onProgress: function (k) {
        var el = milesEl();
        if (el) el.textContent = Math.round(startMiles + (S.miles - startMiles) * k);
      },
      onStop: function (i) {
        return tripEvent(events[i]).then(function () {
          scene.party(sceneOpts());
          rolling();
          renderPanel();
        });
      }
    });
    travelling.then(function () {
      busy = false;
      if (trip.notes.length || trip.skipped.length) S._trip = trip;
      beatScreen();
    });
  }

  // A trail event: a small card over the live diorama, decided quickly.
  function tripEvent(ev) {
    return new Promise(function (resolve) {
      scene.react(ev.react);
      var list = E.choices(S, ev);
      app.className = "app top";
      app.innerHTML =
        '<div class="card event"><div class="chips"><span class="chip trail">' + (vehicle() === "ship" ? "At sea" : vehicle() === "walkers" ? "On the road" : "On the trail") + "</span>" +
        '<span class="chip lead">Mouse: ' + roleLabel(ev.lead) + "</span>" + draftChip(ev) + "</div>" +
        "<h2>" + esc(ev.title) + "</h2><p>" + esc(ev.text) + "</p>" +
        '<div class="choices">' + list.map(function (ch, i) {
          return '<button data-choice="' + ch.index + '"' + (ch.ok ? "" : " disabled") + '><span class="key">' + (i + 1) + "</span>" + esc(ch.label) +
            (ch.ok ? "" : '<span class="why">You don\u2019t have what this needs.</span>') + "</button>";
        }).join("") + "</div></div>";
      var first = app.querySelector("button:not([disabled])");
      if (first) first.focus({ preventScroll: true });
      function decideEvent(index) {
        var r = E.resolveEvent(S, ev, index);
        renderPanel();
        app.querySelector(".choices").outerHTML =
          '<p class="result"><strong>' + esc(r.choice === "Continue" ? "" : r.choice) + "</strong> " + esc(r.result) + "</p>" +
          '<div class="changes">' + r.changes.map(function (ch) {
            return '<span class="change ' + (ch.amount > 0 ? "up" : "") + '">' + ch.amount + " " + STAT_NAMES[ch.stat] + "</span>";
          }).join("") + "</div>" +
          r.sick.map(function (m) { return "<p><strong>" + esc(m.name) + " is sick.</strong></p>"; }).join("") +
          r.deaths.map(function (m) { return '<div class="epitaph">' + esc(m.epitaph) + "</div>"; }).join("") +
          '<div class="actions"><button class="primary" id="roll">Continue on the trail</button></div>';
        var btn = document.getElementById("roll");
        btn.focus({ preventScroll: true });
        function done() { keyHandlers = {}; resolve(); }
        btn.addEventListener("click", done);
        keyHandlers = { Enter: done };
        save();
      }
      app.querySelectorAll("[data-choice]").forEach(function (b) {
        b.addEventListener("click", function () { decideEvent(Number(b.getAttribute("data-choice"))); });
      });
      keyHandlers = {};
      list.forEach(function (ch, i) { if (ch.ok) keyHandlers[String(i + 1)] = function () { decideEvent(ch.index); }; });
    });
  }

  // ------------------------------------------------------------ beats
  function beatScreen() {
    var b = E.beat(S);
    setScene(S.place);
    if (b.type === "landmark") return landmark(b);
    if (b.type === "ending") return ending();
    if (b.type === "store") return store();
    return cardScreen(E.cardFor(S));
  }

  function tripNotes() {
    var t = S._trip;
    delete S._trip;
    if (!t) return "";
    var notes = t.notes.concat(t.skipped.length ? ["Running behind: you press on past " + t.skipped.join(" and ") + " without stopping."] : []);
    return notes.map(function (n) { return '<p class="problem">' + esc(n) + "</p>"; }).join("");
  }

  function cardScreen(c) {
    screenName = "card";
    // A card can bring its own painting (the rancho, the evening camp).
    if (c.art && W.scenes[c.art] && c.art !== E.place(S.place).scene) {
      scene.set(c.art, sceneOpts());
    }
    scene.dim("strong");
    var list = E.choices(S, c);
    show(
      '<div class="card"><div class="chips"><span class="chip lead">Mouse: ' + roleLabel(c.lead) + "</span>" +
      (c.vote ? '<span class="chip vote">Group vote</span>' : "") + draftChip(c) + "</div>" +
      '<div class="eyebrow">' + esc(E.place(S.place).name) + "</div><h2>" + esc(c.title) + "</h2>" +
      tripNotes() + "<p>" + esc(c.text) + "</p>" +
      '<div class="choices">' + list.map(function (ch, i) {
        return '<button data-choice="' + ch.index + '"' + (ch.ok ? "" : " disabled") + '><span class="key">' + (i + 1) + "</span>" + esc(ch.label) +
          (ch.ok ? "" : '<span class="why">You don’t have what this needs.</span>') + "</button>";
      }).join("") + "</div></div>",
      { panel: true }
    );
    on("[data-choice]", function (el) { decide(c, Number(el.getAttribute("data-choice"))); });
    keyHandlers = {};
    list.forEach(function (ch, i) { if (ch.ok) keyHandlers[String(i + 1)] = function () { decide(c, ch.index); }; });
  }

  function decide(c, index) {
    var report = E.choose(S, c, index);
    result(c, report);
  }

  var STAT_NAMES = { money: "dollars", food: "lb food", oxen: "oxen", parts: "spare parts", medicine: "medicine", trade: "trade goods", gold: "dollars in gold", land: "acres", days: "days" };
  function result(c, r) {
    screenName = "result";
    show(
      '<div class="card narrow"><div class="eyebrow">' + esc(c.title) + "</div><h2>" + esc(r.choice) + "</h2>" +
      "<p>" + esc(r.result) + "</p>" +
      '<div class="changes">' + r.changes.map(function (ch) {
        return '<span class="change ' + (ch.amount > 0 ? "up" : "") + '">' + ch.amount + " " + STAT_NAMES[ch.stat] + "</span>" +
          (ch.note ? "<p>" + esc(ch.note) + "</p>" : "");
      }).join("") + "</div>" +
      r.sick.map(function (m) { return "<p><strong>" + esc(m.name) + " is sick.</strong> The " + roleLabel("doctor") + " will need to watch over them.</p>"; }).join("") +
      r.deaths.map(function (m) { return '<div class="epitaph">' + esc(m.epitaph) + "</div>"; }).join("") +
      '<div class="actions"><button class="primary" id="go" data-autofocus>Continue</button></div></div>',
      { panel: true }
    );
    on("#go", function () { travelScreen(); });
    keyHandlers = { Enter: function () { travelScreen(); } };
  }

  function landmark(b) {
    screenName = "landmark";
    var L = W.landmarks[b.landmark];
    scene.dim(null);
    show(
      '<div class="card narrow" style="margin-top:auto"><div class="chips"><span class="chip lead">Read aloud: ' + roleLabel("journal") + "</span>" + draftChip(L) + "</div>" +
      "<h2>" + esc(L.title) + "</h2>" + tripNotes() + "<p>" + esc(L.text) + "</p>" +
      '<div class="diary">' + (L.quote ? "“" + esc(L.quote) + "”" : "<em>A real diary excerpt goes here once it is verified.</em>") +
      (L.speaker ? '<div class="who">' + esc(L.speaker) + "</div>" : "") + "</div>" +
      '<div class="actions"><button class="primary" id="go" data-autofocus>Continue</button></div></div>',
      { panel: true, top: false }
    );
    on("#go", function () { travelScreen(); });
    keyHandlers = { Enter: function () { travelScreen(); } };
  }

  // ------------------------------------------------------------ ending
  function ending() {
    screenName = "ending";
    var L = E.ledger(S), EN = W.endings;
    scene.dim("strong");
    var mine = [];
    mine.push(L.ending);
    mine.push("Arrived " + L.date + (L.miles ? ", after " + L.miles + " miles" : "") + ".");
    mine.push("Survived: " + L.survivors.map(function (m) { return m.name; }).join(", ") + ".");
    L.lost.forEach(function (m) { mine.push(m.epitaph); });
    if (L.land) mine.push("Land: " + L.land + " acres.");
    mine.push("Money: $" + (L.money + L.gold) + ".");
    mine = mine.concat(L.flagLines);
    show(
      '<div class="ledger">' +
      '<div class="card"><div class="eyebrow">Your family</div><h2>' + esc(L.family.name) + "</h2><ul>" +
      mine.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div>" +
      '<div class="card"><div class="chips">' + draftChip(L.others) + '</div><div class="eyebrow">' + esc(L.others.title) + "</div><h2>Meanwhile</h2><ul>" +
      L.others.lines.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div></div>" +
      '<div class="card question"><h2>' + esc(EN.question) + "</h2><p>" + esc(EN.handoutPrompt) + "</p>" +
      (W.config.titleImage ? "<p>" + esc(EN.gastPrompt) + '</p><div class="actions" style="justify-content:center">' +
        '<button id="painting">Show the painting again</button></div>' : "") +
      '<p class="teaser">' + esc(EN.teaser) + "</p></div>",
      { top: true }
    );
    on("#painting", showPainting);
  }

  function showPainting() {
    var img = W.config.titleImage;
    var back = function () { ending(); };
    if (img) {
      show('<div class="title-art" style="background-image:url(\'' + img + '\')"></div>' +
        '<div class="title-screen"><div class="stack"><button class="primary" id="back" data-autofocus>Back to the ledger</button></div></div>');
    } else {
      scene.set("prairie", sceneOpts({ showcase: true }));
      show('<div class="card narrow"><p>Your teacher will add the painting, John Gast\u2019s <em>American Progress</em> (1872), here.</p><button class="primary" id="back">Back to the ledger</button></div>');
    }
    on("#back", back);
  }

  // ------------------------------------------------------------ teacher panel
  function teacher() {
    if (teacherEl.hidden) return;
    var mins = S.startedAt ? E.elapsedMinutes(S) : 0;
    var b = S.beats && S.beats[S.index];
    teacherEl.innerHTML =
      "<h3>Teacher panel</h3>" +
      "<div>Seed <strong>" + S.seed + "</strong> · " + (S.familyId ? esc(E.family(S).name) : "no family yet") + "</div>" +
      "<div>Clock " + Math.floor(mins) + ":" + String(Math.floor((mins % 1) * 60)).padStart(2, "0") +
      (b ? " · target for this stop " + b.target + " min" : "") + "</div>" +
      '<div class="actions">' +
      '<button data-t="late">Pretend 5 min later</button>' +
      '<button data-t="restart">Restart same seed</button>' +
      '<button data-t="new">New random seed</button>' +
      '<button data-t="close">Close (Ctrl+Shift+T)</button></div>' +
      (S.beats ? '<h3>Jump to</h3><div class="beat-list">' + S.beats.map(function (x, i) {
        return '<button data-jump="' + i + '" class="' + (i === S.index ? "current" : "") + '">' + (i + 1) + ". " +
          esc(E.place(x.at).name) + " · " + x.type + (x.optional ? " (optional)" : "") + "</button>";
      }).join("") + "</div>" : "") +
      (!S.familyId ? '<h3>Families</h3>' + W.families.map(function (f) {
        return '<button data-fam="' + f.id + '">' + esc(f.name) + "</button>";
      }).join("") : "");
    teacherEl.querySelectorAll("[data-t]").forEach(function (el) {
      el.onclick = function () {
        var t = el.getAttribute("data-t");
        if (t === "late") S.startedAt -= 5 * 60000;
        if (t === "restart") { var seed = S.seed; clearSave(); S = E.create(seed); title(); }
        if (t === "new") { clearSave(); S = E.create(); title(); }
        if (t === "close") teacherEl.hidden = true;
        teacher();
      };
    });
    teacherEl.querySelectorAll("[data-jump]").forEach(function (el) {
      el.onclick = function () { E.jumpTo(S, Number(el.getAttribute("data-jump"))); beatScreen(); teacher(); };
    });
    teacherEl.querySelectorAll("[data-fam]").forEach(function (el) {
      el.onclick = function () { E.chooseFamily(S, el.getAttribute("data-fam"), Date.now()); roles(); teacher(); };
    });
  }
  setInterval(teacher, 1000);
  if (params.has("teacher")) { teacherEl.hidden = false; }

  document.addEventListener("keydown", function (ev) {
    if (ev.ctrlKey && ev.shiftKey && (ev.key === "T" || ev.key === "t")) {
      ev.preventDefault();
      teacherEl.hidden = !teacherEl.hidden;
      teacher();
      return;
    }
    if (ev.target && ev.target.tagName === "INPUT") return;
    if (ev.key === "Enter" && ev.target && ev.target.tagName === "BUTTON") return; // the button handles it
    var fn = keyHandlers[ev.key];
    if (fn) { ev.preventDefault(); fn(); }
  });

  title();
  teacher();
})();
