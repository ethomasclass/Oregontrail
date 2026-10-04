// Westward: two short skill breaks (about 30 to 40 seconds each), played by the
// student whose role the game calls. Keyboard, mouse, and touch all work.
//   raft  Steer a raft down the Columbia River rapids. Hits on rocks cost supplies.
//         With Chinookan pilots there are fewer rocks and a warning before each one.
//   pan   Swirl a gold pan to wash out gravel. Swirl too hard and the gold goes too.
//         Most pans hold only a few flecks: gold mining was a lottery.
// W.minigames.run(kind, opts) returns a Promise of { score, hits, gold }.
(function () {
  "use strict";
  var W = window.WESTWARD;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function overlay(title, how, who) {
    var el = document.createElement("div");
    el.className = "minigame";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-label", title);
    el.innerHTML =
      '<div class="mg-card"><div class="mg-head"><div><div class="eyebrow">Pass the laptop to: ' + who + "</div><h2>" + title + "</h2></div>" +
      '<div class="mg-timer" aria-live="off"></div></div>' +
      '<canvas width="800" height="440" aria-hidden="true"></canvas>' +
      '<p class="mg-how">' + how + "</p>" +
      '<div class="mg-controls"><button class="mg-left" aria-label="Left">◀</button>' +
      '<button class="primary mg-start">Start</button>' +
      '<button class="mg-right" aria-label="Right">▶</button></div></div>';
    document.body.appendChild(el);
    return el;
  }

  // Shared input: arrow keys, on-screen buttons, and pointer position.
  function input(el, canvas) {
    var st = { left: false, right: false, pointerX: null, presses: [] };
    function key(e, down) {
      if (e.key === "ArrowLeft" || e.key === "a") { st.left = down; if (down) st.presses.push("L"); e.preventDefault(); }
      if (e.key === "ArrowRight" || e.key === "d") { st.right = down; if (down) st.presses.push("R"); e.preventDefault(); }
    }
    var kd = function (e) { key(e, true); }, ku = function (e) { key(e, false); };
    document.addEventListener("keydown", kd, true);
    document.addEventListener("keyup", ku, true);
    function hold(btn, prop, tag) {
      btn.addEventListener("pointerdown", function (e) { st[prop] = true; st.presses.push(tag); e.preventDefault(); });
      ["pointerup", "pointerleave", "pointercancel"].forEach(function (t) { btn.addEventListener(t, function () { st[prop] = false; }); });
    }
    hold(el.querySelector(".mg-left"), "left", "L");
    hold(el.querySelector(".mg-right"), "right", "R");
    canvas.addEventListener("pointermove", function (e) {
      var r = canvas.getBoundingClientRect();
      st.pointerX = (e.clientX - r.left) / r.width * canvas.width;
      st.pointerY = (e.clientY - r.top) / r.height * canvas.height;
      st.moved = (st.moved || 0) + Math.abs(e.movementX || 0) + Math.abs(e.movementY || 0);
    });
    st.off = function () { document.removeEventListener("keydown", kd, true); document.removeEventListener("keyup", ku, true); };
    return st;
  }

  function begin(el, onStart) {
    var b = el.querySelector(".mg-start");
    b.focus();
    function go() { b.disabled = true; b.textContent = "Go!"; onStart(); }
    b.addEventListener("click", go);
  }

  // ------------------------------------------------------------ the Columbia raft
  function raft(opts) {
    return new Promise(function (resolve) {
      var el = overlay("Rafting the Columbia River", (opts.pilot ? "Your Chinookan guides (Native people who know this river) shout a warning before each rock. " : "") +
        "Steer the raft with the arrow keys, the buttons, or the mouse. Stay away from the rocks.", opts.who);
      var cv = el.querySelector("canvas"), g = cv.getContext("2d"), inp = input(el, cv), timerEl = el.querySelector(".mg-timer");
      var T = 32, t = 0, x = 400, hits = 0, rocks = [], spawn = 0, last = 0, flash = 0, running = false, raf;
      var gap = opts.pilot ? 0.95 : 0.6;
      function draw() {
        g.fillStyle = "#6f97a6"; g.fillRect(0, 0, 800, 440);
        // banks scroll by
        g.fillStyle = "#7d8f5a";
        for (var i = -1; i < 9; i++) {
          var y = ((t * 160) % 60) + i * 60;
          g.fillRect(0, y, 90 + 20 * Math.sin(i + Math.floor(t * 160 / 60)), 60);
          g.fillRect(710 - 20 * Math.cos(i + Math.floor(t * 160 / 60)), y, 120, 60);
        }
        g.strokeStyle = "rgba(255,255,255,0.35)"; g.lineWidth = 2;
        for (var k = 0; k < 14; k++) { var wy = ((t * 220 + k * 37) % 460) - 20, wx = 120 + (k * 97) % 560; g.beginPath(); g.moveTo(wx, wy); g.lineTo(wx + 26, wy); g.stroke(); }
        rocks.forEach(function (r) {
          if (opts.pilot && r.y < 120 && r.y > -40) { g.fillStyle = "rgba(201,165,78,0.5)"; g.beginPath(); g.arc(r.x, 40, r.r + 8, 0, 6.28); g.fill(); }
          g.fillStyle = "#5a5f6b"; g.beginPath();
          for (var a = 0; a < 6; a++) { var ang = a / 6 * 6.28; g.lineTo(r.x + Math.cos(ang) * r.r * (0.8 + 0.2 * ((a * 7) % 3)), r.y + Math.sin(ang) * r.r * 0.8); }
          g.closePath(); g.fill(); g.strokeStyle = "#22262e"; g.stroke();
          g.strokeStyle = "rgba(255,255,255,0.6)"; g.beginPath(); g.arc(r.x, r.y - r.r * 0.4, r.r * 1.1, 0.2, 2.9); g.stroke();
        });
        // the raft and wagon
        g.save(); g.translate(x, 360); if (flash > 0) g.rotate(Math.sin(flash * 40) * 0.2);
        g.fillStyle = "#7a5a3c"; g.fillRect(-30, -22, 60, 50); g.strokeStyle = "#22262e"; g.lineWidth = 2; g.strokeRect(-30, -22, 60, 50);
        g.fillStyle = "#efe6d2"; g.beginPath(); g.ellipse(0, 0, 18, 26, 0, 0, 6.28); g.fill(); g.stroke();
        g.restore();
        if (flash > 0) { g.fillStyle = "rgba(194,113,90," + (flash * 0.6) + ")"; g.fillRect(0, 0, 800, 440); }
        g.fillStyle = "#22262e"; g.font = "bold 20px Unbounded, sans-serif"; g.fillText("Rocks hit: " + hits, 16, 30);
      }
      function frame(now) {
        raf = requestAnimationFrame(frame);
        var real = (now - (last || now)) / 1000, dt = Math.min(0.05, real); last = now;
        if (!running) { draw(); return; }
        t += real;
        var target = inp.pointerX != null ? inp.pointerX : x;
        if (inp.left) target = x - 400 * dt * 4; if (inp.right) target = x + 400 * dt * 4;
        x += Math.max(-420 * dt, Math.min(420 * dt, target - x));
        x = Math.max(120, Math.min(680, x));
        spawn -= dt;
        if (spawn <= 0 && t < T - 2) { spawn = gap + Math.random() * gap; rocks.push({ x: 130 + Math.random() * 540, y: -30, r: 18 + Math.random() * 16, hit: false }); }
        rocks.forEach(function (r) {
          r.y += dt * 210;
          if (!r.hit && Math.abs(r.y - 360) < r.r + 20 && Math.abs(r.x - x) < r.r + 26) { r.hit = true; hits++; flash = 1; }
        });
        rocks = rocks.filter(function (r) { return r.y < 480; });
        flash = Math.max(0, flash - dt * 2);
        timerEl.textContent = Math.max(0, Math.ceil(T - t)) + "s";
        draw();
        if (t >= T) finish();
      }
      function finish() {
        running = false; cancelAnimationFrame(raf); inp.off();
        setTimeout(function () { el.remove(); resolve({ hits: hits, score: Math.max(0, 1 - hits / 4) }); }, 600);
      }
      begin(el, function () { running = true; });
      raf = requestAnimationFrame(frame);
      if (reduce) T = 24;
    });
  }

  // ------------------------------------------------------------ the gold pan
  function pan(opts) {
    return new Promise(function (resolve) {
      var el = overlay("Panning for gold", "Swirl the pan to wash out the gravel. Move the mouse in circles over the pan, or tap Left and Right again and again. Gold is heavy, so it stays in the pan. Swirl too hard and the gold spills out too.", opts.who);
      var cv = el.querySelector("canvas"), g = cv.getContext("2d"), inp = input(el, cv), timerEl = el.querySelector(".mg-timer");
      var T = 30, t = 0, last = 0, running = false, raf, pans = 0, total = 0, grains = [], swirl = 0, lastPress = null, lastMoved = 0, msg = "";
      function newPan() {
        grains = [];
        for (var i = 0; i < 70; i++) grains.push({ a: Math.random() * 6.28, r: Math.random() * 130, gold: false, out: false });
        // most pans hold a few flecks; now and then, many
        var flecks = Math.random() < 0.08 ? 12 + Math.floor(Math.random() * 10) : Math.floor(Math.random() * 4);
        for (var j = 0; j < flecks; j++) grains.push({ a: Math.random() * 6.28, r: Math.random() * 60, gold: true, out: false });
      }
      function draw() {
        g.fillStyle = "#8c9a94"; g.fillRect(0, 0, 800, 440);
        g.fillStyle = "#3f3a36"; g.beginPath(); g.ellipse(400, 230, 175, 165, 0, 0, 6.28); g.fill();
        g.fillStyle = "#6b6158"; g.beginPath(); g.ellipse(400, 230, 160, 150, 0, 0, 6.28); g.fill();
        g.fillStyle = "rgba(143,176,190,0.55)"; g.beginPath(); g.ellipse(400, 230, 150, 140, 0, 0, 6.28); g.fill();
        grains.forEach(function (p) {
          if (p.out) return;
          g.fillStyle = p.gold ? "#f2c94c" : "#5c544c";
          var px = 400 + Math.cos(p.a) * p.r, py = 230 + Math.sin(p.a) * p.r * 0.93;
          g.beginPath(); g.arc(px, py, p.gold ? 3 : 5, 0, 6.28); g.fill();
        });
        g.fillStyle = "#22262e"; g.font = "bold 20px Unbounded, sans-serif";
        g.fillText("Pans: " + pans + "   Gold: $" + total, 16, 30);
        g.font = "16px 'Bricolage Grotesque', sans-serif"; g.fillText(msg, 16, 420);
        // swirl meter
        g.fillStyle = "#fbf9f4"; g.fillRect(640, 20, 140, 16);
        g.fillStyle = swirl > 0.8 ? "#c2715a" : "#5f8f96"; g.fillRect(640, 20, 140 * Math.min(1, swirl), 16);
        g.strokeStyle = "#22262e"; g.strokeRect(640, 20, 140, 16);
      }
      function frame(now) {
        raf = requestAnimationFrame(frame);
        var real = (now - (last || now)) / 1000, dt = Math.min(0.05, real); last = now;
        if (!running) { draw(); return; }
        t += real;
        // swirl energy from alternating key presses or mouse movement
        var add = 0;
        while (inp.presses.length) { var pr = inp.presses.shift(); if (pr !== lastPress) add += 0.16; lastPress = pr; }
        var mv = (inp.moved || 0) - lastMoved; lastMoved = inp.moved || 0;
        add += Math.min(0.2, mv / 900);
        swirl = Math.max(0, Math.min(1.2, swirl * Math.pow(0.35, dt) + add));
        grains.forEach(function (p) {
          if (p.out) return;
          p.a += swirl * dt * 6;
          var heavy = p.gold ? 0.15 : 1;
          p.r += swirl * dt * 70 * heavy - (p.gold ? dt * 18 : 0);
          if (swirl > 0.85 && p.gold) p.r += dt * 60 * (swirl - 0.85) * 8; // too hard: gold slops out
          p.r = Math.max(0, p.r);
          if (p.r > 150) p.out = true;
        });
        var gravel = grains.filter(function (p) { return !p.gold && !p.out; }).length;
        if (gravel === 0) {
          var flecks = grains.filter(function (p) { return p.gold && !p.out; }).length;
          total += flecks * 2; pans++;
          msg = flecks ? "Pan " + pans + ": " + flecks + " tiny flecks of gold ($" + flecks * 2 + ")." : "Pan " + pans + ": only sand, no gold.";
          newPan();
        }
        timerEl.textContent = Math.max(0, Math.ceil(T - t)) + "s";
        draw();
        if (t >= T) finish();
      }
      function finish() {
        running = false; cancelAnimationFrame(raf); inp.off();
        setTimeout(function () { el.remove(); resolve({ gold: total, pans: pans, score: Math.min(1, total / 40) }); }, 600);
      }
      newPan();
      begin(el, function () { running = true; });
      raf = requestAnimationFrame(frame);
    });
  }

  W.minigames = {
    run: function (kind, opts) {
      if (W.scene && W.scene.pause) W.scene.pause(true);
      var p = kind === "raft" ? raft(opts || {}) : pan(opts || {});
      return p.then(function (r) { if (W.scene && W.scene.pause) W.scene.pause(false); return r; });
    }
  };
})();
