-- low wooded bluffs beyond the river, blue with wet air, paler under the break in the clouds
local fn = noise{seed=75, octaves=4, period=130}
local tn = noise{seed=76, octaves=2, period=7}
local crest = function(x)
  return 278 - 14*fn:at01(x, 0) - 14*math.exp(-((x-160)/130)^2) - 8*math.exp(-((x-900)/90)^2) + 6*math.exp(-((x-SUNX)/120)^2) + 1.5*tn(x, 0)
end
local m = below(crest)
work(m, {hand="body", fill=true, color=function(x, y)
  local lit = math.exp(-((x - SUNX)/220)^2)
  local c = mix("#7d899a", "#97a0a6", smoothstep(262, 300, y))
  return mix(c, "#bdb9a8", 0.55*lit)
end, angle=0, angle_jitter=0.06, length={16, 50}, coverage=4, medium=0.15, clip=true, pal=landpal})
wait(24*60)
