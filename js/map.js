// Westward: the travel map. Between stops the camera "pulls up" from the diorama to a
// map of the West, and the wagon creeps along the trail while the days go by. The map
// keeps a pin for everything that happened (trouble on the trail, crossings, deaths,
// and choices), so by the end it is the family's whole story.
//   W.travelMap.overlay(S, trip)  the map during travel: show(), hide(), update(), note(), remove()
//   W.travelMap.open(S, opts)     the map as a screen ("Look at the map"); resolves on close
//   W.travelMap.pin(S, kind, label, trip)  remember something that happened here
// The map is drawn to scale from real latitude and longitude (data/map.js).
(function () {
  "use strict";
  var W = window.WESTWARD, D = W.mapData;
  var INK = "#2b1d12", SOFT = "#6b5440", RIVER = "#5a7c90", RED = "#9b3024", PAPER = "#efe2c4";
  var SEA_PLACES = { hongkong: 1, pacific: 1 };

  // ------------------------------------------------------------------ projection
  var projections = {};
  function proj(key) {
    if (projections[key]) return projections[key];
    var b = D[key].bounds, k = Math.cos(b.midLat * Math.PI / 180);
    var width = D[key].width || 1000, s = width / ((b.lon[1] - b.lon[0]) * k);
    var p = function (pt) { return [(pt[1] - b.lon[0]) * k * s, (b.lat[1] - pt[0]) * s]; };
    p.w = width; p.h = Math.round((b.lat[1] - b.lat[0]) * s); p.s = s;
    projections[key] = p;
    return p;
  }
  function f(n) { return Math.round(n * 10) / 10; }
  function line(pts) { return pts.map(function (q) { return f(q[0]) + "," + f(q[1]); }).join(" "); }
  function smooth(pts) {
    if (pts.length < 3) return "M" + line(pts).replace(/ /g, " L");
    var d = "M" + f(pts[0][0]) + "," + f(pts[0][1]);
    for (var i = 1; i < pts.length - 1; i++) {
      var mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
      d += " Q" + f(pts[i][0]) + "," + f(pts[i][1]) + " " + f(mx) + "," + f(my);
    }
    var l = pts[pts.length - 1];
    return d + " L" + f(l[0]) + "," + f(l[1]);
  }
  function rng(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  // ------------------------------------------------------------------ which map, which route
  function family(S) { return W.families.filter(function (x) { return x.id === S.familyId; })[0]; }
  function isSea(S) { var fam = family(S); return fam && fam.route === "sea"; }
  function mapFor(S, trip) {
    if (!isSea(S)) return "west";
    if (trip && trip.fromId) return SEA_PLACES[trip.fromId] ? "sea" : "california";
    return SEA_PLACES[S.place] ? "sea" : "california";
  }
  // The paths this family's map shows: [name, active]
  function routesFor(S, key) {
    if (key === "sea") return [["sea", true]];
    if (key === "california" || isSea(S)) return [["bay", true]];
    var br = S.branch;
    return [["main", true], ["oregon", !br || br === "oregon"], ["california", !br || br === "california"]].map(function (r, i) {
      return [r[0], i === 0 || br === r[0], !br && i > 0];
    });
  }
  function points(key, name) {
    var p = proj(key);
    return D[key].paths[name].map(function (q) { var xy = p(q); return { x: xy[0], y: xy[1], place: q[2] }; });
  }
  // The family's route as one list of points: main trail, then their branch.
  function routePoints(S, key) {
    if (key === "sea") return points("sea", "sea");
    if (key === "california" || isSea(S)) return points("california", "bay");
    var pts = points("west", "main");
    var br = S.branch || "oregon";
    return pts.concat(points("west", br).slice(1));
  }
  function seg(a, b) { return Math.hypot(b.x - a.x, b.y - a.y); }
  // A point part of the way along a list of points (k from 0 to 1, by length).
  function along(pts, k) {
    var total = 0, i;
    for (i = 1; i < pts.length; i++) total += seg(pts[i - 1], pts[i]);
    var want = total * Math.max(0, Math.min(1, k)), run = 0;
    for (i = 1; i < pts.length; i++) {
      var l = seg(pts[i - 1], pts[i]);
      if (run + l >= want) {
        var t = l ? (want - run) / l : 0;
        return { x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * t, y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * t, i: i };
      }
      run += l;
    }
    var last = pts[pts.length - 1];
    return { x: last.x, y: last.y, i: pts.length - 1 };
  }
  function indexOfPlace(pts, id) { for (var i = 0; i < pts.length; i++) if (pts[i].place === id) return i; return -1; }

  // Where the family is now: by miles on the trail, or by days at sea.
  function locate(S, trip) {
    var key = mapFor(S, trip), pts = routePoints(S, key);
    var miles = W.places, here = S.place, a, b, k;
    if (trip && trip.fromId && trip.fromId !== trip.toId) {
      a = indexOfPlace(pts, trip.fromId); b = indexOfPlace(pts, trip.toId);
      if (a >= 0 && b > a) {
        var from = miles[trip.fromId], to = miles[trip.toId];
        if (typeof from.miles === "number" && typeof to.miles === "number" && to.miles > from.miles) k = (S.miles - from.miles) / (to.miles - from.miles);
        else k = trip.days ? trip.day / trip.days : 1;
        var sub = pts.slice(a, b + 1), at = along(sub, k);
        return { map: key, x: at.x, y: at.y, done: pts.slice(0, a + at.i).concat([{ x: at.x, y: at.y }]), pts: pts };
      }
    }
    var i = indexOfPlace(pts, here);
    if (i < 0) i = 0;
    return { map: key, x: pts[i].x, y: pts[i].y, done: pts.slice(0, i + 1), pts: pts };
  }

  // ------------------------------------------------------------------ drawing
  // The parts of the map that never change are drawn once into a flat image (fast to
  // show and to move things over); names stay as live text so they use the game's fonts.
  var bases = {};
  function base(key) {
    if (bases[key]) return bases[key];
    var M = D[key], p = proj(key), out = [], labels = [], R = rng(7);
    // sea and land
    if (M.coast) {
      var coast = M.coast.map(p);
      out.push('<path d="M' + line([[0, 0]].concat(coast).concat([[0, p.h]])).replace(/ /g, " L") + ' Z" fill="#9fb4b8" fill-opacity="0.42"/>');
      out.push('<path d="' + smooth(coast) + '" fill="none" stroke="' + SOFT + '" stroke-width="1.6"/>');
      for (var w = 0; w < 26; w++) {
        var cy = 20 + R() * (p.h - 40), cxMax = coastXAt(coast, cy) - 18;
        if (cxMax < 20) continue;
        var cx = 10 + R() * (cxMax - 10);
        out.push('<path d="M' + f(cx) + "," + f(cy) + " q4,-3 8,0 t8,0" + '" fill="none" stroke="' + RIVER + '" stroke-opacity="0.45" stroke-width="1"/>');
      }
    } else {
      out.push('<rect x="0" y="0" width="' + p.w + '" height="' + p.h + '" fill="#9fb4b8" fill-opacity="0.42"/>');
      M.land.forEach(function (l) {
        out.push('<path d="M' + line(l.pts.map(p)).replace(/ /g, " L") + ' Z" fill="' + PAPER + '" stroke="' + SOFT + '" stroke-width="1.4"/>');
      });
      M.islands.forEach(function (q) { var xy = p(q); out.push('<circle cx="' + f(xy[0]) + '" cy="' + f(xy[1]) + '" r="2.4" fill="' + PAPER + '" stroke="' + SOFT + '"/>'); });
      for (var v = 0; v < 40; v++) {
        var sx = 300 + R() * 640, sy = 40 + R() * (p.h - 80);
        out.push('<path d="M' + f(sx) + "," + f(sy) + " q4,-3 8,0 t8,0" + '" fill="none" stroke="' + RIVER + '" stroke-opacity="0.4" stroke-width="1"/>');
      }
    }
    (M.bays || []).forEach(function (b) {
      out.push('<path d="M' + line(b.map(p)).replace(/ /g, " L") + ' Z" fill="#9fb4b8" fill-opacity="0.55" stroke="' + SOFT + '" stroke-width="1.2"/>');
    });
    (M.lakes || []).forEach(function (l) {
      var c = p(l.at);
      out.push('<ellipse cx="' + f(c[0]) + '" cy="' + f(c[1]) + '" rx="' + f(l.rx * p.s * 0.75) + '" ry="' + f(l.ry * p.s) + '" fill="#9fb4b8" fill-opacity="0.7" stroke="' + RIVER + '"/>');
    });
    (M.rivers || []).forEach(function (r) {
      out.push('<path d="' + smooth(r.pts.map(p)) + '" fill="none" stroke="' + RIVER + '" stroke-width="' + (r.width || 1.5) + '" stroke-linecap="round" stroke-linejoin="round"/>');
    });
    // mountains: little hachured peaks along each range
    (M.ranges || []).forEach(function (r) {
      var pts = r.pts.map(p), list = pts.map(function (q) { return { x: q[0], y: q[1] }; });
      var len = 0; for (var i = 1; i < list.length; i++) len += seg(list[i - 1], list[i]);
      for (var d = 0; d <= len; d += 13) {
        var at = along(list, len ? d / len : 0), jx = (R() - 0.5) * 6, jy = (R() - 0.5) * 6, s = 0.8 + R() * 0.5;
        var x = at.x + jx, y = at.y + jy;
        out.push('<path d="M' + f(x - 6 * s) + "," + f(y + 4) + " L" + f(x) + "," + f(y - 6 * s) + " L" + f(x + 6 * s) + "," + f(y + 4) + '" fill="' + PAPER + '" stroke="' + SOFT + '" stroke-width="1.1" stroke-linejoin="round"/>' +
          '<path d="M' + f(x) + "," + f(y - 6 * s) + " L" + f(x + 2.5 * s) + "," + f(y + 4) + '" stroke="' + SOFT + '" stroke-opacity="0.55" stroke-width="1"/>');
      }
    });
    (M.ranges || []).forEach(function (r) {
      if (!r.name) return;
      var a = p(r.pts[0]), b = p(r.pts[r.pts.length - 1]), at = r.labelAt ? p(r.labelAt) : [(a[0] + b[0]) / 2 + 16, (a[1] + b[1]) / 2];
      labels.push(label(at[0], at[1], r.name, "range"));
    });
    (M.rivers || []).forEach(function (r) {
      if (!r.name) return;
      var m = p(r.labelAt || r.pts[Math.floor(r.pts.length / 2)]);
      labels.push(label(m[0], m[1] - 6, r.name, "river"));
    });
    (M.nations || []).forEach(function (n) {
      var c = p(n.at);
      labels.push(label(c[0], c[1], n.name, "nation"));
    });
    (M.regions || []).forEach(function (r) {
      var c = p(r.at);
      labels.push(r.rotate ? '<g transform="translate(' + f(c[0]) + "," + f(c[1]) + ") rotate(" + r.rotate + ')">' + label(0, 0, r.name, "sea") + "</g>" :
        label(c[0], c[1], r.name, r.sea ? "sea" : "region", r.note, r.right ? "end" : r.anchor));
    });
    // compass and scale
    // compass in open country: top right on the trail map, lower right at sea
    var land = key !== "sea";
    var cx0 = land ? p.w - 46 : p.w - 150, cy0 = land ? 64 : p.h - 70;
    out.push('<g transform="translate(' + cx0 + "," + cy0 + ')" fill="none" stroke="' + INK + '" stroke-width="1.2">' +
      '<circle r="22" stroke-opacity="0.5"/><path d="M0,-28 L5,0 L0,28 L-5,0 Z" fill="' + PAPER + '"/><path d="M0,-28 L5,0 L-5,0 Z" fill="' + INK + '"/>' +
      "</g>");
    labels.push('<text x="' + cx0 + '" y="' + (cy0 - 32) + '" text-anchor="middle" fill="' + INK + '" font-size="12" font-family="Alegreya SC, Georgia, serif" font-weight="700">N</text>');
    var miles = { west: 200, california: 50, sea: 1000 }[key], px = miles / 69 * p.s;
    var sx = land ? p.w - 30 - px : cx0 - 50 - px;
    out.push('<g transform="translate(' + f(sx) + "," + (p.h - 22) + ')"><path d="M0,0 L' + f(px) + ',0 M0,-5 L0,5 M' + f(px / 2) + ',-3 L' + f(px / 2) + ',3 M' + f(px) + ',-5 L' + f(px) + ',5" stroke="' + INK + '" stroke-width="1.5"/></g>');
    labels.push('<text x="' + f(sx + px / 2) + '" y="' + (p.h - 30) + '" text-anchor="middle" font-size="12" fill="' + INK + '" font-family="Alegreya Sans, sans-serif">' + miles.toLocaleString("en-US") + " miles</text>");
    bases[key] = {
      img: "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + p.w + " " + p.h + '" width="' + p.w * 2 + '" height="' + p.h * 2 + '">' + out.join("") + "</svg>"),
      labels: labels.join("")
    };
    return bases[key];
  }
  function coastXAt(coast, y) {
    for (var i = 1; i < coast.length; i++) {
      var a = coast[i - 1], b = coast[i];
      if ((a[1] - y) * (b[1] - y) <= 0) { var t = (y - a[1]) / ((b[1] - a[1]) || 1); return a[0] + (b[0] - a[0]) * t; }
    }
    return 0;
  }
  function label(x, y, text, kind, note, anchorTo) {
    var st = {
      nation: 'font-family="Alegreya SC, Georgia, serif" font-size="13" letter-spacing="2.5" fill="#7a5233" font-weight="700"',
      region: 'font-family="Alegreya SC, Georgia, serif" font-size="15" letter-spacing="1.5" fill="' + SOFT + '" font-weight="500"',
      sea: 'font-family="Alegreya Sans, sans-serif" font-style="italic" font-size="17" letter-spacing="3" fill="#466172"',
      river: 'font-family="Alegreya Sans, sans-serif" font-style="italic" font-size="10.5" fill="' + RIVER + '"',
      range: 'font-family="Alegreya Sans, sans-serif" font-style="italic" font-size="11" fill="' + SOFT + '"',
      place: 'font-family="Alegreya Sans, sans-serif" font-size="13.5" font-weight="700" fill="' + INK + '"'
    }[kind];
    var anchor = anchorTo || "middle";
    var halo = 'paint-order="stroke" stroke="' + PAPER + '" stroke-width="3.2" stroke-linejoin="round"';
    var parts = kind === "nation" ? text.split(", ") : [text];
    var out = parts.map(function (t, i) {
      return '<text x="' + f(x) + '" y="' + f(y + i * 14) + '" text-anchor="' + anchor + '" ' + st + " " + halo + ">" + esc(t) + "</text>";
    }).join("");
    if (note) out += '<text x="' + f(x) + '" y="' + f(y + 14) + '" text-anchor="' + anchor + '" font-family="Alegreya Sans, sans-serif" font-style="italic" font-size="11" fill="' + SOFT + '" ' + halo + ">" + esc(note) + "</text>";
    return out;
  }
  var PIN = {
    event: function (x, y) { return '<path d="M' + x + "," + (y - 7) + " L" + (x + 6) + "," + y + " L" + x + "," + (y + 7) + " L" + (x - 6) + "," + y + ' Z" fill="#c9a24e" stroke="' + INK + '" stroke-width="1.2"/>'; },
    river: function (x, y) { return '<circle cx="' + x + '" cy="' + y + '" r="6.5" fill="#cfe0e4" stroke="' + RIVER + '" stroke-width="1.6"/><path d="M' + (x - 4) + "," + (y + 1) + " q2,-3 4,0 t4,0" + '" fill="none" stroke="' + RIVER + '" stroke-width="1.4"/>'; },
    death: function (x, y) { return '<path d="M' + x + "," + (y - 8) + " L" + x + "," + (y + 8) + " M" + (x - 5) + "," + (y - 3) + " L" + (x + 5) + "," + (y - 3) + '" stroke="#fff" stroke-width="4.5" stroke-linecap="round"/><path d="M' + x + "," + (y - 8) + " L" + x + "," + (y + 8) + " M" + (x - 5) + "," + (y - 3) + " L" + (x + 5) + "," + (y - 3) + '" stroke="' + INK + '" stroke-width="2.2" stroke-linecap="round"/>'; },
    choice: function (x, y) { return '<circle cx="' + x + '" cy="' + y + '" r="5.5" fill="' + RED + '" stroke="' + INK + '" stroke-width="1.2"/>'; }
  };
  var WAGON = '<path d="M-9 3h14l1-6c-3-4-11-4-14 0z" fill="#f6ead0" stroke="' + INK + '" stroke-width="1.6" stroke-linejoin="round"/><circle cx="-6" cy="6" r="2.6" fill="' + INK + '"/><circle cx="3" cy="6" r="2.6" fill="' + INK + '"/>';
  var SHIP = '<path d="M-10 3 L10 3 L7 8 L-7 8 Z" fill="#6b4a33" stroke="' + INK + '" stroke-width="1.4"/><path d="M-1 3 L-1 -10 M-1 -9 L7 1 L-1 1 M-2 -7 L-9 1 L-2 1" fill="#f6ead0" stroke="' + INK + '" stroke-width="1.3" stroke-linejoin="round"/>';

  // The whole map for this family right now.
  function svg(S, trip, opts) {
    opts = opts || {};
    var loc = locate(S, trip), key = opts.map || loc.map, p = proj(key);
    if (key !== loc.map) loc = { map: key, x: -99, y: -99, done: [], pts: routePoints(S, key) };
    var b = base(key);
    var out = ['<div class="map-stack" style="--map-ratio:' + (p.w / p.h).toFixed(4) + '"><img class="map-base" alt="" src="' + b.img + '">' +
      '<svg class="trail-map" viewBox="0 0 ' + p.w + " " + p.h + '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Map of the route west">'];
    out.push(b.labels);
    // routes: the way ahead dashed, the way you came in red
    routesFor(S, key).forEach(function (r) {
      var pts = points(key, r[0]).map(function (q) { return [q.x, q.y]; });
      out.push('<path d="' + smooth(pts) + '" fill="none" stroke="' + INK + '" stroke-opacity="' + (r[1] ? 0.85 : 0.3) + '" stroke-width="2.2" stroke-dasharray="1 6" stroke-linecap="round"/>');
    });
    out.push('<path class="done" d="' + donePath(loc) + '" fill="none" stroke="' + RED + '" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>');
    // places on this family's routes
    var M = D[key], seen = {};
    routesFor(S, key).forEach(function (r) {
      points(key, r[0]).forEach(function (q) {
        if (!q.place || seen[q.place] || !M.places[q.place]) return;
        seen[q.place] = true;
        var pl = M.places[q.place], name = (M.names && M.names[q.place]) || (W.places[q.place].name || "").split(":")[0].split(",")[0];
        var visited = (S.visited || []).indexOf(q.place) >= 0 || q.place === S.place;
        out.push('<circle cx="' + f(q.x) + '" cy="' + f(q.y) + '" r="5" fill="' + (visited ? INK : PAPER) + '" stroke="' + INK + '" stroke-width="1.8"/>');
        out.push(label(q.x + pl[2], q.y + pl[3], name, "place", null, pl[4]));
      });
    });
    // pins
    (S.pins || []).forEach(function (pin, i) {
      if (pin.map !== key) return;
      out.push('<g class="pin"><title>' + esc((i + 1) + ". " + pin.label + " (" + pin.date + ")") + "</title>" + (PIN[pin.kind] || PIN.event)(f(pin.x), f(pin.y)) + "</g>");
    });
    // the wagon (or ship)
    out.push('<g class="token" transform="' + tokenAt(loc) + '"><circle r="15" fill="#c9a24e" stroke="#7a5a22" stroke-width="2"/>' +
      '<circle r="11.5" fill="none" stroke="#f0d58c" stroke-opacity="0.8"/>' + (key === "sea" ? SHIP : WAGON) + '<path d="M-4 14 L0 20 L4 14" fill="#7a5a22"/></g>');
    out.push("</svg></div>");
    return out.join("");
  }

  function donePath(loc) { return loc.done.length > 1 ? smooth(loc.done.map(function (q) { return [q.x, q.y]; })) : "M0,0"; }
  function tokenAt(loc) { return "translate(" + f(loc.x) + "," + f(loc.y - 16) + ")"; }

  // ------------------------------------------------------------------ pins
  function pin(S, kind, label, trip) {
    var loc = locate(S, trip);
    S.pins = (S.pins || []).concat([{ kind: kind, label: label, date: W.engine.formatDate(W.engine.dateOf(S)).replace(/, \d{4}$/, ""), map: loc.map, x: Math.round(loc.x), y: Math.round(loc.y) }]);
  }
  function visit(S) { S.visited = S.visited || []; if (S.visited.indexOf(S.place) < 0) S.visited.push(S.place); }

  // ------------------------------------------------------------------ the map during travel
  function overlay(S, trip) {
    var el = document.createElement("div");
    el.className = "map-overlay";
    el.setAttribute("aria-hidden", "true");
    var to = trip.to.split(":")[0];
    el.innerHTML = '<div class="map-board"><h2 class="map-title">To ' + esc(to) + '</h2><div class="map-art"></div>' +
      '<div class="map-foot"><span class="map-date"></span><span class="map-note"></span><span class="map-miles"></span></div></div>';
    var art = el.querySelector(".map-art");
    // The map is drawn once each time it appears; after that only the wagon and the
    // red line move (redrawing the whole map every frame would slow the trip down).
    var visible = false, built = false, token = null, done = null, lastAt = 0;
    function update(force) {
      var now = performance.now();
      if (!force && now - lastAt < 120) return;
      lastAt = now;
      if (!built) {
        art.innerHTML = svg(S, trip);
        token = art.querySelector(".token"); done = art.querySelector(".done"); built = true;
      } else {
        var loc = locate(S, trip);
        token.setAttribute("transform", tokenAt(loc));
        done.setAttribute("d", donePath(loc));
      }
      el.querySelector(".map-date").textContent = W.engine.formatDate(W.engine.dateOf(S));
      var total = totalMiles(S);
      el.querySelector(".map-miles").textContent = isSea(S) ? "Day " + (trip.day || 0) + " of about " + trip.days : S.miles.toLocaleString("en-US") + (total ? " of " + total.toLocaleString("en-US") : "") + " miles";
    }
    function show() {
      if (visible) return Promise.resolve();
      visible = true;
      built = false;
      update(true);
      if (!el.isConnected) document.body.appendChild(el);
      el.classList.remove("out");
      void el.offsetWidth;
      el.classList.add("in");
      return new Promise(function (r) { setTimeout(function () { if (visible && W.scene.cover) W.scene.cover(true); r(); }, 700); });
    }
    function hide() {
      if (!visible) return Promise.resolve();
      visible = false;
      if (W.scene.cover) W.scene.cover(false);
      el.classList.remove("in");
      el.classList.add("out");
      return new Promise(function (r) { setTimeout(r, 550); });
    }
    return {
      show: show, hide: hide, update: function () { if (visible) update(); },
      note: function (t) { var n = el.querySelector(".map-note"); if (n) n.textContent = t || ""; },
      get visible() { return visible; },
      remove: function () { if (W.scene.cover) W.scene.cover(false); el.remove(); }
    };
  }
  function totalMiles(S) {
    if (isSea(S)) return 0;
    var last = (S.beats || []).filter(function (b) { return b.type === "ending"; })[0];
    var p = last && W.places[last.at];
    return p && typeof p.miles === "number" ? p.miles : 0;
  }

  // ------------------------------------------------------------------ the map as a screen
  var KIND_NAMES = { event: "Trouble on the trail", river: "River crossing", death: "A death", choice: "A choice" };
  function open(S, opts) {
    opts = opts || {};
    return new Promise(function (resolve) {
      var el = document.createElement("div");
      el.className = "map-overlay map-screen in";
      var maps = isSea(S) ? [["sea", "The Pacific"], ["california", "California"]] : [["west", null]];
      var current = opts.map || (maps.length > 1 ? (SEA_PLACES[S.place] ? "sea" : "california") : "west");
      function draw() {
        var pins = (S.pins || []).map(function (p, i) { return { p: p, n: i + 1 }; }).filter(function (x) { return x.p.map === current; });
        el.innerHTML = '<div class="map-board"><h2 class="map-title">' + esc(opts.title || "Your trip so far") + "</h2>" +
          (maps.length > 1 ? '<div class="map-tabs">' + maps.map(function (m) { return '<button data-map="' + m[0] + '"' + (m[0] === current ? ' class="on"' : "") + ">" + m[1] + "</button>"; }).join("") + "</div>" : "") +
          '<div class="map-body"><div class="map-art">' + svg(S, null, { map: current }) + "</div>" +
          '<ol class="map-legend">' + (pins.length ? pins.map(function (x) {
            return '<li><span class="pin-key ' + x.p.kind + '"></span><b>' + esc(x.p.label) + "</b> <span>" + esc(x.p.date) + "</span></li>";
          }).join("") : "<li class=\"empty\">Nothing has happened yet. Every crossing, choice, and trouble will get a pin here.</li>") + "</ol></div>" +
          '<div class="map-actions"><button class="primary" id="map-close" data-autofocus>' + esc(opts.closeLabel || "Back") + "</button></div></div>";
        el.querySelectorAll("[data-map]").forEach(function (b) { b.onclick = function () { current = b.getAttribute("data-map"); draw(); }; });
        el.querySelector("#map-close").onclick = close;
        el.querySelector("#map-close").focus({ preventScroll: true });
      }
      // the map screen takes the keyboard while it is open: Enter or Escape closes it
      function key(ev) {
        if (ev.key === "Tab") return;
        ev.stopPropagation();
        if (ev.key === "Escape" || ev.key === "Enter") { ev.preventDefault(); close(); }
      }
      function close() { document.removeEventListener("keydown", key, true); el.classList.add("out"); setTimeout(function () { el.remove(); resolve(); }, 450); }
      document.addEventListener("keydown", key, true);
      draw();
      document.body.appendChild(el);
    });
  }

  W.travelMap = { overlay: overlay, open: open, pin: pin, visit: visit, svg: svg, locate: locate, kinds: KIND_NAMES };
})();
