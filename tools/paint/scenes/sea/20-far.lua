-- the sea to the horizon: a hard level line, fine swells, the sun's path breaking into light
local m = below(function(x) return HZ end)
local wn = noise{seed=21, octaves=3, period=120}
work(m, {hand="broad", fill=true, color=function(x, y)
  local c = swellcol(x, y, HZ, 2.2 + 0.12*(y - HZ), "#566782", "#7d8aa0", wn)
  c = mix(c, "#a9a8a6", 0.55*(1 - smoothstep(HZ, HZ + 8, y)))       -- haze at the horizon
  return mix(c, "#ead39f", 0.75*sunpath(x, y))
end, angle=0, angle_jitter=0.002, curve={0, 0}, length={60, 200}, coverage=4.2, medium=0.25, load=0.8, clip=true, pal=landpal})
blend(m, {angle=0, angle_jitter=0.002, coverage=0.8, length={80, 240}})
-- glitter in the sun's path
local gl = m * mask(function(x, y) return sunpath(x, y) * smoothstep(0.1, 0.5, wn(x*2, y*6)) end)
work(gl, {hand="body", color="#f6e6b6", angle=0, angle_jitter=0.005, length={8, 24}, coverage=0.8, medium=0.2, pressure={0.3, 0.5}, hug=false, pal=landpal})
wait(24*60)
