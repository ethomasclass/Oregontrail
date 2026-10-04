-- a hot hazy afternoon sky, the sun low in the west behind dust
local gn = noise{seed=17, octaves=3, period=260}
local function glow(x, y)
  return math.exp(-((x - SUNX)/(280 + 70*gn(x, 0)))^2) * smoothstep(HZ - 240, HZ, y)
end
local sn = noise{seed=31, octaves=3, period=180, stretch={0, 7}}
local function skycol(x, y)
  local t = clamp(y / HZ, 0, 1)
  local c = gradient({{0,"#7d8aa0"},{0.35,"#a0a5aa"},{0.65,"#cbbd9f"},{0.88,"#e2c894"},{1,"#e9d3a2"}}, t)
  c = mix(c, "#f2d79c", 0.6*glow(x, y))
  local v = sn(x, y)
  return shift(c, 0.02*v, 0.004*v, 0.008*v)
end
local skym = above(function(x) return HZ + 30 end)
work(skym, {hand="broad", color=skycol, angle=0, angle_jitter=0.02, length={140, 340}, coverage=4.6, medium=0.35, load=0.8, fill=true, pal=skypal})
blend(skym, {angle=0, coverage=1.2, length={150, 400}})
-- a few thin streaks of dusty cloud, low and brownish, and a faint high veil
local bn = noise{seed=9, octaves=5, period=240, stretch={0, 5}}
local bn2 = noise{seed=23, octaves=4, period=120, stretch={0, 4}}
local function band(y, c, th) return 1 - smoothstep(0.5*th, th, math.abs(y - c)) end
local high = mask(function(x, y)
  local c = 62 + 14*bn(x*0.5, 0) + 0.02*(x - 500)
  return band(y, c, 12*smoothstep(-0.1, 0.4, bn2(x, 40))) * (1 - 0.8*math.exp(-((x - 500)/180)^2))
end):blur(1.5)
local low = mask(function(x, y)
  local c = 205 + 12*bn(x, 90) + 0.02*(x - 500)
  local th = (20 + 10*bn2(x, 300)) * (1 - 0.6*math.exp(-((x - SUNX)/120)^2))
  return band(y, c, th) * smoothstep(-0.3, 0.1, bn2(x*1.3, 500))
end):blur(1.5)
local function cloudcol(x, y)
  local hi = y < 130
  local body = hi and "#aaa6a8" or "#a29386"
  local under = hi and "#e6d2b4" or "#efc78e"
  local c2 = hi and (62 + 14*bn(x*0.5, 0)) or (205 + 12*bn(x, 90))
  local lit = smoothstep(c2 - 4, c2 + 12, y) * (0.3 + 0.7*math.exp(-((x - SUNX)/320)^2))
  return mix(body, under, lit)
end
work((high + low):blur(3), {hand="broad", color=cloudcol, hug=false, angle=0, angle_jitter=0.02, curve={0, 0},
  length={90, 260}, coverage=2.0, medium=0.35, load=0.9, pressure={0.45, 0.7}, ramps={0.25, 0.35}, pal=skypal})
blend(high + low, {angle=0, coverage=1.6})
wait(24*60)
