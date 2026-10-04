-- a clear spring morning: cool blue above, warm cream low on the right where the sun is up
local gn = noise{seed=27, octaves=3, period=260}
local function glow(x, y)
  return math.exp(-((x - SUNX)/(260 + 60*gn(x, 0)))^2) * smoothstep(HZ - 240, HZ, y)
end
local sn = noise{seed=33, octaves=3, period=180, stretch={0, 7}}
local function skycol(x, y)
  local t = clamp(y / HZ, 0, 1)
  local c = gradient({{0,"#6a86ad"},{0.3,"#8fa5bf"},{0.6,"#bfc5c4"},{0.82,"#e3dabc"},{1,"#efe0b6"}}, t)
  c = mix(c, "#fbe9b8", 0.65*glow(x, y))
  local v = sn(x, y)
  return shift(c, 0.02*v, 0.004*v, 0.008*v)
end
local skym = above(function(x) return HZ + 30 end)
work(skym, {hand="broad", color=skycol, angle=0, angle_jitter=0.02, length={140, 340}, coverage=4.6, medium=0.32, load=0.8, fill=true, pal=skypal})
blend(skym, {angle=0, coverage=1.2, length={150, 400}})
-- fair-weather clouds: soft flattened heaps low in the sky, lit on the side toward the sun;
-- the center top is left open
local cn = noise{seed=51, octaves=5, period=150, stretch={0, 2.6}}
local function cl(x, y)
  local env = smoothstep(95, 150, y) * (1 - smoothstep(225, 262, y))
  local hi = smoothstep(30, 60, y) * (1 - smoothstep(70, 95, y)) * 0.8
  local calm = 1 - 0.85*math.exp(-((x - 500)/170)^2) * (1 - smoothstep(110, 160, y))
  local e = math.max(env, hi * (1 - math.exp(-((x - 500)/260)^2)))
  return smoothstep(0.08, 0.32, cn(x, y) + 0.25*(e - 1)) * e * calm
end
local clouds = mask(cl):blur(2)
local function cloudcol(x, y)
  local d = cn(x, y) - cn(x + 9, y)          -- falling to the right: the side facing the sun
  local lit = clamp(d * 5, 0, 1) * (0.35 + 0.65*math.exp(-((x - SUNX)/380)^2))
  local base = mix("#b6b5be", "#c9c1bb", smoothstep(120, 240, y))
  local c = mix(base, "#f7e8c8", lit)
  return mix(c, "#9ea3b3", 0.35*smoothstep(170, 245, y) * (1 - lit))
end
work(clouds:blur(3), {hand="broad", color=cloudcol, hug=false, angle=0, angle_jitter=0.05, curve={0.1, 0},
  length={50, 160}, coverage=2.2, medium=0.35, load=0.85, pressure={0.45, 0.7}, ramps={0.25, 0.35}, pal=skypal})
blend(clouds, {angle=0, coverage=1.2, length={40, 140}})
wait(24*60)
