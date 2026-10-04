-- dusk: deep blue overhead, through a dusty mauve, to an ember band along the horizon
local gn = noise{seed=141, octaves=3, period=260}
local function glow(x, y)
  return math.exp(-((x - SUNX)/(300 + 70*gn(x, 0)))^2) * smoothstep(HZ - 150, HZ, y)
end
local sn = noise{seed=142, octaves=3, period=180, stretch={0, 7}}
local function skycol(x, y)
  local t = clamp(y / HZ, 0, 1)
  local c = gradient({{0,"#26304a"},{0.35,"#3d4865"},{0.6,"#6a6a80"},{0.78,"#a88078"},{0.9,"#cf8a55"},{1,"#de9a58"}}, t)
  c = mix(c, "#efb062", 0.6*glow(x, y))
  local v = sn(x, y)
  return shift(c, 0.015*v, 0.003*v, 0.006*v)
end
local skym = above(function(x) return HZ + 30 end)
work(skym, {hand="broad", color=skycol, angle=0, angle_jitter=0.02, length={140, 340}, coverage=4.8, medium=0.32, load=0.8, fill=true, pal=skypal})
blend(skym, {angle=0, coverage=1.3, length={150, 400}})
-- a few long low streaks of cloud, dark, their undersides touched with the last ember light
local bn = noise{seed=143, octaves=5, period=240, stretch={0, 6}}
local bn2 = noise{seed=144, octaves=4, period=120, stretch={0, 4}}
local function band(y, c, th) return 1 - smoothstep(0.5*th, th, math.abs(y - c)) end
local function c1(x) return 228 + 10*bn(x, 90) - 0.02*(x - 500) end
local function c2(x) return 258 + 6*bn(x*1.3, 40) end
local low = mask(function(x, y)
  local a = band(y, c1(x), 9 + 5*bn2(x, 300)) * smoothstep(-0.3, 0.1, bn2(x*1.3, 500))
  local b = band(y, c2(x), 5 + 3*bn2(x, 700)) * smoothstep(-0.1, 0.3, bn2(x*1.1, 900))
  return math.max(a, b)
end):blur(1.5)
local function cloudcol(x, y)
  local c = y < 245 and c1(x) or c2(x)
  local lit = smoothstep(c - 2, c + 8, y) * (0.05 + 0.95*math.exp(-((x - SUNX)/280)^2))
  return mix("#554c5e", "#e09a5c", lit)
end
work(low:blur(3), {hand="broad", color=cloudcol, hug=false, angle=0, angle_jitter=0.02, curve={0, 0},
  length={90, 260}, coverage=2.0, medium=0.35, load=0.85, pressure={0.45, 0.7}, ramps={0.25, 0.35}, pal=skypal})
blend(low, {angle=0, coverage=1.4})
wait(2*24*60)
-- the first stars, few, mostly where the sky is darkest; one brighter planet low over the glow
local b = brush{kind="round", width=1.3, point=0.5}
local placed = 0
for i = 1, 400 do
  local x, y = rand(5, 995), rand(6, 150)
  local keep = (1 - smoothstep(40, 150, y)) * (1 - 0.8*math.exp(-((x - 500)/120)^2)*(1 - smoothstep(0, 90, y)))
  if rand() < keep*0.22 then
    b:reload(rand() < 0.3 and "#f3e6c8" or "#dfe2ea", 0.5)
    b:touch(x, y, {pressure=rand(0.25, 0.55)})
    placed = placed + 1
  end
end
local p = brush{kind="round", width=2.2, point=0.5}
p:reload("#fbf1d6", 0.7)
p:touch(870, 168, {pressure=0.6})
print("stars", placed)
wait(24*60)
