-- the muddy street at the edge of town: ruts, standing water that holds the morning sky
local nn = noise{seed=61, octaves=4, period=90}
local crest = function(x) return 352 + 5*nn(x, 0) - 6*math.exp(-((x-900)/120)^2) end
local m = below(crest)
local gn = noise{seed=62, octaves=3, period=50, stretch={0, 5}}
work(m, {hand="body", fill=true, color=function(x, y)
  local sun = math.exp(-((x - SUNX)/420)^2)
  local c = mix("#7d664b", "#4c3c2c", smoothstep(352, H, y))
  c = mix(c, "#9c7f58", 0.3*sun*(1 - smoothstep(352, 390, y)))
  return shift(c, 0.03*gn(x, y), 0, 0.01*gn(x, y))
end, angle=0, angle_jitter=0.04, length={20, 60}, coverage=3.6, medium=0.15, clip=true, pal=landpal})
wait(8*60)
-- ruts running along the street
local ruts = ribbon({{0,384},{250,381},{520,386},{760,382},{1000,387}}, 3.5) + ribbon({{0,400},{260,397},{540,402},{780,398},{1000,403}}, 3)
work(ruts * m, {hand="body", fill=true, tool="filbert 4", color="#3f3226", angle=0, length={20, 60}, coverage=1.5, medium=0.15, pal=landpal})
-- puddles, kept away from where the wagon stands
local pn = noise{seed=63, octaves=3, period=30}
local puddles = (ellipse(70, 393, 34, 3) + ellipse(610, 389, 45, 3.5) + ellipse(880, 385, 40, 3) + ellipse(950, 405, 26, 2.5)):roughen(2, 8, 64, 1)
work(puddles * m, {hand="body", fill=true, tool="filbert 3", color=function(x, y)
  return mix("#8f949a", "#c9bf9f", math.exp(-((x - SUNX)/260)^2))
end, angle=0, length={10, 40}, coverage=1.6, medium=0.25, load=0.6, clip=true, pal=landpal})
-- tufts of grass at the street's edges
local grass = pile{{"yellow ochre",3},{"raw umber",1},{"lead white",0.5}}
local edges = below(function(x) return crest(x) + 3 end) * mask(function(x, y)
  return (1 - smoothstep(60, 130, x)) + smoothstep(760, 860, x)
end) * above(function(x) return crest(x) + 22 end)
work(edges, {hand="hatch", pile=grass, coverage=0.45, angle=-1.45, angle_jitter=0.3})
