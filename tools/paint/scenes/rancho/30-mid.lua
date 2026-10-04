-- golden hills with live oaks, the long adobe on its rise, cattle, and squatters' tents at the edges
local mn = noise{seed=5, octaves=4, period=150}
MC = function(x) return curve({{0,302},{200,293},{430,306},{620,287},{800,290},{1000,312}})(x) + 4*mn(x, 0) end
-- the house
local HX0, HX1, HB = 560, 790, 314
local wall = rect(HX0, HB - 10, HX1 - HX0, 10)
local roof = poly({{HX0 - 5, HB - 10}, {HX0 + 5, HB - 17}, {HX1 - 5, HB - 17}, {HX1 + 5, HB - 10}})
local endw = poly({{HX0 - 12, HB - 1}, {HX0 - 12, HB - 8}, {HX0 - 4, HB - 12}, {HX0, HB - 10}, {HX0, HB}})
local house = wall + roof + endw
-- oaks and cattle
local crowns, trunks, shadows = {}, {}, {}
local spots = {{70,318,1.2},{150,306,0.9},{205,322,1.3},{300,316,1.0},{340,330,1.5},{455,318,1.0},{500,328,1.3},
  {610,330,1.4},{830,302,0.9},{870,318,1.2},{955,326,1.4},{250,302,0.8},{395,312,0.85},{705,325,1.1},{860,333,1.5}}
for i, s in ipairs(spots) do
  local x, y, sc = s[1], s[2], s[3]
  if y < MC(x) + 8 then y = MC(x) + 8 end
  local c, t = oak(x, y, sc, 100 + i)
  crowns[#crowns + 1] = c
  trunks[#trunks + 1] = t
  shadows[#shadows + 1] = ellipse(x + 12*sc, y + 0.5, 13*sc, 2.2*sc)
end
local CR, TR, SH = U(crowns), U(trunks), U(shadows)
local cows = {}
for i, s in ipairs({{380,333},{392,336},{405,331},{418,337},{430,334},{440,330},{250,336},{262,339},{880,340},{895,337}}) do
  cows[#cows + 1] = ellipse(s[1], s[2], 3.4, 1.7) + ellipse(s[1] + (i % 2 == 0 and 3.6 or -3.6), s[2] - 0.6, 1.3, 1.0)
end
local CW = U(cows)
local tents, tsh = {}, {}
for _, s in ipairs({{915,330,1.1},{940,336,1.3},{970,328,1.0},{36,334,1.2},{62,328,0.9}}) do
  local x, y, sc = s[1], s[2], s[3]
  tents[#tents + 1] = poly({{x - 5*sc, y}, {x, y - 7*sc}, {x + 5*sc, y}})
  tsh[#tsh + 1] = poly({{x, y - 7*sc}, {x + 9*sc, y - 6.5*sc}, {x + 14*sc, y}, {x + 5*sc, y}})
end
local TF, TS = U(tents), U(tsh)
-- the hills
local m = below(MC)
local gn = noise{seed=8, octaves=3, period=90, stretch={0, 4}}
local fold = noise{seed=19, octaves=3, period=120}
work(m - (house + CR + TR + CW + TF + TS):grow(0.5), {hand="body", fill=true, color=function(x, y)
  local lit = math.exp(-((x - SUNX)/420)^2)
  local c = mix("#a8874f", "#cda45a", 0.6*lit)
  c = mix(c, "#d8b56c", 0.5*(1 - smoothstep(MC(x), MC(x) + 10, y)) * (0.4 + 0.6*lit))   -- light along the hilltops
  -- a second, lower swell of hills inside the band, its far side in shade
  local inner = 322 + 7*math.sin(x / 95 + 1.3) + 4*fold(x, 300)
  c = mix(c, "#836a42", 0.5*smoothstep(inner - 14, inner, y) * (1 - smoothstep(inner, inner + 5, y)))
  c = mix(c, "#7f6541", 0.55*smoothstep(0.05, 0.45, fold(x, y*1.8)))       -- shaded folds
  c = mix(c, "#6f5d3b", smoothstep(MC(x) + 10, H, y) * 0.45)
  if SH:at(x, y) > 0.2 then c = mix(c, "#6a5838", 0.6*SH:at(x, y)) end
  return shift(c, 0.03*gn(x, y), 0, 0.01*gn(x, y))
end, angle=0, angle_jitter=0.05, length={18, 60}, coverage=4.2, medium=0.12, clip=true, pal=landpal})
-- oaks: a dark mass, lit a little on the sun side
work(CR + TR, {hand="body", fill=true, tool="filbert 4", color=function(x, y) return mix("#3b3d2b", "#2a2c21", smoothstep(-0.2, 0.6, fold(x*3, y*3))) end,
  angle=function(x, y) return 1.2*gn(x*4, y*4) end, angle_jitter=0.6, length={4, 10}, coverage=3.4, medium=0.15, clip=true, pal=landpal})
local litc = {}
for i, s in ipairs(spots) do local x, y, sc = s[1], s[2], s[3] if y < MC(x) + 8 then y = MC(x) + 8 end
  litc[#litc + 1] = ellipse(x - 5*sc, y - 10*sc, 6*sc, 3*sc) end
work(U(litc) * CR, {hand="body", fill=true, tool="filbert 3", color="#5e5b37", angle=0.3, angle_jitter=0.6, length={3, 8}, coverage=1.6, medium=0.12, hug=false, clip=CR, pal=landpal})
-- the adobe: whitewash, a warm lit end wall facing the sun, red tile, the shadow of the portal
work(wall, {hand="detail", color="#cfc4ab", angle=0, coverage=3.5, medium=0.1, pal=landpal})
work(endw, {hand="detail", color="#eee2c6", angle=1.57, coverage=3.5, medium=0.1, pal=landpal})
work(roof, {hand="detail", color=function(x, y) return mix("#93573c", "#6e3a2a", smoothstep(HB - 17, HB - 10, y)) end, angle=0, coverage=3.5, medium=0.1, pal=landpal})
local portal = rect(HX0 + 8, HB - 10, HX1 - HX0 - 40, 4.5)
work(portal, {hand="detail", color="#6c5a4a", angle=0, coverage=3, medium=0.1, pal=landpal})
local posts, doors = {}, {}
for x = HX0 + 10, HX1 - 34, 15 do posts[#posts + 1] = rect(x, HB - 10, 1.1, 10) end
for _, x in ipairs({HX0 + 40, HX0 + 95, HX0 + 150, HX1 - 20}) do doors[#doors + 1] = rect(x, HB - 7, 3, 7) end
work(U(doors), {hand="detail", color="#4a3a2e", angle=1.57, coverage=3, medium=0.1, pal=landpal})
work(U(posts), {hand="detail", color="#cbbfa8", angle=1.57, coverage=2.5, medium=0.1, pal=landpal})
-- cattle and the squatters' tents
work(CW, {hand="detail", color="#4e3426", angle=0, coverage=3, medium=0.1, pal=landpal})
work(TF, {hand="detail", color="#d8cfbd", angle=1.57, coverage=3, medium=0.1, pal=landpal})
work(TS, {hand="detail", color="#a49b8a", angle=0, coverage=3, medium=0.1, pal=landpal})
wait(24*60)
