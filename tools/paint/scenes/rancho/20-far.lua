-- the coast range far off, violet-gold in the haze, and a nearer ridge of tawny hills
local fn = noise{seed=3, octaves=4, period=140}
local fn2 = noise{seed=6, octaves=4, period=90}
local c1 = function(x) return 236 + 12*fn(x, 0) - 16*math.exp(-((x - 700)/130)^2) - 10*math.exp(-((x - 120)/90)^2) end
local c2 = function(x) return 258 + 7*fn2(x, 0) - 9*math.exp(-((x - 420)/110)^2) end
local r1 = below(c1) * above(function(x) return c2(x) + 6 end)
work(r1, {hand="body", fill=true, color=function(x, y)
  return mix("#a69f9d", "#bbae95", smoothstep(c1(x), c2(x), y))
end, angle=0, length={20, 60}, coverage=4, medium=0.15, clip=true, pal=landpal})
work(below(c2), {hand="body", fill=true, color=function(x, y)
  local lit = math.exp(-((x - SUNX)/380)^2)
  local c = mix("#ab9878", "#c2a777", 0.6*lit)
  return mix(c, "#a7936f", smoothstep(c2(x), c2(x) + 30, y) * 0.5)
end, angle=0, length={20, 60}, coverage=4, medium=0.15, clip=true, pal=landpal})
-- far oaks: tiny dark dots of blue-gray along the ridge's folds
local dots = {}
for i = 1, 40 do
  local x = rand(0, 1000)
  local y = c2(x) + rand(3, 14)
  dots[#dots + 1] = ellipse(x, y, rand(1.8, 3.2), rand(1.1, 1.6))
end
work(U(dots), {hand="detail", color="#7d7869", angle=0, coverage=2, medium=0.12, pal=landpal})
wait(24*60)
