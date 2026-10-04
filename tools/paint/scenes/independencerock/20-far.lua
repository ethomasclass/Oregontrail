-- distant ranges beyond the Sweetwater: a blue line of granite mountains, paler near the sun
local fn = noise{seed=111, octaves=5, period=60}
local base = curve({{0,250},{80,236},{150,226},{220,240},{300,256},{380,262},{460,252},{540,258},
  {640,264},{720,256},{800,262},{880,250},{940,238},{1000,244}})
local crest = function(x) return base(x) - 9*fn:at01(x, 0) end
local m = below(crest):roughen(0.8, 9)
local vn = noise{seed=112, octaves=3, period=40, stretch={1.3, 4}}
work(m, {hand="body", fill=true, color=function(x, y)
  local d = y - crest(x)
  local c = mix("#8a95ad", "#a8aab4", smoothstep(0, 26, d))
  c = shift(c, 0.02*vn(x, y)*(1 - smoothstep(8, 30, d)), 0, 0.006*vn(x, y))
  -- the haze at their feet, and a paler, warmer air toward the sun
  c = mix(c, "#c2b4a8", smoothstep(HZ - 14, HZ + 26, y))
  return mix(c, "#c9b9ad", 0.45*math.exp(-((x - SUNX)/170)^2))
end, angle=0, length={20, 60}, coverage=4, medium=0.15, clip=true, pal=landpal})
wait(24*60)
