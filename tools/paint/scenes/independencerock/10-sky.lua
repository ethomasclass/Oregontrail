-- An evening sky: the glow low on the right, peach and rose under a deepening blue.
local gn = noise{seed=101, octaves=3, period=260}
local function glow(x, y)
  return math.exp(-((x - SUNX)/(300 + 70*gn(x, 0)))^2) * smoothstep(HZ - 240, HZ, y)
end
local sn = noise{seed=103, octaves=3, period=180, stretch={0, 7}}
local function skycol(x, y)
  local t = clamp(y / HZ, 0, 1)
  local c = gradient({{0,"#526893"},{0.32,"#8193b0"},{0.6,"#c3b5ac"},{0.82,"#e9c8a0"},{1,"#f2d6aa"}}, t)
  c = mix(c, "#fadb9c", 0.75*glow(x, y))
  local v = sn(x, y)
  return shift(c, 0.02*v, 0.004*v, 0.008*v)
end
local skym = above(function(x) return HZ + 30 end)
work(skym, {hand="broad", color=skycol, angle=0, angle_jitter=0.02, length={140, 340}, coverage=4.6, medium=0.35, load=0.8, fill=true, pal=skypal})
blend(skym, {angle=0, coverage=1.2, length={150, 400}})
-- long evening banks: a broken high band and a low bank lit rose from beneath near the sun
local bn = noise{seed=107, octaves=5, period=240, stretch={0, 5}}
local bn2 = noise{seed=109, octaves=4, period=120, stretch={0, 4}}
local function band(y, c, th) return 1 - smoothstep(0.5*th, th, math.abs(y - c)) end
local function c1(x) return 82 + 16*bn(x*0.5, 0) - 0.03*(x - 500) end
local function c2(x) return 186 + 12*bn(x, 90) + 0.025*(x - 500) end
local high = mask(function(x, y)
  local calm = 1 - 0.75*math.exp(-((x - 480)/160)^2)
  return band(y, c1(x), 18*smoothstep(-0.2, 0.35, bn2(x, 40))) * calm
end):blur(1.5)
local low = mask(function(x, y)
  local th = (28 + 12*bn2(x, 300)) * (1 - 0.7*math.exp(-((x - SUNX)/110)^2))
  return band(y, c2(x), th) * smoothstep(-0.35, 0.05, bn2(x*1.3, 500))
end):blur(1.5)
local function cloudcol(x, y)
  local hi = y < 135
  local body = hi and "#a7a3b3" or "#8d8796"
  local under = hi and "#f0d2b6" or "#f2bf96"
  local c = hi and c1(x) or c2(x)
  local lit = smoothstep(c - 4, c + 14, y) * (0.3 + 0.7*math.exp(-((x - SUNX)/330)^2))
  return mix(body, under, lit)
end
work((high + low):blur(3), {hand="broad", color=cloudcol, hug=false, angle=0, angle_jitter=0.02, curve={0, 0},
  length={90, 260}, coverage=2.2, medium=0.35, load=0.9, pressure={0.45, 0.7}, ramps={0.25, 0.35}, pal=skypal})
blend(high + low, {angle=0, coverage=1.4})
wait(24*60)
