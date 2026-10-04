-- rolling grassland, lit gold toward the sun
local mn = noise{seed=5, octaves=4, period=150}
local crest = function(x) return HZ + 6 + 10*mn(x, 0) - 6*math.exp(-((x-420)/120)^2) end
local m = below(crest)
local gn = noise{seed=8, octaves=3, period=90, stretch={0, 4}}
work(m, {hand="body", color=function(x, y)
  local lit = math.exp(-((x - SUNX)/360)^2)
  local c = mix("#7d7a44", "#c9a752", 0.55*lit)
  c = mix(c, "#7c7748", smoothstep(HZ + 10, H, y) * 0.5)
  return shift(c, 0.03*gn(x, y), 0, 0.01*gn(x, y))
end, angle=0, angle_jitter=0.05, length={18, 70}, coverage=4.2, medium=0.12, clip=true, fill=true, pal=landpal})
wait(24*60)
