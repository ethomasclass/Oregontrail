-- nearer water: a few deserted hulks turned storeships, roofed over, their masts cut down
local MCR = function(x) return 304 + 1.5*math.sin(x / 37) end
local m = below(MCR)
local hulks, roofs, stubs, refl, ports = {}, {}, {}, {}, {}
for _, s in ipairs({{110, 324, 120}, {440, 316, 84}, {760, 330, 150}}) do
  local x, y, L = s[1], s[2], s[3]
  local hh = L * 0.1
  hulks[#hulks + 1] = poly({{x - L/2 - 6, y - hh - 2}, {x - L/2 + 8, y - hh}, {x + L/2 - 4, y - hh}, {x + L/2 + 4, y - hh - 1.5}, {x + L/2 - 3, y}, {x - L/2 + 6, y}}, true)
  local rw = L * 0.62
  roofs[#roofs + 1] = poly({{x - rw/2, y - hh}, {x - rw/2 + 6, y - hh - 0.09*L}, {x + rw/2 - 6, y - hh - 0.09*L}, {x + rw/2, y - hh}})
  stubs[#stubs + 1] = rect(x - L*0.38, y - hh - 4, 1.6, 4)
  stubs[#stubs + 1] = rect(x + L*0.36, y - hh - 4.5, 1.6, 4.5)
  refl[#refl + 1] = poly({{x - L/2 + 4, y}, {x + L/2 - 2, y}, {x + L/2 - 6, y + hh * 1.6}, {x - L/2 + 8, y + hh * 1.5}})
  for k = 1, 5 do ports[#ports + 1] = rect(x - L/2 + 6 + (L - 12) * k / 6, y - hh*0.55, 1.4, 1.2) end
end
local HK, RF, ST, RFL = U(hulks), U(roofs), U(stubs), U(refl)
local sn = noise{seed=33, octaves=3, period=200, stretch={0, 7}}
local function wcol(x, y)
  local c = mix("#8f9aa2", "#6f7b85", smoothstep(304, H, y))
  c = mix(c, "#d7d8d2", 0.55*math.exp(-((x - SUNX)/110)^2) * (1 - smoothstep(304, 380, y)))
  local v = sn(x, y)
  return shift(c, 0.02*v, 0, 0.005*v)
end
-- the hulks and their reflections first, then the water around them while they are wet
work(HK, {hand="detail", color=function(x, y) return mix("#4a413a", "#2f2a26", smoothstep(300, 322, y)) end, angle=0, coverage=3.5, medium=0.12, pal=landpal})
work(RF, {hand="detail", color="#5f564b", angle=0, coverage=3, medium=0.12, pal=landpal})
work(ST, {hand="detail", color="#3a332d", angle=1.57, coverage=3, medium=0.1, pal=landpal})
work(U(ports), {hand="detail", color="#1f1c1a", angle=0, coverage=2, medium=0.1, pal=landpal})
work(RFL, {hand="body", fill=true, tool="filbert 5", color="#4c535a", angle=1.57, angle_jitter=0.05, length={6, 18}, coverage=2.6, medium=0.3, load=0.8, pal=landpal})
local open = m - HK - RFL
work(open, {hand="broad", fill=true, color=wcol, angle=0, angle_jitter=0.004, curve={0, 0}, length={100, 280}, coverage=4, medium=0.3, load=0.75,
  pal=landpal, clip=open:grow(2):blur(1.5)})
blend(RFL:grow(5) * m - HK, {angle=0, angle_jitter=0.004, length={30, 120}, coverage=1.8, clip=m - HK})
-- silver ripple lights toward the light
local sil = m * mask(function(x, y) return math.exp(-((x - SUNX)/130)^2) * (1 - smoothstep(320, 400, y)) end) - HK:grow(2)
work(sil, {hand="body", color="#d6d8d2", angle=0, angle_jitter=0.01, length={30, 90}, coverage=0.5, medium=0.25, hug=false, pressure={0.3, 0.45}, pal=landpal})
wait(24*60)
