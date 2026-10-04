-- the town: brick and clapboard storefronts, the courthouse on its square, smoke from the
-- chimneys; the meadow at the edge of town where the wagons gather
local mn = noise{seed=55, octaves=4, period=150}
local crest = function(x) return HZ + 10 + 6*mn(x, 0) - 4*math.exp(-((x-250)/160)^2) end
local ground = below(crest)
local gn = noise{seed=56, octaves=3, period=60, stretch={0, 4}}
work(ground, {hand="body", fill=true, color=function(x, y)
  local sun = math.exp(-((x - SUNX)/380)^2)
  local meadow = mix("#8c8650", "#b9a35a", 0.5*sun)
  meadow = mix(meadow, "#77703f", smoothstep(305, 345, y)*0.6)
  local dirt = mix("#9a8463", "#7f6a4e", smoothstep(318, 360, y))
  local town = smoothstep(440, 520, x) * smoothstep(312, 326, y)
  local c = mix(meadow, dirt, town + 0.35*smoothstep(322, 345, y)*(1 - town))
  return shift(c, 0.03*gn(x, y), 0, 0.01*gn(x, y))
end, angle=0, angle_jitter=0.05, length={16, 60}, coverage=4.2, medium=0.12, clip=true, pal=landpal})
wait(24*60)

-- trees behind the town and along the meadow edge
local trees = union{
  ellipse(468, 304, 16, 14), ellipse(492, 300, 12, 15), ellipse(622, 300, 14, 15),
  ellipse(842, 300, 13, 13), ellipse(944, 298, 16, 16), ellipse(990, 302, 14, 14),
  ellipse(80, 306, 18, 12), ellipse(104, 302, 12, 12), ellipse(40, 304, 16, 11)}
trees = (trees * above(function(x) return 322 end)):roughen(3, 6, 57, 1)
local tl = noise{seed=58, octaves=3, period=10}
work(trees, {hand="body", fill=true, tool="filbert 4", color=function(x, y)
  local c = mix("#5d6650", "#454c3c", smoothstep(290, 320, y))
  return mix(c, "#8d8a5c", clamp((tl(x, y) - tl(x + 4, y + 3))*3, 0, 1)*0.6)
end, angle=-1.2, angle_jitter=0.8, length={4, 12}, coverage=3.5, medium=0.15, clip=true, pal=landpal})

FN = noise{seed=66, octaves=3, period=9, stretch={math.pi/2, 3}}
-- buildings: {x, width, height, base, kind, color, roof}
local front = {
  {506, 30, 35, 331, "frame", "#cfc3a5", "gable"},
  {538, 32, 49, 331, "brick", "#94563a", "flat"},
  {572, 42, 55, 332, "brick", "#a1603f", "flat"},
  {616, 40, 43, 331, "frame", "#bdae8d", "gable"},
  {742, 36, 51, 331, "brick", "#8c5038", "flat"},
  {780, 30, 39, 332, "frame", "#d8cdb0", "flat"},
  {812, 46, 58, 331, "brick", "#9b5b3d", "flat"},
  {860, 28, 36, 331, "frame", "#b3a689", "gable"},
  {890, 40, 49, 332, "brick", "#a3664a", "flat"},
  {932, 34, 42, 331, "frame", "#cdc1a2", "flat"},
  {968, 36, 38, 331, "frame", "#a99c82", "gable"},
}
local back = {
  {486, 34, 30, 319, "frame", "#a2998a", "gable"},
  {598, 34, 35, 319, "brick", "#86584a", "flat"},
  {786, 40, 40, 318, "brick", "#8a5a48", "flat"},
  {872, 44, 35, 318, "frame", "#a39a8a", "gable"},
  {950, 40, 34, 318, "frame", "#9d9585", "flat"},
}
local function shape(b)
  local x, w, h, base = b[1], b[2], b[3], b[4]
  local m = rect(x, base - h, w, h)
  if b[7] == "gable" then m = m + poly({{x - 1, base - h + 0.5}, {x + w/2, base - h - w*0.32}, {x + w + 1, base - h + 0.5}}) end
  if b[7] == "flat" then m = m + rect(x - 1, base - h - 2, w + 2, 2.5) end
  return m
end
local function find(list, x, y)
  for _, b in ipairs(list) do
    local top = b[4] - b[3] - (b[7] == "gable" and b[2]*0.32 or 2)
    if x >= b[1] - 1 and x <= b[1] + b[2] + 1 and y >= top and y <= b[4] then return b end
  end
end
local function bcol(b, x, y, cool)
  local t = clamp((x - b[1]) / b[2], 0, 1)
  local roofy = b[4] - b[3]
  local c = b[6]
  if b[7] == "gable" and y < roofy then c = mix("#6d6866", "#9a8f86", t) end
  if b[7] == "flat" and y < roofy + 0.5 then c = shift(c, -0.12, 0, 0) end
  c = mix(c, "#f3dcae", 0.22*t)                      -- the morning light comes from the right
  c = mix(c, shift(c, -0.1, 0, -0.01), smoothstep(b[4] - 6, b[4], y))
  if cool then c = mix(c, "#9aa2ac", 0.3) end
  c = mix(c, "#b9b6b0", 0.12)
  local v = FN(x, y)
  return shift(c, 0.03*v, 0.004*v, 0.006*v)
end
-- the courthouse: brick, two stories on its square, a hipped roof and a white cupola
local CH = {x=652, w=88, top=268, base=322}
local chbody = rect(CH.x, CH.top, CH.w, CH.base - CH.top)
local chroof = poly({{CH.x - 3, CH.top + 1}, {CH.x + 18, CH.top - 11}, {CH.x + CH.w - 18, CH.top - 11}, {CH.x + CH.w + 3, CH.top + 1}})
local CT = CH.top - 11
local cup = rect(688, CT - 20, 16, 21) + ellipse(696, CT - 20, 9, 7) * above(function(x) return CT - 20 end) + poly({{694.5, CT - 25}, {696, CT - 38}, {697.5, CT - 25}})
local backm = union((function() local t = {} for i, b in ipairs(back) do t[i] = shape(b) end return t end)())
local frontm = union((function() local t = {} for i, b in ipairs(front) do t[i] = shape(b) end return t end)())
local chm = chbody + chroof + cup
work(backm - frontm - chm, {hand="body", fill=true, tool="flat 3", color=function(x, y)
  local b = find(back, x, y) or back[1]
  return bcol(b, x, y, true)
end, angle=math.pi/2, angle_jitter=0.05, length={4, 14}, coverage=3.6, medium=0.12, clip=true, pal=landpal})
work(chm - frontm, {hand="body", fill=true, tool="flat 3", color=function(x, y)
  local t = clamp((x - CH.x) / CH.w, 0, 1)
  if y < CT + 1 and x > 685 and x < 707 then
    return mix("#c9c3b6", "#f4ead2", clamp((x - 688)/16, 0, 1))      -- the cupola, whitewashed
  end
  if y < CH.top + 1 then return mix("#5f5a5c", "#8e8580", t) end      -- slate roof
  return mix("#8f5139", "#c07a52", 0.55*t)
end, angle=math.pi/2, angle_jitter=0.05, length={4, 14}, coverage=3.8, medium=0.12, clip=true, pal=landpal})
work(frontm, {hand="body", fill=true, tool="flat 3", color=function(x, y)
  local b = find(front, x, y) or front[1]
  return bcol(b, x, y, false)
end, angle=math.pi/2, angle_jitter=0.05, length={4, 14}, coverage=3.8, medium=0.12, clip=true, pal=landpal})

-- the wagons gathered on the meadow at the edge of town, canvas tops catching the sun
local wagons = {
  {132, 329, -1}, {152, 325, -1}, {183, 332, -1}, {214, 324, -1}, {229, 334, 1}, {268, 328, -1},
  {300, 323, -1}, {322, 333, -1}, {362, 327, 1}, {398, 331, -1}, {424, 324, -1}, {712, 344, -1}, {918, 342, 1}}
local bon, bed, wheel, oxen = {}, {}, {}, {}
for i, w in ipairs(wagons) do
  local cx, b, d = w[1], w[2], w[3]
  bon[#bon + 1] = poly({{cx - 11, b - 7}, {cx - 10.5, b - 11.5}, {cx - 7, b - 14}, {cx + 7, b - 14}, {cx + 10.5, b - 11.5}, {cx + 11, b - 7}}, true)
  bed[#bed + 1] = rect(cx - 11, b - 7.5, 22, 4)
  wheel[#wheel + 1] = ellipse(cx - 6*d, b - 2.6, 2.6, 2.6) + ellipse(cx + 7*d, b - 3, 3.2, 3.2)
  if i % 3 ~= 0 then oxen[#oxen + 1] = ellipse(cx + 18*d, b - 3, 4.5, 2.6) + ellipse(cx + 27*d, b - 3, 4.5, 2.6) end
end
local bonm, bedm, wheelm, oxm = union(bon), union(bed), union(wheel), union(oxen)
work(oxm + bedm + wheelm, {hand="detail", fill=true, tool="round 1.6", color=function(x, y)
  return mix("#4b3a2c", "#6a5038", 0.3)
end, coverage=3, medium=0.12, clip=true, pal=landpal})
work(bonm, {hand="detail", fill=true, tool="round 2", color=function(x, y)
  for _, w in ipairs(wagons) do
    if math.abs(x - w[1]) < 11.5 and math.abs(y - (w[2] - 10)) < 8 then
      local t = clamp((x - (w[1] - 10.5)) / 21, 0, 1)
      return mix("#a8a6a2", "#f4ead2", smoothstep(0.15, 0.7, t))
    end
  end
  return "#e6dcc6"
end, angle=0, coverage=3.5, medium=0.12, clip=true, pal=landpal})
wait(24*60)

-- windows, doors and the shadowed boardwalks; then the chimneys and their smoke
local wins = {}
for _, b in ipairs(front) do
  local x, w, h, base = b[1], b[2], b[3], b[4]
  local n = math.max(2, math.floor(w / 9))
  local sp = w / n
  for k = 0, n - 1 do
    local wx = x + sp*k + sp/2 - 1.6
    if h > 34 then wins[#wins + 1] = rect(wx, base - h + 7, 3.4, 6.5) end
    if h > 46 then wins[#wins + 1] = rect(wx, base - h + 21, 3.4, 6.5) end
  end
  wins[#wins + 1] = rect(x + w*0.18, base - 13, w*0.26, 8)
  wins[#wins + 1] = rect(x + w*0.56, base - 14, 4.5, 11)
  wins[#wins + 1] = rect(x + w*0.72, base - 13, w*0.2, 8)
end
for k = 0, 6 do wins[#wins + 1] = rect(CH.x + 6 + k*12, CH.top + 8, 4, 8) end
for k = 0, 6 do if k ~= 3 then wins[#wins + 1] = rect(CH.x + 6 + k*12, CH.top + 30, 4, 9) end end
wins[#wins + 1] = rect(CH.x + 41, CH.top + 31, 6, 23)
wins[#wins + 1] = rect(693, CT - 16, 3.5, 9)
local winm = union(wins)
work(winm, {hand="detail", fill=true, tool="round 1.4", color=function(x, y) return mix("#3b3433", "#5a4e48", clamp((x - 500)/500, 0, 1)) end,
  coverage=3, medium=0.1, clip=true, pal=landpal})
local walks = {}
for _, b in ipairs(front) do walks[#walks + 1] = rect(b[1] - 2, b[4] - 1, b[2] + 4, 3.5) end
work(union(walks), {hand="detail", fill=true, tool="round 1.6", color="#55473a", angle=0, coverage=2.5, medium=0.1, clip=true, pal=landpal})

local chim, smoke = {}, {}
local sn = noise{seed=59, octaves=3, period=12}
local chimneys = {}
for _, b in ipairs(front) do
  if b[5] == "brick" then chimneys[#chimneys + 1] = {b[1] + b[2]*0.78, b[4] - b[3] - 2} end
end
chimneys[#chimneys + 1] = {CH.x + 12, CH.top - 9}
chimneys[#chimneys + 1] = {CH.x + CH.w - 12, CH.top - 9}
for i, c in ipairs(chimneys) do
  chim[#chim + 1] = rect(c[1] - 1.5, c[2] - 6, 3, 6.5)
  if i % 2 == 1 or i == #chimneys then
    for k = 0, 6 do
      local px = c[1] - k*4.5 - (k^1.6)*1.4
      local py = c[2] - 8 - k*4.5 + (k^1.3)*1.0
      smoke[#smoke + 1] = ellipse(px, py, 1.6 + k*0.8, 1.3 + k*0.5)
    end
  end
end
work(union(chim), {hand="detail", fill=true, tool="round 1.4", color="#6e4636", coverage=3, medium=0.1, clip=true, pal=landpal})
local smokem = union(smoke):roughen(2, 5, 60, 1):blur(1.5)
work(smokem, {hand="scumble", tool="filbert 3", color=function(x, y)
  return mix("#a9aab2", "#d9d2c4", 0.6*clamp((sn(x, y) + 0.3), 0, 1))
end, hug=false, coverage=1.1, load=0.4, medium=0.5, pal=landpal})
blend(smokem:grow(2), {coverage=1.0, length={10, 30}})
wait(24*60)
