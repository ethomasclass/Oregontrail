-- the North Platte valley floor, the river, and Chimney Rock standing on its clay cone
local mn = noise{seed=71, octaves=4, period=150}
local crest = function(x) return 298 + 5*mn(x, 0) - 4*math.exp(-((x-380)/140)^2) end
-- the rock's silhouette: a concave cone and a slender spire with a slight cap
local en = noise{seed=72, octaves=4, period=26}
local function halfwidth(y)
  if y >= SHOULDER then
    local t = clamp((y - SHOULDER) / (ROCKFOOT - SHOULDER), 0, 1)
    return 24 + 118 * t^1.7
  end
  local t = clamp((y - SPIRETOP) / (SHOULDER - SPIRETOP), 0, 1)
  local w = 8 + 5*t^1.5
  w = w + 2.2*math.exp(-((y - (SPIRETOP + 8))/5)^2)   -- the weathered cap
  w = w + 3*math.exp(-((y - (SHOULDER - 8))/6)^2)     -- a ledge where the spire leaves the cone
  return w
end
local function axis(y)
  -- the spire leans a hair; the cone's left flank runs a little longer
  return ROCKX + 0.03*(y - SHOULDER)
end
ROCKM = mask(function(x, y)
  if y < SPIRETOP - 4 or y > ROCKFOOT + 6 then return 0 end
  local hw = halfwidth(y)
  local dx = x - axis(y)
  if dx < 0 and y > SHOULDER then hw = hw * (1 + 0.15*smoothstep(SHOULDER, ROCKFOOT, y)) end
  hw = hw + 2.2*en(x*0.3, y)
  local top = smoothstep(SPIRETOP - 2, SPIRETOP + 3 + 2*en(x, 0), y)
  return (1 - smoothstep(hw - 1, hw + 1, math.abs(dx))) * top
end):soften(0.6)
local floor = below(crest)
local valley = floor - ROCKM
local gn = noise{seed=73, octaves=3, period=90, stretch={0, 4}}
work(valley, {hand="body", fill=true, color=function(x, y)
  local lit = math.exp(-((x - SUNX)/420)^2)
  local c = mix("#8b8250", "#c4a45a", 0.55*lit)
  c = mix(c, "#7e7a4a", smoothstep(HZ + 18, H, y) * 0.5)
  return shift(c, 0.03*gn(x, y), 0, 0.01*gn(x, y))
end, angle=0, angle_jitter=0.05, length={18, 70}, coverage=4.2, medium=0.12, clip=true, pal=landpal})
-- the rock: lit from the left by the low sun, violet-gray in its shadow, clay strata across it
local sn = noise{seed=74, octaves=3, period=30, stretch={0, 9}}
local gul = noise{seed=75, octaves=3, period=18, stretch={1.5708, 5}}
local function rockcol(x, y)
  local hw = halfwidth(y)
  local t = (x - axis(y)) / hw
  local lit = 1 - smoothstep(-0.12, 0.18, t + 0.2*gul(x, y))
  local spire = 1 - smoothstep(SHOULDER - 6, SHOULDER + 14, y)
  local light = spire > 0.5 and "#f6c47e" or "#ecc086"
  local half = spire > 0.5 and "#c4825a" or "#bd8a68"
  local shade = spire > 0.5 and "#6a5462" or "#735e68"
  local c = gradient({{0, shade}, {0.35, mix(shade, half, 0.6)}, {0.7, half}, {1, light}}, lit)
  -- strata: soft horizontal bands of paler and redder clay
  local s = sn(x, y)
  c = shift(c, 0.035*s, 0.006*s, 0.01*s)
  -- gullies down the cone
  c = shift(c, -0.07*math.max(0, gul(x, y))*(1 - spire), 0, -0.004*math.max(0, gul(x, y)))
  -- grass creeping up the foot of the cone
  -- the lower slopes are grassed over, the grass reaching up the gullies in tongues
  local foot = smoothstep(ROCKFOOT - 52 + 16*gul(x*0.6, 0), ROCKFOOT - 8, y)
  local grass = mix("#7f7448", "#a99a5a", lit)
  c = mix(c, grass, 0.85*foot)
  return c
end
work(ROCKM, {hand="body", fill=true, tool="filbert 4", color=rockcol, angle=function(x, y)
  if y < SHOULDER then return 1.5708 end
  local t = clamp((x - axis(y)) / halfwidth(y), -1, 1)
  return 1.5708 - 0.75*t
end, length={8, 26}, coverage=4, medium=0.15, load=0.85, clip=true, pal=landpal})
-- next day, the rock set: the shadow side laid again, darker and cooler, so the form turns
-- decisively away from the sun, and the sunlit face restated warm
wait(24*60)
local LITM = mask(function(x, y)
  if ROCKM:at(x, y) < 0.5 then return 0 end
  local t = (x - axis(y)) / halfwidth(y)
  return (1 - smoothstep(-0.35, -0.05, t + 0.2*gul(x, y))) * (1 - smoothstep(ROCKFOOT - 44, ROCKFOOT - 20, y))
end):blur(1)
work(LITM, {hand="body", fill=true, tool="filbert 3", color=function(x, y)
  local c = y < SHOULDER + 4 and "#f4be7c" or "#e8b884"
  local s = sn(x, y)
  return shift(c, 0.03*s, 0.006*s, 0.01*s)
end, angle=1.5708, length={6, 18}, coverage=2.6, medium=0.15, load=0.85, hug=false, clip=ROCKM, pal=landpal})
local SHADEM = mask(function(x, y)
  if ROCKM:at(x, y) < 0.5 then return 0 end
  local t = (x - axis(y)) / halfwidth(y)
  return smoothstep(0.0, 0.3, t + 0.2*gul(x, y)) * (1 - smoothstep(ROCKFOOT - 40, ROCKFOOT - 12, y))
end):blur(1)
work(SHADEM, {hand="body", fill=true, tool="filbert 3", color=function(x, y)
  local spire = y < SHOULDER + 4
  local c = spire and "#5f4c5a" or "#6a5862"
  local s = sn(x, y)
  c = shift(c, 0.03*s, 0.004*s, 0.006*s)
  -- reflected warm light from the valley low on the shadow side
  return mix(c, "#7e6a60", 0.4*smoothstep(SHOULDER + 20, ROCKFOOT - 20, y))
end, angle=1.5708, length={6, 18}, coverage=3.6, medium=0.15, load=0.9, hug=false, clip=ROCKM, pal=landpal})
-- the river: a broad pale ribbon catching the sky, braided around sandbars
local river = ribbon({{0,333},{90,328},{180,322},{260,327},{340,336},{450,331},{540,322},{640,320},{760,327},{860,334},{940,327},{1000,322}},
  {6, 3, 2, 4, 7, 3, 2, 3, 5, 6, 3, 2})
local rbreak = noise{seed=77, octaves=2, period=80}
river = river * mask(function(x, y) return smoothstep(-0.5, -0.2, rbreak(x, 0)) end)
work(river, {hand="body", fill=true, color=function(x, y)
  return mix("#e6d6ad", "#f1dfae", math.exp(-((x - SUNX)/260)^2))
end, angle=0, length={20, 60}, coverage=2, medium=0.2, clip=true, pal=landpal})
-- the rock's shadow lies long across the valley floor to the right
local castm = mask(function(x, y)
  local d = x - (ROCKX + 60)
  if d < 0 or y < ROCKFOOT - 4 or y > ROCKFOOT + 10 then return 0 end
  return (1 - smoothstep(0, 230, d)) * (1 - smoothstep(4, 10, math.abs(y - ROCKFOOT - 2 - 0.01*d)))
end):blur(2) - ROCKM
work(castm, {hand="body", fill=true, color=function(x, y) return "#6f6c4a" end, angle=0, length={20, 60}, coverage=1.6, medium=0.2, clip=true, pal=landpal})
-- a dark line of willow and cottonwood scrub along the far bank, broken
local bn = noise{seed=76, octaves=3, period=60}
local scrub = mask(function(x, y)
  local c = 318 + 3*bn(x, 7)
  local on = smoothstep(0.05, 0.3, bn(x, 40))
  return on * (1 - smoothstep(0, 3 + 2*bn(x, 9), math.abs(y - c + 1)))
end) - ROCKM
work(scrub, {hand="body", fill=true, tool="filbert 4", color="#5d5a3a", angle=0, length={6, 18}, coverage=2, medium=0.15, clip=true, pal=landpal})
wait(24*60)
