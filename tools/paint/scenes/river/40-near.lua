-- the near bank where the wagon waits: grass on the left, falling to a mud and gravel bar on the
-- right where the river laps; willows at the left edge, reeds at the right
local nn = noise{seed=91, octaves=4, period=90}
local base = curve({{0, 350}, {300, 355}, {560, 357}, {680, 370}, {780, 375}, {1000, 371}})
local crest = function(x) return base(x) + 4*nn(x, 0) end
local m = below(crest)
local gn = noise{seed=92, octaves=3, period=50, stretch={0, 5}}
local function groundcol(x, y)
  local grassy = 1 - smoothstep(560, 700, x)
  local d = smoothstep(crest(x), H, y)
  local grass = mix("#7e7647", "#4a4630", d)
  local mud = mix(mix("#8f7d60", "#a08c6a", smoothstep(700, 900, x)), "#5a4a38", d)
  local c = mix(mud, grass, grassy)
  return shift(c, 0.03*gn(x, y), 0, 0.01*gn(x, y))
end
work(m, {hand="body", fill=true, color=groundcol, angle=0, angle_jitter=0.04, length={20, 60}, coverage=3.8, medium=0.15, clip=true, pal=landpal})
-- the wet edge of the bar, darker just under the waterline
local wet = (m - below(function(x) return crest(x) + 7 end)) * mask(function(x, y) return smoothstep(600, 690, x) end)
work(wet, {hand="body", fill=true, tool="filbert 4", color="#6a5844", angle=0, length={20, 60}, coverage=2.2, medium=0.15, clip=true, pal=landpal})
wait(10*60)
-- the river lapping at the bar: a broken pale line and a few ripples just off it
local lap = ribbon({{600, base(600) - 0.5}, {700, base(700) - 0.5}, {820, base(820) - 0.5}, {1000, base(1000) - 0.5}}, 1.0)
  * mask(function(x, y) return smoothstep(600, 660, x) end)
work(lap, {hand="body", tool="filbert 3", color="#d8cdb2", angle=0, length={20, 50}, coverage=1.2, medium=0.25, load=0.5, hug=false, pal=landpal})
local rip = ribbon({{650, base(650) - 5}, {760, base(760) - 5.5}, {880, base(880) - 5}}, 0.7)
  + ribbon({{720, base(720) - 10}, {840, base(840) - 10.5}, {980, base(980) - 10}}, 0.6)
work(rip, {hand="body", tool="filbert 3", color="#b9aa8c", angle=0, length={20, 50}, coverage=0.9, medium=0.3, load=0.4, hug=false, pal=landpal})
-- a stranded drift log on the bar
local log = ribbon({{742, 388}, {790, 384}, {826, 386}}, 2.6)
work(log, {hand="detail", fill=true, tool="round 1.8", color=function(x, y) return mix("#5a4c3e", "#a39478", 1 - smoothstep(383, 386, y)) end,
  angle=-0.05, coverage=3, medium=0.1, clip=true, pal=landpal})
-- willows at the left edge
local wb = noise{seed=93, octaves=3, period=24, kind="billow"}
local willow = (below(function(x) return 312 + 40*smoothstep(30, 125, x) - 14*wb:at01(x, 0) end) * above(function(x) return crest(x) + 6 end) * mask(function(x, y) return 1 - smoothstep(118, 132, x) end)):roughen(3, 7, 95, 1)
local tl = noise{seed=94, octaves=3, period=10}
work(willow, {hand="body", fill=true, tool="filbert 4", color=function(x, y)
  local c = mix("#5e6148", "#3c3e2c", smoothstep(318, 360, y))
  return mix(c, "#8e8a5a", clamp((tl(x, y) - tl(x + 4, y + 3))*3, 0, 1)*0.6)
end, angle=-1.3, angle_jitter=0.6, length={5, 16}, coverage=3.5, medium=0.15, clip=willow:grow(1), pal=landpal})
-- grass along the top of the bank, and reeds at the right edge
local grass = pile{{"yellow ochre",2},{"raw umber",1},{"lead white",0.4}}
local tops = below(function(x) return crest(x) + 3 end) * above(function(x) return crest(x) + 26 end) * mask(function(x, y) return (1 - smoothstep(110, 150, x)) + smoothstep(470, 520, x)*(1 - smoothstep(560, 620, x)) end)
work(tops, {hand="hatch", pile=grass, coverage=0.35, angle=-1.45, angle_jitter=0.3})
local reeds = below(function(x) return crest(x) - 14 - 10*wb:at01(x*2, 3) end) * mask(function(x, y) return smoothstep(900, 940, x) end) * above(function(x) return crest(x) + 10 end)
work(reeds, {hand="hatch", color=function(x, y) return mix("#8a7c50", "#4e4a33", smoothstep(340, 380, y)) end, coverage=1.2, angle=-1.5, angle_jitter=0.2, pal=landpal})
