-- wooded hills beyond the town: a pale far range and a nearer timbered ridge on the left
local fn = noise{seed=41, octaves=4, period=150}
local tn = noise{seed=42, octaves=2, period=7}
local crest1 = function(x)
  return 262 - 18*fn:at01(x, 0) - 16*math.exp(-((x-230)/150)^2) + 12*math.exp(-((x-860)/140)^2) + 1.5*tn(x, 0)
end
local rn = noise{seed=43, octaves=4, period=110}
local tn2 = noise{seed=44, octaves=3, period=6}
local crest2 = function(x)
  return 284 - 12*rn:at01(x, 0) - 10*math.exp(-((x-120)/120)^2) + 18*smoothstep(480, 700, x) + 2.5*tn2(x, 0)
end
local m2 = below(crest2)
local m1 = below(crest1) - m2
work(m1, {hand="body", fill=true, color=function(x, y)
  local sun = math.exp(-((x - SUNX)/300)^2)
  local c = mix("#8e9bb0", "#a9aeb0", smoothstep(250, 290, y))
  return mix(c, "#c8c1ad", 0.55*sun)
end, angle=0, angle_jitter=0.08, length={16, 50}, coverage=4, medium=0.15, clip=true, pal=landpal})
local wn = noise{seed=45, octaves=3, period=14}
work(m2, {hand="body", fill=true, color=function(x, y)
  local sun = math.exp(-((x - SUNX)/320)^2)
  local c = mix("#6f7c80", "#878d84", smoothstep(270, 300, y))
  c = mix(c, "#a9a690", 0.5*sun)
  return shift(c, 0.03*wn(x, y), 0, 0.01*wn(x, y))
end, angle=0, angle_jitter=0.3, length={10, 30}, coverage=4, medium=0.15, clip=true, pal=landpal})
wait(24*60)
