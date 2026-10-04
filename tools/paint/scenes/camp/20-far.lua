-- low hills against the afterglow, blue-violet, lighter where the ember light lies behind them
local fn = noise{seed=151, octaves=4, period=150}
local crest = function(x)
  return 276 - 14*fn:at01(x, 0) - 12*math.exp(-((x-260)/140)^2) + 6*math.exp(-((x-SUNX)/160)^2)
end
local m = below(crest)
work(m, {hand="body", fill=true, color=function(x, y)
  local g = math.exp(-((x - SUNX)/280)^2)
  local c = mix("#4d4c62", "#575265", smoothstep(262, 300, y))
  return mix(c, "#7a6168", 0.45*g*(1 - smoothstep(crest(x), crest(x) + 25, y)))
end, angle=0, angle_jitter=0.06, length={16, 50}, coverage=4, medium=0.15, clip=true, pal=landpal})
wait(24*60)
