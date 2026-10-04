-- the middle sea: long swells in bands, deeper blue, catching the sky on their backs
local cn = noise{seed=5, octaves=3, period=110}
local crest = function(x) return 304 + 2*math.sin(x / 61) + 1.5*cn(x, 0) end
local m = below(crest)
local wn = noise{seed=22, octaves=3, period=160}
work(m, {hand="broad", fill=true, color=function(x, y)
  local c = swellcol(x, y, 304, 7 + 0.14*(y - 304), "#3d4d67", "#68789a", wn)
  return mix(c, "#dcc493", 0.7*sunpath(x, y))
end, angle=function(x, y) return 0.04*wn(x, y + 50) end, angle_jitter=0.004, curve={0.03, 0.01}, length={60, 200}, coverage=4.2, medium=0.25, load=0.8, clip=true, pal=landpal})
blend(m, {angle=0, angle_jitter=0.003, coverage=0.7, length={60, 200}})
-- the backs of the swells: long pale lines of reflected sky, thin pressure
local backs = m * mask(function(x, y)
  local ph = (y - 304) / (7 + 0.14*(y - 304)) + 0.35*wn(x, y) + 0.05*math.sin(x / 90)
  local f = ph - math.floor(ph)
  return smoothstep(0.12, 0.2, f) * (1 - smoothstep(0.2, 0.3, f)) * smoothstep(-0.3, 0.2, wn(x*0.8, y + 700))
end)
work(backs, {hand="body", color="#8796ad", angle=0, angle_jitter=0.01, length={30, 90}, coverage=0.8, medium=0.2, pressure={0.3, 0.45}, hug=false, pal=landpal})
local gl = m * mask(function(x, y) return sunpath(x, y) * smoothstep(0.15, 0.5, wn(x*1.5, y*4)) end)
work(gl, {hand="body", color="#f3e0ac", angle=0, angle_jitter=0.01, length={10, 30}, coverage=0.7, medium=0.2, pressure={0.3, 0.5}, hug=false, pal=landpal})
wait(24*60)
