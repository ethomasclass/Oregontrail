-- the anchorage: junks under ribbed batten sails, two Western ships among them
local MCR = function(x) return 308 + 1.5*math.sin(x / 33) end
local m = below(MCR)
local hulls, sails, bats, refl = {}, {}, {}, {}
for _, j in ipairs({{250, 318, 38, 34, false}, {430, 327, 56, 52, true}, {640, 336, 84, 78, false}, {820, 320, 48, 44, true}, {725, 314, 30, 26, true}}) do
  local h, s, b, r = junk(j[1], j[2], j[3], j[4], j[5])
  hulls[#hulls + 1] = h sails[#sails + 1] = s bats[#bats + 1] = b refl[#refl + 1] = r
end
-- Western ships: dark hull, square sails set pale, on three masts
local wsails, whulls, wrefl = {}, {}, {}
for _, w in ipairs({{100, 316, 54, 1.0}, {950, 313, 44, 0.85}}) do
  local x, y, L, s = w[1], w[2], w[3], w[4]
  whulls[#whulls + 1] = poly({{x - L/2 - 6, y - 5*s}, {x + L/2, y - 5*s}, {x + L/2 - 3, y}, {x - L/2 + 2, y}})
  for k, dx in ipairs({-0.3, 0.02, 0.32}) do
    local mx = x + dx*L
    local hgt = (k == 2 and 52 or 44) * s
    local yb = y - 6*s
    for t = 0, 2 do
      local w2 = (13 - 3*t) * s
      local y1 = yb - hgt * (t/3) - 1
      local y0 = yb - hgt * ((t + 1)/3) + 1.5
      wsails[#wsails + 1] = poly({{mx - w2/2, y1}, {mx - w2/2 + 1, y0}, {mx + w2/2 - 1, y0}, {mx + w2/2, y1}})
    end
  end
  wrefl[#wrefl + 1] = poly({{x - L/2 + 2, y}, {x + L/2 - 3, y}, {x + L/2 - 6, y + 9*s}, {x - L/2 + 5, y + 9*s}})
end
local H1, S1, B1, R1 = U(hulls), U(sails), U(bats), U(refl)
local H2, S2, R2 = U(whulls), U(wsails), U(wrefl)
local boats = H1 + S1 + H2 + S2
-- boats and their reflections first; the water laid around them while they are wet
work(S1, {hand="detail", color=function(x, y) return mix("#977250", "#6c513b", smoothstep(-0.2, 0.5, math.sin(x / 9))) end, angle=1.57, coverage=3.5, medium=0.12, pal=landpal})
work(B1, {hand="detail", color="#4d3726", angle=0, coverage=2.5, medium=0.1, pal=landpal})
work(S2, {hand="detail", color=function(x, y) return x < 500 and "#e7dcc3" or "#cfc6b2" end, angle=1.57, coverage=3.5, medium=0.12, pal=landpal})
work(H1 + H2, {hand="detail", color=function(x, y) return mix("#5a4332", "#33281f", smoothstep(-0.5, 0.5, math.sin(y))) end, angle=0, coverage=3.5, medium=0.12, pal=landpal})
local RR = (R1 + R2) * m
work(RR, {hand="body", fill=true, tool="filbert 5", color="#868670", angle=1.57, angle_jitter=0.05, length={4, 10}, coverage=2.0, medium=0.3, load=0.8, pal=landpal})
local sn = noise{seed=33, octaves=3, period=200, stretch={0, 7}}
local open = m - boats - RR
work(open, {hand="broad", fill=true, color=function(x, y)
  local c = mix("#c3bea5", "#9ea18e", smoothstep(308, H, y))
  c = mix(c, "#e6d6aa", 0.5*math.exp(-((x - SUNX)/150)^2) * (1 - smoothstep(310, 380, y)))
  local v = sn(x, y)
  return shift(c, 0.015*v, 0, 0.004*v)
end, angle=0, angle_jitter=0.004, curve={0, 0}, length={100, 280}, coverage=4, medium=0.3, load=0.75, pal=landpal, clip=open:grow(2):blur(1.5)})
blend(RR:grow(2) * m - boats, {angle=0, angle_jitter=0.004, length={20, 60}, coverage=1.0, clip=m - boats})
wait(24*60)
