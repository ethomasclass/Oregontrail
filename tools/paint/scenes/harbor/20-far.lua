-- the sand hills with tents and frame houses climbing them, the cove below thick with anchored ships
local m = below(HILL)
local water = below(function(x) return HZ end)
local hills = m - water
-- buildings first, reserved: dense at the shore, thinning up the slopes
local bl, bd = {}, {}
for i = 1, 170 do
  local x = rand(5, 995)
  local top = HILL(x) + 6
  local u = rand(0, 1)^1.8                     -- most of them low on the slope
  local y = lerp(HZ - 2, top + 8, u)
  if y > top + 4 then
    local w, h = rand(2.5, 6.5), rand(2, 4.2)
    if rand(0, 1) < 0.45 then bl[#bl + 1] = rect(x, y - h, w, h) else bd[#bd + 1] = rect(x, y - h, w, h) end
  end
end
local BL, BD = U(bl), U(bd)
local hn = noise{seed=12, octaves=3, period=60}
work(hills - (BL + BD):grow(0.4), {hand="body", fill=true, color=function(x, y)
  local d = smoothstep(HILL(x), HZ, y)
  local c = mix("#a9a594", "#b7a882", d)                         -- bluer and paler near the tops
  c = mix(c, "#7c7865", 0.45*smoothstep(0.1, 0.5, hn(x, y*1.4)))   -- chaparral in the folds
  return mix(c, "#cbc7bb", 0.25*math.exp(-((x - SUNX)/200)^2) * (1 - d))
end, angle=0.15, angle_jitter=0.3, length={14, 40}, coverage=4.2, medium=0.15, clip=true, pal=landpal})
work(BL, {hand="detail", color="#d6d1c3", angle=0, coverage=3, medium=0.1, pal=landpal})
work(BD, {hand="detail", color="#857560", angle=0, coverage=3, medium=0.1, pal=landpal})
-- the water of the cove, to the bottom
local sn = noise{seed=31, octaves=3, period=200, stretch={0, 7}}
work(water, {hand="broad", fill=true, color=function(x, y)
  local c = mix("#a3abb0", "#8a959e", smoothstep(HZ, H, y))
  c = mix(c, "#d2d4cf", 0.5*math.exp(-((x - SUNX)/150)^2))
  local v = sn(x, y)
  return shift(c, 0.015*v, 0, 0.004*v)
end, angle=0, angle_jitter=0.005, curve={0, 0}, length={80, 240}, coverage=4, medium=0.25, load=0.8, clip=true, pal=landpal})
-- fog drifting down over the hilltops
local fogm = mask(function(x, y) return 1 - smoothstep(HILL(x) + 4, HILL(x) + 30, y) end) * hills:grow(8)
work(fogm:blur(3), {hand="broad", fill=true, color="#c8cbc8", hug=false, angle=0.05, angle_jitter=0.05, length={40, 140}, coverage=1.3,
  medium=0.35, load=0.6, pressure={0.3, 0.5}, pal=skypal})
-- the forest of masts: hulls along the shore, masts standing against the sand
local hulls, masts, yards, refl = {}, {}, {}, {}
local xs = uneven(95, 10, 990, 0.8, 0.7, 4)
for i, x in ipairs(xs) do
  local y = HZ + 2 + 20*rand(0, 1)^1.5
  local L = rand(10, 26) * (0.7 + (y - HZ)/30)
  hulls[#hulls + 1] = poly({{x - L/2, y - 2.6}, {x + L/2, y - 3.2}, {x + L/2 - 2, y}, {x - L/2 + 1.5, y}})
  local nm = (rand(0, 1) < 0.7) and 3 or 2
  for k = 1, nm do
    local mx = x - L/2 + L * (k - 0.5) / nm + rand(-1, 1)
    local mh = rand(24, 66) * (0.7 + (y - HZ)/35) * (k == 2 and 1.1 or 1)
    local top = math.max(y - mh, HILL(mx) + 10)
    masts[#masts + 1] = rect(mx - 0.45, top, 0.9, y - 2.5 - top)
    for j = 1, 3 do
      local yy = top + (y - top) * (0.12 + 0.2 * j)
      local yw = rand(4, 8) * (1.1 - 0.2 * j)
      if rand(0, 1) < 0.7 then yards[#yards + 1] = ribbon({{mx - yw/2, yy}, {mx + yw/2, yy}}, 0.5) end
    end
    refl[#refl + 1] = rect(mx - 0.4, y + 0.5, 0.8, rand(6, 14))
  end
end
work(U(refl), {hand="detail", color="#6e767c", angle=1.57, coverage=1.5, medium=0.15, pal=landpal})
work(U(hulls), {hand="detail", color="#3b3733", angle=0, coverage=3.5, medium=0.1, pal=landpal})
work(U(masts), {hand="detail", color="#463f38", angle=1.57, coverage=3, medium=0.1, pal=landpal})
work(U(yards), {hand="detail", color="#4c4640", angle=0, coverage=2.5, medium=0.1, pal=landpal})
wait(24*60)
