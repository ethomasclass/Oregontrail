// Westward: two short skill breaks (about 30 to 40 seconds each), played by the
// student whose role the game calls. Keyboard, mouse, and touch all work.
//   raft  Steer a raft down the Columbia River rapids. Hits on rocks cost supplies.
//         With Chinookan pilots there are fewer rocks and a warning before each one.
//   pan   Swirl a gold pan to wash out gravel. Swirl too hard and the gold goes too.
//         Most pans hold only a few flecks: gold mining was a lottery.
//   fish  Drop a hook near a fish, set the hook when it bites, then reel it in
//         without snapping the line. Trout in the Sweetwater; big salmon in the Snake.
// W.minigames.run(kind, opts) returns a Promise of { score, hits, gold, fish, pounds }.
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

  // ------------------------------------------------------------ fishing
  // Move the hook (mouse, arrow keys, or buttons). When a fish bites, click or press
  // Space fast to set the hook. Then hold to reel; let go when the line gets too tight.
  var FISH = {
    trout: { name: "trout", pounds: [0.6, 2.5], strength: 0.55, color: "#6f7f4a", belly: "#d9c59a", spots: "#2b2a22", len: 46, bite: 0.75, count: 6 },
    salmon: { name: "salmon", pounds: [8, 22], strength: 1.0, color: "#7e8f9a", belly: "#e3b3a0", spots: "#3a4a55", len: 74, bite: 0.6, count: 4 }
  };
  function fish(opts) {
    return new Promise(function (resolve) {
      var F = FISH[opts.fish] || FISH.trout;
      var el = overlay(F === FISH.salmon ? "Fishing for salmon" : "Fishing for trout",
        "Move the hook near a fish with the mouse or the arrow keys. When it bites, click or press Space fast to hook it. " +
        "Then hold the mouse button (or Space, or Reel) to pull it in. Let go when the line turns red, or it will snap.", opts.who);
      var cv = el.querySelector("canvas"), g = cv.getContext("2d"), inp = input(el, cv), timerEl = el.querySelector(".mg-timer");
      var startBtn = el.querySelector(".mg-start");
      var T = 40, t = 0, last = 0, running = false, raf;
      var hook = { x: 470, y: 260 }, fishes = [], caught = [], phase = "free", target = null, biteT = 0, nibble = 0;
      var tension = 0, reel = 0, reeling = false, msg = "", msgT = 0, up = false, down = false, splash = 0;
      var WATER = 150, ROD = { x: 120, y: 92 };
      function rnd(a, b) { return a + Math.random() * (b - a); }
      function spawnFish() {
        var dir = Math.random() < 0.5 ? 1 : -1;
        fishes.push({ x: dir > 0 ? -60 : 860, y: rnd(WATER + 40, 410), dir: dir, v: rnd(40, 80) * (F === FISH.salmon ? 1.3 : 1), lb: rnd(F.pounds[0], F.pounds[1]), wig: Math.random() * 6, interest: 0, spooked: 0 });
      }
      for (var i = 0; i < F.count; i++) { spawnFish(); fishes[i].x = rnd(60, 760); }
      function say(m, s2) { msg = m; msgT = s2 || 2; }
      function keys(e, isDown) {
        if (e.key === "ArrowUp" || e.key === "w") { up = isDown; e.preventDefault(); }
        if (e.key === "ArrowDown" || e.key === "s") { down = isDown; e.preventDefault(); }
        if (e.key === " " || e.key === "Spacebar") { e.preventDefault(); e.stopPropagation(); if (isDown && !e.repeat) action(true); if (!isDown) action(false); }
      }
      var kd = function (e) { keys(e, true); }, ku = function (e) { keys(e, false); };
      document.addEventListener("keydown", kd, true); document.addEventListener("keyup", ku, true);
      cv.addEventListener("pointerdown", function (e) { e.preventDefault(); action(true); });
      var pu = function () { action(false); };
      window.addEventListener("pointerup", pu);
      // after Start, the big button becomes the Reel button
      startBtn.addEventListener("pointerdown", function (e) { if (running) { e.preventDefault(); action(true); } });
      startBtn.addEventListener("pointerup", function () { if (running) action(false); });
      function action(press) {
        if (!running) return;
        if (!press) { reeling = false; return; }
        if (phase === "bite") { phase = "fight"; tension = 0.3; reel = 0.08; splash = 1; say("Hooked! Hold to reel it in.", 1.5); reeling = true; return; }
        if (phase === "fight") { reeling = true; return; }
        if (phase === "free") say("Wait for a bite...", 0.8);
      }
      function lose(text) { if (target) { target.spooked = 3; target.dir = -target.dir; } target = null; phase = "free"; reeling = false; tension = 0; reel = 0; say(text, 2); }
      function frame(now) {
        raf = requestAnimationFrame(frame);
        var real = (now - (last || now)) / 1000, dt = Math.min(0.05, real); last = now;
        if (running) t += real;
        // move the hook (not while a fish is on the line)
        if (running && phase !== "fight") {
          var tx = inp.pointerX != null ? inp.pointerX : hook.x, ty = inp.pointerY != null ? inp.pointerY : hook.y;
          if (inp.left) tx = hook.x - 300; if (inp.right) tx = hook.x + 300;
          if (up) ty = hook.y - 300; if (down) ty = hook.y + 300;
          hook.x += Math.max(-260 * dt, Math.min(260 * dt, tx - hook.x));
          hook.y += Math.max(-220 * dt, Math.min(220 * dt, ty - hook.y));
          hook.x = Math.max(200, Math.min(780, hook.x)); hook.y = Math.max(WATER + 20, Math.min(420, hook.y));
        }
        fishes.forEach(function (f) {
          f.wig += dt * 8;
          if (f === target && phase === "fight") return;
          var dx = hook.x - f.x, dy = hook.y - f.y, d = Math.hypot(dx, dy);
          if (f.spooked > 0) { f.spooked -= dt; f.x += f.dir * f.v * 2.2 * dt; return; }
          if (running && phase === "free" && d < 120 && Math.sign(dx) === f.dir) {
            // curious: swim to the bait
            f.x += Math.sign(dx) * Math.min(Math.abs(dx), f.v * 0.8 * dt); f.y += Math.sign(dy) * Math.min(Math.abs(dy), 40 * dt);
            if (d < 26) { phase = "nibble"; target = f; nibble = rnd(0.4, 1.3); }
          } else {
            f.x += f.dir * f.v * dt; f.y += Math.sin(f.wig * 0.2) * 8 * dt;
          }
        });
        fishes = fishes.filter(function (f) { return f === target || (f.x > -90 && f.x < 890); });
        while (fishes.length < F.count) spawnFish();
        if (phase === "nibble") {
          nibble -= dt;
          target.x = hook.x - target.dir * F.len * 0.5; target.y = hook.y;
          if (nibble <= 0) { phase = "bite"; biteT = F.bite; splash = 0.6; say("BITE! Click or press Space!", F.bite); }
        } else if (phase === "bite") {
          biteT -= dt;
          target.x = hook.x - target.dir * F.len * 0.5; target.y = hook.y + Math.sin(t * 40) * 3;
          if (biteT <= 0) lose("Too slow. The fish stole the bait.");
        } else if (phase === "fight") {
          // the fish pulls; reeling pulls back but tightens the line
          var pull = F.strength * (0.55 + 0.45 * Math.sin(t * 2.3 + target.wig));
          if (reeling) { reel += dt * (0.32 - pull * 0.12); tension += dt * (0.55 + pull * 0.5); }
          else { reel -= dt * pull * 0.08; tension -= dt * 0.8; }
          tension = Math.max(0, tension); reel = Math.max(0, reel);
          hook.x = 260 + (1 - reel) * 480 + Math.sin(t * 5) * 6; hook.y = WATER + 30 + (1 - reel) * 180;
          target.x = hook.x - target.dir * F.len * 0.5; target.y = hook.y;
          if (tension >= 1) lose("Snap! The line broke and the fish got away.");
          else if (reel >= 1) {
            caught.push(target.lb); splash = 1;
            say("Caught a " + target.lb.toFixed(1) + " pound " + F.name + "!", 2.2);
            fishes.splice(fishes.indexOf(target), 1); target = null; phase = "free"; reeling = false; tension = 0; reel = 0;
            hook.x = 470; hook.y = 260;
          }
        }
        msgT -= dt; splash = Math.max(0, splash - dt * 1.5);
        if (running) timerEl.textContent = Math.max(0, Math.ceil(T - t)) + "s";
        draw();
        if (running && t >= T) finish();
      }
      function drawFish(f) {
        g.save(); g.translate(f.x, f.y); g.scale(-f.dir, 1);
        var L = F.len, w = Math.sin(f.wig) * 0.25;
        g.fillStyle = F.color; g.beginPath(); g.ellipse(0, 0, L * 0.5, L * 0.17, 0, 0, 6.28); g.fill();
        g.fillStyle = F.belly; g.beginPath(); g.ellipse(0, L * 0.06, L * 0.42, L * 0.08, 0, 0, 3.14); g.fill();
        g.fillStyle = F.color; g.beginPath(); g.moveTo(L * 0.45, 0); g.lineTo(L * 0.72, -L * 0.17 + w * 8); g.lineTo(L * 0.72, L * 0.17 + w * 8); g.closePath(); g.fill();
        g.fillStyle = F.spots; for (var k = 0; k < 5; k++) { g.beginPath(); g.arc(-L * 0.2 + k * L * 0.12, -L * 0.05 + (k % 2) * 3, 1.4, 0, 6.28); g.fill(); }
        g.fillStyle = "#111"; g.beginPath(); g.arc(-L * 0.36, -L * 0.03, 2, 0, 6.28); g.fill();
        g.restore();
      }
      function draw() {
        // sky, far bank, near bank with the family member fishing
        g.fillStyle = "#dfe4dc"; g.fillRect(0, 0, 800, WATER);
        g.fillStyle = "#8a9a62"; g.beginPath(); g.moveTo(0, 70); for (var x = 0; x <= 800; x += 40) g.lineTo(x, 60 + 18 * Math.sin(x * 0.013)); g.lineTo(800, WATER); g.lineTo(0, WATER); g.fill();
        g.fillStyle = "#7a5d42"; g.beginPath(); g.moveTo(0, 104); g.lineTo(190, 112); g.lineTo(215, WATER + 6); g.lineTo(0, WATER + 30); g.fill();
        var wg = g.createLinearGradient(0, WATER, 0, 440); wg.addColorStop(0, "#6f97a6"); wg.addColorStop(1, "#2f4f5e");
        g.fillStyle = wg; g.fillRect(0, WATER, 800, 290);
        g.fillStyle = "#5b6b4a"; for (var r = 0; r < 9; r++) { g.beginPath(); g.ellipse(80 + r * 95, 440, 40, 16, 0, 3.14, 6.28); g.fill(); }
        g.strokeStyle = "rgba(255,255,255,0.35)"; g.lineWidth = 2;
        for (var k = 0; k < 10; k++) { var wx = (k * 97 + t * 30) % 820 - 10; g.beginPath(); g.moveTo(wx, WATER + 4 + (k % 3) * 2); g.lineTo(wx + 24, WATER + 4 + (k % 3) * 2); g.stroke(); }
        // the person and rod
        g.fillStyle = "#3a3530"; g.fillRect(84, 80, 12, 28); g.fillStyle = "#5a4636"; g.fillRect(80, 58, 20, 26); g.fillStyle = "#e3bb98"; g.beginPath(); g.arc(90, 50, 9, 0, 6.28); g.fill();
        g.fillStyle = "#3a3028"; g.fillRect(78, 38, 24, 4); g.fillRect(84, 30, 12, 10);
        var bend = phase === "fight" ? 18 + tension * 20 : 4;
        g.strokeStyle = "#6b5038"; g.lineWidth = 3; g.beginPath(); g.moveTo(98, 70); g.quadraticCurveTo(160, 40 + bend, 200 + bend, 50 + bend * 1.4); g.stroke();
        // the line: red when it is about to snap
        g.strokeStyle = tension > 0.75 ? "#c2402f" : "rgba(30,30,30,0.7)"; g.lineWidth = tension > 0.75 ? 2 : 1;
        g.beginPath(); g.moveTo(200 + bend, 50 + bend * 1.4); g.lineTo(hook.x, hook.y); g.stroke();
        // bobber at the surface
        var bx = 200 + bend + (hook.x - 200 - bend) * ((WATER - 50 - bend * 1.4) / Math.max(1, hook.y - 50 - bend * 1.4));
        var bob = phase === "nibble" ? Math.sin(t * 30) * 3 : phase === "bite" ? 6 : 0;
        g.fillStyle = "#c2402f"; g.beginPath(); g.arc(bx, WATER + bob, 6, 3.14, 6.28); g.fill(); g.fillStyle = "#f2ede3"; g.beginPath(); g.arc(bx, WATER + bob, 6, 0, 3.14); g.fill();
        fishes.forEach(drawFish);
        g.strokeStyle = "#cfcfcf"; g.lineWidth = 2; g.beginPath(); g.arc(hook.x, hook.y + 4, 5, 0, 3.4); g.stroke();
        if (splash > 0) { g.strokeStyle = "rgba(255,255,255," + splash + ")"; g.lineWidth = 2; g.beginPath(); g.ellipse(bx, WATER, 30 * (1.4 - splash), 6, 0, 0, 6.28); g.stroke(); }
        // the meters
        var lbs = caught.reduce(function (a, b) { return a + b; }, 0);
        g.fillStyle = "#22262e"; g.font = "bold 20px 'Alegreya SC', Georgia, serif"; g.fillText("Fish: " + caught.length + "   Pounds: " + Math.round(lbs), 240, 30);
        if (phase === "fight") {
          g.fillStyle = "#fbf9f4"; g.fillRect(560, 14, 220, 16); g.fillStyle = tension > 0.75 ? "#c2402f" : "#c9a54e"; g.fillRect(560, 14, 220 * Math.min(1, tension), 16);
          g.strokeStyle = "#22262e"; g.strokeRect(560, 14, 220, 16); g.fillStyle = "#22262e"; g.font = "13px 'Alegreya Sans', sans-serif"; g.fillText("Line strain", 560, 46);
          g.fillStyle = "#fbf9f4"; g.fillRect(560, 54, 220, 10); g.fillStyle = "#5f8f96"; g.fillRect(560, 54, 220 * Math.min(1, reel), 10); g.strokeRect(560, 54, 220, 10);
        }
        if (msgT > 0) { g.font = "bold 22px 'Alegreya Sans', sans-serif"; g.fillStyle = phase === "bite" ? "#c2402f" : "#fbf9f4"; g.strokeStyle = "rgba(0,0,0,0.6)"; g.lineWidth = 4; g.strokeText(msg, 240, 130); g.fillText(msg, 240, 130); }
      }
      function finish() {
        running = false; cancelAnimationFrame(raf); inp.off();
        document.removeEventListener("keydown", kd, true); document.removeEventListener("keyup", ku, true);
        window.removeEventListener("pointerup", pu);
        var lbs = Math.round(caught.reduce(function (a, b) { return a + b; }, 0));
        setTimeout(function () { el.remove(); resolve({ fish: caught.length, pounds: lbs, score: Math.min(1, caught.length / 4) }); }, 700);
      }
      begin(el, function () { running = true; startBtn.disabled = false; startBtn.textContent = "Reel (hold)"; say("Move the hook near a fish.", 2); });
      raf = requestAnimationFrame(frame);
    });
  }

  W.minigames = {
    run: function (kind, opts) {
      if (W.scene && W.scene.pause) W.scene.pause(true);
      var p = kind === "raft" ? raft(opts || {}) : kind === "fish" ? fish(opts || {}) : pan(opts || {});
      return p.then(function (r) { if (W.scene && W.scene.pause) W.scene.pause(false); return r; });
    }
  };
})();
