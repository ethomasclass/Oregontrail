-- east bright and gold, west dark and stormy
local sn = noise{seed=31, octaves=3, period=180, stretch={0, 6}}
local storm = noise{seed=44, octaves=5, period=150}
local function skycol(x, y)
  local east = smoothstep(150, 900, x)
  local t = clamp(y / HZ, 0, 1)
  local bright = gradient({{0,"#b9c3c9"},{0.4,"#ead9b0"},{0.8,"#f7e6b4"},{1,"#fbefc8"}}, t)
  local dark = gradient({{0,"#3b3e48"},{0.5,"#5a5a60"},{1,"#7a6f66"}}, t)
  local c = mix(dark, bright, clamp(east + 0.25*storm(x, y)*(1-east), 0, 1))
  c = mix(c, "#fff3cf", 0.6*math.exp(-((x - 640)/220)^2 - ((y - 170)/170)^2))
  c = mix(c, "#fbe9b8", 0.4*math.exp(-((x - 900)/160)^2 - ((y - 330)/120)^2))
  local v = sn(x, y)
  return shift(c, 0.02*v, 0.004*v, 0.008*v)
end
local skym = above(function(x) return HZ + 30 end)
work(skym, {hand="broad", color=skycol, angle=0, angle_jitter=0.05, length={120, 300}, coverage=4.8, medium=0.35, load=0.8, fill=true, pal=skypal})
blend(skym, {angle=0, coverage=1.3, length={150, 380}})
-- storm masses rolling over the west
local cn = noise{seed=12, octaves=5, period=110}
local stormm = mask(function(x, y)
  local edge = 330 + 90*cn(0, y)
  return smoothstep(0.05, 0.35, cn(x, y) + 0.4) * (1 - smoothstep(edge - 80, edge + 80, x)) * (1 - smoothstep(HZ - 40, HZ, y))
end):blur(3)
work(stormm, {hand="broad", color=function(x, y) return mix("#2e3038", "#5d5862", smoothstep(0, HZ, y)) end,
  hug=false, angle=-0.08, angle_jitter=0.12, length={90, 240}, coverage=2.4, medium=0.3, load=0.9, pal=skypal})
blend(stormm, {angle=-0.08, coverage=2.0})
wait(24*60)
