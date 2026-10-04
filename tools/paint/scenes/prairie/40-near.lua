-- the near ground: dark grass, a worn wagon trail, seed heads catching light
local nn = noise{seed=9, octaves=4, period=90}
local crest = function(x) return 352 + 6*nn(x, 0) + 10*math.exp(-((x-860)/150)^2) end
local m = below(crest)
work(m, {hand="body", color=function(x, y)
  return mix("#6a6338", "#3f3a24", smoothstep(352, H, y))
end, angle=0, length={20, 60}, coverage=3.2, medium=0.15, clip=true, fill=true, pal=landpal})
local ruts = ribbon({{0,392},{300,388},{600,394},{1000,389}}, 5) + ribbon({{0,402},{300,398},{600,404},{1000,399}}, 4)
work(ruts * m, {hand="body", color="#9a8659", angle=0, length={20, 60}, coverage=1.6, medium=0.15, pal=landpal})
local grass = pile{{"yellow ochre",3},{"lead white",1},{"chrome yellow",0.3}}
work(below(function(x) return crest(x) + 4 end), {hand="hatch", pile=grass, coverage=0.5, angle=-1.45, angle_jitter=0.3})
