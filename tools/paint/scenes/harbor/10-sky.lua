-- a cool gray-blue sky, silver light at the right, a bank of fog lying low behind the hills
local gn = noise{seed=17, octaves=3, period=260}
local function glow(x, y)
  return math.exp(-((x - SUNX)/(300 + 70*gn(x, 0)))^2) * smoothstep(0, HZ, y)
end
local sn = noise{seed=31, octaves=3, period=180, stretch={0, 7}}
local function skycol(x, y)
  local t = clamp(y / HZ, 0, 1)
  local c = gradient({{0,"#6d7d92"},{0.4,"#94a0ad"},{0.75,"#bcc1c2"},{1,"#cfd0cb"}}, t)
  c = mix(c, "#e6e4da", 0.55*glow(x, y))
  local v = sn(x, y)
  return shift(c, 0.02*v, 0.002*v, 0.006*v)
end
local skym = above(function(x) return HZ + 30 end)
work(skym, {hand="broad", color=skycol, angle=0, angle_jitter=0.02, length={140, 340}, coverage=4.6, medium=0.35, load=0.8, fill=true, pal=skypal})
blend(skym, {angle=0, coverage=1.2, length={150, 400}})
-- the fog: a soft rolling bank whose top climbs and falls over the hills, brightest toward the light
local fn = noise{seed=9, octaves=5, period=140}
local fogtop = function(x) return 128 + 22*fn(x, 0) + 0.02*(x - 500) end
local fog = mask(function(x, y)
  return smoothstep(fogtop(x) - 6, fogtop(x) + 22, y) * (1 - smoothstep(HZ + 10, HZ + 30, y))
end):blur(2)
local function fogcol(x, y)
  local c = mix("#a9afb4", "#d6d7d2", smoothstep(fogtop(x), fogtop(x) + 40, y))
  return mix(c, "#ecebe3", 0.5*glow(x, y))
end
work(fog, {hand="broad", color=fogcol, hug=false, angle=0, angle_jitter=0.04, curve={0.1, 0.05},
  length={60, 200}, coverage=2.4, medium=0.35, load=0.9, pressure={0.45, 0.7}, ramps={0.25, 0.35}, pal=skypal})
-- a few high gray streaks, quiet over the center
local bn = noise{seed=23, octaves=4, period=160, stretch={0, 5}}
local high = mask(function(x, y)
  local c = 60 + 16*bn(x*0.5, 0)
  return (1 - smoothstep(5, 12, math.abs(y - c))) * smoothstep(0, 0.35, bn(x, 200)) * (1 - 0.85*math.exp(-((x - 500)/170)^2))
end):blur(2)
work(high, {hand="broad", color="#8e98a4", hug=false, angle=0, angle_jitter=0.02, curve={0, 0},
  length={90, 240}, coverage=1.6, medium=0.35, load=0.8, pressure={0.4, 0.6}, pal=skypal})
blend(fog + high, {angle=0, coverage=1.5})
wait(24*60)
