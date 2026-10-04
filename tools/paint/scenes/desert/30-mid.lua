-- the alkali flats: a white crust stretching away, streaked faintly gray and tan, a false sheen of water
local mn = noise{seed=201, octaves=4, period=200}
local crest = function(x) return 296 + 3*mn(x, 0) end
local m = below(crest)
local gn = noise{seed=202, octaves=3, period=110, stretch={0, 10}}
local pn = noise{seed=203, octaves=4, period=70, stretch={0, 6}}
work(m, {hand="body", fill=true, color=function(x, y)
  local c = mix("#ebe6d9", "#ddd3be", smoothstep(296, 340, y))
  -- patches of tan sand and gray crust
  local p = pn(x, y)
  c = mix(c, p > 0 and "#cfc0a0" or "#c9c6bd", 0.35*math.abs(p))
  -- the mirage: a pale bluish sheen just under the far edge
  c = mix(c, "#dfe2df", 0.5*(1 - smoothstep(0, 8, math.abs(y - 304 - 2*gn(x, 0))))*smoothstep(-0.1, 0.3, gn(x, 50)))
  return shift(c, 0.02*gn(x, y), 0, 0.006*gn(x, y))
end, angle=0, angle_jitter=0.03, length={24, 80}, coverage=4.2, medium=0.12, clip=true, pal=landpal})
-- a scatter of tiny dark specks far out: castoff goods and stranded wagons, too far to tell
for i, x in ipairs({214, 236, 612, 780, 806}) do
  local y = crest(x) + 4 + (i % 2)
  work(ellipse(x, y, 2.2 + (i % 3)*0.6, 1.0), {hand="detail", color="#857a6c", coverage=2, medium=0.15, clip=true, pal=landpal})
end
wait(24*60)
