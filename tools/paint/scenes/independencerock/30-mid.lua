-- the Sweetwater valley floor, the river, and Independence Rock: a long low granite dome
local mn = noise{seed=121, octaves=4, period=150}
local crest = function(x) return 300 + 5*mn(x, 0) end
-- the dome's profile: a whale's back, steeper at the right (head) end, a second low hump at left
local pn = noise{seed=122, octaves=4, period=60}
local function domeu(x) return (x - DOMEX) / DOMERX end
local function dometop(x)
  local u = domeu(x)
  if math.abs(u) >= 1 then return DOMEFOOT + 10 end
  local s = u > 0 and (1 - u^2)^0.45 or (1 - u^2)^0.7
  local h = DOMEH * s * (1 + 0.06*math.exp(-((x - 430)/50)^2) - 0.04*math.exp(-((x - 500)/26)^2))
  return DOMEFOOT - h - 2.5*pn(x, 0)*s
end
DOMEM = mask(function(x, y)
  local top = dometop(x)
  return smoothstep(top - 0.8, top + 0.8, y) * (1 - smoothstep(DOMEFOOT + 2, DOMEFOOT + 8, y))
end):roughen(0.8, 7, 123)
local floor = below(crest)
local gn = noise{seed=124, octaves=3, period=90, stretch={0, 4}}
work(floor - DOMEM, {hand="body", fill=true, color=function(x, y)
  local lit = math.exp(-((x - SUNX)/420)^2)
  local c = mix("#85836a", "#b4a272", 0.5*lit)
  c = mix(c, "#77775a", smoothstep(HZ + 18, H, y) * 0.5)
  return shift(c, 0.03*gn(x, y), 0, 0.01*gn(x, y))
end, angle=0, angle_jitter=0.05, length={18, 70}, coverage=4.2, medium=0.12, clip=true, pal=landpal})
-- the granite: lit from the right and above, cool violet-gray where it turns away;
-- weather streaks run down it, and big fractures break the smooth back
local mot = noise{seed=125, octaves=4, period=26}
local big = noise{seed=129, octaves=3, period=70}
local streak = noise{seed=126, octaves=3, period=22, stretch={1.5708, 5}}
local function domecol(x, y)
  local u = clamp(domeu(x), -1, 1)
  local top = dometop(x)
  local v = clamp((DOMEFOOT - y) / math.max(4, DOMEFOOT - top), 0, 1)
  local lit = clamp(0.42 + 0.5*u + 0.5*(v - 0.45) + 0.14*big(x, y) + 0.06*mot(x, y), 0, 1)
  local c = gradient({{0, "#57525e"}, {0.28, "#6f6a76"}, {0.5, "#948685"}, {0.75, "#c39d8a"}, {0.92, "#dcb495"}, {1, "#e9c6a4"}}, lit)
  c = shift(c, 0.03*mot(x, y), 0.004*mot(x + 50, y), 0.008*mot(x, y + 50))
  -- dark weather streaks running down from the crown
  c = shift(c, -0.06*math.max(0, streak(x, y))*smoothstep(0.2, 0.8, v + 0.3), 0, -0.006*math.max(0, streak(x, y)))
  -- grass and sage creeping up its foot
  local foot = smoothstep(DOMEFOOT - 18 + 10*pn(x, 9), DOMEFOOT, y)
  return mix(c, "#7c7b5e", 0.75*foot)
end
local an = noise{seed=130, octaves=2, period=40}
work(DOMEM, {hand="body", fill=true, tool="filbert 5", color=domecol, angle=function(x, y)
  local u = clamp(domeu(x), -0.98, 0.98)
  return -0.6*u + 0.4*an(x, y)
end, angle_jitter=0.25, length={8, 26}, coverage=4.2, medium=0.15, load=0.85, clip=true, pal=landpal})
-- fractures: a few long curving cracks over the back and short ones down its flanks, drawn by hand
local cracks = {
  {{392, 296}, {430, 279}, {470, 268}, {508, 262}},
  {{650, 252}, {700, 260}, {744, 274}, {776, 292}},
  {{566, 262}, {572, 288}, {574, 312}},
  {{712, 266}, {724, 290}},
}
local cgate = noise{seed=133, octaves=2, period=30}
local cm = nil
for i, pts in ipairs(cracks) do
  local o = outline{pts=pts, open=true, char="searching", seed=130 + i, amount=1.2}
  local b = o:band(0.9, 0.9)
  cm = cm and (cm + b) or b
end
cm = cm * DOMEM:shrink(4) * mask(function(x, y) return smoothstep(-0.3, 0.1, cgate(x, y)) end)
work(cm, {hand="detail", color=function(x, y) return shift(domecol(x, y), -0.08, 0.002, -0.01) end,
  angle=0, coverage=1.2, medium=0.2, clip=true, pal=landpal})
-- grass, sage and boulders washed up around the foot, so it does not sit on a ruled line
local fn2 = noise{seed=131, octaves=4, period=24}
local footm = mask(function(x, y)
  local u = domeu(x)
  if math.abs(u) > 1.05 then return 0 end
  local top = DOMEFOOT + 2 - 14*math.max(0, fn2(x, 0) + 0.15) - 6*math.max(0, fn2(x*3, 50))
  return smoothstep(top - 0.8, top + 0.8, y) * (1 - smoothstep(DOMEFOOT + 4, DOMEFOOT + 8, y))
end)
work(footm, {hand="body", fill=true, tool="filbert 3", color=function(x, y)
  local c = mix("#77785a", "#5e604a", smoothstep(-0.2, 0.4, fn2(x, y)))
  return mix(c, "#a39670", 0.4*math.exp(-((x - SUNX)/240)^2))
end, angle=-0.3, angle_jitter=0.5, length={4, 12}, coverage=3, medium=0.15, clip=true, pal=landpal})
-- the Sweetwater: a narrow winding ribbon catching the sky, with willows along it
local rbreak = noise{seed=132, octaves=2, period=90}
local rline = curve({{0,336},{110,332},{170,333},{260,340},{330,337},{420,330},{500,332},{560,339},{690,336},{780,330},{830,331},{930,338},{1000,335}})
local rpts, rw = {}, {}
for x = 0, 1000, 8 do rpts[#rpts + 1] = {x, rline(x)} rw[#rw + 1] = 1.2 + 0.12*(rline(x) - 324) end
local river = ribbon(rpts, rw) * mask(function(x, y) return smoothstep(-0.1, 0.2, rbreak(x, 0)) end)
local wn = noise{seed=128, octaves=3, period=50}
local wline = function(x) return rline(x) - 4 end
local willows = mask(function(x, y)
  local c = wline(x)
  local on = smoothstep(-0.05, 0.25, wn(x, 0))
  return on * (1 - smoothstep(0, 3 + 2.5*wn:at01(x, 5), math.abs(y - c)))
end) - DOMEM
work(willows, {hand="body", fill=true, tool="filbert 4", color=function(x, y)
  return mix("#565a3e", "#7b7542", 0.5*math.exp(-((x - SUNX)/300)^2))
end, angle=0, length={5, 16}, coverage=2.4, medium=0.15, clip=true, pal=landpal})
work(river, {hand="body", fill=true, color=function(x, y)
  return mix("#aaa89c", "#dcc6a2", math.exp(-((x - SUNX)/260)^2))
end, angle=0, length={20, 60}, coverage=2, medium=0.2, clip=true, pal=landpal})
wait(24*60)
