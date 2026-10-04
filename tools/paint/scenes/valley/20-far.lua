-- Mount Hood: a snowy cone floating over the blue Cascade foothills, lit from the left
local hn = noise{seed=231, octaves=4, period=30}
local function hood(x)
  local d = x - HOODX
  local w = d < 0 and 128 or 116
  local t = math.abs(d) / w
  return 262 - 150 * math.exp(-(t^1.15)) + 3*hn:at01(x, 0)*(1 - math.exp(-t))
end
local hm = below(hood):roughen(0.6, 6, 232)
local spur = noise{seed=233, octaves=4, period=16, kind="ridged", stretch={1.5708, 4}}
local sn = noise{seed=234, octaves=4, period=24, warp={30, 6}}
work(hm, {hand="body", fill=true, tool="filbert 4", color=function(x, y)
  local d = x - HOODX
  local lit = clamp(0.62 - 0.012*d + 1.6*(spur(x - 2, y) - spur(x + 2, y)), 0, 1)
  local snow = smoothstep(214, 186, y + 22*sn(x, y) + 14*spur(x, y))
  local rock = gradient({{0, "#7d86a4"}, {1, "#a8a4b0"}}, lit)
  local snowc = gradient({{0, "#b2bdd6"}, {0.5, "#dfe2e6"}, {1, "#fdf6e6"}}, lit)
  local c = mix(rock, snowc, snow)
  return mix(c, "#b9c3d2", 0.6*smoothstep(205, HZ - 6, y))   -- its foot lost in morning air
end, angle=function(x, y) return 1.5708 - 0.8*clamp((x - HOODX)/120, -1, 1) end,
  length={8, 24}, coverage=4.2, medium=0.15, load=0.85, clip=true, pal=landpal})
-- the Cascade foothills: long blue wooded ridges, a lighter one in front
local fn = noise{seed=235, octaves=4, period=90}
local c1 = function(x) return 254 + 8*fn(x, 0) - 10*math.exp(-((x - 160)/120)^2) - 6*math.exp(-((x - 950)/90)^2) end
local m1 = below(c1):roughen(0.8, 8, 236)
local tn = noise{seed=237, octaves=3, period=7}
work(m1, {hand="body", fill=true, color=function(x, y)
  local c = mix("#8a97ad", "#a5aebb", smoothstep(0, 24, y - c1(x)))
  c = shift(c, -0.02*math.max(0, tn(x, y)), 0, 0)
  return mix(c, "#c7cbc8", smoothstep(HZ - 14, HZ + 20, y))
end, angle=0, length={14, 44}, coverage=4, medium=0.15, clip=true, pal=landpal})
wait(24*60)
