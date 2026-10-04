-- a vast sky: deep blue above, warm glow low ahead, towering cumulus lit from the low sun
local gn = noise{seed=17, octaves=3, period=260}
local function glow(x, y)
  local d = math.sqrt(((x - SUNX)/(260 + 60*gn(x, 0)))^2 + ((y - SUNY)/150)^2)
  return math.exp(-d*d)
end
local sn = noise{seed=31, octaves=3, period=180, stretch={0, 7}}
local function skycol(x, y)
  local t = clamp(y / HZ, 0, 1)
  local c = gradient({{0,"#4f6488"},{0.35,"#7a8daa"},{0.68,"#b9b7ae"},{0.88,"#e6cc98"},{1,"#efd7a2"}}, t)
  c = mix(c, "#f7e2a9", 0.7*glow(x, y))
  local v = sn(x, y)
  return shift(c, 0.02*v, 0.004*v, 0.008*v)
end
local skym = above(function(x) return HZ + 30 end)
work(skym, {hand="broad", color=skycol, angle=0, angle_jitter=0.02, length={140, 340}, coverage=4.6, medium=0.35, load=0.8, fill=true, pal=skypal})
blend(skym, {angle=0, coverage=1.2, length={150, 400}})
-- towering cumulus: a great tower at left, a smaller one at right; lit on the side toward the sun
local bn = noise{seed=44, octaves=4, period=46, kind="billow"}
local towers = {
  {cx=240, top=62, base=246, w0=40, w1=170, lean=-0.18},
  {cx=890, top=138, base=248, w0=28, w1=110, lean=0.1},
}
local function tower(t, x, y)
  if y < t.top - 20 or y > t.base + 4 then return 0, 0 end
  local f = clamp((y - t.top) / (t.base - t.top), 0, 1)
  local w = lerp(t.w0, t.w1, f^0.7) * (1 + 0.28*bn(x, y))
  local cx = t.cx + t.lean*(y - t.base)
  local d = (x - cx) / w
  local inside = (1 - smoothstep(0.85, 1.0, math.abs(d))) * smoothstep(t.top - 8 + 14*bn(x*1.3, 0), t.top + 6, y)
    * (1 - smoothstep(t.base - 4, t.base + 2, y))
  return inside, d
end
local cm = mask(function(x, y)
  local a = tower(towers[1], x, y)
  local b = tower(towers[2], x, y)
  return math.max(a, b)
end):blur(1.5)
local function cloudcol(x, y)
  local t = x < 600 and towers[1] or towers[2]
  local _, d = tower(t, x, y)
  local dir = (SUNX > t.cx) and 1 or -1
  local lit = smoothstep(-0.1, 0.8, d*dir) * (0.6 + 0.4*bn(x*1.5, y*1.5))
  local f = clamp((y - t.top) / (t.base - t.top), 0, 1)
  local body = mix("#a8a3ac", "#7d7b8c", f)
  return mix(body, mix("#f6e2b8", "#f0c88e", f), clamp(lit, 0, 1)*0.85)
end
-- the body of each tower as one mass of level strokes, in its shadow color
local function shadecol(x, y)
  local t = x < 600 and towers[1] or towers[2]
  local f = clamp((y - t.top) / (t.base - t.top), 0, 1)
  return mix(mix("#b2abb0", "#8a8695", f), "#c9b49f", 0.35*glow(x, y))
end
work(cm, {hand="broad", fill=true, color=shadecol, angle=0, angle_jitter=0.25, curve={0.15, 0.05},
  length={40, 120}, coverage=3.4, medium=0.3, load=0.9, pressure={0.5, 0.75}, ramps={0.25, 0.35}, clip=cm:grow(2):blur(1.5), pal=skypal})
-- the lit flank toward the sun and the sunlit tops, laid into the wet body
local litm = mask(function(x, y)
  local best = 0
  for _, t in ipairs(towers) do
    local inside, d = tower(t, x, y)
    if inside > 0 then
      local dir = (SUNX > t.cx) and 1 or -1
      local flank = smoothstep(0.0, 0.75, d*dir)
      local top = 1 - smoothstep(t.top + 6, t.top + 40, y)
      best = math.max(best, inside * math.max(flank, 0.7*top) * (0.55 + 0.45*smoothstep(-0.3, 0.3, bn(x*1.2, y*1.2))))
    end
  end
  return best
end):blur(2)
work(litm, {hand="broad", color=cloudcol, hug=false, angle=0, angle_jitter=0.35, curve={0.2, 0.1},
  length={25, 80}, coverage=2.2, medium=0.3, load=0.9, pressure={0.45, 0.7}, ramps={0.25, 0.35}, clip=cm:grow(1), pal=skypal})
-- soften the shadowed bases into the sky, keep the lit edges found
local bases = cm * mask(function(x, y) return smoothstep(180, 240, y) end)
blend(bases, {angle=0, coverage=1.6, length={40, 140}})
-- a long low bank of stratus across the glow, thinning over the sun
local ln = noise{seed=9, octaves=4, period=200, stretch={0, 5}}
local low = mask(function(x, y)
  local c = 262 + 6*ln(x, 0)
  return (1 - smoothstep(3, 7, math.abs(y - c))) * smoothstep(-0.2, 0.2, ln(x, 90)) * (1 - 0.8*math.exp(-((x - SUNX)/70)^2))
end):blur(1.5)
work(low, {hand="broad", color=function(x, y) return mix("#a59496", "#e9b986", glow(x, y)) end, hug=false, angle=0, angle_jitter=0.01, curve={0, 0},
  length={90, 240}, coverage=1.2, medium=0.35, load=0.7, pressure={0.35, 0.5}, pal=skypal})
blend(low, {angle=0, coverage=1.2})
-- the sun itself, low, dissolving into the glow
local sun = ellipse(SUNX, SUNY, 6, 6):blur(2)
work(sun, {hand="body", color="#fbefc4", angle=0, length={5, 10}, coverage=2.4, medium=0.25, pal=skypal})
blend(ellipse(SUNX, SUNY, 30, 20):blur(6), {angle=0, coverage=1.6, length={10, 40}})
wait(24*60)
