-- a hazy subtropical morning: pale warm air, soft humid cumulus heaped low behind the peaks
local gn = noise{seed=17, octaves=3, period=260}
local function glow(x, y)
  return math.exp(-((x - SUNX)/(320 + 70*gn(x, 0)))^2) * smoothstep(HZ - 280, HZ, y)
end
local sn = noise{seed=31, octaves=3, period=180, stretch={0, 7}}
local function skycol(x, y)
  local t = clamp(y / HZ, 0, 1)
  local c = gradient({{0,"#8f9eaa"},{0.35,"#b3b8b3"},{0.7,"#d8cca9"},{1,"#e9d8ad"}}, t)
  c = mix(c, "#f3dfab", 0.55*glow(x, y))
  local v = sn(x, y)
  return shift(c, 0.018*v, 0.004*v, 0.008*v)
end
local skym = above(function(x) return HZ + 30 end)
work(skym, {hand="broad", color=skycol, angle=0, angle_jitter=0.02, length={140, 340}, coverage=4.6, medium=0.35, load=0.8, fill=true, pal=skypal})
blend(skym, {angle=0, coverage=1.2, length={150, 400}})
-- cumulus heaps: rounded tops from a billow noise, flat bases, lit on the sun side
local cn = noise{seed=44, octaves=4, period=110, kind="billow"}
local base = function(x) return 222 + 8*gn(x, 50) end
local top = function(x) return 150 + 40*cn(x, 0) + 30*math.exp(-((x - 500)/170)^2) end
local cum = mask(function(x, y)
  return smoothstep(top(x), top(x) + 10, y) * (1 - smoothstep(base(x) - 6, base(x), y)) * smoothstep(-0.25, 0.1, gn(x * 1.7, 300))
end):blur(3)
local function cumcol(x, y)
  local lit = smoothstep(top(x) + 25, top(x), y) * (0.4 + 0.6*math.exp(-((x - SUNX)/300)^2))
  return mix(mix("#b9b3ad", "#a5a2a3", smoothstep(top(x), base(x), y)), "#f2e2bf", 0.75*lit)
end
work(cum, {hand="broad", color=cumcol, hug=false, angle=0, angle_jitter=0.15, curve={0.2, 0.1},
  length={40, 140}, coverage=2.4, medium=0.35, load=0.9, pressure={0.45, 0.7}, ramps={0.25, 0.35}, pal=skypal})
blend(cum, {angle=0, coverage=1.4})
wait(24*60)
