-- the near ground: cracked alkali crust and drifted sand; what the emigrants threw away lies half-buried
local nn = noise{seed=211, octaves=4, period=90}
local crest = function(x) return 352 + 4*nn(x, 0) - 6*math.exp(-((x - 860)/150)^2) end
local m = below(crest)
local gn = noise{seed=212, octaves=3, period=70, stretch={0, 4}}
local cells = worley{seed=213, period=16, jitter=0.9}
work(m, {hand="body", fill=true, color=function(x, y)
  -- a low drift of warmer sand at the near edge, so this ground stands in front of the white flats
  local c = mix("#d3c3a0", "#9c8a68", smoothstep(356, H, y))
  c = mix(c, "#c2ae88", 0.6*(1 - smoothstep(crest(x), crest(x) + 7, y)))
  c = shift(c, 0.03*gn(x, y), 0.003*gn(x, y), 0.01*gn(x, y))
  return c
end, angle=0, length={20, 60}, coverage=3.4, medium=0.15, clip=true, pal=landpal})
-- the crust's cracks: faint gray lines along the cell walls, nearer cells larger
local cracks = mask(function(x, y)
  if y < crest(x) + 6 then return 0 end
  local s = 1 + (y - 352) / 40
  local a, b, c = cells:at(x / s, y / s * 1.8)
  local wall
  if type(a) == "table" then wall = a.wall or a.edge or a[3] or (a.f2 and a.f1 and (a.f2 - a.f1)) or 1 else wall = c or 1 end
  wall = wall / s
  return (1 - smoothstep(0.01, 0.04, wall)) * smoothstep(0.0, 0.4, gn(x, y + 300))
end)
work(cracks * m, {hand="detail", color="#a89c84", coverage=0.7, medium=0.2, clip=true, pal=landpal})
local ruts = ribbon({{0,391},{300,388},{600,393},{1000,389}}, 5) + ribbon({{0,401},{300,398},{600,403},{1000,399}}, 4)
work(ruts * m, {hand="body", fill=true, color="#bfb092", angle=0, length={20, 60}, coverage=1.6, medium=0.15, pal=landpal})
-- what was left behind, all at the right, away from the wagon's stretch
-- 1. a wagon wheel sunk to its hub, gray wood and a rusted iron tire
local wx, wy, wr = 712, 386, 30
local ground = function(x) return wy + 4 + 1.5*nn(x, 9) end
local above_ground = mask(function(x, y) return y < ground(x) and 1 or 0 end)
local rim = (ellipse(wx, wy, wr, wr*0.86) - ellipse(wx, wy, wr - 3.2, wr*0.86 - 3)) * above_ground
local spokes = nil
for i = 0, 11 do
  local a = i * math.pi / 6 + 0.13
  local r = ribbon({{wx + 4*math.cos(a), wy + 4*0.86*math.sin(a)}, {wx + (wr - 2)*math.cos(a), wy + (wr - 2)*0.86*math.sin(a)}}, 0.9)
  spokes = spokes and (spokes + r) or r
end
spokes = spokes * above_ground
local hub = ellipse(wx, wy, 5, 4.4) * above_ground
-- its shadow on the sand, to the lower right
local shadow = mask(function(x, y)
  local dx, dy = x - wx - 10, (y - ground(x) - 3) * 3.2
  return (1 - smoothstep(0.7, 1, math.sqrt(dx*dx/(38*38) + dy*dy/(20*20)))) * (y > ground(x) - 1 and 1 or 0)
end):blur(1.5)
work(shadow, {hand="body", fill=true, color="#9d8f78", angle=0, length={8, 24}, coverage=1.6, medium=0.2, clip=true, pal=landpal})
work(spokes, {hand="detail", color=function(x, y) return mix("#a8987e", "#6e604e", smoothstep(wx - 20, wx + 20, x)) end, coverage=2.4, medium=0.12, clip=true, pal=landpal})
work(rim + hub, {hand="detail", color=function(x, y)
  return mix("#8a6a4c", "#4b3b30", smoothstep(wx - 24, wx + 20, x) * 0.8 + 0.2*smoothstep(wy - wr, wy, y))
end, coverage=2.6, medium=0.12, clip=true, pal=landpal})
-- sand drifted up against it
local drift = mask(function(x, y)
  local g = ground(x)
  return (1 - smoothstep(wr - 6, wr + 4, math.abs(x - wx))) * smoothstep(g - 4, g - 1, y) * (1 - smoothstep(g + 2, g + 6, y))
end):blur(1)
work(drift, {hand="body", fill=true, tool="filbert 3", color="#d8cbb0", angle=0, length={6, 16}, coverage=2, medium=0.15, clip=true, pal=landpal})
-- 2. a discarded trunk, lid sprung, and a stave barrel on its side; a stove beyond
local trunk = poly({{812, 372}, {848, 370}, {850, 384}, {814, 386}})
local lid = poly({{811, 372}, {847, 370}, {852, 362}, {816, 364}})
work(trunk, {hand="detail", color=function(x, y) return mix("#7a5a3e", "#5a4232", smoothstep(812, 850, x)) end, coverage=2.6, medium=0.12, clip=true, pal=landpal})
work(lid, {hand="detail", color="#9a7a58", coverage=2.4, medium=0.12, clip=true, pal=landpal})
work(ribbon({{812, 378}, {850, 377}}, 0.8), {hand="detail", color="#3e3430", coverage=1.6, medium=0.12, clip=true, pal=landpal})
work(mask(function(x, y) local dx, dy = (x - 842)/26, (y - 387)/4 return 1 - smoothstep(0.6, 1, dx*dx + dy*dy) end), {hand="body", fill=true, color="#a09078", angle=0, length={8, 20}, coverage=1.4, medium=0.2, clip=true, pal=landpal})
local barrel = (ellipse(612, 369, 19, 10) * mask(function(x, y) return y < 375 + 0.08*(x - 600) and 1 or 0 end)):roughen(0.6, 4, 214)
work(barrel, {hand="detail", color=function(x, y) return mix("#b09470", "#5e4c3c", smoothstep(361, 376, y)) end, angle=0, coverage=2.4, medium=0.12, clip=true, pal=landpal})
work((ribbon({{601, 360}, {600, 377}}, 0.9) + ribbon({{622, 360}, {623, 378}}, 0.9)) * barrel, {hand="detail", color="#4a3c34", coverage=1.6, medium=0.12, clip=true, pal=landpal})
work(ellipse(630, 369, 3.5, 8) * mask(function(x, y) return y < 377 and 1 or 0 end), {hand="detail", color="#7a6450", coverage=2, medium=0.12, clip=true, pal=landpal})
work(mask(function(x, y) local dx, dy = (x - 618)/30, (y - 377)/4 return 1 - smoothstep(0.6, 1, dx*dx + dy*dy) end), {hand="body", fill=true, color="#a09078", angle=0, length={8, 20}, coverage=1.4, medium=0.2, clip=true, pal=landpal})
local stove = rect(926, 350, 20, 16) + rect(934, 334, 4, 16)
work(stove, {hand="detail", color=function(x, y) return mix("#5a504a", "#3a3432", smoothstep(930, 944, x)) end, coverage=2.4, medium=0.12, clip=true, pal=landpal})
-- 3. at the far left, a broken ox yoke half-buried in drift
local yoke = ribbon({{30, 372}, {55, 366}, {80, 368}, {104, 374}}, 2.2)
work(yoke, {hand="detail", color="#8a7258", coverage=2.4, medium=0.12, clip=true, pal=landpal})
work(ribbon({{48, 366}, {46, 378}}, 1) + ribbon({{88, 369}, {90, 380}}, 1), {hand="detail", color="#6a5644", coverage=2, medium=0.12, clip=true, pal=landpal})
-- dry tufts of greasewood, sparse
local tufts = ellipse(560, 360, 9, 4) + ellipse(980, 372, 12, 5) + ellipse(118, 364, 7, 3)
work(tufts:roughen(1.5, 4, 215), {hand="hatch", color="#8e8466", angle=-1.4, angle_jitter=0.5, coverage=1.6, clip=true, pal=landpal})
