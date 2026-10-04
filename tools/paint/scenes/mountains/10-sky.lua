-- A cool, luminous high-country sky: deep blue overhead, silver-gold low on the left,
-- big sunlit cloud masses gathering where the peaks will stand.
local gn = noise{seed=141, octaves=3, period=260}
local function glow(x, y)
  return math.exp(-((x - SUNX)/(340 + 70*gn(x, 0)))^2) * smoothstep(HZ - 260, HZ, y)
end
local sn = noise{seed=143, octaves=3, period=180, stretch={0, 7}}
local function skycol(x, y)
  local t = clamp(y / HZ, 0, 1)
  local c = gradient({{0,"#4a6a9e"},{0.3,"#7392bb"},{0.6,"#b2c0cc"},{0.85,"#dcdcca"},{1,"#e8e2c6"}}, t)
  c = mix(c, "#f6e8b8", 0.6*glow(x, y))
  local v = sn(x, y)
  return shift(c, 0.02*v, 0.004*v, 0.008*v)
end
local skym = above(function(x) return HZ + 30 end)
work(skym, {hand="broad", color=skycol, angle=0, angle_jitter=0.02, length={140, 340}, coverage=4.6, medium=0.35, load=0.8, fill=true, pal=skypal})
blend(skym, {angle=0, coverage=1.2, length={150, 400}})
-- cloud masses: billowing banks behind the range (the peaks will cut into them), lit from the left,
-- gray-blue in their shaded bellies; a thin high band
local bn = noise{seed=147, octaves=5, period=150, warp={120, 30}}
local bn2 = noise{seed=149, octaves=4, period=120, stretch={0, 4}}
local mass = mask(function(x, y)
  local c = 150 + 14*bn2(x, 0)
  local th = 46 + 20*bn(x, 300)
  local d = (y - c) / th
  local v = bn(x, y) + 0.62 - 1.4*d*d - 0.5*math.exp(-((x - 480)/120)^2)
  return smoothstep(0.0, 0.25, v)
end):blur(2)
local high = mask(function(x, y)
  local c = 62 + 14*bn2(x*0.6, 50) + 0.03*(x - 500)
  local calm = 1 - 0.8*math.exp(-((x - 500)/170)^2)
  return (1 - smoothstep(6, 14, math.abs(y - c))) * smoothstep(-0.1, 0.4, bn2(x, 90)) * calm
end):blur(1.5)
local function cloudcol(x, y)
  local hi = y < 105
  if hi then return mix("#b5b7c2", "#f0e6d0", 0.5) end
  -- lit on the upper-left, shaded below and to the right
  local u = bn(x - 6, y - 6) - bn(x + 6, y + 6)
  local lit = clamp(0.5 + 2.2*u - 0.006*(y - 150), 0, 1)
  return gradient({{0, "#8e95a8"}, {0.5, "#c4c3c4"}, {1, "#faf2de"}}, lit)
end
work(mass:blur(2), {hand="broad", color=cloudcol, hug=false, angle=0, angle_jitter=0.15, curve={0.2, 0},
  length={50, 160}, coverage=2.6, medium=0.35, load=0.9, pressure={0.45, 0.75}, ramps={0.25, 0.35}, pal=skypal})
blend(mass, {angle=0, coverage=1.0, length={40, 140}})
wait(24*60)
