-- the near water, darker, and the edge of a plank wharf on piles at the right
local crest = function(x) return 352 + 1.5*math.sin(x / 41) end
local m = below(crest)
local DX = 650                 -- the wharf's end
local deck = poly({{DX, 344}, {1000, 341}, {1000, 352}, {DX, 354}})
local face = poly({{DX, 354}, {1000, 352}, {1000, 359}, {DX, 361}})
local piles, prefl = {}, {}
for x = DX + 6, 1000, 38 do
  piles[#piles + 1] = rect(x, 359, 4.2, 30)
  prefl[#prefl + 1] = rect(x + 0.3, 389, 3.6, 22)
end
piles[#piles + 1] = rect(DX + 0.5, 359, 4.5, 33)
local cargo = U{ellipse(800, 337, 4.5, 6.5), ellipse(811, 338, 4.5, 6), rect(860, 331, 14, 12), rect(874, 335, 10, 8), ellipse(940, 337, 4.5, 6)}
local P, PR = U(piles), U(prefl)
local WH = deck + face + cargo
local under = poly({{DX, 360}, {1000, 358}, {1000, 392}, {DX, 392}})   -- the shadow under the wharf
local sn = noise{seed=35, octaves=3, period=200, stretch={0, 7}}
local function wcol(x, y)
  local c = mix("#6f7a83", "#3d474f", smoothstep(352, H, y))
  c = mix(c, "#b9bdb9", 0.4*math.exp(-((x - SUNX)/120)^2) * (1 - smoothstep(352, 400, y)))
  local v = sn(x, y)
  return shift(c, 0.02*v, 0, 0.005*v)
end
work(under - P, {hand="body", fill=true, color="#2c3136", angle=0, length={20, 60}, coverage=3.5, medium=0.15, clip=true, pal=landpal})
work(P + PR, {hand="detail", color=function(x, y) return y > 389 and "#2a2a28" or "#4a3d31" end, angle=1.57, coverage=3, medium=0.1, pal=landpal})
local open = m - WH - under - P - PR
work(open, {hand="broad", fill=true, color=wcol, angle=0, angle_jitter=0.004, curve={0, 0}, length={100, 280}, coverage=4, medium=0.3, load=0.75,
  pal=landpal, clip=open:grow(2):blur(1.5)})
blend(PR:grow(4) * m, {angle=0, length={20, 60}, coverage=1.5, clip=m - WH - under})
work(deck, {hand="body", fill=true, color="#8a7a63", angle=-0.01, length={30, 90}, coverage=3.5, medium=0.12, clip=true, pal=landpal})
work(face, {hand="detail", color="#3c332b", angle=0, coverage=3.5, medium=0.1, pal=landpal})
work(cargo, {hand="detail", color=function(x, y) return x < 850 and "#5e4a36" or "#7d6b53" end, angle=1.57, coverage=3.5, medium=0.1, pal=landpal})
-- soft ripples: long pale and dark level lines across the open water
local rip = m * mask(function(x, y) return smoothstep(0.35, 0.6, sn(x * 0.6, y * 9)) end) - WH - under
work(rip, {hand="body", color="#6c7780", angle=0, angle_jitter=0.01, length={30, 90}, coverage=0.6, pressure={0.3, 0.45}, medium=0.15, pal=landpal})
