// Westward: sound, made entirely in the browser (Web Audio), so there are no audio
// files to license. Browsers only allow sound after a click, so it starts on the
// first click. The teacher can mute it with the sound button or the M key.
//   ambient: wind on the land, river roar (louder for swift rivers), rain, the sea,
//            and a crackling fire at night camp
//   travel:  hoof thuds and wagon creaks while the wagon moves
//   one-shots: event sting, thunder, splash, a sick note, a death tone, arrival chime
(function () {
  "use strict";
  var W = window.WESTWARD;
  var KEY = "westward-sound";
  var ctx = null, master, noise, layers = {}, travelTimer = null, fireTimer = null;
  var muted = false;
  try { muted = localStorage.getItem(KEY) === "off"; } catch (e) { /* private mode */ }

  function start() {
    if (ctx) { if (ctx.state === "suspended") ctx.resume(); return; }
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.7;
    master.connect(ctx.destination);
    // two seconds of white noise, shared by every noisy sound
    noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    var d = noise.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    layers.wind = layer([["bandpass", 500, 0.6]], 0.08);
    layers.river = layer([["lowpass", 700, 0.7], ["lowpass", 900, 0.5]], 0.11);
    layers.rain = layer([["highpass", 1800, 0.5]], 0.07);
    layers.sea = layer([["lowpass", 420, 0.7]], 0.15);
    ambient(pending.kind, pending.level, pending.weather);
  }

  // A looping noise source through filters, with its own volume and a slow swell.
  function layer(filters, swell) {
    var src = ctx.createBufferSource();
    src.buffer = noise; src.loop = true;
    var node = src;
    filters.forEach(function (f) {
      var bq = ctx.createBiquadFilter();
      bq.type = f[0]; bq.frequency.value = f[1]; bq.Q.value = f[2];
      node.connect(bq); node = bq;
    });
    var g = ctx.createGain(); g.gain.value = 0;
    var lfo = ctx.createOscillator(), lfoGain = ctx.createGain();
    lfo.frequency.value = 0.07 + Math.random() * 0.08; lfoGain.gain.value = swell;
    lfo.connect(lfoGain); lfoGain.connect(g.gain); lfo.start();
    node.connect(g); g.connect(master); src.start();
    return { gain: g, lfoGain: lfoGain };
  }
  function fade(l, to) {
    if (!l) return;
    var now = ctx.currentTime;
    l.gain.gain.cancelScheduledValues(now);
    l.gain.gain.setValueAtTime(l.gain.gain.value, now);
    l.gain.gain.linearRampToValueAtTime(to, now + 1.5);
  }

  // What the place sounds like.
  var pending = { kind: "wind", level: 0.5, weather: null };
  function ambient(kind, level, weather) {
    pending = { kind: kind || "wind", level: level == null ? 0.5 : level, weather: weather };
    if (!ctx) return;
    fade(layers.wind, kind === "sea" ? 0.04 : kind === "river" ? 0.06 : 0.12);
    fade(layers.river, kind === "river" ? 0.12 + 0.35 * (level || 0.4) : 0);
    fade(layers.sea, kind === "sea" ? 0.3 : 0);
    fade(layers.rain, weather === "rain" ? 0.22 : weather === "snow" ? 0.05 : 0);
    clearInterval(fireTimer); fireTimer = null;
    if (kind === "fire") fireTimer = setInterval(function () { if (Math.random() < 0.7) crackle(); }, 140);
  }

  // ---------------------------------------------------------------- small sounds
  function env(node, peak, attack, decay, when) {
    var g = ctx.createGain(), t = when || ctx.currentTime;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
    node.connect(g); g.connect(master);
    return g;
  }
  function tone(freq, type, peak, attack, decay, when, glideTo) {
    var o = ctx.createOscillator(), t = when || ctx.currentTime;
    o.type = type || "sine"; o.frequency.setValueAtTime(freq, t);
    if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, t + attack + decay);
    env(o, peak, attack, decay, t);
    o.start(t); o.stop(t + attack + decay + 0.05);
  }
  function burst(type, freq, q, peak, attack, decay, when) {
    var src = ctx.createBufferSource(), t = when || ctx.currentTime;
    src.buffer = noise;
    var bq = ctx.createBiquadFilter(); bq.type = type; bq.frequency.value = freq; bq.Q.value = q;
    src.connect(bq);
    env(bq, peak, attack, decay, t);
    src.start(t, Math.random()); src.stop(t + attack + decay + 0.05);
  }
  function crackle() { burst("highpass", 2500 + Math.random() * 2000, 1, 0.05 + Math.random() * 0.06, 0.002, 0.04); }
  function thunder() {
    var t = ctx.currentTime + 0.3;
    burst("lowpass", 180, 0.8, 0.9, 0.05, 2.8, t);
    burst("lowpass", 400, 0.6, 0.4, 0.02, 0.6, t);
  }

  var SOUNDS = {
    // something goes wrong: a low, uneasy pair of notes (thunder for storms)
    thunder: function () { thunder(); },
    event: function (kind) {
      if (kind === "storm" || kind === "lightning") return thunder();
      var t = ctx.currentTime;
      tone(196, "triangle", 0.22, 0.02, 1.2, t);
      tone(233, "triangle", 0.18, 0.02, 1.4, t + 0.18);
      burst("lowpass", 300, 0.7, 0.25, 0.01, 0.5, t);
    },
    sick: function () { tone(220, "sine", 0.12, 0.05, 0.9, null, 196); },
    death: function () {
      var t = ctx.currentTime;
      tone(110, "sine", 0.3, 0.6, 3.5, t);
      tone(165, "sine", 0.16, 0.8, 3.2, t + 0.1);
      tone(330, "triangle", 0.05, 1.2, 2.5, t + 0.4);
    },
    arrive: function () {
      var t = ctx.currentTime;
      tone(392, "sine", 0.12, 0.02, 1.2, t);
      tone(523, "sine", 0.1, 0.02, 1.6, t + 0.22);
    },
    splash: function () {
      var t = ctx.currentTime;
      burst("bandpass", 900, 0.8, 0.5, 0.01, 0.9, t);
      burst("lowpass", 300, 0.7, 0.4, 0.02, 1.4, t + 0.1);
    }
  };

  function play(name, arg) {
    if (!ctx || muted || !SOUNDS[name]) return;
    try { SOUNDS[name](arg); } catch (e) { /* never let sound break the game */ }
  }

  // Hoof thuds and wagon creaks while traveling.
  function travel(on) {
    clearInterval(travelTimer); travelTimer = null;
    if (!on || !ctx) return;
    var beat = 0;
    travelTimer = setInterval(function () {
      if (muted) return;
      beat++;
      tone(70 + Math.random() * 15, "sine", 0.12, 0.005, 0.12);
      if (beat % 5 === 0 && Math.random() < 0.6) burst("bandpass", 220 + Math.random() * 80, 6, 0.06, 0.05, 0.35);
    }, 380);
  }

  function setMuted(m) {
    muted = m;
    try { localStorage.setItem(KEY, m ? "off" : "on"); } catch (e) { /* ignore */ }
    if (ctx) master.gain.setTargetAtTime(m ? 0 : 0.7, ctx.currentTime, 0.1);
    button.setAttribute("aria-pressed", String(!m));
    button.textContent = m ? "Sound: off" : "Sound: on";
  }

  // The mute button, for the teacher (or press M).
  var button = document.createElement("button");
  button.className = "sound-toggle";
  button.type = "button";
  button.setAttribute("aria-pressed", String(!muted));
  button.textContent = muted ? "Sound: off" : "Sound: on";
  button.addEventListener("click", function (e) { e.stopPropagation(); start(); setMuted(!muted); });
  document.body.appendChild(button);
  document.addEventListener("pointerdown", start, true);
  document.addEventListener("keydown", function (e) {
    start();
    if ((e.key === "m" || e.key === "M") && !(e.target && e.target.tagName === "INPUT")) setMuted(!muted);
  }, true);

  W.sound = { start: start, play: play, ambient: ambient, travel: travel, mute: setMuted };
})();
