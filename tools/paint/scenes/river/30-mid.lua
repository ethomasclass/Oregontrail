-- the far bank: a line of cottonwoods with a ferry landing in a gap, and the wide brown river
-- that holds the broken sky
local bil = noise{seed=81, octaves=3, period=38, kind="billow"}
local bn = noise{seed=82, octaves=3, period=120}
local crowns = {{30, 20, 40}, {105, 28, 46}, {180, 16, 34}, {262, 30, 52}, {345, 20, 40}, {420, 26, 44}, {500, 14, 36}, {560, 18, 34},
  {770, 24, 42}, {845, 16, 36}, {920, 30, 50}, {990, 18, 36}}
TCREST = function(x)
  local h = 6 + 8*bil:at01(x, 0) + 6*bn:at01(x, 0)
  local top = 0
  for _, c in ipairs(crowns) do
    local u = (x - c[1]) / c[3]
    if math.abs(u) < 1 then top = math.max(top, c[2]*math.sqrt(1 - u*u)) end
  end
  h = h + top*(0.85 + 0.3*bil:at01(x*2, 7))
  h = h * (1 - 0.8*math.exp(-((x - 662)/48)^2))
  return BANK - 4 - h
end
local trees = below(TCREST) * above(function(x) return BANK + 0.5 end)
local refl = mask(function(x, y)
  local d = (BANK - TCREST(x)) * 0.55
  return (y >= BANK and y < BANK + d) and 1 or 0
end):roughen(2, 6, 83, 1)
local water = below(function(x) return BANK end)
local tl = noise{seed=84, octaves=3, period=12}
local function treecol(x, y)
  local c = mix("#5a5f4e", "#3f4436", smoothstep(TCREST(x), BANK, y))
  return shift(c, 0.03*tl(x, y), 0, 0.01*tl(x, y))
end
-- the darks first: the trees and their reflection, pulled down, laid together
work(trees, {hand="body", fill=true, tool="filbert 5", color=treecol, angle=function(x, y) return -1.2 + 1.0*tl(x, y) end,
  length={6, 18}, coverage=3.4, medium=0.25, load=0.8, clip=trees:grow(1), pal=landpal})
work(refl, {hand="body", fill=true, tool="filbert 5", color=function(x, y)
  local c = treecol(x, 2*BANK - y)
  return mix(shift(c, -0.04, 0, 0), "#5c4c3a", 0.35)
end, angle=math.pi/2, angle_jitter=0.05, length={8, 24}, coverage=2.8, medium=0.3, load=0.8, pal=landpal})
-- then the open water around them: the sky mirrored (shortened), muddied and darkening toward us
local wn = noise{seed=85, octaves=3, period=200, stretch={0, 9}}
local wn2 = noise{seed=86, octaves=2, period=40, stretch={0, 12}}
local function watercol(x, y)
  local yy = BANK - (y - BANK)*3
  local c = SKYCOL(x, yy)
  c = mix(c, "#6c6b74", 0.65*CLOUDV(x, yy))
  local d = smoothstep(BANK, H, y)
  c = mix(c, "#806548", 0.32 + 0.2*d)
  c = mix(c, "#4d3f31", 0.4*d)
  local v = wn(x, y) + 0.6*wn2(x, y)
  return shift(c, 0.04*v, 0, 0.008*v)
end
local openw = water - refl
work(openw, {hand="broad", fill=true, color=watercol, angle=0, angle_jitter=0.004, curve={0, 0}, length={120, 320},
  coverage=3.8, medium=0.3, load=0.75, fill=true, clip=openw:grow(3):blur(2), pal=landpal})
blend(refl:grow(8) * water, {angle=0, angle_jitter=0.004, length={40, 160}, coverage=2.0, clip=water})
wait(15*60)
-- lights on the crowns facing the break in the clouds
local ln = noise{seed=87, octaves=3, period=30}
local lit = (trees * mask(function(x, y)
  local top = TCREST(x)
  return (1 - smoothstep(top + 4, top + 14, y)) * smoothstep(-0.15, 0.25, ln(x, y)) * (0.3 + 0.7*math.exp(-((x - SUNX)/300)^2))
end)):blur(1.5)
work(lit, {hand="body", fill=true, tool="filbert 3", color=function(x, y)
  return mix("#7d7d58", "#b4a670", math.exp(-((x - SUNX)/220)^2))
end, angle=-1.0, angle_jitter=0.8, length={4, 10}, coverage=1.6, medium=0.15, hug=false, clip=trees:grow(1), pal=landpal})
-- the landing: a muddy slope in the gap of the trees
local landing = poly({{606, BANK + 0.5}, {630, BANK - 5}, {700, BANK - 6}, {722, BANK + 0.5}}, true)
work(landing, {hand="body", fill=true, tool="filbert 3", color=function(x, y) return mix("#8d7a5c", "#b19c74", clamp((x - 606)/116, 0, 1)) end,
  angle=0, length={6, 20}, coverage=3, medium=0.15, clip=true, pal=landpal})
wait(24*60)
-- the ferry: a flat scow with a wagon aboard, moored at the landing, and its reflection
local hull = rect(626, BANK + 0.5, 46, 3.4)
local deck = rect(626, BANK - 0.8, 46, 1.4)
local bonnet = ellipse(648, BANK - 5.5, 7, 5) * above(function(x) return BANK - 4.5 end)
local wbed = rect(641, BANK - 5, 15, 3.6)
local post = rect(710, BANK - 16, 1.6, 16) + rect(618, BANK - 12, 1.4, 12)
work(hull + wbed + post, {hand="detail", fill=true, tool="round 1.4", color="#3d3128", coverage=3, medium=0.1, clip=true, pal=landpal})
work(deck, {hand="detail", fill=true, tool="round 1.2", color="#a6916c", angle=0, coverage=2.5, medium=0.1, clip=true, pal=landpal})
work(bonnet, {hand="detail", fill=true, tool="round 1.6", color=function(x, y)
  return mix("#b2ada3", "#f2e7cc", smoothstep(643, 653, x))
end, coverage=3, medium=0.1, clip=true, pal=landpal})
local frefl = rect(626, BANK + 4, 46, 4)
work(frefl, {hand="body", fill=true, tool="filbert 3", color="#4f4132", angle=math.pi/2, length={3, 6}, coverage=1.6, medium=0.3, load=0.5, clip=frefl:grow(1), pal=landpal})
wait(24*60)
