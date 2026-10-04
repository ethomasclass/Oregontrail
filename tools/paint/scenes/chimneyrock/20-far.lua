-- far bluffs south of the river: flat-topped, blue with air, a little violet against the glow
local fn = noise{seed=61, octaves=4, period=70}
local base = curve({{0,262},{60,250},{110,236},{190,234},{230,246},{300,262},{380,266},{430,256},{470,252},
  {520,258},{600,268},{700,270},{800,262},{850,244},{900,240},{950,248},{1000,256}})
local crest = function(x) return base(x) - 3*fn:at01(x, 0) end
local m = below(crest):roughen(0.8, 9)
local vn = noise{seed=62, octaves=3, period=50, stretch={1.5708, 4}}
work(m, {hand="body", fill=true, color=function(x, y)
  local d = y - crest(x)
  local c = mix("#8e98ae", "#a9a8ad", smoothstep(0, 22, d))
  -- faint gullies on the bluff faces
  c = shift(c, 0.025*vn(x, y)*(1 - smoothstep(10, 30, d)), 0, 0.006*vn(x, y))
  c = mix(c, "#b9b0a2", smoothstep(HZ - 10, HZ + 30, y))
  -- toward the glow the bluffs go cooler and darker (contre-jour)
  return mix(c, "#848ea6", 0.35*math.exp(-((x - SUNX)/200)^2)*(1 - smoothstep(0, 40, d)))
end, angle=0, length={20, 60}, coverage=4, medium=0.15, clip=true, pal=landpal})
wait(24*60)
