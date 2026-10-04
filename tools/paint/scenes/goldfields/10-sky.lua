-- an overcast sky, a weak sun smothered in gray
local gn = noise{seed=17, octaves=3, period=260}
local function glow(x, y)
  return math.exp(-((x - SUNX)/(230 + 60*gn(x, 0)))^2) * math.exp(-((y - SUNY)/120)^2)
end
local sn = noise{seed=31, octaves=3, period=180, stretch={0, 7}}
local function skycol(x, y)
  local t = clamp(y / HZ, 0, 1)
  local c = gradient({{0,"#666b74"},{0.4,"#818489"},{0.75,"#a19e96"},{1,"#b7b09f"}}, t)
  c = mix(c, "#d2cab0", 0.6*glow(x, y))
  local v = sn(x, y)
  return shift(c, 0.02*v, 0.003*v, 0.006*v)
end
local skym = above(function(x) return HZ + 30 end)
work(skym, {hand="broad", color=skycol, angle=0, angle_jitter=0.02, length={140, 340}, coverage=4.6, medium=0.35, load=0.8, fill=true, pal=skypal})
blend(skym, {angle=0, coverage=1.2, length={150, 400}})
-- a heavy lid of stratus: long dark bands with paler seams between them, calmer at the top center
local bn = noise{seed=9, octaves=5, period=220, stretch={0, 5}}
local bn2 = noise{seed=23, octaves=4, period=130, stretch={0, 4}}
local decks = mask(function(x, y)
  if y > HZ - 8 then return 0 end
  local calm = 1 - 0.7*math.exp(-((x - 500)/200)^2) * (1 - smoothstep(50, 120, y))
  local v = bn(x, y*1.6) + 0.3*bn2(x, y)
  return smoothstep(0.02, 0.3, v) * calm
end):blur(2)
local function cloudcol(x, y)
  local lit = glow(x, y)
  local c = mix("#5f5e64", "#7d7a7c", smoothstep(40, HZ, y))
  return mix(c, "#a9a395", 0.7*lit)
end
work(decks, {hand="broad", color=cloudcol, hug=false, angle=0, angle_jitter=0.02, curve={0, 0},
  length={90, 260}, coverage=2.2, medium=0.35, load=0.9, pressure={0.45, 0.7}, ramps={0.25, 0.35}, pal=skypal})
-- the sun only as a pale smear in the overcast
local disc = ellipse(SUNX, SUNY, 60, 24):blur(10)
work(disc, {hand="broad", color="#cdc6ae", hug=false, angle=0, length={50, 120}, coverage=1.4, medium=0.35, load=0.8, pressure={0.35, 0.5}, pal=skypal})
blend(decks + disc, {angle=0, coverage=1.5})
wait(24*60)
