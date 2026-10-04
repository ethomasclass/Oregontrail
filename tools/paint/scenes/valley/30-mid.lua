-- the valley floor: meadows and ripe fields, groves of oak, the river winding toward you in morning mist
local mn = noise{seed=241, octaves=4, period=160}
local crest = function(x) return 298 + 4*mn(x, 0) end
local m = below(crest)
local gn = noise{seed=242, octaves=3, period=90, stretch={0, 4}}
local fld = noise{seed=243, octaves=3, period=60, stretch={0, 5}}
local function meadow(x, y)
  local lit = math.exp(-((x - SUNX)/480)^2)
  local c = mix("#77834e", "#a7a65e", 0.5*lit)
  -- fields: ripe wheat in some strips, fresh green in others, larger toward you
  local s = 1 + (y - 298) / 30
  local f = fld(x / s, y * 1.6 / s)
  if f > 0.28 then c = mix(c, "#c8b064", smoothstep(0.28, 0.36, f)) end
  if f < -0.32 then c = mix(c, "#8e9a58", smoothstep(-0.32, -0.4, f)) end
  c = mix(c, "#aeb7b2", 0.55*(1 - smoothstep(crest(x), crest(x) + 22, y)))   -- air at the far edge
  c = mix(c, "#6e7a48", smoothstep(HZ + 30, H, y) * 0.35)
  return shift(c, 0.025*gn(x, y), 0, 0.008*gn(x, y))
end
work(m, {hand="body", fill=true, color=meadow, angle=0, angle_jitter=0.04, length={16, 60}, coverage=4.2, medium=0.12, clip=true, pal=landpal})
-- the river, winding out of the distance and widening toward you, holding the sky
local rpts = {{1000,305},{900,307},{800,312},{700,309},{610,314},{520,322},{450,319},{380,326},{300,336},{220,340},{130,348},{40,356},{0,360}}
local river = ribbon(rpts, {1.2, 1.4, 1.8, 1.8, 2.2, 3, 3, 3.6, 4.6, 5, 6, 7, 7.5})
work(river, {hand="body", fill=true, color=function(x, y)
  return mix("#d7dcd8", "#f0e6c8", math.exp(-((x - SUNX)/260)^2))
end, angle=0, length={10, 40}, coverage=2.4, medium=0.2, clip=true, pal=landpal})
-- oak groves: rounded crowns along the river and scattered over the meadows
local groves = {}
local function grove(cx, cy, n, spread, size)
  for i = 1, n do
    local x = cx + randn(0, spread)
    local depth = smoothstep(298, 350, cy)
    local r = size * (0.6 + 0.6*rand()) * (0.7 + 0.8*depth)
    groves[#groves + 1] = {x, cy + randn(0, 1.2), r}
  end
end
grove(860, 304, 6, 22, 4)   grove(760, 309, 5, 18, 4)  grove(560, 311, 7, 26, 5)
grove(470, 314, 4, 12, 5)   grove(330, 322, 6, 22, 6)  grove(180, 330, 5, 20, 7)
grove(960, 302, 4, 14, 3.6) grove(640, 304, 3, 10, 3.6) grove(90, 316, 5, 20, 6)
local om = nil
for _, g in ipairs(groves) do
  local e = ellipse(g[1], g[2] - 0.6*g[3], g[3], 0.8*g[3])
  om = om and (om + e) or e
end
om = om:roughen(0.8, 3, 244)
local tn = noise{seed=245, octaves=3, period=5}
work(om, {hand="body", fill=true, tool="filbert 3", color=function(x, y)
  local c = mix("#58653c", "#3c4630", smoothstep(-0.4, 0.4, tn(x, y) + 0.04*(x - SUNX)/40 * 0))
  local depth = smoothstep(298, 340, y)
  return mix(c, "#9aa7a4", 0.5*(1 - depth))
end, angle=0, angle_jitter=0.8, length={3, 8}, coverage=3.2, medium=0.15, clip=true, pal=landpal})
-- their lit shoulders, toward the sun
local litm = mask(function(x, y) return om:at(x, y) * (1 - om:at(x - 2, y - 2.5)) end):grow(0.6)
work(litm * om, {hand="detail", color=function(x, y)
  local depth = smoothstep(298, 340, y)
  return mix("#8e9452", "#b2b48e", 0.5*(1 - depth))
end, coverage=1.6, medium=0.15, clip=true, pal=landpal})
-- morning mist lying along the river
local mistn = noise{seed=246, octaves=4, period=90, stretch={0, 5}}
local rc = curve({{0,360},{40,356},{130,348},{220,340},{300,336},{380,326},{450,319},{520,322},{610,314},{700,309},{800,312},{900,307},{1000,305}})
local mist = mask(function(x, y)
  local d = math.abs(y - rc(x) + 3)
  return (1 - smoothstep(2, 10, d)) * smoothstep(-0.1, 0.35, mistn(x, y))
end):blur(3) * m
work(mist, {hand="broad", fill=true, color="#ece9df", hug=false, angle=0, length={40, 120}, coverage=1.2, medium=0.5, load=0.5, pressure={0.25, 0.45}, pal=skypal, clip=m})
blend(mist, {angle=0, coverage=1.0, length={40, 120}})
wait(24*60)
