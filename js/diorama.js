// Westward: the low-poly diorama behind every screen (Three.js, flat shaded,
// isometric camera), in the same visual family as the Lowell mill game.
//
// Each place is a slab of land built from data/scenes.js. The wagon, the ox
// team, and the family walking beside it stay in the middle; when the group
// travels, the next place's slab slides in under them. Clouds drift and cast
// shadows, dust rises from the wheels, smoke curls from chimneys and fires,
// water moves, and rain or snow falls where the place calls for it.
//
// Same interface as js/scene.js (the 2D fallback, used if WebGL is missing):
//   set(key, opts), travelTo(key, opts, ms), travel(ms), dim(level), preload(key)
// opts: { vehicle: "wagon" | "ship" | "walkers" | "none", party: members,
//         family: id, weather, month, showcase (slow turntable for the title) }
(function () {
  "use strict";
  var W = window.WESTWARD, T = window.THREE;
  var root = document.getElementById("scene");
  if (!T || !root) return;

  var renderer;
  try {
    renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
  } catch (e) {
    return; // no WebGL: keep the 2D painted-hills scene from scene.js
  }
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.className = "diorama";
  renderer.domElement.setAttribute("aria-hidden", "true");

  var SLAB_L = 110, SLAB_D = 60, SLAB_T = 3.2;
  var scene = new T.Scene();
  var camera = new T.OrthographicCamera(-1, 1, 1, -1, 1, 600);
  var hemi = new T.HemisphereLight(0xffffff, 0xcfc6b2, 0.8);
  var sun = new T.DirectionalLight(0xfff2dc, 0.9);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -60, right: 60, top: 60, bottom: -60, near: 1, far: 260 });
  sun.shadow.bias = -0.0008;
  sun.shadow.normalBias = 0.04;
  scene.add(hemi, sun, sun.target);

  var world = new T.Group();      // slabs (they slide during travel)
  var rigG = new T.Group();       // wagon, oxen, walkers, or ship
  rigG.scale.setScalar(1.45);
  var fxG = new T.Group();        // dust and smoke
  var skyG = new T.Group();       // clouds
  scene.add(world, rigG, fxG, skyG);

  // ------------------------------------------------------------------ helpers
  var mats = {};
  function mat(c, o) {
    var key = c + (o ? JSON.stringify(o) : "");
    if (!mats[key]) mats[key] = new T.MeshPhongMaterial(Object.assign({ color: new T.Color(c), flatShading: true, shininess: 0, specular: 0x000000 }, o || {}));
    return mats[key];
  }
  function mesh(geo, c, o) {
    var m = new T.Mesh(geo, typeof c === "string" ? mat(c, o) : c);
    m.castShadow = true; m.receiveShadow = true;
    return m;
  }
  function at(m, x, y, z) { m.position.set(x, y, z); return m; }
  function box(w, h, d, c) { return mesh(new T.BoxGeometry(w, h, d), c); }
  function cyl(rt, rb, h, seg, c) { return mesh(new T.CylinderGeometry(rt, rb, h, seg), c); }
  function cone(r, h, seg, c) { return mesh(new T.ConeGeometry(r, h, seg), c); }
  function ico(r, c, detail) { return mesh(new T.IcosahedronGeometry(r, detail || 0), c); }
  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6d2b79f5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function shade(hex, k) { var c = new T.Color(hex); c.multiplyScalar(k); return "#" + c.getHexString(); }
  function lerpColor(a, b, t) { return "#" + new T.Color(a).lerp(new T.Color(b), t).getHexString(); }

  // Gentle rolling ground, flat along the trail.
  // Never below the soil top (y = 0) and flat at the slab's edges, so no seams show.
  var flatZones = [];   // rivers and seas being built: the ground lies flat under water
  function inFlat(x, z) {
    for (var i = 0; i < flatZones.length; i++) {
      var f = flatZones[i];
      if (f.bed) continue;
      var d = f.along ? Math.abs(z - f.z) - f.w / 2 : Math.abs(x - f.x) - f.w / 2;
      if (d < 1.5) return d < 0 ? 0 : d / 1.5;
    }
    return 1;
  }
  // A river crossing cuts a trench right through the slab: banks slope down to the bed.
  function crossingAt(x) {
    for (var i = 0; i < flatZones.length; i++) {
      var f = flatZones[i];
      if (!f.bed) continue;
      var d = Math.abs(x - f.x) - f.w / 2;
      if (d < 1.5) return { d: d, bed: f.bed };
    }
    return null;
  }
  function groundH(x, z, seed) {
    var c = crossingAt(x);
    if (c && c.d < 0) { var u = Math.min(1, -c.d / 2.5); return -c.bed * u * u * (3 - 2 * u); }
    var s = seed % 1000;
    var h = 0.55 * Math.sin(x * 0.11 + s) * Math.cos(z * 0.13 + s * 0.7) + 0.35 * Math.sin(x * 0.27 + z * 0.19 + s * 1.3);
    h = 0.6 * (h + 0.9);
    var flat = Math.min(1, Math.max(0, (Math.abs(z) - 3) / 6));
    var edge = Math.min(1, (SLAB_L / 2 - Math.abs(x)) / 3, (SLAB_D / 2 - Math.abs(z)) / 3);
    return h * flat * Math.max(0, edge) * inFlat(x, z) * (c ? c.d / 1.5 : 1);
  }
  // Height on a built slab (each slab remembers its own rivers).
  function heightOn(slab, x, z) {
    var keep = flatZones;
    flatZones = slab.userData.zones || [];
    var h = groundH(x, z, slab.userData.seed);
    flatZones = keep;
    return h;
  }

  // ------------------------------------------------------------------ the slab
  var animators = [];   // per-slab things that move every frame (water, smoke, flags...)

  function placeIn(R, opt, taken, radius) {
    opt = opt || {};
    for (var tries = 0; tries < 40; tries++) {
      var x = opt.x !== undefined && tries === 0 ? opt.x : (R() - 0.5) * (SLAB_L - 8);
      var side = opt.side || (R() < 0.5 ? "back" : "front");
      var z = side === "back" ? -(4 + R() * (SLAB_D / 2 - 7)) : (4 + R() * (SLAB_D / 2 - 7));
      if (opt.z !== undefined) z = opt.z;
      var ok = taken.every(function (t) { return Math.hypot(t.x - x, t.z - z) > t.r + radius; });
      if (ok) { taken.push({ x: x, z: z, r: radius }); return { x: x, z: z }; }
      if (opt.x !== undefined) { taken.push({ x: x, z: z, r: radius }); return { x: x, z: z }; }
    }
    return { x: (R() - 0.5) * SLAB_L * 0.9, z: side === "back" ? -10 : 10 };
  }

  function buildSlab(key, variant, riverNow) {
    var def = W.scenes[key] || W.scenes.prairie;
    var seed = hash(key + ":" + (variant || 0));
    var R = rng(seed);
    var g = new T.Group();
    g.userData = { key: key, anim: [], seed: seed };
    var taken = [{ x: 0, z: 0, r: 0 }];
    var allSea = (def.features || []).some(function (f) { return f[0] === "sea" && f[2] && f[2].all; });
    flatZones = [];
    (def.features || []).forEach(function (f) {
      var o = f[2] || {};
      if (f[0] === "river") flatZones.push(o.along ? { along: true, z: o.z, w: o.width || 4 } :
        { x: o.x || -26, w: o.width || 24, bed: 0.7 + 0.32 * ((riverNow && riverNow.depth) || o.depth || 3.5), current: (riverNow && riverNow.current) || o.current || 0.4, depthFt: (riverNow && riverNow.depth) || o.depth || 3.5 });
      if (f[0] === "sea" && !o.all) flatZones.push({ along: true, z: SLAB_D / 4 + 1, w: SLAB_D / 2 + 2 });
    });

    g.userData.zones = flatZones.slice();
    var deepest = flatZones.reduce(function (m, f) { return Math.max(m, f.bed || 0); }, 0);
    var bodyTop = deepest ? -deepest - 0.35 : -0.01;
    // body of the slab: soil sides and a darker base, like a museum diorama
    var body = box(SLAB_L, SLAB_T, SLAB_D, allSea ? def.soil : def.soil);
    body.position.y = bodyTop - SLAB_T / 2;
    body.castShadow = false;
    g.add(body);
    var base = box(SLAB_L + 0.6, 0.5, SLAB_D + 0.6, shade(def.soil, 0.7));
    base.position.y = bodyTop - SLAB_T - 0.25;
    if (deepest) skirts(g, def, seed, bodyTop);
    base.castShadow = false;
    g.add(base);

    if (!allSea) {
      // the top: low-poly patches of two ground colors
      var geo = new T.PlaneGeometry(SLAB_L, SLAB_D, 56, 24).toNonIndexed();
      geo.rotateX(-Math.PI / 2);
      var pos = geo.attributes.position, cols = [];
      for (var i = 0; i < pos.count; i++) pos.setY(i, groundH(pos.getX(i), pos.getZ(i), seed));
      var ca = new T.Color(def.ground), cb = new T.Color(def.ground2 || def.ground), tmp = new T.Color();
      for (var f = 0; f < pos.count; f += 3) {
        tmp.copy(ca).lerp(cb, R() < 0.35 ? 0.4 + R() * 0.6 : R() * 0.3);
        for (var k = 0; k < 3; k++) cols.push(tmp.r, tmp.g, tmp.b);
      }
      geo.setAttribute("color", new T.Float32BufferAttribute(cols, 3));
      geo.computeVertexNormals();
      var top = new T.Mesh(geo, new T.MeshPhongMaterial({ vertexColors: true, flatShading: true, shininess: 0, specular: 0 }));
      top.receiveShadow = true;
      g.add(top);
    }

    // the trail: a worn strip with two wheel ruts
    if (def.trail) {
      // trail pieces between river banks
      var spans = [[-SLAB_L / 2, SLAB_L / 2]];
      flatZones.forEach(function (f) {
        if (!f.bed) return;
        var a = f.x - f.w / 2 - 0.5, b = f.x + f.w / 2 + 0.5;
        spans = spans.reduce(function (out, sp) {
          if (b <= sp[0] || a >= sp[1]) out.push(sp);
          else { if (a > sp[0]) out.push([sp[0], a]); if (b < sp[1]) out.push([b, sp[1]]); }
          return out;
        }, []);
      });
      spans.forEach(function (sp) {
        var len = sp[1] - sp[0], cx = (sp[0] + sp[1]) / 2;
        var trail = mesh(new T.PlaneGeometry(len, 3.2), def.trail);
        trail.rotation.x = -Math.PI / 2; trail.position.set(cx, 0.03, 0); trail.castShadow = false;
        g.add(trail);
        [-0.95, 0.95].forEach(function (z) {
          var rut = mesh(new T.PlaneGeometry(len, 0.32), shade(def.trail, 0.82));
          rut.rotation.x = -Math.PI / 2; rut.position.set(cx, 0.06, z); rut.castShadow = false;
          g.add(rut);
        });
      });
    }

    (def.features || []).forEach(function (f) {
      var fn = BUILD[f[0]];
      if (fn) fn(g, f[1] || 1, f[2] || {}, R, def, taken, seed);
    });
    return g;
  }

  function groundY(x, z, seed) { return groundH(x, z, seed); }

  // Soil walls around the slab's edges, from the ground down to the body, so a
  // river trench shows as a clean cutaway instead of a hole.
  function skirts(g, def, seed, bottom) {
    var mat = new T.MeshPhongMaterial({ color: new T.Color(def.soil), flatShading: true, shininess: 0, specular: 0, side: T.DoubleSide });
    [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(function (side) {
      var alongX = side[1] !== 0, n = alongX ? 60 : 24, len = alongX ? SLAB_L : SLAB_D;
      var pos = [], idx = [];
      for (var i = 0; i <= n; i++) {
        var t = -len / 2 + len * i / n;
        var x = alongX ? t : side[0] * SLAB_L / 2, z = alongX ? side[1] * SLAB_D / 2 : t;
        pos.push(x, groundH(x, z, seed), z, x, bottom, z);
        if (i < n) { var a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
      }
      var geo = new T.BufferGeometry();
      geo.setAttribute("position", new T.Float32BufferAttribute(pos, 3));
      geo.setIndex(idx); geo.computeVertexNormals();
      g.add(new T.Mesh(geo, mat));
    });
  }

  // A big crossing river: deep water in a trench, racing foam and logs, rapids on
  // swift rivers, and a depth post on the near bank marked in feet.
  function bigRiver(g, zone, color, R) {
    var waterY = -0.6, w = zone.w + 0.6, cur = zone.current;
    // water surface, darker in the deep middle
    var geo = new T.PlaneGeometry(w, SLAB_D, 16, 34);
    geo.rotateX(-Math.PI / 2);
    var cols = [], base = new T.Color(color), deep = base.clone().multiplyScalar(0.62), c = new T.Color();
    var pa = geo.attributes.position;
    for (var i = 0; i < pa.count; i++) {
      var u = 1 - Math.abs(pa.getX(i)) / (w / 2);
      c.copy(base).lerp(deep, Math.min(1, u * 1.4));
      cols.push(c.r, c.g, c.b);
    }
    geo.setAttribute("color", new T.Float32BufferAttribute(cols, 3));
    var water = new T.Mesh(geo, new T.MeshPhongMaterial({ vertexColors: true, flatShading: true, shininess: 50, specular: 0x445055, transparent: true, opacity: 0.93 }));
    water.receiveShadow = true;
    g.add(at(water, zone.x, waterY, 0));
    var basePos = Float32Array.from(geo.attributes.position.array);
    var phase = new Float32Array(pa.count);
    for (var ph = 0; ph < pa.count; ph++) phase[ph] = R() * 6.28;
    // the body of water, seen in cutaway at the slab's front and back
    var bodyW = new T.Mesh(new T.BoxGeometry(w - 0.4, zone.bed + waterY + 0.1, SLAB_D - 0.05), new T.MeshPhongMaterial({ color: deep, transparent: true, opacity: 0.55, flatShading: true }));
    g.add(at(bodyW, zone.x, (-zone.bed + waterY) / 2, 0));
    // foam streaks racing downstream (toward the front, +z)
    var foam = new T.InstancedMesh(new T.BoxGeometry(0.7, 0.05, 0.22), new T.MeshBasicMaterial({ color: 0xf4f6f2, transparent: true, opacity: 0.8 }), 90);
    var specks = [];
    for (var f = 0; f < 90; f++) specks.push({ x: (R() - 0.5) * (w - 2), z: (R() - 0.5) * SLAB_D, s: 0.6 + R() * 1.2, ph: R() * 6 });
    g.add(at(foam, zone.x, waterY + 0.06, 0));
    // logs and branches swept along
    var logs = [];
    for (var l = 0; l < 3; l++) {
      var log = mesh(new T.CylinderGeometry(0.22, 0.25, 3 + R() * 2, 6), "#5a4330");
      log.rotation.z = Math.PI / 2; log.rotation.y = R() * 3;
      var holder = new T.Group(); holder.add(log);
      g.add(at(holder, zone.x + (R() - 0.5) * (w - 4), waterY + 0.05, (R() - 0.5) * SLAB_D));
      logs.push({ g: holder, spin: (R() - 0.5) * 0.6 });
    }
    // rapids: rocks with white water around them
    if (cur > 0.65) {
      for (var r = 0; r < 9; r++) {
        var rx = zone.x + (R() - 0.5) * (w - 4), rz = (R() - 0.5) * (SLAB_D - 6);
        if (Math.abs(rz) < 3) rz += 6;
        var rock = mesh(new T.DodecahedronGeometry(0.6 + R() * 0.7, 0), "#6f6a62"); rock.scale.y = 0.7;
        g.add(at(rock, rx, waterY, rz));
        var ring = new T.Mesh(new T.TorusGeometry(1.1, 0.12, 3, 10), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 }));
        ring.rotation.x = Math.PI / 2; ring.scale.set(1, 1.6, 1);
        g.add(at(ring, rx, waterY + 0.04, rz + 0.4));
      }
    }
    // the depth post on the near bank, one stripe per foot
    var postX = zone.x + zone.w / 2 - 1.6, post = new T.Group(), ft = 0.32, feet = Math.ceil(zone.depthFt) + 3;
    post.add(at(box(0.32, feet * ft + 0.4, 0.32, "#efe9dc"), 0, (feet * ft + 0.4) / 2, 0));
    for (var k = 0; k < feet; k += 1) post.add(at(box(0.38, 0.12, 0.38, k % 5 === 4 ? "#a5402f" : "#22262e"), 0, (k + 1) * ft, 0));
    g.add(at(post, postX, waterY - zone.depthFt * ft, -3.4));
    // motion
    var m4 = new T.Matrix4(), q = new T.Quaternion(), sc = new T.Vector3(), pv = new T.Vector3(), t = 0, speed = 2.5 + cur * 9;
    g.userData.anim.push(function (dt) {
      t += dt;
      var p = geo.attributes.position, amp = 0.06 + cur * 0.16;
      for (var i = 0; i < p.count; i++) {
        var x = basePos[i * 3], z = basePos[i * 3 + 2];
        p.setY(i, amp * (0.55 * Math.sin(z * 0.7 - t * (2 + cur * 5) + phase[i]) + 0.45 * Math.sin(t * 2.3 + phase[i] * 1.7)));
      }
      p.needsUpdate = true;
      specks.forEach(function (sp, i) {
        sp.z += dt * speed * sp.s;
        if (sp.z > SLAB_D / 2) { sp.z = -SLAB_D / 2; sp.x = (Math.random() - 0.5) * (w - 2); }
        pv.set(sp.x + Math.sin(t * 2 + sp.ph) * 0.3, 0, sp.z); sc.set(sp.s, 1, 1 + sp.s);
        q.setFromAxisAngle(new T.Vector3(0, 1, 0), Math.PI / 2 + Math.sin(t + sp.ph) * 0.3);
        m4.compose(pv, q, sc); foam.setMatrixAt(i, m4);
      });
      foam.instanceMatrix.needsUpdate = true;
      logs.forEach(function (lg) {
        lg.g.position.z += dt * speed * 0.6;
        lg.g.rotation.y += dt * lg.spin;
        lg.g.position.y = waterY + 0.06 * Math.sin(t * 2 + lg.spin * 10);
        if (lg.g.position.z > SLAB_D / 2 + 2) lg.g.position.z = -SLAB_D / 2 - 2;
      });
    });
  }

  // instanced scatter of a small shape, colored per instance
  function scatter(g, geo, n, colors, R, opt, taken, seed, sy) {
    var im = new T.InstancedMesh(geo, new T.MeshPhongMaterial({ flatShading: true, shininess: 0, specular: 0 }), n);
    var m4 = new T.Matrix4(), q = new T.Quaternion(), s = new T.Vector3(), p = new T.Vector3(), c = new T.Color();
    for (var i = 0; i < n; i++) {
      var x = (R() - 0.5) * (SLAB_L - 2), z = (R() - 0.5) * (SLAB_D - 2);
      if (opt.side === "back" && z > 0) z = -z;
      if (opt.side === "front" && z < 0) z = -z;
      if (Math.abs(z) < 2.2) z += z < 0 ? -2.4 : 2.4;
      if (taken.some(function (t) { return t.r > 2 && Math.hypot(t.x - x, t.z - z) < t.r; })) { i--; n--; if (n <= i) break; continue; }
      var k = 0.6 + R() * 0.8;
      s.set(k, k * (sy || 1) * (0.7 + R() * 0.6), k);
      q.setFromAxisAngle(new T.Vector3(0, 1, 0), R() * 6.28);
      p.set(x, groundY(x, z, seed), z);
      m4.compose(p, q, s);
      im.setMatrixAt(i, m4);
      im.setColorAt(i, c.set(colors[Math.floor(R() * colors.length)]));
    }
    im.count = Math.max(0, n);
    im.castShadow = true; im.receiveShadow = true;
    g.add(im);
    return im;
  }

  // ------------------------------------------------------------------ smoke and dust
  var puffGeo = new T.IcosahedronGeometry(0.4, 0);
  var puffs = [];
  for (var pi = 0; pi < 70; pi++) {
    var pm = new T.Mesh(puffGeo, new T.MeshLambertMaterial({ color: 0xd8cfbe, transparent: true, opacity: 0, depthWrite: false }));
    pm.visible = false;
    fxG.add(pm);
    puffs.push({ m: pm, age: 99, life: 1 });
  }
  function puff(x, y, z, o) {
    var p = puffs.filter(function (q) { return q.age >= q.life; })[0];
    if (!p) return;
    p.m.position.set(x, y, z);
    p.m.material.color.set(o.color || 0xd8cfbe);
    p.vx = o.vx || 0; p.vy = o.vy || 0.6; p.vz = o.vz || 0;
    p.age = 0; p.life = o.life || 2.5; p.grow = o.grow || 1.2; p.op = o.op || 0.55; p.s0 = o.size || 0.6;
    p.m.visible = true;
  }
  function stepPuffs(dt) {
    puffs.forEach(function (p) {
      if (p.age >= p.life) return;
      p.age += dt;
      var k = p.age / p.life;
      p.m.position.x += p.vx * dt; p.m.position.y += p.vy * dt; p.m.position.z += p.vz * dt;
      var s = p.s0 * (1 + p.grow * k);
      p.m.scale.set(s, s, s);
      p.m.material.opacity = p.op * (1 - k) * Math.min(1, k * 6);
      if (p.age >= p.life) p.m.visible = false;
    });
  }
  // A chimney or fire that smokes: registered with the slab so it moves with it.
  function smoker(g, x, y, z, color) {
    var t = Math.random() * 2;
    g.userData.anim.push(function (dt) {
      t -= dt;
      if (t <= 0) {
        t = 0.45 + Math.random() * 0.4;
        var wp = new T.Vector3(x, y, z).applyMatrix4(g.matrixWorld);
        puff(wp.x, wp.y, wp.z, { color: color || 0xcfc8bc, vy: 1.1, vx: 0.35, life: 3.2, grow: 2.2, op: 0.5, size: 0.35 });
      }
    });
  }

  // ------------------------------------------------------------------ feature builders
  function tree(kind, R) {
    var t = new T.Group();
    if (kind === "pine") {
      t.add(at(cyl(0.18, 0.25, 1.2, 5, "#5a4330"), 0, 0.6, 0));
      [[1.4, 1.9, 1.5], [1.1, 1.6, 2.5], [0.75, 1.3, 3.4]].forEach(function (c) {
        t.add(at(cone(c[0], c[1], 6, R() < 0.5 ? "#4b6a4a" : "#557553"), 0, c[2], 0));
      });
    } else if (kind === "oak") {
      t.add(at(cyl(0.22, 0.32, 1.3, 5, "#5b4532"), 0, 0.65, 0));
      var c1 = ico(1.7, R() < 0.5 ? "#5f7a45" : "#6b8650"); c1.scale.set(1.3, 0.75, 1.15); t.add(at(c1, 0, 2.0, 0));
      var c2 = ico(1.1, "#6f8a52"); c2.scale.set(1.1, 0.8, 1); t.add(at(c2, 0.8, 2.4, 0.3));
    } else {
      t.add(at(cyl(0.22, 0.34, 2.2, 5, "#6b5038"), 0, 1.1, 0));
      var a = ico(1.5, R() < 0.5 ? "#86a05a" : "#7c9652"); a.scale.set(1, 1.2, 1); t.add(at(a, 0, 3.1, 0));
      t.add(at(ico(1.0, "#93aa63"), 0.7, 3.8, 0.2));
    }
    var k = 0.75 + R() * 0.6;
    t.scale.set(k, k, k);
    t.rotation.y = R() * 6.28;
    return t;
  }
  function trees(kind) {
    return function (g, n, opt, R, def, taken, seed) {
      for (var i = 0; i < n; i++) {
        var p = placeIn(R, { side: opt.side, x: i === 0 ? opt.x : undefined }, taken, 1.6);
        g.add(at(tree(kind, R), p.x, groundY(p.x, p.z, seed), p.z));
      }
    };
  }

  function animal(kind, R) {
    var a = new T.Group();
    var dark = kind === "bison";
    var col = dark ? "#4a3626" : (R() < 0.5 ? "#8a5a3a" : "#b58b62");
    var body = box(dark ? 1.5 : 1.4, dark ? 0.8 : 0.7, 0.7, col); a.add(at(body, 0, 0.85, 0));
    if (dark) { var hump = box(0.7, 0.5, 0.72, "#3b2a1e"); a.add(at(hump, -0.4, 1.35, 0)); }
    var head = box(0.45, 0.42, 0.42, dark ? "#2f2219" : col); a.add(at(head, -0.95, dark ? 0.8 : 0.95, 0));
    [[-0.5, 0.25], [-0.5, -0.25], [0.5, 0.25], [0.5, -0.25]].forEach(function (l) {
      a.add(at(box(0.16, 0.5, 0.16, shade(col, 0.8)), l[0], 0.25, l[1]));
    });
    a.userData.head = head;
    return a;
  }
  function herd(kind) {
    return function (g, n, opt, R, def, taken, seed) {
      var c = placeIn(R, { side: opt.side || "back" }, taken, 6);
      var list = [];
      for (var i = 0; i < n; i++) {
        var x = c.x + (R() - 0.5) * 12, z = c.z + (R() - 0.5) * 7;
        if (Math.abs(z) < 4) z = c.z;
        var a = animal(kind, R);
        a.rotation.y = R() < 0.7 ? 0 : R() * 6.28;
        g.add(at(a, x, groundY(x, z, seed), z));
        list.push({ a: a, ph: R() * 6 });
      }
      var t = 0;
      g.userData.anim.push(function (dt) {
        t += dt;
        list.forEach(function (l) { l.a.userData.head.rotation.z = 0.25 + 0.25 * Math.sin(t * 0.8 + l.ph); });
      });
    };
  }

  function waterMesh(w, d, color, segW, segD) {
    var geo = new T.PlaneGeometry(w, d, segW, segD);
    geo.rotateX(-Math.PI / 2);
    var m = new T.Mesh(geo, new T.MeshPhongMaterial({ color: new T.Color(color), flatShading: true, shininess: 40, specular: 0x556066, transparent: true, opacity: 0.94 }));
    m.receiveShadow = true;
    var base = Float32Array.from(geo.attributes.position.array);
    m.userData.wave = function (t, amp) {
      var p = geo.attributes.position;
      for (var i = 0; i < p.count; i++) {
        var x = base[i * 3], z = base[i * 3 + 2];
        p.setY(i, amp * (0.5 * Math.sin(x * 0.55 + z * 0.21 + t * 1.4) + 0.35 * Math.cos(z * 0.73 - x * 0.31 + t * 1.1) + 0.25 * Math.sin(x * 1.37 + z * 1.11 + t * 2.3)));
      }
      p.needsUpdate = true;
    };
    return m;
  }

  function gable(w, h, L, c) {
    var s = new T.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.closePath();
    var geo = new T.ExtrudeGeometry(s, { depth: L, bevelEnabled: false });
    geo.translate(0, 0, -L / 2);
    return mesh(geo, c);
  }
  function house(w, h, d, wall, roof) {
    var hs = new T.Group();
    hs.add(at(box(w, h, d, wall), 0, h / 2, 0));
    var r = gable(d + 0.3, h * 0.45, w + 0.3, roof); r.rotation.y = Math.PI / 2; hs.add(at(r, 0, h, 0));
    return hs;
  }

  var BUILD = {
    grass: function (g, n, opt, R, def, taken, seed) {
      scatter(g, new T.ConeGeometry(0.16, 0.7, 4), n, [shade(def.ground, 0.8), shade(def.ground, 0.92), shade(def.ground2 || def.ground, 0.85), "#c2b26a"], R, opt, taken, seed);
    },
    flowers: function (g, n, opt, R, def, taken, seed) {
      scatter(g, new T.IcosahedronGeometry(0.14, 0), n, ["#e7c24f", "#f3eee0", "#9a7fb6", "#d98c5f"], R, opt, taken, seed);
    },
    sage: function (g, n, opt, R, def, taken, seed) {
      scatter(g, new T.IcosahedronGeometry(0.45, 0), n, ["#8e9a7e", "#9fa88c", "#7f8a70"], R, opt, taken, seed, 0.6);
    },
    rocks: function (g, n, opt, R, def, taken, seed) {
      scatter(g, new T.DodecahedronGeometry(0.55, 0), n, ["#9c968a", "#8a8478", "#b0a898"], R, opt, taken, seed, 0.6);
    },
    stump: function (g, n, opt, R, def, taken, seed) {
      scatter(g, new T.CylinderGeometry(0.3, 0.36, 0.5, 6), n, ["#8a6a48", "#7a5d3f", "#9c7b55"], R, opt, taken, seed);
    },
    cottonwood: trees("cottonwood"),
    oak: trees("oak"),
    pine: trees("pine"),
    hills: function (g, n, opt, R, def, taken, seed) {
      for (var i = 0; i < n; i++) {
        var x = (i + 0.5) / n * SLAB_L - SLAB_L / 2 + (R() - 0.5) * 10, z = -SLAB_D / 2 + 5 + R() * 4;
        var h = ico(8 + R() * 6, opt.color || shade(def.ground2 || def.ground, 0.9), 1);
        h.scale.set(1.2, 0.32 + R() * 0.15, 0.7);
        g.add(at(h, x, -0.5, z));
      }
    },
    bluffs: function (g, n, opt, R, def, taken, seed) {
      for (var i = 0; i < n; i++) {
        var x = (i + 0.5) / n * SLAB_L - SLAB_L / 2 + (R() - 0.5) * 8, z = -SLAB_D / 2 + 6 + R() * 5;
        var r = 4 + R() * 4, h = 4 + R() * 4;
        var b = cyl(r * 0.8, r, h, 7, "#c9a57a"); g.add(at(b, x, h / 2 - 0.3, z));
        g.add(at(cyl(r * 0.8, r * 0.82, 0.6, 7, "#d9bf94"), x, h - 0.1, z));
      }
    },
    peaks: function (g, n, opt, R, def, taken, seed) {
      for (var i = 0; i < n; i++) {
        var hood = opt.hood;
        var x = hood ? -10 : (i + 0.5) / n * SLAB_L - SLAB_L / 2 + (R() - 0.5) * 8;
        var z = -SLAB_D / 2 + 6 + R() * 5;
        var r = hood ? 11 : (opt.small ? 5 + R() * 4 : 8 + R() * 6);
        var h = hood ? 26 : (opt.small ? 6 + R() * 6 : 14 + R() * 12);
        var col = opt.green ? (R() < 0.5 ? "#6f8f5f" : "#7d9a68") : (R() < 0.5 ? "#8e97a6" : "#9aa2ae");
        var p = cone(r, h, hood ? 9 : 6 + Math.floor(R() * 2), col);
        p.rotation.y = R() * 3;
        g.add(at(p, x, h / 2 - 0.5, z));
        if (opt.snow || hood) {
          var cap = cone(r * 0.38, h * 0.38, p.geometry.parameters.radialSegments, "#f4f2ec");
          cap.rotation.y = p.rotation.y;
          g.add(at(cap, x, h - h * 0.19 - 0.45, z));
        }
      }
    },
    river: function (g, n, opt, R, def, taken, seed) {
      var w;
      if (opt.along) {
        w = waterMesh(SLAB_L, opt.width || 4, opt.color || "#93a9b1", 40, 3);
        g.add(at(w, 0, 0.12, opt.z));
        taken.push({ x: 0, z: opt.z, r: 0 });
        // keep big things off the water
        for (var x = -SLAB_L / 2; x < SLAB_L / 2; x += 6) taken.push({ x: x, z: opt.z, r: (opt.width || 4) / 2 + 1 });
      } else {
        var zone = g.userData.zones.filter(function (z) { return z.bed; })[0];
        for (var z = -SLAB_D / 2; z < SLAB_D / 2; z += 4) taken.push({ x: zone.x, z: z, r: zone.w / 2 + 1.5 });
        bigRiver(g, zone, opt.color || "#6f8f9a", R);
        g.userData.crossing = zone;
        return;
      }
      var t = 0;
      g.userData.anim.push(function (dt) { t += dt; w.userData.wave(t, 0.06); });
    },
    sea: function (g, n, opt, R, def, taken, seed) {
      var w;
      if (opt.all) {
        w = waterMesh(SLAB_L, SLAB_D, def.ground, 44, 24);
        g.add(at(w, 0, 0.1, 0));
      } else {
        w = waterMesh(SLAB_L, SLAB_D / 2 + 2, "#7f9fae", 40, 12);
        g.add(at(w, 0, 0.35, SLAB_D / 4));
        for (var x = -SLAB_L / 2; x < SLAB_L / 2; x += 5) taken.push({ x: x, z: SLAB_D / 4, r: SLAB_D / 4 + 1 });
      }
      var t = 0;
      g.userData.anim.push(function (dt) { t += dt; w.userData.wave(t, opt.all ? 0.35 : 0.12); });
    },
    bison: herd("bison"),
    cattle: herd("cattle"),
    tipis: function (g, n, opt, R, def, taken, seed) {
      var c = placeIn(R, { side: opt.side, x: opt.x }, taken, 9);
      for (var i = 0; i < n; i++) {
        var x = c.x + (R() - 0.5) * 14, z = c.z + (R() - 0.5) * 6;
        if (Math.abs(z) < 4) z = c.z + (c.z < 0 ? -2 : 2);
        var t = new T.Group();
        t.add(at(cone(1.3, 3.4, 8, R() < 0.5 ? "#e8dcc0" : "#e0d0ae"), 0, 1.7, 0));
        for (var p = 0; p < 5; p++) {
          var pole = cyl(0.04, 0.04, 1.2, 4, "#5a4330");
          var a = p / 5 * 6.28;
          pole.position.set(Math.cos(a) * 0.12, 3.6, Math.sin(a) * 0.12);
          pole.rotation.z = Math.cos(a) * 0.35; pole.rotation.x = -Math.sin(a) * 0.35;
          t.add(pole);
        }
        var door = cone(0.35, 0.9, 3, "#5a4636"); door.scale.z = 0.2; t.add(at(door, 0.95, 0.45, 0.35));
        t.rotation.y = R() * 6.28;
        g.add(at(t, x, groundY(x, z, seed), z));
        if (i % 3 === 0) smoker(g, x, 3.8, z, 0xd9d2c4);
      }
    },
    tents: function (g, n, opt, R, def, taken, seed) {
      for (var i = 0; i < n; i++) {
        var p = placeIn(R, { side: opt.side, x: i === 0 ? opt.x : undefined }, taken, 1.4);
        var tent = mesh(new T.CylinderGeometry(1, 1, 2.2, 3), R() < 0.5 ? "#e4ddcb" : "#d6ceb8");
        tent.rotation.z = Math.PI / 2; tent.rotation.x = Math.PI / 6;
        var wrap = new T.Group(); wrap.add(at(tent, 0, 0.5, 0)); wrap.rotation.y = R() * 3; wrap.scale.setScalar(1.5 + R() * 0.4);
        g.add(at(wrap, p.x, groundY(p.x, p.z, seed), p.z));
      }
    },
    wagons: function (g, n, opt, R, def, taken, seed) {
      for (var i = 0; i < n; i++) {
        var w = makeWagon(R);
        var x, z;
        if (opt.circle) {
          var a = i / n * 6.28;
          x = (opt.x || 0) + Math.cos(a) * 7; z = -12 + Math.sin(a) * 4.5;
          w.rotation.y = -a + Math.PI / 2;
        } else {
          var p = placeIn(R, { side: opt.side, x: i === 0 ? opt.x : undefined }, taken, 3);
          x = p.x; z = p.z; w.rotation.y = R() * 0.6 - 0.3;
        }
        w.scale.setScalar(0.85);
        g.add(at(w, x, groundY(x, z, seed), z));
      }
      if (opt.circle) taken.push({ x: opt.x || 0, z: -12, r: 8 });
    },
    campfire: function (g, n, opt, R, def, taken, seed) {
      var x = opt.x || 0, z = -12;
      var fire = new T.Group();
      fire.add(at(box(1.2, 0.2, 0.25, "#4a3424"), 0, 0.1, 0));
      var l2 = box(1.2, 0.2, 0.25, "#4a3424"); l2.rotation.y = 1.4; fire.add(at(l2, 0, 0.15, 0));
      var flame = cone(0.45, 1.1, 5, new T.MeshBasicMaterial({ color: 0xffb04a }));
      var flame2 = cone(0.25, 0.7, 5, new T.MeshBasicMaterial({ color: 0xffe08a }));
      fire.add(at(flame, 0, 0.7, 0)); fire.add(at(flame2, 0, 0.6, 0));
      var light = new T.PointLight(0xffa050, 2.4, 30, 1.4);
      fire.add(at(light, 0, 1.4, 0));
      g.add(at(fire, x, 0, z));
      smoker(g, x, 1.4, z, 0x8f8a84);
      var t = 0;
      g.userData.anim.push(function (dt) {
        t += dt;
        var f = 1 + 0.18 * Math.sin(t * 13) + 0.1 * Math.sin(t * 7.3);
        flame.scale.set(1, f, 1); flame2.scale.set(1, 2 - f, 1);
        light.intensity = 1.9 + 0.5 * Math.sin(t * 11) * Math.sin(t * 3.1);
      });
    },
    town: function (g, n, opt, R, def, taken, seed) {
      var cx = opt.x || 0, count = opt.small ? 6 : 11;
      for (var i = 0; i < count; i++) {
        var side = i % 2 ? 1 : -1;
        var x = cx + (i - count / 2) * 4.2 + (R() - 0.5);
        var z = side * (opt.small ? -9 - R() * 4 : 6.5 + R() * 1.5);
        if (opt.small) z = -8 - R() * 8;
        var wall = ["#b5735a", "#e7dcc4", "#c9b79a", "#a9a49a", "#d8c8a8"][Math.floor(R() * 5)];
        var hgt = 2.2 + R() * 2.2;
        var hs = house(3.2, hgt, 2.8, wall, R() < 0.5 ? "#6b5a4a" : "#7d6f62");
        hs.rotation.y = side > 0 ? Math.PI : 0;
        g.add(at(hs, x, groundY(x, z, seed), z));
        taken.push({ x: x, z: z, r: 2.6 });
        if (R() < 0.5) { g.add(at(box(0.4, 1.2, 0.4, "#7a5a48"), x + 0.8, hgt + 0.8, z)); smoker(g, x + 0.8, hgt + 1.5, z); }
      }
      if (!opt.small) {
        var ch = house(5, 3.6, 4.4, "#b06a52", "#5f5a55");
        g.add(at(ch, cx, 0, -14));
        g.add(at(box(1.4, 1.6, 1.4, "#ece4d2"), cx, 5.6, -14));
        g.add(at(cone(1.1, 1.4, 4, "#5f5a55"), cx, 7.1, -14));
        taken.push({ x: cx, z: -14, r: 4 });
      }
    },
    fort: function (g, n, opt, R, def, taken, seed) {
      var cx = opt.x || 0, cz = -11, s = 7, adobe = "#dccaa6", h = 2.6;
      var f = new T.Group();
      f.add(at(box(2 * s, h, 0.7, adobe), 0, h / 2, -s));
      f.add(at(box(2 * s, h, 0.7, adobe), -0, h / 2, s));
      f.add(at(box(0.7, h, 2 * s, adobe), -s, h / 2, 0));
      f.add(at(box(0.7, h, 2 * s, adobe), s, h / 2, 0));
      f.add(at(box(2.2, 1.9, 0.75, "#5a4636"), 0, 0.95, s + 0.05));
      [[-s, -s], [s, s]].forEach(function (c) { f.add(at(cyl(1.6, 1.7, h + 1.4, 8, "#d4c09a"), c[0], (h + 1.4) / 2, c[1])); });
      var inner = house(5, 2, 3, "#e8dcc4", "#8a7a66"); f.add(at(inner, -2, 0, -3));
      f.add(at(cyl(0.06, 0.06, 6, 4, "#4a3a2c"), 3, 3, -3));
      var flag = mesh(new T.PlaneGeometry(1.6, 1, 6, 1), new T.MeshPhongMaterial({ color: 0xb04a3a, side: T.DoubleSide, flatShading: true, shininess: 0 }));
      f.add(at(flag, 3.8, 5.5, -3));
      var base = Float32Array.from(flag.geometry.attributes.position.array), t = 0;
      g.userData.anim.push(function (dt) {
        t += dt;
        var p = flag.geometry.attributes.position;
        for (var i = 0; i < p.count; i++) { var x = base[i * 3]; p.setZ(i, 0.18 * Math.sin(x * 2.4 - t * 5) * (x + 0.8)); }
        p.needsUpdate = true;
      });
      smoker(g, cx - 2, 3, cz - 3);
      g.add(at(f, cx, 0, cz));
      taken.push({ x: cx, z: cz, r: 10 });
    },
    chimneyrock: function (g, n, opt, R, def, taken, seed) {
      var cx = opt.x || 0, cz = -12;
      g.add(at(cone(8, 7, 9, "#c9a07a"), cx, 3.3, cz));
      g.add(at(cyl(1.0, 1.9, 9, 7, "#c08e64"), cx, 11.2, cz));
      g.add(at(cyl(0.7, 1.0, 1.4, 7, "#b88660"), cx, 16.3, cz));
      g.add(at(cyl(7.2, 7.6, 0.5, 9, "#b88a64"), cx, 2.5, cz));
      taken.push({ x: cx, z: cz, r: 9 });
    },
    indrock: function (g, n, opt, R, def, taken, seed) {
      var cx = opt.x || 0, cz = -12;
      var d = ico(9, "#a8988e", 1); d.scale.set(1.7, 0.5, 1.05); g.add(at(d, cx, 0.4, cz));
      var d2 = ico(4, "#b5a59a", 1); d2.scale.set(1.4, 0.45, 1); g.add(at(d2, cx + 9, 0.2, cz + 3));
      taken.push({ x: cx, z: cz, r: 15 });
    },
    sluices: function (g, n, opt, R, def, taken, seed) {
      for (var i = 0; i < n; i++) {
        var x = (i + 0.5) / n * SLAB_L * 0.8 - SLAB_L * 0.4, z = -7 - R() * 2;
        var s = new T.Group();
        s.add(at(box(6, 0.5, 0.8, "#8a6a48"), 0, 1.0, 0));
        [-2.5, 0, 2.5].forEach(function (lx) { s.add(at(box(0.15, 1, 0.15, "#5a4330"), lx, 0.4, 0.3)); s.add(at(box(0.15, 1, 0.15, "#5a4330"), lx, 0.4, -0.3)); });
        s.rotation.y = 0.3 + R() * 0.4; s.rotation.z = 0.06;
        g.add(at(s, x, 0, z));
        taken.push({ x: x, z: z, r: 3 });
      }
    },
    rancho: function (g, n, opt, R, def, taken, seed) {
      var cx = opt.x || 0, cz = -12;
      var r = new T.Group();
      r.add(at(box(14, 2.4, 4.6, "#ece4d2"), 0, 1.2, 0));
      var roof = gable(5.4, 1.4, 14.6, "#a5553f"); roof.rotation.y = Math.PI / 2; r.add(at(roof, 0, 2.4, 0));
      for (var i = -3; i <= 3; i++) r.add(at(box(0.25, 2.2, 0.25, "#6b5038"), i * 2, 1.1, 3));
      r.add(at(box(14.4, 0.2, 1.6, "#a5553f"), 0, 2.35, 2.4));
      [-4, 0, 4].forEach(function (dx) { r.add(at(box(1, 1.4, 0.1, "#5a4636"), dx, 0.7, 2.32)); });
      g.add(at(r, cx, 0, cz));
      smoker(g, cx + 5, 3.6, cz);
      taken.push({ x: cx, z: cz, r: 9 });
    },
    fence: function (g, n, opt, R, def, taken, seed) {
      var z = opt.side === "front" ? 4.5 : -4.5, f = new T.Group();
      for (var x = -SLAB_L / 2 + 4; x < SLAB_L / 2 - 4; x += 3) {
        if (R() < 0.12) continue;
        f.add(at(box(0.2, 1.1, 0.2, "#7a5d42"), x, 0.55, z));
        var rail = box(3, 0.12, 0.12, "#8a6c4c"); rail.rotation.z = (R() - 0.5) * 0.15; f.add(at(rail, x + 1.5, 0.75, z));
        f.add(at(box(3, 0.12, 0.12, "#8a6c4c"), x + 1.5, 0.4, z));
      }
      g.add(f);
    },
    cabin: function (g, n, opt, R, def, taken, seed) {
      var p = placeIn(R, { side: opt.side || "back", x: opt.x }, taken, 4);
      var c = house(4, 2.2, 3.2, "#8a6646", "#5f4c3c");
      g.add(at(c, p.x, groundY(p.x, p.z, seed), p.z));
      g.add(at(box(0.6, 1.6, 0.6, "#8f8a80"), p.x + 1.4, 3.2, p.z));
      smoker(g, p.x + 1.4, 4, p.z);
    },
    fields: function (g, n, opt, R, def, taken, seed) {
      ["#a9c27a", "#c9b86a", "#8fb06a", "#b7a35e", "#9cba70"].forEach(function (c, i) {
        var x = -40 + i * 18 + (R() - 0.5) * 4, z = i % 2 ? 11 : -11;
        var f = mesh(new T.PlaneGeometry(12, 7), c); f.rotation.x = -Math.PI / 2; f.castShadow = false;
        g.add(at(f, x, 0.08 + groundY(x, z, seed), z));
        for (var r = -3; r <= 3; r += 1) {
          var row = mesh(new T.PlaneGeometry(12, 0.18), shade(c, 0.85)); row.rotation.x = -Math.PI / 2; row.castShadow = false;
          g.add(at(row, x, 0.1 + groundY(x, z, seed), z + r));
        }
      });
    },
    ships: function (g, n, opt, R, def, taken, seed) {
      for (var i = 0; i < n; i++) {
        var x = (R() - 0.5) * (SLAB_L - 10), z = 10 + R() * (SLAB_D / 2 - 14);
        var s = new T.Group();
        s.add(at(box(6, 1.2, 1.8, "#4f3a2a"), 0, 0.5, 0));
        var masts = 2 + Math.floor(R() * 2);
        for (var m = 0; m < masts; m++) {
          var mx = -2 + m * (4 / Math.max(1, masts - 1));
          s.add(at(cyl(0.07, 0.1, 7, 5, "#3a2a1c"), mx, 4.5, 0));
          s.add(at(box(0.08, 0.08, 2.4, "#3a2a1c"), mx, 6.2, 0));
          if (R() < 0.35) s.add(at(box(0.1, 2, 2.2, "#ebe4d2"), mx, 4.8, 0));
        }
        s.rotation.y = (R() - 0.5) * 0.6;
        g.add(at(s, x, 0, z));
        (function (s, ph) {
          var t = 0;
          g.userData.anim.push(function (dt) { t += dt; s.position.y = 0.12 * Math.sin(t * 1.2 + ph); s.rotation.z = 0.03 * Math.sin(t * 0.9 + ph); });
        })(s, R() * 6);
      }
    },
    junks: function (g, n, opt, R, def, taken, seed) {
      for (var i = 0; i < n; i++) {
        var x = (R() - 0.5) * (SLAB_L - 10), z = 9 + R() * (SLAB_D / 2 - 13);
        var s = new T.Group();
        s.add(at(box(5, 1.1, 1.8, "#6b4a32"), 0, 0.5, 0));
        s.add(at(box(1.2, 0.8, 1.9, "#5a3e2a"), 2.4, 1.3, 0));
        [-1, 1.2].forEach(function (mx, k) {
          s.add(at(cyl(0.07, 0.09, 5, 5, "#3a2a1c"), mx, 3.4, 0));
          var sail = box(k ? 2.4 : 3, k ? 3 : 3.6, 0.08, "#a5653f");
          s.add(at(sail, mx + 0.4, 3.7, 0));
          for (var b = 0; b < 4; b++) s.add(at(box(k ? 2.5 : 3.1, 0.07, 0.12, "#3a2a1c"), mx + 0.4, 2.3 + b * 0.9, 0));
        });
        s.rotation.y = Math.PI / 2 + (R() - 0.5) * 0.8;
        g.add(at(s, x, 0, z));
        (function (s, ph) {
          var t = 0;
          g.userData.anim.push(function (dt) { t += dt; s.position.y = 0.15 * Math.sin(t * 1.1 + ph); s.rotation.x = 0.04 * Math.sin(t * 0.8 + ph); });
        })(s, R() * 6);
      }
    },
    wheel: function (g, n, opt, R, def, taken, seed) {
      for (var i = 0; i < n; i++) {
        var p = placeIn(R, {}, taken, 1.5);
        var wl = makeWheel(0.7, "#7a6650");
        wl.rotation.x = Math.PI / 2 - 0.25; wl.rotation.z = R();
        g.add(at(wl, p.x, 0.2, p.z));
      }
    },
    wreck: function (g, n, opt, R, def, taken, seed) {
      for (var i = 0; i < n; i++) {
        var p = placeIn(R, {}, taken, 3);
        var w = new T.Group();
        w.add(at(box(3.6, 0.55, 1.7, "#8a7458"), 0, 0.5, 0));
        [-1.2, 0, 1.2].forEach(function (x) {
          var bow = mesh(new T.TorusGeometry(1.0, 0.04, 3, 8, Math.PI), "#c9b89a"); bow.rotation.y = Math.PI / 2; w.add(at(bow, x, 0.8, 0));
        });
        var wl = makeWheel(0.6, "#6f5c48"); w.add(at(wl, -1.2, 0.3, 1.0));
        w.rotation.z = 0.18; w.rotation.y = R() * 6;
        g.add(at(w, p.x, 0, p.z));
      }
    },
    skull: function (g, n, opt, R, def, taken, seed) {
      for (var i = 0; i < n; i++) {
        var p = placeIn(R, {}, taken, 1);
        var s = new T.Group();
        s.add(at(box(0.5, 0.3, 0.35, "#efe9dc"), 0, 0.15, 0));
        s.add(at(cone(0.06, 0.5, 4, "#efe9dc"), 0, 0.3, 0.3));
        s.add(at(cone(0.06, 0.5, 4, "#efe9dc"), 0, 0.3, -0.3));
        s.rotation.y = R() * 6;
        g.add(at(s, p.x, 0, p.z));
      }
    }
  };

  // ------------------------------------------------------------------ the rig
  function makeWheel(r, c) {
    var w = new T.Group();
    w.add(mesh(new T.TorusGeometry(r, 0.07, 4, 14), c || "#3a2a1e"));
    for (var i = 0; i < 6; i++) {
      var s = box(0.06, 2 * r, 0.06, c || "#4a3626");
      s.rotation.z = i * Math.PI / 6;
      w.add(s);
    }
    w.add(mesh(new T.CylinderGeometry(0.13, 0.13, 0.2, 6).rotateX(Math.PI / 2), "#2a1e16"));
    return w;
  }
  function makeWagon(R) {
    var w = new T.Group();
    w.add(at(box(3.8, 0.6, 1.8, "#6e4c30"), 0, 1.05, 0));
    w.add(at(box(3.9, 0.12, 1.9, "#5a3c26"), 0, 1.38, 0));
    var bon = mesh(new T.CylinderGeometry(1.05, 1.05, 3.6, 7, 1, true, -Math.PI / 2, Math.PI), mat("#efe6d2", { side: T.DoubleSide }));
    bon.rotation.z = Math.PI / 2; bon.scale.set(1, 1, 1.05);
    w.add(at(bon, 0, 1.4, 0));
    [-1.2, 0, 1.2].forEach(function (x) {
      var bow = mesh(new T.TorusGeometry(1.06, 0.035, 3, 8, Math.PI), "#d9cdb2");
      bow.rotation.y = Math.PI / 2;
      w.add(at(bow, x, 1.4, 0));
    });
    w.add(at(box(2.2, 0.1, 0.12, "#5a3c26"), -2.9, 0.75, 0));
    var wheels = [];
    [[-1.3, 0.55], [1.3, 0.72]].forEach(function (a) {
      [-1.0, 1.0].forEach(function (z) {
        var wl = makeWheel(a[1]);
        w.add(at(wl, a[0], a[1], z));
        wheels.push(wl);
      });
    });
    w.userData.wheels = wheels;
    return w;
  }
  function makeOx(col) {
    var o = new T.Group();
    var body = new T.Group();
    body.add(at(box(1.9, 0.9, 0.85, col), 0, 1.15, 0));
    body.add(at(box(0.7, 0.35, 0.8, shade(col, 0.9)), -0.55, 1.65, 0));
    body.add(at(box(0.55, 0.5, 0.55, shade(col, 0.85)), -1.15, 1.1, 0));
    body.add(at(cone(0.06, 0.45, 4, "#efe6d2"), -1.25, 1.45, 0.3));
    body.add(at(cone(0.06, 0.45, 4, "#efe6d2"), -1.25, 1.45, -0.3));
    body.add(at(box(0.08, 0.6, 0.08, shade(col, 0.6)), 0.98, 1.0, 0));
    o.add(body);
    var legs = [];
    [[-0.65, 0.28], [-0.65, -0.28], [0.65, 0.28], [0.65, -0.28]].forEach(function (p, i) {
      var pivot = new T.Group();
      pivot.position.set(p[0], 0.8, p[1]);
      pivot.add(at(box(0.18, 0.8, 0.18, shade(col, 0.75)), 0, -0.4, 0));
      o.add(pivot);
      legs.push({ g: pivot, ph: (i === 0 || i === 3) ? 0 : Math.PI });
    });
    o.userData = { legs: legs, body: body };
    return o;
  }
  var SKIN = { ohio: "#e3bb98", irish: "#ebc6a6", black: "#7a5038", chinese: "#d9ab80" };
  function makePerson(m, family) {
    var p = new T.Group(), c = m.color || "#5a5f6b", skin = SKIN[family] || "#d9b08c";
    var small = m.look === "girl" || m.look === "youth" ? 0.85 : 1;
    var skirt = m.look === "woman" || m.look === "girl";
    var legs = [];
    if (skirt) {
      p.add(at(cone(0.38, 0.85, 7, c), 0, 0.45, 0));
    } else {
      [-0.11, 0.11].forEach(function (z, i) {
        var pivot = new T.Group(); pivot.position.set(0, 0.82, z);
        pivot.add(at(box(0.14, 0.8, 0.14, "#3a3530"), 0, -0.4, 0));
        p.add(pivot); legs.push({ g: pivot, ph: i ? Math.PI : 0 });
      });
    }
    p.add(at(box(0.32, 0.55, 0.36, c), 0, 1.1, 0));
    p.add(at(mesh(new T.IcosahedronGeometry(0.17, 0), skin), 0, 1.55, 0));
    if (m.look === "man") {
      p.add(at(cyl(0.3, 0.3, 0.04, 8, "#3a3028"), 0, 1.68, 0));
      p.add(at(cyl(0.15, 0.17, 0.22, 8, "#3a3028"), 0, 1.8, 0));
    } else if (m.look === "youth") {
      p.add(at(cyl(0.18, 0.2, 0.12, 8, "#5a4a3a"), 0, 1.7, 0));
    } else if (m.look === "laborer") {
      p.add(at(cone(0.42, 0.26, 10, "#d9c79c"), 0, 1.76, 0));
      var pole = box(1.6, 0.05, 0.05, "#7a5d42"); pole.rotation.y = Math.PI / 2; p.add(at(pole, 0, 1.38, 0));
      p.add(at(cyl(0.2, 0.16, 0.25, 6, "#a58a5c"), 0, 1.05, 0.75));
      p.add(at(cyl(0.2, 0.16, 0.25, 6, "#a58a5c"), 0, 1.05, -0.75));
    } else {
      var bon = mesh(new T.SphereGeometry(0.21, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2), m.look === "girl" ? "#efe6d2" : "#e6dcc6");
      bon.rotation.z = 0.5; p.add(at(bon, 0.04, 1.58, 0));
    }
    p.scale.setScalar(small * 1.15);
    p.userData = { legs: legs };
    return p;
  }
  function makeShip() {
    var s = new T.Group();
    var hull = new T.Shape(); hull.moveTo(-4, 0.6); hull.lineTo(4.3, 0.6); hull.lineTo(5.2, 1.3); hull.lineTo(3.6, -0.5); hull.lineTo(-3.6, -0.5); hull.lineTo(-4.2, 1.1); hull.closePath();
    var hg = new T.ExtrudeGeometry(hull, { depth: 2, bevelEnabled: false }); hg.translate(0, 0, -1);
    s.add(mesh(hg, "#4a3626"));
    s.add(at(box(8, 0.12, 1.9, "#8a6c4c"), 0.2, 0.62, 0));
    [-2, 1.2].forEach(function (x, i) {
      s.add(at(cyl(0.09, 0.12, 8, 5, "#3a2a1c"), x, 4.5, 0));
      [2.4, 4.6, 6.6].forEach(function (y, k) {
        var w = 2.6 - k * 0.5;
        s.add(at(box(0.12, 1.8 - k * 0.3, w * 1.4, "#f1eadb"), x + 0.1, y, 0));
      });
    });
    var bowsprit = cyl(0.05, 0.05, 3, 4, "#3a2a1c");
    bowsprit.rotation.z = 1.1;
    s.add(at(bowsprit, 4.6, 1.8, 0));
    return s;
  }

  var rig = { kind: null, wagon: null, oxen: [], people: [], ship: null };
  function buildRig(vehicle, party, family) {
    while (rigG.children.length) rigG.remove(rigG.children[0]);
    rig = { kind: vehicle, wagon: null, oxen: [], people: [], ship: null };
    if (vehicle === "none") return;
    if (vehicle === "ship") {
      rig.ship = makeShip();
      rigG.add(rig.ship);
      return;
    }
    var R = rng(7);
    if (vehicle === "wagon") {
      rig.wagon = makeWagon(R);
      rigG.add(at(rig.wagon, 2.2, 0, 0));
      [[-2.3, 0.62, "#7b4f31"], [-2.3, -0.62, "#5f3e28"], [-4.9, 0.62, "#8a5a38"], [-4.9, -0.62, "#6b4a33"]].forEach(function (o) {
        var ox = makeOx(o[2]);
        rigG.add(at(ox, o[0], 0, o[1]));
        rig.oxen.push(ox);
      });
      rigG.add(at(box(0.18, 0.18, 1.9, "#4a3424"), -3.4, 1.6, 0));
      rigG.add(at(box(0.18, 0.18, 1.9, "#4a3424"), -6.0, 1.6, 0));
    }
    // the family walks beside the team (most emigrants walked); the dead are missing
    var walkers = (party || []).filter(function (m) { return m.alive !== false; });
    walkers.forEach(function (m, i) {
      var p = makePerson(m, family);
      var x = vehicle === "wagon" ? -5.5 + i * 2.3 : -3 + i * 1.6;
      var z = vehicle === "wagon" ? 2.1 + (i % 2) * 0.5 : (i % 2 ? 0.7 : -0.7);
      rigG.add(at(p, x, 0, z));
      rig.people.push({ p: p, ph: i * 1.3 });
    });
  }

  // ------------------------------------------------------------------ clouds and weather
  var clouds = [];
  for (var ci = 0; ci < 4; ci++) {
    var cg = new T.Group();   // clouds are never seen, only their shadows drifting over the land
    for (var cj = 0; cj < 3; cj++) {
      var cm = new T.Mesh(new T.IcosahedronGeometry(2.2 + Math.random() * 1.6, 0), new T.MeshBasicMaterial({ colorWrite: false, depthWrite: false }));
      cm.position.set(cj * 2.8 - 2.8, Math.random() * 0.5, (Math.random() - 0.5) * 2.4);
      cm.scale.y = 0.55;
      cm.castShadow = true;
      cg.add(cm);
    }
    cg.position.set(-60 + ci * 32, 26 + Math.random() * 5, -24 + Math.random() * 30);
    skyG.add(cg);
    clouds.push(cg);
  }
  var rain = (function () {
    var n = 500, pos = new Float32Array(n * 6);
    for (var i = 0; i < n; i++) {
      var x = (Math.random() - 0.5) * 80, y = Math.random() * 30, z = (Math.random() - 0.5) * 60;
      pos.set([x, y, z, x - 0.15, y - 0.9, z], i * 6);
    }
    var geo = new T.BufferGeometry(); geo.setAttribute("position", new T.BufferAttribute(pos, 3));
    var l = new T.LineSegments(geo, new T.LineBasicMaterial({ color: 0x9fb0c4, transparent: true, opacity: 0.55 }));
    l.visible = false; scene.add(l);
    return l;
  })();
  var snow = (function () {
    var n = 600, pos = new Float32Array(n * 3);
    for (var i = 0; i < n; i++) pos.set([(Math.random() - 0.5) * 80, Math.random() * 30, (Math.random() - 0.5) * 60], i * 3);
    var geo = new T.BufferGeometry(); geo.setAttribute("position", new T.BufferAttribute(pos, 3));
    var p = new T.Points(geo, new T.PointsMaterial({ color: 0xffffff, size: 3, sizeAttenuation: false }));
    p.visible = false; scene.add(p);
    return p;
  })();

  // ------------------------------------------------------------------ light
  var LIGHT = {
    gold: { hemi: [0xfff1d8, 0xbfae8c, 0.72], sun: [0xffd8a0, 0.95], dir: [-0.9, 0.62, 0.55] },
    day: { hemi: [0xffffff, 0xc8c0ae, 0.82], sun: [0xfff6e8, 0.8], dir: [-0.5, 1.0, 0.45] },
    overcast: { hemi: [0xe6e6e2, 0xaaa496, 0.98], sun: [0xf0eee8, 0.32], dir: [-0.3, 1.0, 0.3] },
    dusk: { hemi: [0xe0b8a0, 0x6a5a50, 0.6], sun: [0xff9a60, 0.75], dir: [-1, 0.3, 0.4] },
    night: { hemi: [0x8090c0, 0x3a332c, 0.62], sun: [0xa9bce0, 0.38], dir: [0.4, 0.9, -0.3] }
  };
  var SEASON = { 6: 0xfff4e0, 7: 0xffecd0, 8: 0xfbe4c6, 9: 0xf3dcc4, 10: 0xe8e2dc, 11: 0xdde2ea, 0: 0xdde2ea, 1: 0xe2e6ea };
  // Across a day's travel the sun climbs and falls: cool morning, bright noon, gold evening.
  var baseSun = { pos: new T.Vector3(), color: new T.Color(), intensity: 1 };
  function timeOfDay(k) {
    if (k == null || !current.def || current.def.light === "night" || current.def.light === "overcast") return;
    var a = (k - 0.5) * 2.2;                     // -1.1 morning .. +1.1 evening
    sun.position.set(baseSun.pos.x * Math.cos(a) - 60 * Math.sin(a), Math.max(18, baseSun.pos.y * Math.cos(a * 0.8)), baseSun.pos.z);
    var warm = Math.abs(a) / 1.1;
    sun.color.copy(baseSun.color).lerp(new T.Color(0xffb878), warm * 0.45);
    sun.intensity = baseSun.intensity * (1 - 0.18 * warm);
  }
  function applyLight(def, month) {
    var L = LIGHT[def.light] || LIGHT.day;
    hemi.color.setHex(L.hemi[0]); hemi.groundColor.setHex(L.hemi[1]); hemi.intensity = L.hemi[2];
    sun.color.setHex(L.sun[0]); sun.intensity = L.sun[1];
    if (SEASON[month] && def.light !== "night") sun.color.multiply(new T.Color(SEASON[month]));
    if (def.honest) { sun.intensity *= 0.8; hemi.color.lerp(new T.Color(0xd8d6d0), 0.4); }
    sun.position.set(L.dir[0] * 80, L.dir[1] * 80, L.dir[2] * 80);
    baseSun.pos.copy(sun.position); baseSun.color.copy(sun.color); baseSun.intensity = sun.intensity;
    var sky = new T.Color(def.sky), top = sky.clone().lerp(new T.Color(def.light === "night" ? 0x141a26 : 0xffffff), 0.35);
    root.style.background = "linear-gradient(to bottom, #" + top.getHexString() + ", #" + sky.getHexString() + " 60%, " + shade(def.sky, 0.93) + ")";
    clouds.forEach(function (c) {
      c.visible = def.light !== "night";
    });
  }

  // ------------------------------------------------------------------ camera
  var view = { az: Math.PI / 4, el: 0.62, size: 25, zoom: 1, zoomTo: 1, showcase: false, t: 0, focus: 0, focusTo: 0, travelK: null, drift: 0 };
  function placeCamera() {
    var w = root.clientWidth || window.innerWidth, h = root.clientHeight || window.innerHeight;
    var aspect = w / h;
    var zoom = view.zoom * (1 + 0.38 * view.focus) * (1 + 0.05 * view.drift);
    var halfH = view.size / zoom * (aspect < 1 ? 1.5 : 1);
    var halfW = halfH * aspect;
    camera.left = -halfW; camera.right = halfW; camera.top = halfH; camera.bottom = -halfH;
    var az = view.az + (view.showcase && !reduce ? 0.35 * Math.sin(view.t * 0.12) : 0) + 0.07 * view.drift * Math.sin(view.t * 0.15);
    var el = view.el - 0.12 * view.focus - (view.low || 0);
    var dir = new T.Vector3(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az));
    // frame the wagon a little left of and below the center, leaving room for cards
    var target = new T.Vector3(-1.5 + (view.focusX || 0), 0, rigG.position.z * 0.5);
    camera.position.copy(target).addScaledVector(dir, 200);
    camera.lookAt(target);
    camera.updateMatrixWorld();
    var up = new T.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
    var right = new T.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    target.addScaledVector(up, halfH * 0.28 * (1 - 0.35 * view.focus)).addScaledVector(right, halfW * 0.12);
    camera.position.copy(target).addScaledVector(dir, 200);
    camera.lookAt(target);
    camera.updateProjectionMatrix();
    sun.target.position.set(0, 0, 0);
  }
  function resize() {
    var w = root.clientWidth || window.innerWidth, h = root.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    placeCamera();
  }

  // ------------------------------------------------------------------ state
  var current = { key: null, slab: null, incoming: null, def: null, weather: null, visits: {} };
  var moving = 0;    // 0..1 how fast the rig is walking
  var travelAnim = null;

  function mount() {
    if (renderer.domElement.parentNode !== root) {
      root.innerHTML = "";
      root.appendChild(renderer.domElement);
      if (window.ResizeObserver) new ResizeObserver(resize).observe(root);
      else window.addEventListener("resize", resize);
      resize();
    }
  }

  function disposeSlab(s) {
    world.remove(s);
    s.traverse(function (o) { if (o.geometry && o.geometry !== puffGeo) o.geometry.dispose(); });
  }

  function setWeather(kind) {
    current.weather = kind || null;
    rain.visible = kind === "rain";
    snow.visible = kind === "snow";
  }

  function newSlab(key, river) {
    current.visits[key] = (current.visits[key] || 0) + 1;
    return buildSlab(key, current.visits[key] > 1 ? current.visits[key] : 0, river);
  }

  function rigKey(opts) {
    return (opts.vehicle || "wagon") + "|" + (opts.family || "") + "|" + (opts.party || []).map(function (m) { return m.name + (m.alive === false ? "x" : ""); }).join(",");
  }

  function set(key, opts) {
    opts = opts || {};
    mount();
    var def = W.scenes[key] || W.scenes.prairie;
    var rk = rigKey(opts);
    if (rk !== current.rigKey) { buildRig(opts.vehicle || "wagon", opts.party, opts.family); current.rigKey = rk; }
    view.showcase = !!opts.showcase;
    if (current.key !== key || opts.force || !current.slab) {
      if (current.slab) disposeSlab(current.slab);
      current.slab = newSlab(key, opts.river);
      world.add(current.slab);
      current.key = key;
    }
    current.def = def;
    placeRig(def);
    applyLight(def, opts.month);
    setWeather(opts.weather || def.weather);
    start();
  }

  // A ship floats on the harbor water in front of the land; everything else uses the trail.
  function placeRig(def) {
    var seaFront = (def.features || []).some(function (f) { return f[0] === "sea" && f[2] && f[2].front; });
    rigG.position.z = rig.kind === "ship" && seaFront ? 12 : 0;
  }

  // Slide the next place in under the wagon while it walks.
  // hooks.onProgress(k) may return a Promise: the wagon coasts to a stop, waits for
  // it (an event, a death), then pulls away again. Speed is eased, never jumped.
  function travelTo(key, opts, ms, hooks) {
    opts = opts || {}; hooks = hooks || {};
    mount();
    var rk = rigKey(opts);
    if (rk !== current.rigKey) { buildRig(opts.vehicle || "wagon", opts.party, opts.family); current.rigKey = rk; }
    view.showcase = false;
    var next = newSlab(key, opts.river);
    var old = current.slab, def = W.scenes[key] || W.scenes.prairie;
    var oldStart = old ? old.position.x : 0, span = SLAB_L + 1.5 - oldStart;
    next.position.x = oldStart - SLAB_L - 1.5;
    world.add(next);
    current.slab = next; current.key = key; current.def = def;
    current.old = old;
    return new Promise(function (resolve) {
      var done = 0, vel = 0, holding = false, switched = false, lastNow = null;
      travelAnim = function (now) {
        if (lastNow === null) lastNow = now;
        var step = Math.min(100, now - lastNow); lastNow = now;
        var remain = ms - done;
        var target = holding ? 0 : Math.max(0.06, Math.min(1, remain / 1400));
        vel += (target - vel) * Math.min(1, step / (holding ? 380 : 700));
        done = Math.min(ms, done + step * vel);
        var k = done / ms;
        var dx = span * k;
        if (old) old.position.x = oldStart + dx;
        next.position.x = oldStart - SLAB_L - 1.5 + dx;
        current.dx = dx;
        view.travelK = k;
        moving = vel;
        if (!holding && hooks.onProgress) {
          var hold = hooks.onProgress(k);
          if (hold && hold.then) {
            holding = true;
            hold.then(function () { holding = false; });
          }
        }
        if (!switched && k > 0.5) { switched = true; placeRig(def); applyLight(def, opts.month); setWeather(opts.weather || def.weather); }
        if (k >= 1 && !holding) {
          if (old) disposeSlab(old);
          current.old = null;
          moving = 0; travelAnim = null; view.travelK = null;
          resolve();
        }
      };
      if (reduce) { ms = Math.min(ms, 2500); }
    });
  }

  // ------------------------------------------------------------------ crossing a river
  // The river slides under the wagon, the way the land does when traveling.
  // how: ford, float, ferry, guide. upset: the wagon tips mid-river.
  function cross(how, upset) {
    var s = current.slab, zone = s && s.userData.crossing;
    if (!zone || reduce) return Promise.resolve();
    var start = s.position.x, far = -(zone.x - zone.w / 2 - 4), dur = 7000 + zone.w * 60;
    var waterY = -0.6, raft = null, swept = [], tipped = false, splashT = 0;
    if (how === "ferry" || how === "float" || how === "guide") {
      raft = new T.Group();
      raft.add(at(box(7.5, 0.35, 3.4, how === "ferry" ? "#7a5a3c" : "#8a6a48"), 0.6, 0.18, 0));
      if (how === "ferry") { raft.add(at(cyl(0.07, 0.07, 2, 5, "#5a4330"), 4, 1.1, 1.5)); raft.add(at(cyl(0.07, 0.07, 2, 5, "#5a4330"), -2.8, 1.1, 1.5)); }
      raft.visible = false;
      rigG.add(raft);
    }
    view.low = 0.16; focus(true);
    return new Promise(function (resolve) {
      var t0 = performance.now();
      var anim = {
        step: function () {
          var k = Math.min(1, (performance.now() - t0) / dur);
          var e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
          s.position.x = start + far * e;
          var localX = -s.position.x / rigG.scale.x;
          var bed = heightOn(s, localX * rigG.scale.x, 0);
          var inWater = bed < -0.05;
          var frac = inWater ? Math.min(1, -bed / zone.bed) : 0;
          moving = inWater && how !== "ford" ? 0.25 : 0.8;
          if (raft) raft.visible = inWater || raft.visible && k < 0.98;
          var y = how === "ford" ? bed : (inWater ? waterY - 0.15 + 0.12 * Math.sin(performance.now() / 300) : bed);
          if (how === "ford" && frac > 0.6) y = Math.max(bed, waterY - 1.1);
          rigG.position.y = Math.min(0, y);
          rigG.position.z = zone.current * 2.8 * frac * (upset ? 1.8 : 1);
          rigG.rotation.y = (how === "float" ? 0.18 : 0.06) * frac * Math.sin(performance.now() / 700);
          if (upset && k > 0.45 && k < 0.7) {
            rigG.rotation.x = Math.min(0.5, rigG.rotation.x + 0.02);
            if (!tipped) { tipped = true; spill(); }
          } else rigG.rotation.x *= 0.92;
          splashT -= 1;
          if (inWater && splashT <= 0) { splashT = 6; puff(1 + Math.random() * 2, waterY + 0.3, rigG.position.z + 1.6, { color: 0xffffff, vx: 0.4, vy: 1.2, vz: 1.5, life: 0.9, grow: 1.5, op: 0.7, size: 0.35 }); }
          swept.forEach(function (o) { o.m.position.z += 0.06 + zone.current * 0.12; o.m.position.y = waterY + 0.05 * Math.sin(performance.now() / 200 + o.ph) - (o.sink ? Math.min(1.5, (performance.now() - o.t) / 2500) : 0); o.m.rotation.y += 0.02; });
          if (k >= 1) {
            reacted.splice(reacted.indexOf(anim), 1);
            rigG.position.y = 0; rigG.position.z = 0; rigG.rotation.set(0, 0, 0);
            if (raft) rigG.remove(raft);
            swept.forEach(function (o) { scene.remove(o.m); });
            view.low = 0; focus(false); moving = 0;
            resolve();
          }
        },
        undo: function () {}
      };
      reacted.push(anim);
      // supplies float away; an ox is swept downstream
      function spill() {
        for (var i = 0; i < 5; i++) {
          var crate = mesh(new T.BoxGeometry(0.7, 0.5, 0.7), i % 2 ? "#8a6a48" : "#efe6d2");
          crate.position.set(-1 + i * 1.1, waterY, rigG.position.z + 2);
          scene.add(crate); swept.push({ m: crate, ph: i });
        }
        if (rig.oxen.length > 2) {
          var ox = rig.oxen[rig.oxen.length - 1];
          var copy = ox.clone(); rigG.remove(ox); rig.oxen.pop();
          copy.position.set(-7, waterY - 0.6, rigG.position.z + 1); copy.scale.setScalar(1.45);
          scene.add(copy); swept.push({ m: copy, ph: 9, sink: true, t: performance.now() });
          current.rigKey = null; // rebuild the team next time
        }
      }
    });
  }

  // The camera eases in on the wagon when something happens, and back out after.
  function focus(on) { view.focusTo = on ? 1 : 0; }

  // The consequence beat: the family gathers at the wagon, the trouble is put right.
  function settle(ms) {
    return new Promise(function (resolve) {
      var t0 = performance.now(), dur = ms || 1600;
      var homes = rig.people.map(function (p) { return p.p.position.clone(); });
      var anim = {
        step: function () {
          var k = Math.min(1, (performance.now() - t0) / dur);
          var out = k < 0.6 ? k / 0.6 : 1 - (k - 0.6) / 0.4;
          rig.people.forEach(function (p, i) {
            var home = homes[i];
            p.p.position.x = home.x + (0.6 + i * 0.5 - home.x) * out * 0.8;
            p.p.position.z = home.z + (1.6 - home.z) * out * 0.8;
            p.p.rotation.y = out * (i % 2 ? 0.8 : -0.8);
          });
          if (k > 0.55 && !anim.fixed) { anim.fixed = true; clearReact(); reacted.push(anim); }
          if (k >= 1) {
            rig.people.forEach(function (p, i) { p.p.position.copy(homes[i]); p.p.rotation.y = 0; });
            reacted.splice(reacted.indexOf(anim), 1);
            resolve();
          }
        },
        undo: function () {}
      };
      reacted.push(anim);
    });
  }

  // ------------------------------------------------------------------ reactions to trail events
  var reacted = [];
  function slabUnderRig() {
    // during a trip the old slab is under the wagon until the seam passes
    if (current.old && current.old.position.x < SLAB_L / 2) return current.old;
    return current.slab;
  }
  function dropBeside(obj, ahead) {
    var s = slabUnderRig();
    obj.position.x = (ahead || -9) - s.position.x;
    obj.position.z = 3.2;
    s.add(obj);
  }
  function react(kind) {
    clearReact();
    if (kind === "wheel" && rig.wagon) {
      var w = rig.wagon.userData.wheels[1];
      w.visible = false;
      rig.wagon.rotation.x = 0.12; rig.wagon.position.y = -0.15;
      var loose = makeWheel(0.55);
      loose.position.set(rig.wagon.position.x * rigG.scale.x - 1.3 * 1.45, 0.8, 1.6 * 1.45);
      loose.scale.setScalar(1.45);
      scene.add(loose);
      var t = 0;
      reacted.push({ undo: function () { w.visible = true; rig.wagon.rotation.x = 0; rig.wagon.position.y = 0; scene.remove(loose); },
        step: function (dt) {
          t += dt;
          if (t < 1.2) { loose.position.z += dt * 2.2; loose.rotation.z -= dt * 4; }
          else if (loose.rotation.x > -1.45) { loose.rotation.x -= dt * 3; loose.position.y = Math.max(0.12, loose.position.y - dt * 0.6); }
        } });
    } else if (kind === "ox" && rig.oxen.length) {
      var ox = rig.oxen[rig.oxen.length - 1];
      ox.userData.down = true;
      reacted.push({ undo: function () { ox.userData.down = false; ox.userData.body.position.y = 0; ox.userData.legs.forEach(function (l) { l.g.rotation.x = 0; }); },
        step: function () { ox.userData.body.position.y += (-0.55 - ox.userData.body.position.y) * 0.08; ox.userData.legs.forEach(function (l, i) { l.g.rotation.x += ((i % 2 ? 1.3 : -1.3) - l.g.rotation.x) * 0.08; }); } });
    } else if (kind === "storm" || kind === "snow" || kind === "dust") {
      var was = current.weather, hi = hemi.intensity, si = sun.intensity;
      if (kind !== "dust") setWeather(kind === "snow" ? "snow" : "rain");
      hemi.intensity = hi * 0.7; sun.intensity = si * 0.35;
      var dt0 = 0;
      reacted.push({ undo: function () { setWeather(was); hemi.intensity = hi; sun.intensity = si; },
        step: function (dt) {
          if (kind !== "dust") return;
          dt0 -= dt;
          if (dt0 <= 0) { dt0 = 0.05; puff((Math.random() - 0.5) * 30, 0.5, (Math.random() - 0.5) * 20, { color: 0xd8c8a4, vx: 3, vy: 0.4, life: 2.5, grow: 3, op: 0.45, size: 0.8 }); }
        } });
    } else if (kind === "grave") {
      var gr = new T.Group();
      var mound = ico(0.8, "#8a7a5c"); mound.scale.set(1.4, 0.35, 0.8); gr.add(at(mound, 0, 0.1, 0));
      gr.add(at(box(0.12, 1.2, 0.5, "#b9a888"), -0.9, 0.6, 0));
      dropBeside(gr, -8);
    } else if (kind === "goods") {
      var gd = new T.Group();
      gd.add(at(box(0.8, 0.9, 0.7, "#3f3a36"), 0, 0.45, 0));               // a cookstove
      gd.add(at(cyl(0.05, 0.05, 0.6, 4, "#3f3a36"), 0.2, 1.2, 0));
      gd.add(at(cyl(0.35, 0.35, 0.9, 8, "#8a6a48"), 1.1, 0.45, 0.4));       // a barrel
      var chair = new T.Group(); chair.add(at(box(0.6, 0.08, 0.6, "#7a5a3c"), 0, 0.5, 0)); chair.add(at(box(0.08, 0.9, 0.6, "#7a5a3c"), -0.3, 0.9, 0));
      chair.rotation.z = 0.4; gd.add(at(chair, -1.1, 0, -0.2));              // a rocking chair, tipped
      gd.add(at(box(0.9, 0.5, 0.55, "#5a4636"), 0.4, 0.25, -0.9));            // a trunk
      dropBeside(gd, -8);
    }
  }
  // After an event changes the family (a death), refresh who walks beside the wagon.
  function updateParty(opts) {
    var rk = rigKey(opts || {});
    if (rk === current.rigKey) return;
    clearReact();
    buildRig(opts.vehicle || "wagon", opts.party, opts.family);
    current.rigKey = rk;
    if (current.def) placeRig(current.def);
  }
  function clearReact() {
    reacted.forEach(function (r) { r.undo(); });
    reacted = [];
  }

  function travel(ms) { return new Promise(function (r) { setTimeout(r, Math.min(ms, 300)); }); }

  function dim(level) {
    root.classList.toggle("dim", level === "strong");
    root.classList.toggle("dim-soft", level === "soft");
    view.zoomTo = level === "strong" ? 1.12 : 1;
  }

  // ------------------------------------------------------------------ the loop
  var raf = 0, last = 0, clock = 0, dustT = 0, paused3d = false;
  // Slow computer guard: if the first seconds run choppy, drop shadows and resolution.
  var perf = { frames: 0, time: 0, done: false };
  function checkPerf(rawDt) {
    if (perf.done) return;
    perf.frames++; perf.time += rawDt;
    if (perf.time < 4) return;
    perf.done = true;
    if (perf.frames / perf.time < 24) {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 0.85));
      renderer.shadowMap.enabled = false;
      scene.traverse(function (o) { if (o.material) o.material.needsUpdate = true; });
      resize();
    }
  }
  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (document.hidden || paused3d) { last = now; return; }
    if (last) checkPerf((now - last) / 1000);
    var dt = Math.min(0.05, (now - (last || now)) / 1000);
    last = now; clock += dt; view.t += dt;
    if (travelAnim) travelAnim(now);
    reacted.forEach(function (r) { if (r.step) r.step(dt); });

    // camera ease: zoom in a touch behind cards, ease toward the wagon at events,
    // and drift slowly while traveling
    view.zoom += (view.zoomTo - view.zoom) * Math.min(1, dt * 2);
    view.focus += (view.focusTo - view.focus) * Math.min(1, dt * 1.6);
    view.drift += ((view.travelK != null ? 1 : 0) - view.drift) * Math.min(1, dt * 0.6);
    timeOfDay(view.travelK);
    placeCamera();

    // slab life: water, smoke, flags, herds
    world.children.forEach(function (s) {
      s.updateMatrixWorld();
      if (!reduce) s.userData.anim.forEach(function (fn) { fn(dt); });
    });

    // the rig: legs, wheels, bobbing
    var walk = reduce ? 0 : moving;
    var stride = clock * 7;
    rig.oxen.forEach(function (o, i) {
      if (o.userData.down) return;
      o.userData.legs.forEach(function (l) { l.g.rotation.z = walk * 0.45 * Math.sin(stride + l.ph + i); });
      o.userData.body.position.y = walk * 0.05 * Math.abs(Math.sin(stride + i));
      o.userData.body.rotation.z = (1 - walk) * 0.03 * Math.sin(clock * 0.8 + i);
    });
    if (rig.wagon) {
      rig.wagon.userData.wheels.forEach(function (w) { w.rotation.z += walk * dt * 5.5; });
      rig.wagon.position.y = walk * 0.04 * Math.sin(stride * 2);
    }
    rig.people.forEach(function (p) {
      p.p.userData.legs.forEach(function (l) { l.g.rotation.z = walk * 0.6 * Math.sin(stride + l.ph + p.ph); });
      p.p.position.y = walk * 0.06 * Math.abs(Math.sin(stride + p.ph));
      p.p.rotation.z = walk * 0.06;
    });
    if (rig.ship) {
      rig.ship.position.y = 0.25 * Math.sin(clock * 1.1) + 0.3;
      rig.ship.rotation.x = 0.05 * Math.sin(clock * 0.9);
      rig.ship.rotation.z = 0.03 * Math.sin(clock * 0.7);
    }

    // dust behind the wheels while walking
    if (walk > 0.2 && rig.kind !== "ship") {
      dustT -= dt;
      if (dustT <= 0) {
        dustT = 0.06;
        puff(4.4 + Math.random() * 2, 0.4, (Math.random() - 0.5) * 3.4, { color: 0xcdbb98, vx: 2.5 + Math.random(), vy: 0.5, vz: 0.6, life: 1.4, grow: 2.2, op: 0.5, size: 0.4 });
      }
    }
    if (walk > 0.2 && rig.kind === "ship") {
      dustT -= dt;
      if (dustT <= 0) { dustT = 0.08; puff(-6.5, 0.4, (Math.random() - 0.5) * 3, { color: 0xffffff, vx: 3, vy: 0.3, life: 1.2, grow: 1.5, op: 0.6, size: 0.4 }); }
    }
    stepPuffs(dt);

    // clouds drift east; faster while traveling, so the sky moves too
    clouds.forEach(function (c) {
      c.position.x += dt * (0.8 + walk * 9);
      if (c.position.x > 70) c.position.x = -70;
    });
    if (rain.visible) {
      var rp = rain.geometry.attributes.position;
      for (var i = 0; i < rp.count; i += 2) {
        var y = rp.getY(i) - dt * 34;
        if (y < 0) y += 30;
        rp.setY(i, y); rp.setY(i + 1, y - 0.9);
        rp.setX(i + 1, rp.getX(i) - 0.15);
      }
      rp.needsUpdate = true;
    }
    if (snow.visible) {
      var sp = snow.geometry.attributes.position;
      for (var j = 0; j < sp.count; j++) {
        var sy = sp.getY(j) - dt * 2.2;
        if (sy < 0) sy += 30;
        sp.setY(j, sy); sp.setX(j, sp.getX(j) + Math.sin(clock + j) * dt * 0.6);
      }
      sp.needsUpdate = true;
    }
    renderer.render(scene, camera);
  }
  function start() { if (!raf) raf = requestAnimationFrame(frame); }

  W.scene2d = W.scene;
  W.scene = { set: set, travelTo: travelTo, travel: travel, dim: dim, react: react, party: updateParty, focus: focus, settle: settle, cross: cross, weather: function (k) { setWeather(k || (current.def && current.def.weather)); }, pause: function (p) { paused3d = !!p; }, preload: function () {}, is3d: true };
})();
