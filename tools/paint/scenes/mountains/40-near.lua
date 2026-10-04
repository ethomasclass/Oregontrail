-- the near ground: sage and bunchgrass on the high plain; clumps gather at the edges
local nn = noise{seed=171, octaves=4, period=90}
local crest = function(x) return 352 + 5*nn(x, 0) - 9*math.exp(-((x - 900)/120)^2) - 5*math.exp(-((x - 40)/70)^2) end
local m = below(crest)
local gn = noise{seed=172, octaves=3, period=70, stretch={0, 4}}
work(m, {hand="body", fill=true, color=function(x, y)
  local c = mix("#6c6d4c", "#3c3d2c", smoothstep(352, H, y))
  c = mix(c, "#857a4c", 0.3*math.exp(-((x - SUNX)/300)^2)*(1 - smoothstep(352, 390, y)))
  return shift(c, 0.025*gn(x, y), 0.003*gn(x, y), 0.008*gn(x, y))
end, angle=0, length={20, 60}, coverage=3.4, medium=0.15, clip=true, pal=landpal})
local ruts = ribbon({{0,391},{300,388},{600,393},{1000,389}}, 5) + ribbon({{0,401},{300,398},{600,403},{1000,399}}, 4)
work(ruts * m, {hand="body", fill=true, color="#9a8c66", angle=0, length={20, 60}, coverage=1.6, medium=0.15, pal=landpal})
local clumps = {}
for i, x in ipairs(uneven(10, 530, 995, 0.6, 0.4, 173)) do clumps[#clumps + 1] = {x, crest(x) + rand(2, 28), rand(9, 22)} end
for i, x in ipairs(uneven(4, 5, 130, 0.6, 0.4, 174)) do clumps[#clumps + 1] = {x, crest(x) + rand(4, 30), rand(10, 20)} end
local sage = nil
for _, c in ipairs(clumps) do
  local e = ellipse(c[1], c[2], c[3], c[3]*0.5)
  sage = sage and (sage + e) or e
end
sage = sage:roughen(2.5, 5, 175)
local sn = noise{seed=176, octaves=3, period=12}
work(sage, {hand="body", fill=true, tool="filbert 3", color=function(x, y)
  local c = mix("#959a86", "#4c5243", smoothstep(-0.2, 0.6, sn(x, y) + 0.02*(y - 360)))
  return mix(c, "#a9a27c", 0.25*math.exp(-((x - SUNX)/220)^2))
end, angle=-0.4, angle_jitter=0.6, length={3, 9}, coverage=3.2, medium=0.15, clip=true, pal=landpal})
local grass = pile{{"yellow ochre",3},{"lead white",1},{"chrome yellow",0.2}}
work(below(function(x) return crest(x) + 4 end) - sage, {hand="hatch", pile=grass, coverage=0.4, angle=-1.45, angle_jitter=0.3})
