-- A bleached sky: a thin washed blue overhead going to a hot white glare at the horizon.
local gn = noise{seed=181, octaves=3, period=300}
local sn = noise{seed=183, octaves=3, period=180, stretch={0, 7}}
local function skycol(x, y)
  local t = clamp(y / HZ, 0, 1)
  local c = gradient({{0,"#7b93b3"},{0.3,"#a3b3c2"},{0.6,"#cfd2cc"},{0.85,"#ebe6d8"},{1,"#f3eee0"}}, t)
  -- the glare: a broad whitening around the high sun's side of the sky
  c = mix(c, "#f4f0e2", 0.35*math.exp(-((x - SUNX)/380)^2) * smoothstep(0, 0.6, t))
  local v = sn(x, y) + 0.4*gn(x, y)
  return shift(c, 0.018*v, 0.003*v, 0.006*v)
end
local skym = above(function(x) return HZ + 30 end)
work(skym, {hand="broad", color=skycol, angle=0, angle_jitter=0.01, curve={0.05, 0}, length={140, 340}, coverage=4.6, medium=0.35, load=0.8, fill=true, pal=skypal})
blend(skym, {angle=0, coverage=2.2, length={150, 400}})
-- only a few thin, wind-torn high streaks; no clouds to give shade
local bn = noise{seed=187, octaves=5, period=240, stretch={0, 6}}
local bn2 = noise{seed=189, octaves=4, period=120, stretch={0, 4}}
local high = mask(function(x, y)
  local c = 92 + 18*bn(x*0.5, 0) - 0.04*(x - 500)
  local calm = 1 - 0.8*math.exp(-((x - 500)/180)^2)
  return (1 - smoothstep(3, 9, math.abs(y - c))) * smoothstep(0.0, 0.45, bn2(x, 40)) * calm
end):blur(2)
work(high, {hand="broad", color="#e9e6de", hug=false, angle=-0.03, angle_jitter=0.02, curve={0, 0},
  length={90, 260}, coverage=1.6, medium=0.4, load=0.7, pressure={0.35, 0.6}, ramps={0.3, 0.4}, pal=skypal})
blend(high, {angle=0, coverage=1.4})
wait(24*60)
