-- the plain: a whitewashed adobe fort with its corner bastion, cottonwoods along the river behind,
-- and a few lodges with their smoke at a distance on the left
local mn = noise{seed=121, octaves=4, period=150}
local crest = function(x) return HZ + 11 + 6*mn(x, 0) end
local ground = below(crest)
local gn = noise{seed=122, octaves=3, period=70, stretch={0, 4}}
work(ground, {hand="body", fill=true, color=function(x, y)
  local sun = math.exp(-((x - SUNX)/380)^2)
  local c = mix("#a69866", "#d0ad5f", 0.65*sun)
  c = mix(c, "#8c7e4c", smoothstep(305, 350, y)*0.55)
  return shift(c, 0.03*gn(x, y), 0, 0.01*gn(x, y))
end, angle=0, angle_jitter=0.05, length={18, 60}, coverage=4.2, medium=0.12, clip=true, pal=landpal})
wait(24*60)

-- cottonwoods along the river behind the fort
local bil = noise{seed=123, octaves=3, period=30, kind="billow"}
local trees = below(function(x) return 302 - 16*bil:at01(x, 0)*smoothstep(770, 820, x) end) * above(function(x) return 316 end) * mask(function(x, y) return smoothstep(770, 800, x) end)
local tl = noise{seed=124, octaves=3, period=10}
work(trees, {hand="body", fill=true, tool="filbert 4", color=function(x, y)
  local c = mix("#68684c", "#4c4d3a", smoothstep(286, 316, y))
  return mix(c, "#a99a5e", clamp((tl(x, y) - tl(x + 4, y))*3, 0, 1)*0.55)
end, angle=-1.2, angle_jitter=0.8, length={4, 12}, coverage=3.5, medium=0.15, clip=true, pal=landpal})

-- the fort, seen a little from the left: the side wall in full sun, the front wall raked
local function lerpy(x, x0, x1, y0, y1) return y0 + (y1 - y0) * clamp((x - x0)/(x1 - x0), 0, 1) end
local side = poly({{546, 299}, {582, 301}, {582, 325}, {546, 319}})
local frontw = poly({{582, 301}, {770, 303.5}, {770, 326}, {582, 325}})
local inner = poly({{612, 302}, {618, 293}, {735, 294}, {742, 303}})             -- a roof inside the walls
local bastion = rect(566, 282, 32, 45) + rect(564, 279, 36, 4)
local gate = rect(660, 288, 24, 16) + rect(658, 285.5, 28, 3)
local fortm = side + frontw + inner + bastion + gate
local wn = noise{seed=125, octaves=3, period=8, stretch={math.pi/2, 3}}
work(fortm, {hand="body", fill=true, tool="flat 3", color=function(x, y)
  local c
  if bastion:at(x, y) > 0.5 then
    c = mix("#f6dfae", "#dcc194", clamp((x - 566)/32, 0, 1))
    if y < 283 then c = "#b9a888" end
  elseif gate:at(x, y) > 0.5 then
    c = mix("#f0d6a4", "#d6bb8c", clamp((x - 660)/24, 0, 1))
    if y < 288.5 then c = "#b2a181" end
  elseif side:at(x, y) > 0.5 then
    c = "#fbe6b4"
  elseif frontw:at(x, y) > 0.5 then
    c = mix("#efd6a2", "#d9bf90", clamp((x - 582)/190, 0, 1))
    c = mix(c, "#bba989", 0.6*(1 - smoothstep(598, 616, x)))            -- the bastion's shadow
  else
    c = mix("#8e7e6a", "#a89480", clamp((x - 612)/130, 0, 1))          -- the inner roof
  end
  c = mix(c, "#b29a78", 0.45*smoothstep(lerpy(x, 546, 770, 312, 318), lerpy(x, 546, 770, 320, 326), y))
  return shift(c, 0.02*wn(x, y), 0, 0.006*wn(x, y))
end, angle=math.pi/2, angle_jitter=0.05, length={4, 14}, coverage=3.8, medium=0.12, clip=true, pal=landpal})

-- the lodges, hide covers glowing in the low sun, their poles crossing above
local lodges = {{262, 318, 14, 19}, {292, 322, 12, 16}, {327, 316, 16, 22}, {362, 321, 11, 15}, {398, 317, 14, 19}, {434, 321, 11, 14}}
local cones, poles = {}, {}
for _, l in ipairs(lodges) do
  local cx, b, w, h = l[1], l[2], l[3], l[4]
  cones[#cones + 1] = poly({{cx - w/2, b}, {cx - 0.6, b - h}, {cx + 0.6, b - h}, {cx + w/2, b}})
  poles[#poles + 1] = ribbon({{cx - 0.4, b - h + 1}, {cx - 2.2, b - h - 5}}, 0.45) + ribbon({{cx + 0.4, b - h + 1}, {cx + 2.4, b - h - 4.5}}, 0.45) + ribbon({{cx, b - h + 1}, {cx + 0.4, b - h - 5.5}}, 0.4)
end
local conem = union(cones)
work(conem, {hand="detail", fill=true, tool="round 1.6", color=function(x, y)
  for _, l in ipairs(lodges) do
    if math.abs(x - l[1]) <= l[3]/2 + 1 and y <= l[2] + 1 and y >= l[2] - l[4] - 1 then
      local t = (x - l[1]) / (l[3]/2)
      return mix("#f0dcb0", "#9c8a70", smoothstep(-0.6, 0.5, t))
    end
  end
  return "#d4c09a"
end, angle=-1.4, coverage=3.5, medium=0.1, clip=true, pal=landpal})
-- horses grazing near the lodges and below the fort
local horses = {}
for _, h in ipairs({{214, 325, 1}, {229, 328, -1}, {470, 326, 1}, {488, 324, 1}, {505, 328, -1}}) do
  local x, y, d = h[1], h[2], h[3]
  horses[#horses + 1] = ellipse(x, y - 3.2, 3.6, 1.7) + ribbon({{x + 3*d, y - 3.5}, {x + 5.2*d, y - 1.2}}, 0.8)
    + rect(x - 2.8, y - 2, 0.8, 2.2) + rect(x + 2, y - 2, 0.8, 2.2)
end
work(union(horses), {hand="detail", fill=true, tool="round 1.2", color="#4c3a2c", coverage=3, medium=0.1, clip=true, pal=landpal})
wait(24*60)
-- dark openings: the gate, loopholes in the bastion; lodge doors and poles; the shadows to the right
local holes = rect(666, 311, 12, 14.5) + rect(573, 290, 3, 4) + rect(588, 290, 3, 4) + rect(577, 305, 4, 6) + rect(668, 291, 2.5, 3) + rect(676, 291, 2.5, 3)
local doors = {}
for _, l in ipairs(lodges) do doors[#doors + 1] = poly({{l[1] - 1.6, l[2]}, {l[1], l[2] - 4.5}, {l[1] + 1.6, l[2]}}) end
work(holes + union(doors), {hand="detail", fill=true, tool="round 1.2", color="#3e322a", coverage=3, medium=0.1, clip=true, pal=landpal})
work(union(poles), {hand="detail", fill=true, tool="round 0.9", color="#5a4636", coverage=2.5, medium=0.1, clip=true, pal=landpal})
local shadows = poly({{770, 326}, {770, 318}, {812, 325}, {812, 327.5}}) + poly({{582, 325}, {770, 326}, {770, 328.5}, {582, 327.5}})
work(shadows, {hand="body", fill=true, tool="filbert 3", color="#7f6d4e", angle=0, length={8, 30}, coverage=2.2, medium=0.15, clip=true, pal=landpal})
-- thin smoke from the lodges, drifting right
local smoke = {}
for i, l in ipairs(lodges) do
  if i ~= 2 and i ~= 5 then
    for k = 0, 6 do
      smoke[#smoke + 1] = ellipse(l[1] + 1 + k*3 + k^1.7, l[2] - l[4] - 5 - k*4, 0.8 + k*0.45, 0.7 + k*0.3)
    end
  end
end
local smokem = union(smoke):roughen(1.5, 4, 126, 1):blur(1.2)
work(smokem, {hand="scumble", tool="filbert 2", color="#b8ad9e", hug=false, coverage=0.6, load=0.3, medium=0.6, pal=landpal})
wait(24*60)
