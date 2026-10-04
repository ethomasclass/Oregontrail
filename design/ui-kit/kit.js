// Westward UI kit: wood, paper, iron, and leather, drawn as SVG in code.
// Every piece is built from a seeded random generator, so the same seed always
// draws the same plank. One light source (top left) for every bevel and shadow.
// Usage: <div data-ui="frame" data-seed="3">...</div>, then UIKit.paint(document).
(function () {
  "use strict";

  var C = {
    wood:  { base: "#8a5a33", grain: "#5e3a1f", light: "#a5703f", hi: "#c8915a", dark: "#4a2c17", seam: "#2b190d" },
    dark:  { base: "#5b3a22", grain: "#3c2414", light: "#71492b", hi: "#8d5f38", dark: "#2c1a0e", seam: "#1a0f07" },
    light: { base: "#b27c47", grain: "#8a5a30", light: "#c58f58", hi: "#e0b47c", dark: "#6e4524", seam: "#3a230f" },
    gray:  { base: "#8a7f72", grain: "#6b6258", light: "#9a9084", hi: "#b2a898", dark: "#4f4840", seam: "#2f2a25" },
    paper: "#f1e3c3", paperMid: "#e6d2a8", paperEdge: "#c9a874", burn: "#8f6a40",
    iron: "#3d3d42", ironHi: "#8c8c94", ironDark: "#1d1d21",
    brass: "#c9a24e", brassHi: "#f0d58c", brassDark: "#7a5a22",
    red: "#9b3024", redDark: "#661c15", redHi: "#c4523f",
    leather: "#7a4a2a", leatherDark: "#4e2d18", stitch: "#e2c596",
    ink: "#2b1d12"
  };

  var uid = 0;
  function id(p) { return p + (++uid); }
  function rng(seed) {
    var a = (seed * 2654435761) >>> 0 || 1;
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function f(n) { return Math.round(n * 10) / 10; }
  function svg(w, h, body, defs) {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + " " + h + '">' +
      (defs ? "<defs>" + defs + "</defs>" : "") + body + "</svg>";
  }

  // ------------------------------------------------------------------ wood
  // One plank, drawn at the origin, w long and h tall, grain running lengthwise.
  function plank(w, h, tone, R, o) {
    o = o || {};
    var t = C[tone] || tone, out = [];
    var r = o.r || 2;
    out.push('<rect x="0" y="0" width="' + f(w) + '" height="' + f(h) + '" rx="' + r + '" fill="' + t.base + '"/>');
    // knots: the grain bends around them
    var knots = [];
    var nk = o.knots != null ? o.knots : (w > 90 && R() < 0.75 ? 1 + (R() < 0.3 ? 1 : 0) : 0);
    for (var k = 0; k < nk; k++) knots.push({ x: w * (0.15 + R() * 0.7), y: h * (0.3 + R() * 0.4), rx: 3 + R() * 4, ry: 1.6 + R() * 1.6 });
    var lines = Math.max(3, Math.round(h / 3.2));
    for (var i = 0; i < lines; i++) {
      var y0 = (i + 0.3 + R() * 0.5) * h / lines, pts = [], amp = 0.4 + R() * 0.9, fr = 0.01 + R() * 0.02, ph = R() * 6;
      for (var x = -2; x <= w + 2; x += Math.max(4, w / 40)) {
        var y = y0 + Math.sin(x * fr + ph) * amp;
        knots.forEach(function (kn) {
          var dx = (x - kn.x) / (kn.rx * 2.4), push = kn.ry * 2.6 - Math.abs(y0 - kn.y);
          if (push > 0) y += (y0 < kn.y ? -1 : 1) * push * Math.exp(-dx * dx);
        });
        pts.push(f(x) + "," + f(Math.max(1, Math.min(h - 1, y))));
      }
      var dark = R() < 0.7;
      out.push('<polyline points="' + pts.join(" ") + '" fill="none" stroke="' + (dark ? t.grain : t.light) + '" stroke-width="' + f(0.6 + R() * 0.9) +
        '" stroke-opacity="' + f(dark ? 0.35 + R() * 0.35 : 0.3 + R() * 0.3) + '" stroke-linecap="round"/>');
    }
    knots.forEach(function (kn) {
      out.push('<ellipse cx="' + f(kn.x) + '" cy="' + f(kn.y) + '" rx="' + f(kn.rx) + '" ry="' + f(kn.ry) + '" fill="' + t.dark + '" fill-opacity="0.75"/>');
      out.push('<ellipse cx="' + f(kn.x) + '" cy="' + f(kn.y) + '" rx="' + f(kn.rx * 1.7) + '" ry="' + f(kn.ry * 1.8) + '" fill="none" stroke="' + t.grain + '" stroke-opacity="0.5" stroke-width="0.8"/>');
    });
    // a crack running in from one end
    if (o.cracks !== false && R() < 0.4 && w > 60) {
      var cy = h * (0.3 + R() * 0.4), left = R() < 0.5, len = 8 + R() * 18, cx = left ? 0 : w, d = "M" + f(cx) + "," + f(cy);
      for (var c = 1; c <= 4; c++) d += " L" + f(cx + (left ? 1 : -1) * len * c / 4) + "," + f(cy + (R() - 0.5) * 2.2);
      out.push('<path d="' + d + '" fill="none" stroke="' + t.seam + '" stroke-width="1.1" stroke-linecap="round" stroke-opacity="0.8"/>');
    }
    // bevel: light from the top left
    if (o.pressed) {
      out.push('<rect x="0" y="0" width="' + f(w) + '" height="3" fill="' + t.seam + '" fill-opacity="0.45"/>');
      out.push('<rect x="0" y="' + f(h - 1.5) + '" width="' + f(w) + '" height="1.5" fill="' + t.hi + '" fill-opacity="0.6"/>');
    } else {
      out.push('<rect x="1" y="1" width="' + f(w - 2) + '" height="1.6" rx="1" fill="' + t.hi + '" fill-opacity="0.85"/>');
      out.push('<rect x="1" y="1" width="1.6" height="' + f(h - 2) + '" fill="' + t.hi + '" fill-opacity="0.45"/>');
      out.push('<rect x="0" y="' + f(h - 2.5) + '" width="' + f(w) + '" height="2.5" fill="' + t.dark + '" fill-opacity="0.8"/>');
      out.push('<rect x="' + f(w - 2) + '" y="0" width="2" height="' + f(h) + '" fill="' + t.dark + '" fill-opacity="0.6"/>');
    }
    out.push('<rect x="0.5" y="0.5" width="' + f(w - 1) + '" height="' + f(h - 1) + '" rx="' + r + '" fill="none" stroke="' + t.seam + '" stroke-width="1.2"/>');
    return out.join("");
  }
  function place(inner, x, y, vertical, h) {
    return vertical ? '<g transform="translate(' + f(x + h) + "," + f(y) + ') rotate(90)">' + inner + "</g>"
                    : '<g transform="translate(' + f(x) + "," + f(y) + ')">' + inner + "</g>";
  }
  // A board of planks laid edge to edge with staggered joints.
  function boards(w, h, tone, R, o) {
    o = o || {};
    var out = [], ph = o.plankH || 30, rows = Math.max(1, Math.round(h / ph)), rh = h / rows;
    for (var r = 0; r < rows; r++) {
      var x = 0, first = true;
      while (x < w - 1) {
        var len = first ? w * (0.25 + R() * 0.6) : w * (0.45 + R() * 0.7);
        if (o.whole) len = w;
        len = Math.min(len, w - x);
        if (w - x - len < 30) len = w - x;
        out.push(place(plank(len, rh, tone, R, { r: 1 }), x, r * rh));
        x += len; first = false;
      }
    }
    return out.join("");
  }

  // ------------------------------------------------------------------ iron and brass
  function nail(x, y, s, metal) {
    s = s || 1;
    var m = metal === "brass" ? [C.brass, C.brassHi, C.brassDark] : [C.iron, C.ironHi, C.ironDark];
    return '<circle cx="' + f(x + 0.8) + '" cy="' + f(y + 1.2) + '" r="' + f(3.4 * s) + '" fill="#000" fill-opacity="0.35"/>' +
      '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(3.2 * s) + '" fill="' + m[0] + '" stroke="' + m[2] + '" stroke-width="0.8"/>' +
      '<circle cx="' + f(x - 0.9 * s) + '" cy="' + f(y - 0.9 * s) + '" r="' + f(1.1 * s) + '" fill="' + m[1] + '" fill-opacity="0.9"/>';
  }
  // An L-shaped iron bracket for a corner. corner: tl, tr, bl, br
  function bracket(x, y, corner, size) {
    size = size || 30;
    var t = 9, sx = corner[1] === "r" ? -1 : 1, sy = corner[0] === "b" ? -1 : 1;
    var d = "M0,0 L" + size + ",0 L" + size + "," + t + " L" + t + "," + t + " L" + t + "," + size + " L0," + size + " Z";
    var g = '<g transform="translate(' + x + "," + y + ") scale(" + sx + "," + sy + ')">' +
      '<path d="' + d + '" transform="translate(1.2,1.6)" fill="#000" fill-opacity="0.35"/>' +
      '<path d="' + d + '" fill="' + C.iron + '" stroke="' + C.ironDark + '" stroke-width="1"/>' +
      '<path d="M1,1 L' + (size - 1) + ',1" stroke="' + C.ironHi + '" stroke-opacity="0.55" stroke-width="1.2"/>' +
      '<path d="M1,1 L1,' + (size - 1) + '" stroke="' + C.ironHi + '" stroke-opacity="0.35" stroke-width="1.2"/>' +
      "</g>";
    var n1 = [x + sx * 4.5, y + sy * 4.5], n2 = [x + sx * (size - 5.5), y + sy * 4.5], n3 = [x + sx * 4.5, y + sy * (size - 5.5)];
    return g + nail(n1[0], n1[1], 0.8) + nail(n2[0], n2[1], 0.7) + nail(n3[0], n3[1], 0.7);
  }

  // ------------------------------------------------------------------ paper
  function edgePath(x, y, w, h, R, rough, step) {
    rough = rough || 1.6; step = step || 9;
    var pts = [];
    function side(x0, y0, x1, y1, nx, ny) {
      var len = Math.hypot(x1 - x0, y1 - y0), n = Math.max(2, Math.round(len / step));
      for (var i = 0; i < n; i++) {
        var k = i / n, j = (R() - 0.5) * rough;
        if (R() < 0.05) j -= rough * 2.5;      // a small nick
        pts.push([x0 + (x1 - x0) * k + nx * j, y0 + (y1 - y0) * k + ny * j]);
      }
    }
    side(x, y, x + w, y, 0, 1); side(x + w, y, x + w, y + h, -1, 0);
    side(x + w, y + h, x, y + h, 0, -1); side(x, y + h, x, y, 1, 0);
    return "M" + pts.map(function (p) { return f(p[0]) + "," + f(p[1]); }).join(" L") + " Z";
  }
  function paperBody(x, y, w, h, R, o) {
    o = o || {};
    var g = id("pg"), d = edgePath(x, y, w, h, R, o.rough, o.step), out = [], defs = [];
    defs.push('<radialGradient id="' + g + '" cx="45%" cy="40%" r="75%"><stop offset="0" stop-color="' + C.paper + '"/><stop offset="0.7" stop-color="' + C.paperMid + '"/><stop offset="1" stop-color="' + C.paperEdge + '"/></radialGradient>');
    if (o.shadow !== false) out.push('<path d="' + d + '" transform="translate(2,3)" fill="#000" fill-opacity="0.3"/>');
    out.push('<path d="' + d + '" fill="url(#' + g + ')"/>');
    // stains and fibers
    var st = id("st");
    defs.push('<radialGradient id="' + st + '"><stop offset="0" stop-color="#a07444" stop-opacity="0.16"/><stop offset="1" stop-color="#a07444" stop-opacity="0"/></radialGradient>');
    for (var i = 0; i < 3 + R() * 3; i++) {
      var cx = x + w * R(), cy = y + h * R(), rr = 14 + R() * Math.min(w, h) * 0.25;
      out.push('<ellipse cx="' + f(cx) + '" cy="' + f(cy) + '" rx="' + f(rr) + '" ry="' + f(rr * (0.6 + R() * 0.5)) + '" fill="url(#' + st + ')"/>');
    }
    for (var j = 0; j < w * h / 2500; j++) {
      var fx = x + w * R(), fy = y + h * R(), a = R() * 3.14, l = 3 + R() * 6;
      out.push('<line x1="' + f(fx) + '" y1="' + f(fy) + '" x2="' + f(fx + Math.cos(a) * l) + '" y2="' + f(fy + Math.sin(a) * l) + '" stroke="#9a7a50" stroke-opacity="0.18" stroke-width="0.6"/>');
    }
    out.push('<path d="' + d + '" fill="none" stroke="' + C.burn + '" stroke-opacity="0.55" stroke-width="1.6"/>');
    return { body: out.join(""), defs: defs.join("") };
  }

  // ------------------------------------------------------------------ pieces
  var P = {};

  // A wooden frame with iron corners. inner: "paper" | "boards" | "none"
  P.frame = function (w, h, R, o) {
    o = o || {};
    var b = o.border || 16, out = [], defs = "";
    if (o.inner === "paper") {
      out.push(place(boards(w - 2 * b + 4, h - 2 * b + 4, "dark", R, { plankH: 40 }), b - 2, b - 2));
      var p = paperBody(b + 4, b + 4, w - 2 * b - 8, h - 2 * b - 8, R, { shadow: true });
      out.push(p.body); defs += p.defs;
    } else if (o.inner === "boards") {
      out.push(place(boards(w - 2 * b + 4, h - 2 * b + 4, "dark", R, { plankH: o.plankH || 34 }), b - 2, b - 2));
    }
    // the shadow the frame casts onto what it holds
    var sh = id("sh");
    defs += '<linearGradient id="' + sh + 'v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0.5"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>' +
            '<linearGradient id="' + sh + 'h" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0.4"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>';
    out.push('<rect x="' + b + '" y="' + b + '" width="' + (w - 2 * b) + '" height="9" fill="url(#' + sh + 'v)"/>');
    out.push('<rect x="' + b + '" y="' + b + '" width="7" height="' + (h - 2 * b) + '" fill="url(#' + sh + 'h)"/>');
    // four beams: top and bottom run the full width, sides fit between
    var tone = o.tone || "wood";
    out.push(place(plank(w, b, tone, R, { cracks: false }), 0, 0));
    out.push(place(plank(w, b, tone, R, { cracks: false }), 0, h - b));
    out.push(place(plank(h - 2 * b, b, tone, R, { cracks: false, knots: 0 }), 0, b, true, b));
    out.push(place(plank(h - 2 * b, b, tone, R, { cracks: false, knots: 0 }), w - b, b, true, b));
    if (o.corners !== false) {
      out.push(bracket(1, 1, "tl", b + 14)); out.push(bracket(w - 1, 1, "tr", b + 14));
      out.push(bracket(1, h - 1, "bl", b + 14)); out.push(bracket(w - 1, h - 1, "br", b + 14));
    }
    return svg(w, h, out.join(""), defs);
  };

  // Loose paper (a note, a tooltip, the journal strip).
  P.paper = function (w, h, R, o) {
    var p = paperBody(2, 2, w - 6, h - 7, R, o);
    return svg(w, h, p.body, p.defs);
  };

  // Paper nailed to a board corner: the journal strip and toasts.
  P.note = function (w, h, R) {
    var p = paperBody(3, 3, w - 8, h - 9, R, { step: 7 });
    return svg(w, h, p.body + nail(12, 11, 0.9) + nail(w - 14, 11, 0.9), p.defs);
  };

  // A plank button. state: normal | hover | pressed | disabled. kind: primary | secondary
  P.button = function (w, h, R, o) {
    o = o || {};
    var state = o.state || "normal", tone = o.kind === "primary" ? "light" : "wood";
    if (state === "disabled") tone = "gray";
    var out = [], dy = state === "pressed" ? 2 : 0;
    if (state !== "pressed") out.push('<rect x="2" y="4" width="' + (w - 3) + '" height="' + (h - 4) + '" rx="3" fill="#000" fill-opacity="0.38"/>');
    var t = Object.assign({}, C[tone]);
    if (state === "hover") { t.base = "#c38a52"; t.hi = "#f0c88e"; t.light = "#d39d63"; }
    out.push(place(plank(w - 2, h - 4, t, R, { pressed: state === "pressed", cracks: false, knots: w > 200 ? 1 : 0 }), 0, dy));
    var metal = o.kind === "primary" ? "brass" : "iron";
    if (o.nails !== false) { out.push(nail(9, (h - 4) / 2 + dy, 0.8, metal)); out.push(nail(w - 12, (h - 4) / 2 + dy, 0.8, metal)); }
    if (state === "hover") out.push('<rect x="0.5" y="' + (0.5 + dy) + '" width="' + (w - 3) + '" height="' + (h - 5) + '" rx="2" fill="none" stroke="' + C.brassHi + '" stroke-opacity="0.9" stroke-width="1.5"/>');
    return svg(w, h, out.join(""));
  };

  // A burned-in number badge for keyboard shortcuts.
  P.key = function (w, h) {
    return svg(w, h, '<circle cx="' + w / 2 + '" cy="' + (h / 2 + 1) + '" r="' + (w / 2 - 1) + '" fill="#000" fill-opacity="0.3"/>' +
      '<circle cx="' + w / 2 + '" cy="' + h / 2 + '" r="' + (w / 2 - 1.5) + '" fill="' + C.brass + '" stroke="' + C.brassDark + '" stroke-width="1.2"/>' +
      '<circle cx="' + w / 2 + '" cy="' + h / 2 + '" r="' + (w / 2 - 4) + '" fill="none" stroke="' + C.brassHi + '" stroke-opacity="0.6"/>');
  };

  // A red ribbon banner with folded tails.
  P.ribbon = function (w, h, R, o) {
    var tail = h * 0.9, drop = h * 0.28, out = [];
    var L = tail * 0.8, Rr = w - tail * 0.8;
    function tailPath(left) {
      var s = left ? 1 : -1, x0 = left ? 0 : w, xi = left ? L : Rr;
      return "M" + f(xi) + "," + f(drop) + " L" + f(x0) + "," + f(drop) + " L" + f(x0 + s * tail * 0.32) + "," + f(drop + (h - drop) / 2) +
        " L" + f(x0) + "," + f(h) + " L" + f(xi + s * 6) + "," + f(h) + " Z";
    }
    out.push('<path d="' + tailPath(true) + '" fill="' + C.redDark + '"/>');
    out.push('<path d="' + tailPath(false) + '" fill="' + C.redDark + '"/>');
    // folds
    out.push('<path d="M' + f(L) + "," + f(h - drop) + " L" + f(L + 6) + "," + f(h) + " L" + f(L) + "," + f(h) + ' Z" fill="#3e0f0b"/>');
    out.push('<path d="M' + f(Rr) + "," + f(h - drop) + " L" + f(Rr - 6) + "," + f(h) + " L" + f(Rr) + "," + f(h) + ' Z" fill="#3e0f0b"/>');
    var g = id("rb");
    var body = "M" + f(L) + ",0 Q" + f(w / 2) + "," + f(-h * 0.12) + " " + f(Rr) + ",0 L" + f(Rr) + "," + f(h - drop) + " Q" + f(w / 2) + "," + f(h - drop - h * 0.12) + " " + f(L) + "," + f(h - drop) + " Z";
    out.push('<path d="' + body + '" transform="translate(1.5,2.5)" fill="#000" fill-opacity="0.3"/>');
    out.push('<path d="' + body + '" fill="url(#' + g + ')" stroke="' + C.redDark + '" stroke-width="1"/>');
    out.push('<path d="M' + f(L + 4) + ",4 Q" + f(w / 2) + "," + f(4 - h * 0.12) + " " + f(Rr - 4) + ',4" fill="none" stroke="' + C.redHi + '" stroke-opacity="0.8" stroke-width="1.2"/>');
    out.push('<path d="M' + f(L + 4) + "," + f(h - drop - 4) + " Q" + f(w / 2) + "," + f(h - drop - 4 - h * 0.12) + " " + f(Rr - 4) + "," + f(h - drop - 4) + '" fill="none" stroke="' + C.stitch + '" stroke-opacity="0.5" stroke-width="0.8" stroke-dasharray="3 3"/>');
    return svg(w, h + 4, out.join(""), '<linearGradient id="' + g + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + C.redHi + '"/><stop offset="1" stop-color="' + C.red + '"/></linearGradient>');
  };

  // A leather tag with stitching: who holds the mouse.
  P.tag = function (w, h, R) {
    var d = "M2,2 L" + (w - h / 2) + ",2 L" + (w - 2) + "," + h / 2 + " L" + (w - h / 2) + "," + (h - 2) + " L2," + (h - 2) + " Z";
    var g = id("lt");
    return svg(w, h + 2, '<path d="' + d + '" transform="translate(1,2)" fill="#000" fill-opacity="0.3"/>' +
      '<path d="' + d + '" fill="url(#' + g + ')" stroke="' + C.leatherDark + '" stroke-width="1.2"/>' +
      '<path d="M6,6 L' + (w - h / 2 - 2) + ",6 L" + (w - 7) + "," + h / 2 + " L" + (w - h / 2 - 2) + "," + (h - 6) + " L6," + (h - 6) + ' Z" fill="none" stroke="' + C.stitch + '" stroke-opacity="0.75" stroke-width="1" stroke-dasharray="3 2.5"/>',
      '<linearGradient id="' + g + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8f5a34"/><stop offset="1" stop-color="' + C.leather + '"/></linearGradient>');
  };

  // A wax seal: a group vote.
  P.seal = function (w, h, R) {
    var cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - 3, pts = [];
    for (var i = 0; i < 16; i++) {
      var a = i / 16 * 6.283, rr = r * (0.9 + R() * 0.12);
      pts.push(f(cx + Math.cos(a) * rr) + "," + f(cy + Math.sin(a) * rr));
    }
    var g = id("ws");
    return svg(w, h, '<polygon points="' + pts.join(" ") + '" transform="translate(1,2)" fill="#000" fill-opacity="0.3"/>' +
      '<polygon points="' + pts.join(" ") + '" fill="url(#' + g + ')" stroke="' + C.redDark + '"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + f(r * 0.62) + '" fill="none" stroke="' + C.redDark + '" stroke-width="1.6"/>' +
      '<circle cx="' + f(cx - 0.6) + '" cy="' + f(cy - 0.6) + '" r="' + f(r * 0.62) + '" fill="none" stroke="' + C.redHi + '" stroke-opacity="0.6"/>',
      '<radialGradient id="' + g + '" cx="40%" cy="35%"><stop offset="0" stop-color="' + C.redHi + '"/><stop offset="1" stop-color="' + C.red + '"/></radialGradient>');
  };

  // A round wooden frame around paper: family portraits and the settings button.
  P.medallion = function (w, h, R, o) {
    o = o || {};
    var cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - 2, ring = Math.max(5, r * 0.22), out = [], defs = "";
    var g = id("md"), pg = id("mp");
    defs += '<radialGradient id="' + g + '" cx="35%" cy="30%"><stop offset="0" stop-color="' + C.light.hi + '"/><stop offset="0.6" stop-color="' + C.wood.base + '"/><stop offset="1" stop-color="' + C.wood.dark + '"/></radialGradient>';
    defs += '<radialGradient id="' + pg + '" cx="45%" cy="40%"><stop offset="0" stop-color="' + (o.fill || C.paper) + '"/><stop offset="1" stop-color="' + (o.fill ? o.fill : C.paperEdge) + '"/></radialGradient>';
    out.push('<circle cx="' + (cx + 1) + '" cy="' + (cy + 2) + '" r="' + r + '" fill="#000" fill-opacity="0.35"/>');
    out.push('<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="url(#' + g + ')" stroke="' + C.wood.seam + '" stroke-width="1.2"/>');
    for (var i = 0; i < 5; i++) {
      var rr = r - ring * (0.2 + 0.6 * R()), a0 = R() * 6.28, a1 = a0 + 0.8 + R() * 1.6;
      out.push('<path d="M' + f(cx + Math.cos(a0) * rr) + "," + f(cy + Math.sin(a0) * rr) + " A" + f(rr) + "," + f(rr) + " 0 0 1 " + f(cx + Math.cos(a1) * rr) + "," + f(cy + Math.sin(a1) * rr) +
        '" fill="none" stroke="' + C.wood.grain + '" stroke-opacity="0.5" stroke-width="0.8"/>');
    }
    out.push('<circle cx="' + cx + '" cy="' + cy + '" r="' + f(r - ring) + '" fill="url(#' + pg + ')" stroke="' + C.wood.seam + '" stroke-width="1.2"/>');
    out.push('<path d="M' + f(cx - (r - ring) * 0.9) + "," + f(cy - (r - ring) * 0.3) + " A" + f(r - ring) + "," + f(r - ring) + ' 0 0 1 ' + f(cx + (r - ring) * 0.5) + "," + f(cy - (r - ring) * 0.85) +
      '" fill="none" stroke="#000" stroke-opacity="0.25" stroke-width="3"/>');
    // a black mourning ribbon across the corner
    if (o.dead) out.push('<g transform="translate(' + f(cx) + "," + f(cy) + ') rotate(-45)">' +
      '<rect x="' + f(-r * 1.05) + '" y="' + f(r * 0.38) + '" width="' + f(r * 2.1) + '" height="' + f(r * 0.3) + '" fill="#000" fill-opacity="0.3" transform="translate(1,2)"/>' +
      '<rect x="' + f(-r * 1.05) + '" y="' + f(r * 0.38) + '" width="' + f(r * 2.1) + '" height="' + f(r * 0.3) + '" fill="#1f1b1a"/>' +
      '<rect x="' + f(-r * 1.05) + '" y="' + f(r * 0.4) + '" width="' + f(r * 2.1) + '" height="1" fill="#6b6460"/></g>');
    return svg(w, h, out.join(""), defs);
  };

  // A dark slot cut into wood: text inputs, slider tracks, the miles bar.
  P.slot = function (w, h, R, o) {
    var g = id("sl");
    return svg(w, h, '<rect x="0" y="0" width="' + w + '" height="' + h + '" rx="4" fill="#1e130b"/>' +
      '<rect x="0" y="0" width="' + w + '" height="' + h + '" rx="4" fill="url(#' + g + ')"/>' +
      '<rect x="0.5" y="' + (h - 1.5) + '" width="' + (w - 1) + '" height="1.2" fill="' + C.wood.hi + '" fill-opacity="0.45"/>' +
      '<rect x="0.5" y="0.5" width="' + (w - 1) + '" height="' + (h - 1) + '" rx="4" fill="none" stroke="#0d0805" stroke-width="1"/>',
      '<linearGradient id="' + g + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0.55"/><stop offset="0.4" stop-color="#000" stop-opacity="0"/></linearGradient>');
  };

  // A paper strip set into a slot: a text field.
  P.field = function (w, h, R) {
    var p = paperBody(3, 3, w - 6, h - 6, R, { shadow: false, rough: 0.8, step: 12 });
    var g = id("fs");
    return svg(w, h, '<rect x="0" y="0" width="' + w + '" height="' + h + '" rx="4" fill="#1e130b"/>' + p.body +
      '<rect x="3" y="3" width="' + (w - 6) + '" height="6" fill="url(#' + g + ')"/>',
      p.defs + '<linearGradient id="' + g + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0.3"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>');
  };

  // A brass slider knob.
  P.knob = function (w, h) {
    var g = id("kb");
    return svg(w, h, '<rect x="1.5" y="3" width="' + (w - 2) + '" height="' + (h - 3) + '" rx="3" fill="#000" fill-opacity="0.4"/>' +
      '<rect x="0.5" y="0.5" width="' + (w - 3) + '" height="' + (h - 4) + '" rx="3" fill="url(#' + g + ')" stroke="' + C.brassDark + '"/>' +
      '<rect x="2" y="2" width="' + (w - 6) + '" height="1.4" fill="' + C.brassHi + '" fill-opacity="0.8"/>' +
      nail((w - 3) / 2, (h - 4) / 2, 0.75),
      '<linearGradient id="' + g + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + C.brassHi + '"/><stop offset="1" stop-color="' + C.brass + '"/></linearGradient>');
  };

  // The long shelf along the bottom of the screen.
  P.shelf = function (w, h, R) {
    var out = [];
    out.push(place(boards(w, h - 14, "dark", R, { plankH: (h - 14) / 2 }), 0, 14));
    out.push('<rect x="0" y="14" width="' + w + '" height="10" fill="url(#shs)"/>');
    out.push(place(plank(w, 16, "wood", R, { cracks: false, knots: 3 }), 0, 0));
    for (var x = 30; x < w; x += 180 + R() * 60) out.push(nail(x, 8, 0.8));
    return svg(w, h, out.join(""), '<linearGradient id="shs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0.55"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>');
  };

  // A small paper plaque in an iron-edged frame: one job's gauge on the shelf.
  P.plaque = function (w, h, R, o) {
    var p = paperBody(4, 4, w - 8, h - 9, R, { shadow: false, rough: 0.9, step: 11 }), out = [];
    out.push('<rect x="1" y="2" width="' + (w - 1) + '" height="' + (h - 2) + '" rx="3" fill="#000" fill-opacity="0.4"/>');
    out.push('<rect x="0" y="0" width="' + (w - 1) + '" height="' + (h - 3) + '" rx="3" fill="' + C.iron + '" stroke="' + C.ironDark + '"/>');
    out.push(p.body);
    if (o && o.alert) out.push('<rect x="4" y="4" width="' + (w - 9) + '" height="' + (h - 12) + '" rx="2" fill="' + C.red + '" fill-opacity="0.16" stroke="' + C.red + '" stroke-width="2"/>');
    out.push(nail(6, 6, 0.55)); out.push(nail(w - 7, 6, 0.55)); out.push(nail(6, h - 9, 0.55)); out.push(nail(w - 7, h - 9, 0.55));
    return svg(w, h, out.join(""), p.defs);
  };

  // An open book in a leather cover: the journal, landmarks, and voices.
  P.book = function (w, h, R) {
    var out = [], defs = "", g = id("bk");
    defs += '<linearGradient id="' + g + '" x1="0" y1="0" x2="1" y2="0"><stop offset="0.44" stop-color="#000" stop-opacity="0"/><stop offset="0.5" stop-color="#000" stop-opacity="0.28"/><stop offset="0.56" stop-color="#000" stop-opacity="0"/></linearGradient>';
    out.push('<rect x="3" y="6" width="' + (w - 4) + '" height="' + (h - 7) + '" rx="8" fill="#000" fill-opacity="0.4"/>');
    out.push('<rect x="0" y="0" width="' + (w - 3) + '" height="' + (h - 6) + '" rx="8" fill="#5a2f1c" stroke="#2e170c" stroke-width="1.5"/>');
    out.push('<rect x="4" y="4" width="' + (w - 11) + '" height="' + (h - 14) + '" rx="6" fill="none" stroke="' + C.stitch + '" stroke-opacity="0.4" stroke-dasharray="4 3"/>');
    // page edges stacked at the bottom
    for (var i = 0; i < 3; i++) out.push('<rect x="' + (14 + i) + '" y="' + (h - 22 + i * 2) + '" width="' + (w - 31 - 2 * i) + '" height="3" fill="' + (i % 2 ? C.paperMid : C.paperEdge) + '"/>');
    var pw = (w - 3) / 2 - 16;
    var a = paperBody(14, 12, pw, h - 38, R, { shadow: false, rough: 1.0 }), b = paperBody(14 + pw + 4, 12, pw, h - 38, R, { shadow: false, rough: 1.0 });
    out.push(a.body); out.push(b.body); defs += a.defs + b.defs;
    out.push('<rect x="14" y="12" width="' + (2 * pw + 4) + '" height="' + (h - 38) + '" fill="url(#' + g + ')"/>');
    // ribbon bookmark
    var bx = w * 0.18;
    out.push('<path d="M' + bx + "," + (h - 20) + " L" + (bx + 14) + "," + (h - 20) + " L" + (bx + 14) + "," + (h + 0) + " L" + (bx + 7) + "," + (h - 6) + " L" + bx + "," + h + ' Z" fill="' + C.red + '" stroke="' + C.redDark + '"/>');
    return svg(w, h, out.join(""), defs);
  };

  // A paper speech bubble with a tail: one person talking.
  P.bubble = function (w, h, R) {
    var p = paperBody(4, 4, w - 10, h - 26, R, { rough: 1.2 });
    var tail = '<path d="M' + (w * 0.18) + "," + (h - 24) + " L" + (w * 0.12) + "," + (h - 3) + " L" + (w * 0.3) + "," + (h - 24) + ' Z" fill="' + C.paperMid + '" stroke="' + C.burn + '" stroke-opacity="0.55" stroke-width="1.6"/>';
    return svg(w, h, tail + p.body, p.defs);
  };

  // A carved sign on posts: the big headline when something happens.
  P.sign = function (w, h, R) {
    var out = [];
    out.push(place(plank(w, h, "light", R, { knots: 2 }), 0, 0));
    out.push(nail(10, 10)); out.push(nail(w - 11, 10)); out.push(nail(10, h - 11)); out.push(nail(w - 11, h - 11));
    return svg(w, h, out.join(""));
  };

  // ------------------------------------------------------------------ icons
  // One set, one stroke width, round caps: drawn in ink, 24 by 24.
  var ICON = {
    food: '<path d="M7 9c0-3 2-5 5-5s5 2 5 5"/><path d="M6 10h12l-1 10H7z"/><path d="M10 4l2 3 2-3"/>',
    ox: '<path d="M4 6c1 3 3 4 5 4M20 6c-1 3-3 4-5 4"/><path d="M9 9h6l1 6-2 4h-4l-2-4z"/><circle cx="10.5" cy="13" r=".6"/><circle cx="13.5" cy="13" r=".6"/>',
    coin: '<circle cx="12" cy="12" r="8"/><path d="M14.5 9.5c-.5-1-1.5-1.5-2.5-1.5-1.5 0-2.5.8-2.5 2s1 1.7 2.5 2 2.5.8 2.5 2-1 2-2.5 2c-1 0-2-.5-2.5-1.5M12 6.5v11"/>',
    calendar: '<rect x="4" y="6" width="16" height="14" rx="1.5"/><path d="M4 10h16M8 4v4M16 4v4"/><path d="M8 14h2M12 14h2M8 17h2"/>',
    compass: '<circle cx="12" cy="12" r="8"/><path d="M15 9l-2 4-4 2 2-4z"/><path d="M12 4v2M12 18v2M4 12h2M18 12h2"/>',
    heart: '<path d="M12 19s-7-4.4-7-9.5C5 7 7 5 9.3 5c1.3 0 2.2.7 2.7 1.6C12.5 5.7 13.4 5 14.7 5 17 5 19 7 19 9.5 19 14.6 12 19 12 19z"/>',
    medicine: '<rect x="8" y="8" width="8" height="12" rx="1.5"/><path d="M10 5h4v3h-4z"/><path d="M12 11v6M9 14h6"/>',
    wheel: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="1.6"/><path d="M12 4v6.4M12 13.6V20M4 12h6.4M13.6 12H20M6.3 6.3l4.5 4.5M13.2 13.2l4.5 4.5M17.7 6.3l-4.5 4.5M10.8 13.2l-4.5 4.5"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6L7 7M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4"/>',
    rain: '<path d="M7 15a4 4 0 010-8 5 5 0 019.6 1.5A3.3 3.3 0 0117 15z"/><path d="M8 18l-1 2M12 18l-1 2M16 18l-1 2"/>',
    wagon: '<path d="M4 15h14l1-6c-3-4-11-4-14 0z"/><circle cx="7" cy="18" r="2"/><circle cx="16" cy="18" r="2"/><path d="M18 13h3"/>',
    pin: '<path d="M12 21s-6-6.2-6-11a6 6 0 0112 0c0 4.8-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>',
    sound: '<path d="M4 10v4h4l5 4V6L8 10z"/><path d="M16 9c1 1 1.5 2 1.5 3s-.5 2-1.5 3M18.5 6.5C20 8 21 10 21 12s-1 4-2.5 5.5"/>',
    book: '<path d="M4 6c3-1 6-1 8 1 2-2 5-2 8-1v13c-3-1-6-1-8 1-2-2-5-2-8-1z"/><path d="M12 7v13"/>',
    talk: '<path d="M5 6h14v9H10l-4 3v-3H5z"/><path d="M8.5 10h7M8.5 12.5h4"/>',
    rest: '<path d="M4 18h16"/><path d="M6 18l2-6h8l2 6"/><path d="M10 9c0-2 4-2 4 0"/><path d="M15 5h3l-3 3h3"/>',
    vote: '<path d="M6 11l3 3 7-7"/><rect x="4" y="15" width="16" height="5" rx="1"/>'
  };
  function icon(name, size, color) {
    size = size || 22;
    return '<svg class="icon" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="' + (color || C.ink) +
      '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (ICON[name] || "") + "</svg>";
  }

  // Paint every [data-ui] element: an SVG sized to the element, behind its content.
  function paint(root) {
    (root || document).querySelectorAll("[data-ui]").forEach(function (el) {
      var kind = el.getAttribute("data-ui"), fn = P[kind];
      if (!fn) return;
      var w = Math.round(el.offsetWidth), h = Math.round(el.offsetHeight);
      var seed = Number(el.getAttribute("data-seed") || 0) || (w * 7 + h * 13 + kind.length);
      var o = {};
      Array.prototype.forEach.call(el.attributes, function (a) { if (a.name.indexOf("data-o-") === 0) o[a.name.slice(7)] = a.value === "true" ? true : a.value === "false" ? false : isNaN(a.value) ? a.value : Number(a.value); });
      var old = el.querySelector(":scope > .ui-bg");
      if (old) old.remove();
      var bg = document.createElement("div");
      bg.className = "ui-bg";
      bg.innerHTML = fn(w, h, rng(seed), o);
      el.insertBefore(bg, el.firstChild);
    });
    (root || document).querySelectorAll("[data-icon]").forEach(function (el) {
      el.innerHTML = icon(el.getAttribute("data-icon"), Number(el.getAttribute("data-size")) || 22, el.getAttribute("data-color"));
    });
  }

  window.UIKit = { paint: paint, pieces: P, icon: icon, colors: C, rng: rng };
})();
