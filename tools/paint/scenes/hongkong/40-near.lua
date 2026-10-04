-- calm near water: the green of the peaks and the warm haze reflected, slow swell lines, a sampan at right
local crest = function(x) return 352 + 1.5*math.sin(x / 47) end
local m = below(crest)
local sam = poly({{872, 366}, {960, 362}, {968, 357}, {955, 369}, {880, 371}}, true)
local mat = poly({{895, 363}, {900, 354}, {930, 353}, {936, 362}}, true)
local samr = poly({{878, 371}, {956, 369}, {950, 384}, {884, 384}})
local boat = sam + mat
work(sam, {hand="detail", color="#3b2f25", angle=0, coverage=3.5, medium=0.1, pal=landpal})
work(mat, {hand="detail", color="#8a7150", angle=0, coverage=3.5, medium=0.1, pal=landpal})
work(samr, {hand="body", fill=true, tool="filbert 5", color="#4c4a3e", angle=1.57, length={5, 12}, coverage=2.2, medium=0.3, pal=landpal})
local sn = noise{seed=35, octaves=3, period=220, stretch={0, 7}}
local open = m - boat - samr
work(open, {hand="broad", fill=true, color=function(x, y)
  local c = mix("#9c9d86", "#56604f", smoothstep(352, H, y))
  c = mix(c, "#d9c99c", 0.45*math.exp(-((x - SUNX)/140)^2) * (1 - smoothstep(352, 410, y)))
  local v = sn(x, y)
  return shift(c, 0.02*v, 0, 0.005*v)
end, angle=0, angle_jitter=0.004, curve={0, 0}, length={100, 280}, coverage=4, medium=0.3, load=0.75, pal=landpal, clip=open:grow(2):blur(1.5)})
blend(samr:grow(4) * m - boat, {angle=0, length={20, 60}, coverage=1.5, clip=m - boat})
-- slow swell lines, light from the sky on their backs
local rip = open * mask(function(x, y) return smoothstep(0.4, 0.65, sn(x * 0.5, y * 10)) end)
blend(open, {angle=0, angle_jitter=0.003, coverage=0.8, length={60, 200}, clip=open})
work(rip, {hand="body", color="#a7a48a", angle=0, angle_jitter=0.005, curve={0, 0}, length={30, 90}, coverage=0.5, pressure={0.3, 0.45}, medium=0.15, pal=landpal})
