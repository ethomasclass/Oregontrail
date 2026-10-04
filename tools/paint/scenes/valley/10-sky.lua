-- A soft, luminous morning sky: clear blue overhead, pearl and cream low, gentle clouds lit from the left.
local gn = noise{seed=221, octaves=3, period=260}
local function glow(x, y)
  return math.exp(-((x - SUNX)/(380 + 70*gn(x, 0)))^2) * smoothstep(HZ - 260, HZ, y)
end
local sn = noise{seed=223, octaves=3, period=180, stretch={0, 7}}
local function skycol(x, y)
  local t = clamp(y / HZ, 0, 1)
  local c = gradient({{0,"#5f80b0"},{0.3,"#88a3c4"},{0.6,"#c3cdd0"},{0.82,"#e9e3c8"},{1,"#f3e8c6"}}, t)
  c = mix(c, "#faefc4", 0.6*glow(x, y))
  local v = sn(x, y)
  return shift(c, 0.02*v, 0.004*v, 0.008*v)
end
local skym = above(function(x) return HZ + 30 end)
work(skym, {hand="broad", color=skycol, angle=0, angle_jitter=0.02, length={140, 340}, coverage=4.6, medium=0.35, load=0.8, fill=true, pal=skypal})
blend(skym, {angle=0, coverage=1.2, length={150, 400}})
-- soft fair-weather clouds: rounded tops lit cream on the left, pearl-gray bellies
local bn = noise{seed=227, octaves=5, period=110, warp={90, 24}}
local bn2 = noise{seed=229, octaves=4, period=150, stretch={0, 4}}
local function cline(x) return 168 + 14*bn2(x, 0) end
local mass = mask(function(x, y)
  local c = cline(x)
  local th = 34 + 14*bn(x, 300)
  local d = (y - c) / th
  local v = bn(x, y) + 0.45 - 1.6*d*d - 0.9*math.exp(-((x - 500)/190)^2) - 0.6*math.exp(-((x - HOODX)/90)^2)
  return smoothstep(0.0, 0.25, v) * (y < c + 0.6*th and 1 or 0)
end):blur(2)
local high = mask(function(x, y)
  local c = 70 + 14*bn2(x*0.6, 50) + 0.03*(x - 500)
  local calm = 1 - 0.8*math.exp(-((x - 500)/170)^2)
  return (1 - smoothstep(5, 12, math.abs(y - c))) * smoothstep(-0.1, 0.4, bn2(x, 90)) * calm
end):blur(1.5)
local function cloudcol(x, y)
  if y < 115 then return "#e7e2d8" end
  local u = bn(x - 6, y - 6) - bn(x + 6, y + 6)
  local lit = clamp(0.55 + 2.0*u - 0.012*(y - cline(x)), 0, 1)
  local c = gradient({{0, "#a3a6b2"}, {0.5, "#d3d1cc"}, {1, "#fcf4e0"}}, lit)
  return mix(c, "#fbefcf", 0.25*math.exp(-((x - SUNX)/250)^2))
end
work((mass + high):blur(2), {hand="broad", color=cloudcol, hug=false, angle=0, angle_jitter=0.15, curve={0.2, 0},
  length={50, 160}, coverage=2.4, medium=0.35, load=0.9, pressure={0.45, 0.75}, ramps={0.25, 0.35}, pal=skypal})
blend(mass + high, {angle=0, coverage=1.0, length={40, 140}})
wait(24*60)
