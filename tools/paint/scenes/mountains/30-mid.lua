-- the broad high plain of South Pass: long sage swells, warm where the light rakes them
local mn = noise{seed=161, octaves=4, period=180}
local crest = function(x) return 290 + 6*mn(x, 0) - 6*math.exp(-((x - 300)/160)^2) + 4*math.exp(-((x - 760)/140)^2) end
local m = below(crest)
local gn = noise{seed=162, octaves=3, period=90, stretch={0, 4}}
local sw = noise{seed=163, octaves=3, period=120, stretch={0, 3}}
work(m, {hand="body", fill=true, color=function(x, y)
  local lit = math.exp(-((x - SUNX)/460)^2)
  local c = mix("#8a8a68", "#b9a668", 0.5*lit)
  -- swells: lit crowns, cooler hollows
  local s = sw(x, y)
  c = mix(c, s > 0 and "#c0ad74" or "#7c816c", 0.35*math.abs(s))
  c = mix(c, "#a6a68e", 0.22*(1 - smoothstep(crest(x), crest(x) + 14, y)))   -- air at the far edge
  c = mix(c, "#7e7c5a", smoothstep(HZ + 30, H, y) * 0.45)
  return shift(c, 0.03*gn(x, y), 0, 0.01*gn(x, y))
end, angle=0, angle_jitter=0.05, length={18, 70}, coverage=4.2, medium=0.12, clip=true, pal=landpal})
-- the trail: a pale thread over the swells toward the pass
local trail = ribbon({{0,330},{200,322},{380,312},{560,304},{720,299},{860,296},{1000,294}}, {3, 2.6, 2.2, 1.8, 1.4, 1.2, 1})
work(trail * m, {hand="body", fill=true, color="#c9b88e", angle=-0.03, length={20, 60}, coverage=1.6, medium=0.15, clip=true, pal=landpal})
wait(24*60)
