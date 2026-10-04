-- the near ground: sun-browned grass, the worn trail, a few clumps of sage at the right
local nn = noise{seed=81, octaves=4, period=90}
local crest = function(x) return 354 + 5*nn(x, 0) - 8*math.exp(-((x-880)/120)^2) + 4*math.exp(-((x-60)/80)^2) end
local m = below(crest)
local gn = noise{seed=82, octaves=3, period=70, stretch={0, 4}}
work(m, {hand="body", fill=true, color=function(x, y)
  local c = mix("#77683c", "#433a24", smoothstep(354, H, y))
  c = mix(c, "#8a7740", 0.35*math.exp(-((x - SUNX)/300)^2)*(1 - smoothstep(354, 390, y)))
  return shift(c, 0.025*gn(x, y), 0.003*gn(x, y), 0.008*gn(x, y))
end, angle=0, length={20, 60}, coverage=3.4, medium=0.15, clip=true, pal=landpal})
local ruts = ribbon({{0,391},{300,387},{600,393},{1000,388}}, 5) + ribbon({{0,401},{300,397},{600,403},{1000,398}}, 4)
work(ruts * m, {hand="body", fill=true, color="#a08a5c", angle=0, length={20, 60}, coverage=1.6, medium=0.15, pal=landpal})
-- sage clumps: low gray-green mounds, lit on the left
local sage = ellipse(640, 362, 18, 7) + ellipse(700, 358, 26, 9) + ellipse(905, 352, 30, 10) + ellipse(960, 366, 20, 8) + ellipse(40, 360, 22, 8)
sage = sage:roughen(2, 6, 83)
work(sage, {hand="body", fill=true, tool="filbert 3", color=function(x, y)
  return mix("#7d806a", "#4d5040", smoothstep(-4, 8, y - 360 + 0.0*x))
end, angle=0, length={4, 12}, coverage=3, medium=0.15, clip=true, pal=landpal})
local grass = pile{{"yellow ochre",3},{"lead white",1},{"chrome yellow",0.3}}
work(below(function(x) return crest(x) + 4 end), {hand="hatch", pile=grass, coverage=0.5, angle=-1.45, angle_jitter=0.3})
