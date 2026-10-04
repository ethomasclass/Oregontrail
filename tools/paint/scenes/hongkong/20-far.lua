-- the island's steep green peaks rising straight from the water, the young town along the shore
local fn = noise{seed=3, octaves=5, period=80, kind="ridged"}
local back = function(x)
  return curve({{0,196},{90,160},{200,122},{290,152},{360,138},{450,176},{560,198},{660,160},{760,118},{850,150},{940,188},{1000,204}})(x) + 7*fn(x, 0)
end
local fn2 = noise{seed=5, octaves=4, period=70}
local front = function(x)
  return curve({{0,262},{120,240},{240,258},{380,232},{520,262},{640,246},{780,236},{900,262},{1000,252}})(x) + 6*fn2(x, 0)
end
local rn = noise{seed=11, octaves=4, period=45, stretch={1.4, 2.5}}
local function slopecol(x, y, far)
  -- ravines in shadow, spurs lit from the left
  local r = rn(x, y)
  local lit = smoothstep(-0.2, 0.4, r)
  local c = mix("#5f6a57", "#8f9169", lit)
  if far then c = mix(c, "#b1b2a3", 0.68 - 0.3*smoothstep(back(x), HZ, y))
  else c = mix(c, "#a9ab98", 0.3) end
  return c
end
local water = below(function(x) return HZ end)
local r1 = below(back) - water
work(r1, {hand="body", fill=true, color=function(x, y) return slopecol(x, y, true) end, angle=0.5, angle_jitter=0.6,
  length={14, 40}, coverage=4.2, medium=0.15, clip=true, pal=landpal})
local r2 = below(front) - water
work(r2, {hand="body", fill=true, color=function(x, y) return mix(slopecol(x, y, false), "#7f8a66", 0.25) end, angle=-0.4, angle_jitter=0.6,
  length={12, 36}, coverage=4.2, medium=0.15, clip=true, pal=landpal})
-- the town: whitewashed houses and godowns along the shore
local bl = {}
for i = 1, 70 do
  local x = 160 + 560*rand(0, 1)^1.2
  local y = HZ - rand(0, 5)
  bl[#bl + 1] = rect(x, y - 2.5, rand(2.5, 6), rand(1.8, 3))
end
work(U(bl), {hand="detail", color="#ddd3bd", angle=0, coverage=3, medium=0.1, pal=landpal})
-- the water: the hazy sky mirrored, warm at the sun
local sn = noise{seed=31, octaves=3, period=200, stretch={0, 7}}
work(water, {hand="broad", fill=true, color=function(x, y)
  local c = mix("#c9c3a9", "#a7a995", smoothstep(HZ, H, y))
  c = mix(c, "#e9d9ab", 0.5*math.exp(-((x - SUNX)/160)^2))
  local v = sn(x, y)
  return shift(c, 0.015*v, 0, 0.004*v)
end, angle=0, angle_jitter=0.004, curve={0, 0}, length={80, 240}, coverage=4, medium=0.25, load=0.8, clip=true, pal=landpal})
-- the peaks' reflection, faint and dragged
local refl = water * mask(function(x, y) return 1 - smoothstep(HZ + 4, HZ + 14, y) end)
work(refl, {hand="body", fill=true, color="#868d74", angle=1.57, angle_jitter=0.05, length={4, 12}, coverage=1.3, medium=0.3, pal=landpal})
blend(refl:grow(4), {angle=0, coverage=1.5, length={30, 100}})
-- distant junks: small brown sails far out on the water
local js = {}
for _, s in ipairs({{70, 302}, {540, 300}, {590, 303}, {880, 301}}) do
  local h, sl, b, r = junk(s[1], s[2], 14, 12, s[1] > 500)
  js[#js + 1] = h + sl
end
work(U(js), {hand="detail", color="#7a6048", angle=1.57, coverage=3, medium=0.1, pal=landpal})
wait(24*60)
