-- the near ground: dry grass and sagebrush, the trail; sage gathers at the edges, quiet where the wagon stands
local nn = noise{seed=131, octaves=4, period=90}
local crest = function(x) return 354 + 5*nn(x, 0) - 7*math.exp(-((x-90)/90)^2) - 6*math.exp(-((x-860)/140)^2) end
local m = below(crest)
local gn = noise{seed=132, octaves=3, period=70, stretch={0, 4}}
work(m, {hand="body", fill=true, color=function(x, y)
  local c = mix("#6f6a46", "#3d3a28", smoothstep(354, H, y))
  c = mix(c, "#87784a", 0.35*math.exp(-((x - SUNX)/300)^2)*(1 - smoothstep(354, 390, y)))
  return shift(c, 0.025*gn(x, y), 0.003*gn(x, y), 0.008*gn(x, y))
end, angle=0, length={20, 60}, coverage=3.4, medium=0.15, clip=true, pal=landpal})
local ruts = ribbon({{0,392},{300,388},{600,394},{1000,389}}, 5) + ribbon({{0,402},{300,398},{600,404},{1000,399}}, 4)
work(ruts * m, {hand="body", fill=true, color="#9c8a62", angle=0, length={20, 60}, coverage=1.6, medium=0.15, pal=landpal})
-- sagebrush: rounded gray-green clumps, darker beneath, lit on the sun side; few in the wagon's stretch
local clumps = {}
local function add(x, y, r) clumps[#clumps + 1] = {x, y, r} end
for i, x in ipairs(uneven(9, 540, 990, 0.6, 0.4, 133)) do add(x, crest(x) + rand(4, 40), rand(10, 20)) end
for i, x in ipairs(uneven(4, 10, 130, 0.6, 0.4, 134)) do add(x, crest(x) + rand(6, 40), rand(10, 18)) end
local sage = nil
for _, c in ipairs(clumps) do
  local e = ellipse(c[1], c[2], c[3], c[3]*0.38)
  sage = sage and (sage + e) or e
end
sage = sage:roughen(3.5, 4, 135):roughen(1.5, 2, 137)
-- the vertical center of the nearest clump, so tops are lit and bottoms dark
function clumpy(x, y)
  local best, bd = y, 1e9
  for _, c in ipairs(clumps) do
    local d = math.abs(x - c[1]) / c[3]
    if d < bd then bd, best = d, c[2] end
  end
  return best + 0.0
end
local sn = noise{seed=136, octaves=3, period=12}
work(sage, {hand="body", fill=true, tool="filbert 3", color=function(x, y)
  local c = mix("#868a74", "#3c3f32", smoothstep(-0.3, 0.5, sn(x, y) + 0.08*(y - clumpy(x, y))))
  return mix(c, "#a89a70", 0.3*math.exp(-((x - SUNX)/200)^2))
end, angle=-0.4, angle_jitter=0.6, length={3, 9}, coverage=3.2, medium=0.15, clip=true, pal=landpal})
local grass = pile{{"yellow ochre",3},{"lead white",1.4},{"pale smalt",0.4}}
work(below(function(x) return crest(x) + 4 end) - sage, {hand="hatch", pile=grass, coverage=0.4, angle=-1.45, angle_jitter=0.3})
