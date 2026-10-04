-- the near plain: tall grass gone gold in the low sun, a worn trail, sage on the right
local nn = noise{seed=131, octaves=4, period=90}
local crest = function(x) return 354 + 5*nn(x, 0) + 6*math.exp(-((x-80)/90)^2) - 7*math.exp(-((x-850)/130)^2) end
local m = below(crest)
local gn = noise{seed=132, octaves=3, period=50, stretch={0, 5}}
work(m, {hand="body", fill=true, color=function(x, y)
  local sun = math.exp(-((x - SUNX)/420)^2)
  local c = mix("#8a7a45", "#4a4128", smoothstep(352, H, y))
  c = mix(c, "#b4944e", 0.35*sun*(1 - smoothstep(352, 395, y)))
  return shift(c, 0.03*gn(x, y), 0, 0.01*gn(x, y))
end, angle=0, angle_jitter=0.04, length={20, 60}, coverage=3.6, medium=0.15, clip=true, pal=landpal})
wait(8*60)
local ruts = ribbon({{0,390},{300,387},{600,392},{1000,388}}, 4) + ribbon({{0,404},{300,401},{600,406},{1000,402}}, 3.5)
work(ruts * m, {hand="body", fill=true, tool="filbert 5", color="#9c8459", angle=0, length={20, 60}, coverage=1.4, medium=0.15, pal=landpal})
-- sagebrush on the right, silvery
local sb = {}
local sn = noise{seed=133, octaves=2, period=20}
for _, p in ipairs({{640, 362, 12}, {690, 372, 16}, {760, 358, 10}, {820, 368, 20}, {905, 360, 14}, {960, 376, 22}, {600, 385, 10}, {880, 396, 18}}) do
  sb[#sb + 1] = ellipse(p[1], p[2], p[3], p[3]*0.45)
end
local sage = (union(sb) * above(function(x) return 420 end)):roughen(3, 5, 134, 1)
work(sage, {hand="body", fill=true, tool="filbert 3", color=function(x, y)
  return mix("#9b9b82", "#5f5f4c", clamp(0.5 + 0.9*sn(x, y), 0, 1))
end, angle=-1.2, angle_jitter=0.8, length={4, 10}, coverage=3, medium=0.15, clip=sage:grow(1), pal=landpal})
local grass = pile{{"yellow ochre",3},{"raw umber",0.6},{"lead white",0.6},{"chrome yellow",0.3}}
local tufts = below(function(x) return crest(x) + 4 end) * mask(function(x, y)
  return (1 - smoothstep(90, 140, x)) + smoothstep(540, 640, x)*0.8
end)
work(tufts, {hand="hatch", pile=grass, coverage=0.4, angle=-1.45, angle_jitter=0.3})
