-- the high Sierra ridge far off, and a nearer foothill ridge: pines on its top, cut bare below
local fn = noise{seed=3, octaves=4, period=120}
local fn2 = noise{seed=4, octaves=5, period=70}
crest1 = function(x) return 212 + 14*fn(x, 0) - 34*math.exp(-((x - 840)/120)^2) - 18*math.exp(-((x - 300)/90)^2) end
crest2 = function(x) return 242 + 7*fn2(x, 0) - 20*math.exp(-((x - 130)/150)^2) - 8*math.exp(-((x - 640)/90)^2) end
local range = below(crest1) * above(function(x) return crest2(x) + 6 end)
work(range, {hand="body", fill=true, color=function(x, y)
  return mix("#8a909a", "#a2a3a2", smoothstep(crest1(x), crest2(x), y))
end, angle=0, length={20, 60}, coverage=4, medium=0.15, clip=true, pal=landpal})
local ridge = below(crest2)
local sc = noise{seed=12, octaves=3, period=60, stretch={0, 2}}
work(ridge, {hand="body", fill=true, color=function(x, y)
  local d = smoothstep(crest2(x), crest2(x) + 22, y)
  -- dark pine on the crest, cut and bare gray-ochre down the slope, in patches
  local bare = smoothstep(-0.1, 0.3, sc(x, y)) * d
  local c = mix("#646a5e", "#8f8670", bare)
  return mix(c, "#7c7666", smoothstep(HZ, H, y) * 0.6)
end, angle=0, angle_jitter=0.05, length={18, 50}, coverage=4.2, medium=0.15, clip=true, pal=landpal})
-- the remaining pines: dark vertical touches along the top, in broken stands
local pn = noise{seed=21, octaves=3, period=50}
local pines = (ridge * mask(function(x, y)
  return (1 - smoothstep(crest2(x) + 4, crest2(x) + 12, y)) * smoothstep(-0.15, 0.2, pn(x, 0))
end)):grow(1)
work(pines, {hand="hatch", color="#4b5049", angle=-1.57, angle_jitter=0.15, coverage=1.2, medium=0.15, pal=landpal})
wait(24*60)
