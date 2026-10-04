-- the camp hillside: stumps where the forest was, tents and cabins crowding down to a torn-up river
local mn = noise{seed=5, octaves=4, period=150}
MC = function(x) return curve({{0,204},{180,220},{400,256},{600,283},{800,295},{1000,288}})(x) + 4*mn(x, 0) end
local RT = function(x) return 327 + 5*mn(x*1.5, 40) + 0.01*(x - 500) end   -- top of the river
local RB = function(x) return RT(x) + 9 + 5*mn(x*2, 80) end               -- its near bank
-- tents and cabins, reserved on the slope first: clustered on the lower slope and along the river
local tents, tshade, cabins, roofs, cfront = {}, {}, {}, {}, {}
local spots = {}
local cl = {{120, 0.55}, {330, 0.6}, {560, 0.45}, {760, 0.5}, {900, 0.6}}
for _, c in ipairs(cl) do
  for i = 1, 6 do spots[#spots + 1] = {c[1] + randn(0, 40), rand(c[2], 0.95)} end
end
table.sort(spots, function(a, b) return a[2] < b[2] end)
local taken = {}
for _, s in ipairs(spots) do
  local x = clamp(s[1], 10, 985)
  local top = MC(x) + 10
  local y = lerp(top, RT(x) - 5, s[2])
  local sc = 0.9 + 0.5 * (y - 240) / 80
  if rand(0, 1) < 0.7 then
    local w, h, L = 5*sc, 7.5*sc, rand(7, 12)*sc
    tents[#tents + 1] = poly({{x - w, y}, {x, y - h}, {x + w, y}})
    tshade[#tshade + 1] = poly({{x, y - h}, {x + L, y - h + 0.6}, {x + L + w, y}, {x + w, y}})
  else
    local w, h = rand(14, 20)*sc, 6.5*sc
    cabins[#cabins + 1] = rect(x - w/2, y - h, w, h)
    cfront[#cfront + 1] = rect(x + w/2 - 0.5, y - h, 5*sc, h)
    roofs[#roofs + 1] = poly({{x - w/2 - 1.5, y - h + 0.5}, {x - w/2 + 2, y - h - 4*sc}, {x + w/2 + 2, y - h - 4*sc}, {x + w/2 + 6*sc, y - h + 0.5}})
  end
end
local TF, TS, CB, RF, CF = U(tents), U(tshade), U(cabins), U(roofs), U(cfront)
local houses = TF + TS + CB + RF + CF
local HG = houses:grow(3)
-- the slope, the river and the near mud, all to the bottom
local m = below(MC)
local gn = noise{seed=8, octaves=3, period=90, stretch={0, 4}}
local scar = noise{seed=13, octaves=4, period=70, stretch={0.9, 2}}
local river = mask(function(x, y) return smoothstep(RT(x) - 1, RT(x) + 1, y) * (1 - smoothstep(RB(x) - 1, RB(x) + 1, y)) end)
local slope = m - river - houses:grow(0.5)
work(slope, {hand="body", fill=true, color=function(x, y)
  local d = smoothstep(MC(x), RT(x), y)
  local c = mix("#73674f", "#5f5341", d)
  c = mix(c, "#9a8460", 0.55*smoothstep(0.15, 0.5, scar(x, y)))                                -- raw clay where the ground is torn
  c = mix(c, "#5d5c4b", 0.4*smoothstep(0.2, 0.6, gn(x*0.7, y*1.5)) * (1 - d))                -- a little scrub left
  if y > RT(x) then c = mix("#62564a", "#463c31", smoothstep(RB(x), H, y)) end
  return shift(c, 0.02*gn(x, y), 0, 0.006*gn(x, y))
end, angle=function(x, y) return 0.1 + 0.25*gn(x, y) end, angle_jitter=0.1, length={16, 50}, coverage=4.2, medium=0.12, clip=true, pal=landpal})
-- the river: thick with mud, dull, a little gray light on it toward the sun
work(river, {hand="body", fill=true, color=function(x, y)
  local c = mix("#77705f", "#5b5448", smoothstep(RT(x), RB(x), y))
  return mix(c, "#9a978a", 0.4*math.exp(-((x - SUNX)/150)^2) * (1 - smoothstep(RT(x), RB(x), y)))
end, angle=0.004, angle_jitter=0.01, length={40, 120}, coverage=4.2, medium=0.2, clip=true, pal=landpal})
blend(river, {angle=0, coverage=1.2, length={40, 140}})
-- tailings: gray gravel heaps along both banks, some cutting into the water
local heaps = {}
for i = 1, 16 do
  local x = rand(10, 990)
  local y = (i % 2 == 0) and RT(x) + 1 or RB(x) + 1
  heaps[#heaps + 1] = ellipse(x, y, rand(9, 20), rand(2.5, 4.5)) * above(function(xx) return y + 2 end)
end
work(U(heaps) - houses, {hand="body", fill=true, color=function(x, y) return mix("#8c877c", "#6c675d", smoothstep(-0.3, 0.6, gn(x*3, y*3))) end,
  angle=0, length={8, 20}, coverage=2.5, medium=0.12, clip=true, pal=landpal})
-- the camp
work(TF, {hand="detail", color="#cfc8b4", angle=1.57, coverage=3, medium=0.12, pal=landpal})
work(TS, {hand="detail", color="#9a9383", angle=0, coverage=3, medium=0.12, pal=landpal})
work(CB, {hand="detail", color="#6b5843", angle=1.57, coverage=3, medium=0.12, pal=landpal})
work(CF, {hand="detail", color="#8b7558", angle=1.57, coverage=3, medium=0.12, pal=landpal})
work(RF, {hand="detail", color="#544a3e", angle=0, coverage=3, medium=0.12, pal=landpal})
-- stumps: the whole slope cut over, dark posts with pale cut tops, thickest on the upper slope
local st, caps = {}, {}
for i = 1, 75 do
  local x = rand(5, 995)
  local u = rand(0, 1)^1.6
  local y = lerp(MC(x) + 6, RT(x) - 8, u)
  if HG:at(x, y) < 0.1 and HG:at(x, y - 6) < 0.1 then
    local sc = 0.8 + 0.6 * (y - 230) / 90
    local w, h = rand(2.2, 3.2)*sc, rand(3.5, 6)*sc
    st[#st + 1] = poly({{x - 0.8, y}, {x + 0.2, y - h}, {x + w - 0.2, y - h}, {x + w + 0.8, y}})
    caps[#caps + 1] = ellipse(x + w/2, y - h, w/2 + 0.2, 0.7)
  end
end
work(U(st), {hand="detail", color="#463c32", angle=1.57, coverage=3, medium=0.1, pal=landpal})
work(U(caps), {hand="detail", color="#a39478", angle=0, coverage=2, medium=0.1, pal=landpal})
-- felled logs lying across the slope
local logs = {}
for i = 1, 9 do
  local x = rand(20, 960)
  local y = rand(MC(x) + 12, RT(x) - 10)
  if HG:at(x, y) < 0.1 then logs[#logs + 1] = ribbon({{x, y}, {x + rand(12, 24), y + rand(-4, 4)}}, 1.3) end
end
work(U(logs), {hand="detail", color="#4d4134", angle=0, coverage=2.5, medium=0.1, pal=landpal})
-- sluices on trestles along the river, and a few small figures at them
local sl, legs, men = {}, {}, {}
for _, x in ipairs({90, 260, 420, 560, 700, 830, 930}) do
  local y = RT(x) - 2
  local l = rand(30, 55)
  sl[#sl + 1] = ribbon({{x, y - 4}, {x + l, y - 1}}, 1.6)
  for k = 0, 2 do local lx = x + 3 + k * (l - 6) / 2 legs[#legs + 1] = rect(lx, y - 4 + 3*k/2, 0.9, 4) end
  if rand(0, 1) < 0.7 then local fx = x + rand(4, l - 4) men[#men + 1] = rect(fx, y - 9, 1.4, 5.5) end
end
work(U(sl), {hand="detail", color="#7a6247", angle=0, coverage=3, medium=0.1, pal=landpal})
work(U(legs), {hand="detail", color="#3e342a", angle=1.57, coverage=2.5, medium=0.1, pal=landpal})
work(U(men), {hand="detail", color="#2e2b28", angle=1.57, coverage=3, medium=0.1, pal=landpal})
wait(24*60)
