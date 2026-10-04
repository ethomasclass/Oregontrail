-- the near meadow: deep green grass going gold in the light, camas in bloom, a great white oak at the right
local nn = noise{seed=251, octaves=4, period=90}
local crest = function(x) return 354 + 5*nn(x, 0) - 7*math.exp(-((x - 880)/140)^2) + 3*math.exp(-((x - 60)/80)^2) end
local m = below(crest)
local gn = noise{seed=252, octaves=3, period=70, stretch={0, 4}}
work(m, {hand="body", fill=true, color=function(x, y)
  local c = mix("#6f7a3e", "#38422a", smoothstep(354, H, y))
  c = mix(c, "#9a9850", 0.4*math.exp(-((x - SUNX)/300)^2)*(1 - smoothstep(354, 392, y)))
  return shift(c, 0.025*gn(x, y), 0.003*gn(x, y), 0.008*gn(x, y))
end, angle=0, length={20, 60}, coverage=3.4, medium=0.15, clip=true, pal=landpal})
local ruts = ribbon({{0,392},{300,388},{600,394},{1000,389}}, 4.5) + ribbon({{0,402},{300,398},{600,404},{1000,399}}, 3.5)
work(ruts * m, {hand="body", fill=true, color="#8c8858", angle=0, length={20, 60}, coverage=1.4, medium=0.15, pal=landpal})
-- the oak: a short heavy trunk, limbs spreading wide, a broad crown in lumps
local OX = 878
local trunk = poly({{OX - 9, 366}, {OX - 6, 330}, {OX - 4, 300}, {OX + 6, 300}, {OX + 7, 332}, {OX + 12, 366}}, true)
local limbs = ribbon({{OX - 3, 312}, {OX - 30, 290}, {OX - 62, 276}}, {5, 3.5, 2})
  + ribbon({{OX + 3, 310}, {OX + 34, 292}, {OX + 70, 282}}, {5, 3.5, 2})
  + ribbon({{OX, 304}, {OX - 4, 276}, {OX + 2, 252}}, {4.5, 3.2, 2})
local lumps = {{OX - 70, 268, 34, 22}, {OX - 30, 250, 40, 28}, {OX + 14, 238, 42, 30}, {OX + 58, 252, 38, 26},
  {OX + 92, 272, 28, 18}, {OX - 92, 286, 22, 13}, {OX - 8, 278, 40, 18}, {OX + 50, 284, 34, 14}}
local crown = nil
for _, l in ipairs(lumps) do
  local e = ellipse(l[1], l[2], l[3], l[4])
  crown = crown and (crown + e) or e
end
crown = crown:roughen(3, 9, 253):roughen(1.2, 3, 254)
-- a few gaps where the sky shows through the lower crown
local gapn = noise{seed=255, octaves=3, period=14}
local holes = mask(function(x, y) return smoothstep(0.42, 0.55, gapn(x, y)) * smoothstep(262, 280, y) end)
crown = crown - holes
local wood = (trunk + limbs) - crown:shrink(3)
work(trunk + limbs, {hand="body", fill=true, tool="filbert 3", color=function(x, y)
  return mix("#6a6150", "#2f2c26", smoothstep(OX - 8, OX + 4, x))
end, angle=1.5708, length={6, 18}, coverage=3, medium=0.15, clip=true, pal=landpal})
local cn = noise{seed=256, octaves=3, period=8}
work(crown, {hand="body", fill=true, tool="filbert 4", color=function(x, y)
  local c = mix("#4b5634", "#2e3826", smoothstep(-0.3, 0.5, cn(x, y) + 0.015*(y - 250)))
  return c
end, angle=0, angle_jitter=0.9, length={4, 12}, coverage=3.4, medium=0.15, clip=true, pal=landpal})
-- light on the crown's upper-left lumps
local lit = mask(function(x, y)
  local best = 0
  for _, l in ipairs(lumps) do
    local dx, dy = (x - l[1] + 0.35*l[3]) / l[3], (y - l[2] + 0.45*l[4]) / l[4]
    best = math.max(best, 1 - smoothstep(0.25, 0.75, dx*dx + dy*dy))
  end
  return best
end) * crown:shrink(1.5)
work(lit, {hand="body", fill=true, tool="filbert 3", color=function(x, y)
  return mix("#8a8c4c", "#b0a660", smoothstep(-0.2, 0.5, cn(x + 30, y)))
end, angle=0, angle_jitter=0.9, length={3, 8}, coverage=2.2, medium=0.15, hug=false, clip=crown, pal=landpal})
-- its shadow pooled on the grass beneath
local shadow = mask(function(x, y)
  local dx, dy = (x - OX - 30) / 120, (y - 368) / 9
  return 1 - smoothstep(0.5, 1, dx*dx + dy*dy)
end):blur(2) * m - trunk
work(shadow, {hand="body", fill=true, color="#3d4528", angle=0, length={14, 40}, coverage=2, medium=0.15, clip=true, pal=landpal})
-- grass catching the light, and camas flowers in blue drifts (none in the wagon's stretch)
local grass = pile{{"yellow ochre",3},{"lead white",1},{"cobalt blue",0.25}}
work(below(function(x) return crest(x) + 4 end) - trunk, {hand="hatch", pile=grass, coverage=0.45, angle=-1.45, angle_jitter=0.3})
local fl = noise{seed=257, octaves=3, period=40}
local camas = mask(function(x, y)
  if x > 120 and x < 560 then return 0 end
  return smoothstep(0.25, 0.5, fl(x, y)) * smoothstep(crest(x) + 6, crest(x) + 14, y)
end)
stipple(camas, {width=1.6, color="#7e86b8", coverage=0.35, pressure={0.5, 0.9}, cluster=0.6, pal=landpal})
