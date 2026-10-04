-- distant bluffs along the river, blue with air
local fn = noise{seed=3, octaves=4, period=110}
local crest = function(x) return HZ - 10 - 14*fn:at01(x, 0) - 22*math.exp(-((x-210)/80)^2) - 12*math.exp(-((x-880)/60)^2) end
local m = below(crest)
work(m, {hand="body", color=function(x, y)
  return mix("#9fa7b5", "#b9b3a6", smoothstep(HZ - 30, HZ + 20, y))
end, angle=0, length={20, 60}, coverage=4, medium=0.15, clip=true, fill=true, pal=landpal})
wait(24*60)
