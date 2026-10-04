-- A big clear late-afternoon sky: warm glow low on the left, cooler blue behind the spire.
local gn = noise{seed=41, octaves=3, period=260}
local function glow(x, y)
  return math.exp(-((x - SUNX)/(330 + 70*gn(x, 0)))^2) * smoothstep(HZ - 250, HZ, y)
end
local sn = noise{seed=43, octaves=3, period=180, stretch={0, 7}}
local function skycol(x, y)
  local t = clamp(y / HZ, 0, 1)
  local c = gradient({{0,"#55709a"},{0.3,"#7f96b6"},{0.6,"#b9bcb8"},{0.82,"#e3cfa3"},{1,"#f0dcae"}}, t)
  -- away from the sun the low sky turns a faint rose-gray
  local away = smoothstep(450, 1000, x) * smoothstep(0.45, 1, t)
  c = mix(c, "#d4bcae", 0.45*away)
  c = mix(c, "#fbe6a6", 0.75*glow(x, y))
  local v = sn(x, y)
  return shift(c, 0.02*v, 0.004*v, 0.008*v)
end
local skym = above(function(x) return HZ + 30 end)
work(skym, {hand="broad", color=skycol, angle=0, angle_jitter=0.02, length={140, 340}, coverage=4.6, medium=0.35, load=0.8, fill=true, pal=skypal})
blend(skym, {angle=0, coverage=1.2, length={150, 400}})
-- clouds: high thin wisps, and a low bank over the glow on the left that parts near the sun;
-- the sky behind the spire is kept clear so the landmark reads
local bn = noise{seed=47, octaves=5, period=240, stretch={0, 5}}
local bn2 = noise{seed=53, octaves=4, period=120, stretch={0, 4}}
local function band(y, c, th) return 1 - smoothstep(0.5*th, th, math.abs(y - c)) end
local clear = function(x) return 1 - 0.9*math.exp(-((x - ROCKX)/110)^2) end
local high = mask(function(x, y)
  local c = 64 + 16*bn(x*0.5, 0) + 0.02*(x - 500)
  local calm = 1 - 0.7*math.exp(-((x - 500)/170)^2)   -- the title sits center-top
  return band(y, c, 14*smoothstep(-0.2, 0.35, bn2(x, 40))) * calm
end):blur(1.5)
local low = mask(function(x, y)
  local c = 176 + 12*bn(x, 90) + 0.03*(x - 300)
  local th = (26 + 12*bn2(x, 300)) * (1 - 0.7*math.exp(-((x - SUNX)/110)^2))
  return band(y, c, th) * smoothstep(-0.35, 0.05, bn2(x*1.3, 500)) * clear(x)
end):blur(1.5)
local function cloudcol(x, y)
  local hi = y < 120
  local body = hi and "#aeaab4" or "#968e98"
  local under = hi and "#f1dcb8" or "#f3cd94"
  local c2 = hi and (64 + 16*bn(x*0.5, 0) + 0.02*(x - 500)) or (176 + 12*bn(x, 90) + 0.03*(x - 300))
  local lit = smoothstep(c2 - 4, c2 + 14, y) * (0.35 + 0.65*math.exp(-((x - SUNX)/360)^2))
  return mix(body, under, lit)
end
work((high + low):blur(3), {hand="broad", color=cloudcol, hug=false, angle=0, angle_jitter=0.02, curve={0, 0},
  length={90, 260}, coverage=2.2, medium=0.35, load=0.9, pressure={0.45, 0.7}, ramps={0.25, 0.35}, pal=skypal})
blend(high + low, {angle=0, coverage=1.4})
wait(24*60)
