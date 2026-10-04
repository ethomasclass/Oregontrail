-- the near sea: big dark swells, their backs lit by the sky, the sun's path broken across them
local cn = noise{seed=9, octaves=3, period=120}
local crest = function(x) return 352 + 3*math.sin(x / 83 + 1) + 1.5*cn(x, 0) end
local m = below(crest)
local wn = noise{seed=23, octaves=3, period=200}
local P = function(y) return 13 + 0.18*(y - 352) end
work(m, {hand="broad", fill=true, color=function(x, y)
  local c = swellcol(x, y, 352, P(y), "#1e2b3e", "#45556e", wn)
  c = mix(c, "#2b384c", 0.35*smoothstep(380, H, y))
  return mix(c, "#b9a47a", 0.55*sunpath(x, y))
end, angle=function(x, y) return 0.05*wn(x, y + 90) end, angle_jitter=0.004, curve={0.04, 0.01}, length={60, 220}, coverage=4.2, medium=0.25, load=0.8, clip=true, pal=landpal})
blend(m, {angle=0, angle_jitter=0.003, coverage=0.7, length={60, 220}})
-- the backs of the big swells, catching the sky
local backs = m * mask(function(x, y)
  local ph = (y - 352) / P(y) + 0.35*wn(x, y) + 0.05*math.sin(x / 90)
  local f = ph - math.floor(ph)
  local top = 1 - smoothstep(crest(x) + 1, crest(x) + 4, y)
  return math.max(top * 0.8, smoothstep(0.12, 0.2, f) * (1 - smoothstep(0.2, 0.32, f))) * smoothstep(-0.3, 0.2, wn(x*0.7, y + 900))
end)
work(backs, {hand="body", color="#6f7f98", angle=0, angle_jitter=0.01, length={30, 100}, coverage=0.9, medium=0.2, pressure={0.3, 0.5}, hug=false, pal=landpal})
local gl = m * mask(function(x, y) return sunpath(x, y) * smoothstep(0.2, 0.55, wn(x*1.2, y*3)) end)
work(gl, {hand="body", color="#efd9a3", angle=0, angle_jitter=0.01, length={14, 40}, coverage=0.6, medium=0.2, pressure={0.3, 0.5}, hug=false, pal=landpal})
