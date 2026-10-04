// Westward: the living scene behind every screen.
// Layers (sky, far, mid, near) move at different speeds while the wagon travels.
// Clouds drift, light breathes, dust rises from the wheels, and weather falls.
// Painted layers from assets/art/ replace the placeholder hills when they exist.
(function () {
  "use strict";
  var W = window.WESTWARD;
  var root = document.getElementById("scene");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var DEPTH = { sky: 0.05, far: 0.18, mid: 0.5, near: 1 };
  var current = null;      // { key, layers: {far, mid, near}, rig }
  var moving = false;
  var particles = [];
  var weather = null, water = false;
  var canvas, ctx, raf = 0, last = 0;

  // ------------------------------------------------------------ placeholder art
  // Simple painted-looking hills as SVG, so the game is playable before the
  // real paintings exist. Every shape is deterministic for its scene.
  function seeded(n) {
    return function () { n = (n * 16807) % 2147483647; return (n - 1) / 2147483646; };
  }
  function hash(s) { var h = 7; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 2147483647; return h || 1; }

  function ridge(r, base, amp, waves, rough) {
    var pts = [];
    var phase = [r() * 6, r() * 6, r() * 6];
    for (var x = 0; x <= 2400; x += 24) {
      var y = base;
      for (var k = 0; k < waves.length; k++) y -= amp * waves[k] * Math.sin(x / (180 + k * 170) + phase[k]);
      y += (r() - 0.5) * rough;
      pts.push(x + "," + y.toFixed(1));
    }
    return "M0,1000 L" + pts.join(" L") + " L2400,1000 Z";
  }

  function svgLayer(body) {
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2400 1000" preserveAspectRatio="xMidYMax slice">' +
      '<defs><filter id="p"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.04" numOctaves="3" seed="4"/>' +
      '<feDisplacementMap in="SourceGraphic" scale="14"/></filter>' +
      '<filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.10 0"/>' +
      '<feComposite in2="SourceGraphic" operator="in"/></filter></defs>' +
      '<g filter="url(#p)">' + body + "</g></svg>");
  }

  function placeholder(key) {
    var art = W.art.scenes[key] || W.art.scenes.prairie;
    var c = art.palette, r = seeded(hash(key));
    var far = "", mid = "", near = "";

    // far: distant ridges or peaks
    var peaks = key === "mountains" || key === "valley";
    var flat = key === "sea";
    far += '<path d="' + ridge(r, peaks ? 520 : flat ? 600 : 600, peaks ? 150 : flat ? 4 : 40, [1, 0.6, 0.3], peaks ? 50 : flat ? 2 : 10) + '" fill="' + c[1] + '" opacity="0.75"/>';
    if (peaks) {
      // snowcaps
      far += '<path d="' + ridge(r, 470, 160, [1, 0.6, 0.3], 60) + '" fill="#f4f1ea" opacity="0.55" clip-path="inset(0 0 55% 0)"/>';
    }
    if (key === "valley") far += '<path d="M1500,560 L1640,330 L1780,560 Z" fill="#eef0f2" opacity="0.8"/>';

    // mid: rolling land and landmarks
    mid += '<path d="' + ridge(r, flat ? 660 : 690, flat ? 8 : 45, [1, 0.5], flat ? 4 : 14) + '" fill="' + c[2] + '"/>';
    if (key === "chimneyrock") mid += '<path d="M1180,700 C1190,560 1230,520 1236,330 L1252,330 C1262,520 1300,560 1320,700 Z" fill="' + c[1] + '"/>' +
      '<ellipse cx="1250" cy="700" rx="230" ry="70" fill="' + c[2] + '"/>';
    if (key === "independencerock") mid += '<ellipse cx="1250" cy="700" rx="420" ry="150" fill="' + c[1] + '"/>';
    if (key === "fort") mid += '<rect x="1050" y="560" width="420" height="140" fill="' + c[3] + '"/>' +
      '<rect x="1020" y="530" width="70" height="170" fill="' + c[3] + '"/><rect x="1430" y="530" width="70" height="170" fill="' + c[3] + '"/>';
    if (key === "town") for (var i = 0; i < 7; i++) {
      var x = 700 + i * 160 + r() * 40, h = 90 + r() * 90;
      mid += '<rect x="' + x + '" y="' + (690 - h) + '" width="120" height="' + h + '" fill="' + c[3] + '"/>' +
        '<path d="M' + (x - 10) + "," + (690 - h) + " L" + (x + 60) + "," + (640 - h) + " L" + (x + 130) + "," + (690 - h) + 'Z" fill="' + c[3] + '"/>';
    }
    if (key === "goldfields" || key === "camp") for (var t = 0; t < 9; t++) {
      var tx = 400 + t * 200 + r() * 80;
      mid += '<path d="M' + tx + ",700 L" + (tx + 55) + ",610 L" + (tx + 110) + ',700 Z" fill="#e8e0cc" stroke="' + c[3] + '" stroke-width="4"/>';
    }
    if (key === "rancho") mid += '<rect x="1000" y="600" width="380" height="100" fill="#d9b48c"/><path d="M980,600 L1190,550 L1400,600 Z" fill="#a0573e"/>';
    if (key === "harbor") for (var m = 0; m < 12; m++) {
      var mx = 300 + m * 160 + r() * 60;
      mid += '<rect x="' + mx + '" y="' + (420 + r() * 80) + '" width="8" height="300" fill="' + c[3] + '"/>';
    }

    // near: foreground ground, grass, water
    if (art.water) near += '<rect x="0" y="760" width="2400" height="240" fill="' + c[1] + '" opacity="0.9"/>' +
      '<path d="' + ridge(r, 900, 18, [1, 0.4], 8) + '" fill="' + c[3] + '"/>';
    else near += '<path d="' + ridge(r, 820, 30, [1, 0.6], 10) + '" fill="' + c[3] + '"/>';
    if (key !== "sea" && key !== "desert") for (var g = 0; g < 160; g++) {
      var gx = r() * 2400, gy = 860 + r() * 140, gh = 14 + r() * 36;
      near += '<path d="M' + gx.toFixed(0) + "," + gy.toFixed(0) + " q" + (r() * 10 - 5).toFixed(0) + "," + (-gh / 2).toFixed(0) + " " + (r() * 16 - 8).toFixed(0) + "," + (-gh).toFixed(0) +
        '" stroke="' + c[2] + '" stroke-width="4" fill="none" opacity="0.7"/>';
    }
    if (key === "sea") near = '<path d="' + ridge(r, 760, 14, [1, 0.5, 0.3], 6) + '" fill="' + c[2] + '"/><path d="' + ridge(r, 860, 20, [1, 0.5], 6) + '" fill="' + c[3] + '"/>';

    return { far: svgLayer(far), mid: svgLayer(mid), near: svgLayer(near), sky: c[0] };
  }

  var cloudTile = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 500" preserveAspectRatio="none">' +
    '<defs><filter id="b"><feGaussianBlur stdDeviation="18"/></filter></defs><g filter="url(#b)" fill="#fffaf0" opacity="0.8">' +
    '<ellipse cx="180" cy="140" rx="170" ry="40"/><ellipse cx="260" cy="120" rx="110" ry="42"/>' +
    '<ellipse cx="700" cy="90" rx="220" ry="36"/><ellipse cx="820" cy="70" rx="120" ry="40"/>' +
    '<ellipse cx="1040" cy="200" rx="160" ry="30"/></g></svg>');

  // ------------------------------------------------------------ the rig
  function wagonSVG() {
    function ox(x) {
      return '<g class="ox" transform="translate(' + x + ',0)">' +
        '<rect class="leg-a" x="8" y="78" width="9" height="34" rx="3" fill="#4a3424"/>' +
        '<rect class="leg-b" x="22" y="78" width="9" height="34" rx="3" fill="#3d2b1e"/>' +
        '<rect class="leg-b" x="66" y="78" width="9" height="34" rx="3" fill="#4a3424"/>' +
        '<rect class="leg-a" x="80" y="78" width="9" height="34" rx="3" fill="#3d2b1e"/>' +
        '<ellipse cx="50" cy="66" rx="50" ry="24" fill="#7b5638"/>' +
        '<ellipse cx="-4" cy="58" rx="16" ry="13" fill="#6a4a30"/>' +
        '<path d="M-8,46 q-10,-10 -16,-4 M2,46 q8,-12 14,-6" stroke="#e8dcc0" stroke-width="4" fill="none"/></g>';
    }
    function wheel(cx, cy, r) {
      var spokes = "";
      for (var i = 0; i < 12; i++) {
        var a = i * Math.PI / 6;
        spokes += '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + r * Math.cos(a)).toFixed(1) + '" y2="' + (cy + r * Math.sin(a)).toFixed(1) + '"/>';
      }
      return '<g class="wheel" stroke="#2c2018" stroke-width="4" fill="none"><circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" stroke-width="7"/>' + spokes +
        '<circle cx="' + cx + '" cy="' + cy + '" r="6" fill="#2c2018"/></g>';
    }
    return '<svg viewBox="-40 0 520 160" role="img" aria-label="A covered wagon pulled by oxen">' +
      '<ellipse cx="230" cy="152" rx="250" ry="8" fill="rgba(0,0,0,0.18)"/>' +
      ox(0) + ox(110) +
      '<line x1="10" y1="62" x2="250" y2="88" stroke="#3a2a1c" stroke-width="5"/>' +
      '<g class="body">' +
      '<path d="M250,30 C250,-8 450,-8 450,30 L462,96 L238,96 Z" fill="#f3ead6" stroke="#22262e" stroke-width="3"/>' +
      '<path d="M300,6 L296,96 M350,0 L350,96 M400,6 L404,96" stroke="#d8ccb0" stroke-width="3"/>' +
      '<rect x="232" y="90" width="236" height="26" fill="#7a5132" stroke="#22262e" stroke-width="3"/></g>' +
      wheel(268, 122, 26) + wheel(426, 116, 34) + "</svg>";
  }
  function shipSVG() {
    return '<svg viewBox="0 0 520 300" role="img" aria-label="A sailing ship"><g class="body">' +
      '<path d="M20,210 L500,210 L450,270 L80,270 Z" fill="#5a3b26" stroke="#22262e" stroke-width="3"/>' +
      '<rect x="160" y="20" width="8" height="190" fill="#3a2a1c"/><rect x="330" y="10" width="8" height="200" fill="#3a2a1c"/>' +
      '<path d="M100,40 Q164,60 228,40 L220,180 Q164,190 108,180 Z" fill="#f3ead6" stroke="#22262e" stroke-width="2"/>' +
      '<path d="M270,30 Q334,50 398,30 L390,180 Q334,190 278,180 Z" fill="#f3ead6" stroke="#22262e" stroke-width="2"/>' +
      "</g></svg>";
  }

  // ------------------------------------------------------------ build a scene
  function paintedPath(key, layer) { return "assets/art/" + key + "/" + layer + ".webp"; }

  function layerSrc(key) {
    var art = W.art.scenes[key] || W.art.scenes.prairie;
    if (art.painted) return {
      sky: art.palette[0], painted: true,
      skyImg: paintedPath(key, "sky"), far: paintedPath(key, "far"), mid: paintedPath(key, "mid"), near: paintedPath(key, "near")
    };
    return placeholder(key);
  }

  // Load a scene's paintings ahead of time so travel never shows a blank layer.
  var preloaded = {};
  function preload(key) {
    var art = W.art.scenes[key];
    if (!art || !art.painted || preloaded[key]) return;
    preloaded[key] = ["sky", "far", "mid", "near"].map(function (l) {
      var img = new Image(); img.src = paintedPath(key, l); return img;
    });
  }

  function sizeLayer(img) {
    var w = Math.max(window.innerWidth * 1.35, window.innerHeight * 2.4);
    img.style.width = w + "px";
    img.style.objectFit = "cover";
    img.style.objectPosition = "center bottom";
    return w;
  }

  function spare() {
    return Math.max(window.innerWidth * 1.35, window.innerHeight * 2.4) - window.innerWidth;
  }

  function place(layers, t) {
    // t = 1 at the start of a trip (scenery far to the right), 0 at rest.
    var s = spare();
    Object.keys(layers).forEach(function (k) {
      var d = DEPTH[k];
      var x = -s * 0.5 - s * 0.5 * d * t;
      layers[k].style.transform = "translate3d(" + x.toFixed(1) + "px,0,0)";
    });
  }

  function set(key, opts) {
    opts = opts || {};
    var art = W.art.scenes[key] || W.art.scenes.prairie;
    if (current && current.key === key && current.vehicle === opts.vehicle && !opts.force) {
      setWeather(opts.weather, art.water);
      tint(opts.month, art.honest);
      return;
    }
    var src = layerSrc(key);
    root.innerHTML = "";
    root.style.background = "linear-gradient(to bottom, " + src.sky + ", #fff6e0 70%)";

    var layers = {};
    if (src.skyImg) {
      var sk = new Image(); sk.src = src.skyImg; sk.className = "layer sky"; sk.alt = "";
      sizeLayer(sk); root.appendChild(sk); layers.sky = sk;
    }
    var glow = document.createElement("div");
    glow.className = "glow";
    glow.style.left = "62%"; glow.style.top = "-18vmax";
    root.appendChild(glow);
    var clouds = document.createElement("div");
    clouds.className = "clouds";
    clouds.style.backgroundImage = "url(\"" + cloudTile + "\")";
    if (src.painted) { clouds.style.opacity = "0.35"; glow.style.opacity = "0.6"; }
    root.appendChild(clouds);

    ["far", "mid", "near"].forEach(function (k) {
      var img = new Image();
      img.alt = "";
      img.className = "layer " + k;
      img.src = src[k];
      sizeLayer(img);
      root.appendChild(img);
      layers[k] = img;
    });

    var rig = document.createElement("div");
    rig.className = "rig" + (opts.vehicle === "ship" ? " ship" : "");
    rig.innerHTML = opts.vehicle === "ship" ? shipSVG() : wagonSVG();
    if (opts.vehicle === "none") rig.style.display = "none";
    root.appendChild(rig);

    var t = document.createElement("div");
    t.className = "tint";
    root.appendChild(t);

    canvas = document.createElement("canvas");
    root.appendChild(canvas);
    ctx = canvas.getContext("2d");
    resize();

    current = { key: key, layers: layers, rig: rig, tint: t, vehicle: opts.vehicle };
    place(layers, 0);
    setWeather(opts.weather, art.water);
    tint(opts.month, art.honest);
    start();
  }

  function tint(month, honest) {
    if (!current) return;
    var colors = { 6: "#fff4dc", 7: "#ffeccc", 8: "#fbe2c0", 9: "#f3d6b8", 10: "#e4dcd8", 11: "#d8dde6", 0: "#d8dde6", 1: "#dfe2e8" };
    current.tint.style.background = colors[month] || "transparent";
    root.style.filter = honest ? "saturate(0.7) contrast(1.05)" : "";
  }

  function setWeather(kind, isWater) {
    weather = kind || null;
    water = !!isWater;
    particles = particles.filter(function (p) { return p.kind === "dust"; });
  }

  function dim(level) {
    root.classList.toggle("dim", level === "strong");
    root.classList.toggle("dim-soft", level === "soft");
  }

  // ------------------------------------------------------------ travel
  function travel(ms) {
    return new Promise(function (resolve) {
      if (!current) return resolve();
      if (reduce) { place(current.layers, 0); return resolve(); }
      moving = true;
      current.rig.classList.add("moving");
      var t0 = performance.now();
      (function frame(now) {
        var k = Math.min(1, (now - t0) / ms);
        // ease out: the wagon slows as it arrives
        var t = 1 - (1 - Math.pow(1 - k, 2.2));
        place(current.layers, t);
        if (k < 1) requestAnimationFrame(frame);
        else {
          moving = false;
          current.rig.classList.remove("moving");
          resolve();
        }
      })(t0);
      place(current.layers, 1);
    });
  }

  // ------------------------------------------------------------ particles
  function resize() {
    if (!canvas) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawn() {
    var w = window.innerWidth, h = window.innerHeight;
    if (moving && current && current.vehicle !== "ship" && particles.length < 160) {
      var r = current.rig.getBoundingClientRect();
      for (var i = 0; i < 3; i++) particles.push({
        kind: "dust", x: r.left + r.width * (0.55 + Math.random() * 0.4), y: r.bottom - 6,
        vx: 0.6 + Math.random() * 1.4, vy: -0.2 - Math.random() * 0.5, life: 1, size: 6 + Math.random() * 14
      });
    }
    if (!reduce && particles.length < 40 && Math.random() < 0.05) particles.push({
      kind: "mote", x: Math.random() * w, y: h * (0.4 + Math.random() * 0.5), vx: 0.15, vy: -0.05, life: 1, size: 1.5 + Math.random() * 2
    });
    if (weather === "rain") for (var a = 0; a < 4; a++) particles.push({ kind: "rain", x: Math.random() * w * 1.2, y: -20, vx: -3, vy: 16 + Math.random() * 6, life: 1 });
    if (weather === "snow" && Math.random() < 0.7) particles.push({ kind: "snow", x: Math.random() * w * 1.2, y: -10, vx: -0.6, vy: 1 + Math.random() * 1.2, life: 1, size: 2 + Math.random() * 3, ph: Math.random() * 6 });
    if (water && Math.random() < 0.3) particles.push({ kind: "glint", x: Math.random() * w, y: h * (0.8 + Math.random() * 0.17), life: 1, size: 10 + Math.random() * 30 });
  }

  function tick(now) {
    raf = requestAnimationFrame(tick);
    if (document.hidden || !ctx) return;
    var dt = Math.min(3, (now - last) / 16.7 || 1);
    last = now;
    spawn();
    var w = window.innerWidth, h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);
    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      if (p.kind === "dust") {
        p.x += p.vx * dt; p.y += p.vy * dt; p.size += 0.25 * dt; p.life -= 0.012 * dt;
        ctx.fillStyle = "rgba(196,170,128," + (0.32 * p.life).toFixed(3) + ")";
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 6.283); ctx.fill();
      } else if (p.kind === "mote") {
        p.x += p.vx * dt; p.y += p.vy * dt + Math.sin(now / 900 + p.x) * 0.1; p.life -= 0.002 * dt;
        ctx.fillStyle = "rgba(255,245,215," + (0.7 * Math.sin(p.life * 3.14)).toFixed(3) + ")";
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 6.283); ctx.fill();
      } else if (p.kind === "rain") {
        p.x += p.vx * dt; p.y += p.vy * dt;
        ctx.strokeStyle = "rgba(210,220,235,0.45)"; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + p.vx * 1.6, p.y + p.vy * 1.6); ctx.stroke();
        if (p.y > h) p.life = 0;
      } else if (p.kind === "snow") {
        p.x += (p.vx + Math.sin(now / 700 + p.ph) * 0.5) * dt; p.y += p.vy * dt;
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 6.283); ctx.fill();
        if (p.y > h) p.life = 0;
      } else if (p.kind === "glint") {
        p.life -= 0.02 * dt;
        ctx.strokeStyle = "rgba(255,250,230," + (0.6 * Math.sin(p.life * 3.14)).toFixed(3) + ")"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + p.size, p.y); ctx.stroke();
      }
      if (p.life <= 0 || p.x < -60 || p.x > w + 60 || p.y < -60) particles.splice(i, 1);
    }
    if (weather === "heat") {
      ctx.fillStyle = "rgba(255,230,180," + (0.08 + 0.04 * Math.sin(now / 600)).toFixed(3) + ")";
      ctx.fillRect(0, 0, w, h);
    }
  }

  function start() { if (!raf) raf = requestAnimationFrame(tick); }

  window.addEventListener("resize", function () {
    if (!current) return;
    Object.keys(current.layers).forEach(function (k) { sizeLayer(current.layers[k]); });
    place(current.layers, 0);
    resize();
  });

  W.scene = { set: set, travel: travel, dim: dim, preload: preload };
})();
