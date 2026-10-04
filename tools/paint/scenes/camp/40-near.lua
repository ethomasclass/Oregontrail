-- the near ground at dusk: dark grass, cool, a few stems against the last light
local nn = noise{seed=171, octaves=4, period=90}
local crest = function(x) return 354 + 5*nn(x, 0) + 8*math.exp(-((x-900)/120)^2) - 6*math.exp(-((x-60)/80)^2) end
local m = below(crest)
local gn = noise{seed=172, octaves=3, period=50, stretch={0, 5}}
work(m, {hand="body", fill=true, color=function(x, y)
  local c = mix("#3f3a3c", "#221f22", smoothstep(352, H, y))
  c = mix(c, "#4e4442", 0.3*math.exp(-((x - SUNX)/300)^2)*(1 - smoothstep(352, 380, y)))
  return shift(c, 0.02*gn(x, y), 0, 0.006*gn(x, y))
end, angle=0, angle_jitter=0.04, length={20, 60}, coverage=3.6, medium=0.15, clip=true, pal=landpal})
wait(8*60)
local ruts = ribbon({{0,392},{300,389},{600,394},{1000,390}}, 4) + ribbon({{0,406},{300,403},{600,408},{1000,404}}, 3.5)
work(ruts * m, {hand="body", fill=true, tool="filbert 5", color="#4a4244", angle=0, length={20, 60}, coverage=1.3, medium=0.15, pal=landpal})
-- stems at the edges only, keeping the middle quiet
local grass = pile{{"raw umber",3},{"bone black",0.6},{"yellow ochre",0.6},{"pale smalt",0.5}}
local edges = below(function(x) return crest(x) + 3 end) * above(function(x) return crest(x) + 30 end) * mask(function(x, y)
  return (1 - smoothstep(70, 130, x)) + smoothstep(620, 720, x)
end)
work(edges, {hand="hatch", pile=grass, coverage=0.5, angle=-1.45, angle_jitter=0.3})
