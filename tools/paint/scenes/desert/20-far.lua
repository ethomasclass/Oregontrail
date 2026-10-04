-- low barren hills, bleached almost to the sky's color and wavering in the heat
local fn = noise{seed=191, octaves=4, period=90}
local base = curve({{0,272},{80,262},{160,256},{240,266},{330,276},{430,278},{520,270},{600,266},{680,274},
  {780,276},{860,264},{930,254},{1000,262}})
local crest = function(x) return base(x) - 6*fn:at01(x, 0) end
local m = below(crest):roughen(0.8, 9)
local vn = noise{seed=192, octaves=3, period=40, stretch={1.4, 4}}
work(m, {hand="body", fill=true, color=function(x, y)
  local d = y - crest(x)
  local c = mix("#b5aeb0", "#c9c0b6", smoothstep(0, 18, d))
  c = shift(c, 0.02*vn(x, y)*(1 - smoothstep(6, 22, d)), 0, 0.005*vn(x, y))
  -- the heat haze swallows their feet in white
  return mix(c, "#ece6da", smoothstep(HZ - 18, HZ + 6, y))
end, angle=0, length={20, 60}, coverage=4, medium=0.15, clip=true, pal=landpal})
-- shimmer: a few pale level strokes dragged across the hills' feet
local sh = noise{seed=193, octaves=3, period=60, stretch={0, 8}}
local shim = mask(function(x, y)
  return smoothstep(0.1, 0.45, sh(x, y)) * smoothstep(HZ - 26, HZ - 14, y) * (1 - smoothstep(HZ, HZ + 8, y))
end):blur(1.5) * m
work(shim, {hand="broad", fill=true, color="#eee9dd", hug=false, angle=0, length={40, 140}, coverage=1.2, medium=0.4, load=0.6, pressure={0.3, 0.5}, pal=skypal, clip=m})
blend(shim, {angle=0, coverage=1.0, length={60, 160}})
wait(24*60)
