-- the near bank: churned mud, standing puddles, a sluice and a rocker off to the right
local nn = noise{seed=9, octaves=4, period=90}
local crest = function(x) return 354 + 5*nn(x, 0) - 8*math.exp(-((x - 900)/90)^2) end
local m = below(crest)
-- reserved shapes: puddles in the quiet part, a stump at each edge, the sluice and the rocker at right
local pud = U{ellipse(250, 384, 46, 3.2), ellipse(410, 399, 34, 2.6), ellipse(120, 405, 30, 2.4), ellipse(560, 377, 26, 2.2),
  ellipse(330, 410, 22, 2)}:roughen(2, 12, 3, 1)
local stumps = U{poly({{946, 369}, {952, 356}, {956, 338}, {984, 337}, {987, 354}, {995, 369}}, true), poly({{12, 374}, {18, 362}, {20, 352}, {40, 351}, {42, 362}, {49, 375}}, true)}
local box = ribbon({{640, 348}, {860, 362}}, 4.5)
local legs = U{rect(650, 351, 2, 13), rect(720, 355, 2, 12), rect(790, 359, 2, 10), rect(852, 364, 2, 8)}
local rocker = poly({{895, 352}, {935, 350}, {937, 362}, {897, 364}})
local things = pud + stumps + box + legs + rocker
local cn = noise{seed=14, octaves=3, period=40}
work(m - things:grow(0.5), {hand="body", fill=true, color=function(x, y)
  local c = mix("#5c4f3d", "#30291f", smoothstep(354, H, y))
  c = mix(c, "#7f6a48", 0.45*smoothstep(0.2, 0.6, cn(x, y)))          -- yellow clay turned up
  c = mix(c, "#6c6a62", 0.35*smoothstep(0.25, 0.6, cn(x + 300, y)))   -- gray gravel
  return c
end, angle=function(x, y) return 0.6*cn(x*2, y*2) end, angle_jitter=0.3, length={12, 40}, coverage=3.8, medium=0.15, clip=true, pal=landpal})
-- the puddles hold the gray sky
work(pud, {hand="body", fill=true, color=function(x, y) return mix("#6b685f", "#4f4b43", smoothstep(-0.2, 0.6, cn(x, y*4))) end, angle=0, length={10, 40}, coverage=2.6, medium=0.2, clip=true, pal=landpal})
work(stumps, {hand="body", fill=true, color=function(x, y) return mix("#5a4a38", "#2c251d", smoothstep(340, 372, y)) end,
  angle=1.57, angle_jitter=0.1, length={6, 18}, coverage=3.5, medium=0.12, clip=true, pal=landpal})
work(U{rect(955, 335, 32, 3), rect(18, 350, 24, 2.5)}, {hand="detail", color="#c2b292", angle=0, coverage=2.5, medium=0.1, pal=landpal})
work(box + rocker, {hand="body", fill=true, color=function(x, y) return mix("#8a7052", "#5e4c38", smoothstep(346, 366, y)) end,
  angle=0.06, length={10, 40}, coverage=3.5, medium=0.12, clip=true, pal=landpal})
work(legs, {hand="detail", color="#3a3026", angle=1.57, coverage=3, medium=0.1, pal=landpal})
-- ridges of churned mud catching a little light
local lights = below(function(x) return crest(x) + 3 end) * mask(function(x, y) return smoothstep(0.35, 0.6, cn(x*1.5, y*3)) end)
work(lights - things:grow(1), {hand="hatch", color="#74664d", angle=0.1, angle_jitter=0.4, coverage=0.25, medium=0.1, pal=landpal})
