-- a golden late-afternoon sky, the sun low on the left behind a thin gilded haze
local gn = noise{seed=101, octaves=3, period=260}
local function glow(x, y)
  return math.exp(-((x - SUNX)/(280 + 70*gn(x, 0)))^2) * smoothstep(HZ - 270, HZ, y)
end
local sn = noise{seed=102, octaves=3, period=180, stretch={0, 7}}
local function skycol(x, y)
  local t = clamp(y / HZ, 0, 1)
  local c = gradient({{0,"#6a83a6"},{0.35,"#9aa6b2"},{0.62,"#d4c69e"},{0.84,"#efd18e"},{1,"#f4dc9e"}}, t)
  c = mix(c, "#fbe39a", 0.75*glow(x, y))
  local v = sn(x, y)
  return shift(c, 0.02*v, 0.004*v, 0.008*v)
end
local skym = above(function(x) return HZ + 30 end)
work(skym, {hand="broad", color=skycol, angle=0, angle_jitter=0.02, length={140, 340}, coverage=5.2, medium=0.32, load=0.8, fill=true, pal=skypal})
blend(skym, {angle=0, coverage=1.2, length={150, 400}})
-- long stratus streaks, gilded underneath toward the sun; the middle top kept open
local bn = noise{seed=103, octaves=5, period=240, stretch={0, 6}}
local bn2 = noise{seed=104, octaves=4, period=120, stretch={0, 4}}
local function band(y, c, th) return 1 - smoothstep(0.5*th, th, math.abs(y - c)) end
local function c1(x) return 92 + 16*bn(x*0.5, 0) - 0.04*(x - 500) end
local function c2(x) return 205 + 12*bn(x, 90) + 0.03*(x - 500) end
local high = mask(function(x, y)
  local open = 1 - 0.9*math.exp(-((x - 500)/150)^2)
  return band(y, c1(x), 14*smoothstep(-0.1, 0.4, bn2(x, 40))) * open
end):blur(1.5)
local low = mask(function(x, y)
  local th = (22 + 10*bn2(x, 300)) * (1 - 0.7*math.exp(-((x - SUNX)/110)^2))
  return band(y, c2(x), th) * smoothstep(-0.3, 0.1, bn2(x*1.3, 500))
end):blur(1.5)
local function cloudcol(x, y)
  local hi = y < 150
  local body = hi and "#aaa5b0" or "#9b8f98"
  local under = hi and "#f2d6ae" or "#f6c986"
  local c = hi and c1(x) or c2(x)
  local lit = smoothstep(c - 4, c + 14, y) * (0.35 + 0.65*math.exp(-((x - SUNX)/320)^2))
  return mix(body, under, lit)
end
work((high + low):blur(3), {hand="broad", color=cloudcol, hug=false, angle=0, angle_jitter=0.02, curve={0, 0},
  length={90, 260}, coverage=2.2, medium=0.35, load=0.9, pressure={0.45, 0.7}, ramps={0.25, 0.35}, pal=skypal})
blend(high + low, {angle=0, coverage=1.4})
wait(24*60)
