-- The Wind River Range: snowcapped peaks lit from the left, blue in shadow, veiled by drifting cloud;
-- a lower wooded foothill ridge in front of them.
local rn = noise{seed=151, octaves=5, period=46, kind="ridged"}
local function peak(x, c, h, w) return h * math.exp(-(math.abs(x - c)/w)^1.25) end
local function crest(x)
  local y = 258 - peak(x, 250, 70, 90) - peak(x, 420, 95, 80) - peak(x, 560, 128, 75) - peak(x, 655, 112, 60)
    - peak(x, 790, 92, 85) - peak(x, 930, 64, 70) - 10*math.exp(-((x - 100)/90)^2)
  return y - 10*rn:at01(x, 0) + 6
end
local m = below(crest):roughen(0.6, 7, 152)
-- the light: faces that rise toward the right look left, into the sun
local spur = noise{seed=153, octaves=4, period=34, kind="ridged", stretch={1.5708, 3}, warp={60, 14}}
local function facing(x, y)
  local d = y - crest(x)
  local slope = (crest(x - 3) - crest(x + 3)) / 6          -- > 0 where the crest climbs to the right
  local s1 = clamp(1.6*slope, -1, 1) * (1 - smoothstep(10, 70, d))
  local s2 = (spur(x - 2.5, y) - spur(x + 2.5, y)) * 2.2
  return clamp(0.5 - 0.5*(s1 + s2*(0.4 + 0.6*smoothstep(0, 40, d))), 0, 1)  -- 1 lit, 0 shade
end
local sn = noise{seed=154, octaves=4, period=30, warp={40, 8}}
local function far_col(x, y)
  local d = y - crest(x)
  local lit = facing(x, y)
  -- snow above the snowline, deeper on high ground, lying in streaks down the gullies
  local snow = smoothstep(SNOWLINE + 22, SNOWLINE - 8, y + 26*sn(x, y) + 18*spur(x, y))
  -- dark rock ribs break through the snow on the steep spurs and below the summits
  local rib = smoothstep(0.62, 0.86, spur:at01(x * 1.3, y)) * smoothstep(8, 30, d)
  snow = snow * (1 - 0.85*rib) * (1 - 0.5*smoothstep(0.2, 0.6, sn(x * 0.7, y + 90)) * smoothstep(20, 60, d))
  local rock = gradient({{0, "#4f5b7c"}, {0.5, "#6f7590"}, {1, "#9e9698"}}, lit)
  local snowc = gradient({{0, "#9aa8c6"}, {0.45, "#c9d0dc"}, {1, "#fbf1dc"}}, lit)
  local c = mix(rock, snowc, snow)
  -- the air: the lower slopes melt into blue haze
  c = mix(c, "#a8b3c6", 0.55*smoothstep(205, HZ, y))
  return c
end
work(m, {hand="body", fill=true, tool="filbert 4", color=far_col, angle=function(x, y)
  local slope = (crest(x - 3) - crest(x + 3)) / 6
  return 1.5708 - 0.7*clamp(slope*1.5, -1, 1)
end, length={8, 26}, coverage=4.2, medium=0.15, load=0.85, clip=true, pal=landpal})
-- drifting cloud across the flanks, in front of the range: soft, lit on top, lost below
local cn = noise{seed=155, octaves=5, period=110, stretch={0, 3}, warp={80, 20}}
local mist = mask(function(x, y)
  local c = 214 + 10*cn(x, 0)
  local v = cn(x, y) + 0.2 - math.abs(y - c)/18
  return smoothstep(0.0, 0.35, v) * smoothstep(-0.2, 0.2, cn(x*0.7, 200))
end):blur(3) * m
work(mist, {hand="broad", fill=true, color=function(x, y)
  return mix("#f4ecdc", "#c3c7d2", smoothstep(205, 228, y))
end, hug=false, angle=0, angle_jitter=0.05, length={40, 120}, coverage=1.8, medium=0.4, load=0.7, pressure={0.35, 0.6}, pal=skypal, clip=m})
blend(mist, {angle=0, coverage=1.2, length={40, 120}})
-- the foothill ridge: darker, cooler, dusted with pine
local fn = noise{seed=156, octaves=4, period=80}
local fn3 = noise{seed=159, octaves=5, period=40}
local fcrest = function(x) return 250 + 7*fn(x, 0) + 5*fn3(x, 0) + 8*math.exp(-((x - 520)/160)^2) - 14*math.exp(-((x - 880)/90)^2) - 8*math.exp(-((x - 120)/70)^2) end
local fm = below(fcrest):roughen(0.8, 8, 157)
local tn = noise{seed=158, octaves=3, period=9}
local fs = noise{seed=160, octaves=3, period=30, stretch={1.2, 3}}
work(fm, {hand="body", fill=true, color=function(x, y)
  local d = y - fcrest(x)
  -- dark pine on the ridges, lit grassy slopes facing the sun
  local c = mix("#55627a", "#7b8798", smoothstep(0, 30, d))
  c = mix(c, "#8e9196", 0.35*smoothstep(0.1, 0.5, fs(x, y)))
  c = shift(c, -0.04*math.max(0, tn(x, y)), 0, 0)
  c = mix(c, "#a3a9b0", smoothstep(HZ - 10, HZ + 30, y))
  return mix(c, "#848a90", 0.25*math.exp(-((x - SUNX)/200)^2))
end, angle=0, length={14, 40}, coverage=4, medium=0.15, clip=true, pal=landpal})
wait(24*60)
