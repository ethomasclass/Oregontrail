-- the far range: low blue hills and one lone peak with snow on its crown, lit from the left
local fn = noise{seed=111, octaves=5, period=90}
local hn = noise{seed=112, octaves=4, period=160}
PEAKX = 770
local function crest(x)
  local hills = 276 - 14*hn:at01(x, 0) - 8*math.exp(-((x-120)/110)^2)
  local d = (x - PEAKX)
  local peak = 66*math.exp(-(d/(d < 0 and 70 or 55))^2) + 44*math.exp(-((x - 700)/80)^2) + 30*math.exp(-((x - 860)/70)^2) + 18*math.exp(-((x - 610)/60)^2)
  return hills - peak - 9*fn(x, 0)*(1 - smoothstep(205, 260, hills - peak))
end
local m = below(crest)
local sn = noise{seed=113, octaves=4, period=40}
-- slope facing the sun (left) or away from it: compare the crest a little to each side
local function facing(x)
  return clamp((crest(x - 6) - crest(x + 6)) / 10, -1, 1)
end
work(m, {hand="body", fill=true, color=function(x, y)
  local mtn = 1 - smoothstep(250, 268, crest(x))
  local c = mix("#9aa0b0", "#acadad", smoothstep(240, 295, y))
  c = mix(c, mix("#6f7690", "#8a8fa2", smoothstep(200, 290, y)), mtn)
  local f = facing(x) * (1 - smoothstep(crest(x) + 10, crest(x) + 70, y))
  c = mix(c, "#b5a99c", 0.45*clamp(f, 0, 1))
  c = mix(c, "#646a86", 0.4*clamp(-f, 0, 1))
  return shift(c, 0.02*sn(x, y), 0, 0.006*sn(x, y))
end, angle=0.3, angle_jitter=0.3, length={12, 40}, coverage=4, medium=0.15, clip=true, pal=landpal})
wait(15*60)
-- snow on the peak's crown, warm on the sunward slopes, blue in the shade
local snow = (m * mask(function(x, y)
  local c = crest(x)
  if c > 222 then return 0 end
  local depth = 4 + 16*(1 - smoothstep(205, 222, c))
  local patch = smoothstep(-0.25, 0.1, sn(x*1.5, y*3))
  return (1 - smoothstep(depth*0.5, depth, y - c - 4*sn(x, y*2))) * patch
end)):roughen(2, 5, 114, 1)
work(snow, {hand="body", fill=true, tool="filbert 3", color=function(x, y)
  local f = facing(x)
  return mix("#aab0c4", "#f3e6d0", smoothstep(-0.2, 0.4, f))
end, angle=0.6, angle_jitter=0.4, length={6, 18}, coverage=3, medium=0.15, clip=m, pal=landpal})
wait(24*60)
