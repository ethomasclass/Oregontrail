// Westward browser test: opens index.html from disk (file://) at Chromebook size,
// plays one full run per family, saves screenshots, and fails on any page error.
//   node tools/browser-test.js [outDir]
// Needs Playwright (npm i -g playwright) and a Chromium build.
"use strict";
var path = require("path");
var fs = require("fs");
var { chromium } = require("playwright");

var root = path.join(__dirname, "..");
var out = process.argv[2] || path.join(root, "tools", "screens");
fs.mkdirSync(out, { recursive: true });

(async function () {
  var opts = { args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] };
  if (fs.existsSync("/opt/pw-browsers/chromium")) opts.executablePath = "/opt/pw-browsers/chromium";
  var browser = await chromium.launch(opts);
  var errors = [];
  var families = ["ohio", "irish", "black", "chinese"];
  for (var f = 0; f < families.length; f++) {
    var fam = families[f];
    var page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
    page.on("pageerror", function (e) { errors.push(fam + ": " + e.message); });
    page.on("console", function (m) { if (m.type() === "error" && !/fonts\.g|ERR_CERT/.test(m.text())) errors.push(fam + " console: " + m.text()); });
    await page.goto("file://" + path.join(root, "index.html") + "?seed=" + (11 + f));
    var shot = async function (name) { await page.screenshot({ path: path.join(out, fam + "-" + name + ".png") }); };
    if (f === 0) await shot("00-title");
    await page.click("#start");
    if (f === 0) await shot("01-families");
    await page.click("[data-family='" + fam + "']");
    await page.click("#yes");
    await page.fill("#st-navigator", "Ava");
    await shot("02-roles");
    await page.click("#go");
    await page.waitForTimeout(800);
    await shot("03-poster");
    await page.click("#go");
    await page.waitForTimeout(800);
    await shot("04-store");
    // buy the guidebook amounts if affordable
    await page.evaluate(function () {
      var st = WESTWARD.engine.storeFor;
      return st;
    });
    for (var i = 0; i < 20; i++) {
      var plus = await page.$$("[data-plus]");
      if (!plus.length) break;
      var clicked = false;
      for (var p = 0; p < plus.length; p++) {
        var done = await page.$("#done:not([disabled])");
        var row = await plus[p].evaluate(function (b) { return b.closest(".store-row").innerText; });
        var m = /guidebook says (\d+)/.exec(row), q = /\n(\d+)\n/.exec(row);
        if (m && q && Number(q[1]) < Number(m[1]) && done) { await plus[p].click(); clicked = true; break; }
      }
      if (!clicked) break;
    }
    // back off until affordable
    for (var k = 0; k < 30 && !(await page.$("#done:not([disabled])")); k++) {
      var minus = await page.$$("[data-minus]");
      await minus[(k % (minus.length - 1)) + 1].click();
    }
    await shot("05-store-filled");
    await page.click("#done");
    var n = 0, endedShot = false;
    var evShots = 0, shotMg = 0, sizeShots = 0;
    while (n++ < 4000) {
      await page.waitForTimeout(150);
      if (await page.$(".ledger")) { await shot("99-ending"); endedShot = true; break; }
      var mg = await page.$(".mg-start:not([disabled])");
      if (mg) {
        await mg.click();
        if (!shotMg++) { await page.waitForTimeout(4000); await shot("60-minigame"); }
        await page.waitForSelector(".minigame", { state: "detached", timeout: 90000 });
        continue;
      }
      var roll = await page.$("#roll");
      if (roll) { try { await roll.click(); } catch (e) {} await page.waitForTimeout(300); continue; }
      var ev = await page.$(".card.event [data-choice]:not([disabled])");
      if (ev) {
        await page.waitForTimeout(900);
        if (evShots++ < 3) await shot("50-event-" + evShots);
        try { await ev.click(); } catch (e) {}
        continue;
      }
      var trail = await page.$("[data-opt='go']");
      if (trail) {
        if (sizeShots++ < 2) await shot("40-sizeup-" + sizeShots);
        try { await trail.click(); } catch (e) {}
        await page.waitForTimeout(1500);
        if (sizeShots < 3) await shot("41-moving-" + sizeShots);
        continue;
      }
      var go = await page.$("#go");
      var choice = await page.$("[data-choice]:not([disabled])");
      if (choice) {
        if (n < 40) await shot(String(n + 10).padStart(2, "0") + "-card");
        try { await choice.click(); } catch (e) {}
      } else if (go) {
        var label = await go.innerText();
        if (/Continue on the trail|Continue the voyage/.test(label)) {
          if (n < 4) await shot(String(n + 10).padStart(2, "0") + "-travel");
          try { await go.click(); } catch (e) {}
          await page.waitForTimeout(1200);
          if (n < 4) await shot(String(n + 10).padStart(2, "0") + "-moving");
          await page.waitForTimeout(800);
        } else {
          if (n < 12) await shot(String(n + 10).padStart(2, "0") + "-screen");
          try { await go.click(); } catch (e) {}
        }
      }
    }
    if (!endedShot) errors.push(fam + ": did not reach the ending");
    await page.close();
  }
  await browser.close();
  if (errors.length) { console.log("ERRORS:\n  " + errors.join("\n  ")); process.exit(1); }
  console.log("Browser test passed. Screenshots in " + out);
})();
