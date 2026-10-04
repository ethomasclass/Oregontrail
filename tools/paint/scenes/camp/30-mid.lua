-- the camp: wagons drawn into a loose ring on the darkening plain, a small fire inside it
local mn = noise{seed=161, octaves=4, period=150}
local crest = function(x) return HZ + 9 + 5*mn(x, 0) end
local ground = below(crest)
local gn = noise{seed=162, octaves=3, period=60, stretch={0, 4}}
function FIREGLOW(x, y, sx, sy)
  return math.exp(-((x - FX)/(sx or 70))^2 - ((y - FY)/(sy or 16))^2)
end
work(ground, {hand="body", fill=true, color=function(x, y)
  local g = math.exp(-((x - SUNX)/320)^2)
  local c = mix("#55505a", "#625a5c", 0.5*g)
  c = mix(c, "#3c3940", smoothstep(305, 350, y))
  c = mix(c, "#8a5e3a", 0.8*FIREGLOW(x, y, 110, 22))
  return shift(c, 0.02*gn(x, y), 0, 0.006*gn(x, y))
end, angle=0, angle_jitter=0.05, length={16, 60}, coverage=4.2, medium=0.12, clip=true, pal=landpal})
wait(24*60)

-- the ring of wagons, an opening at the front so the fire shows
local wagons = {}
local n = 10
for i = 0, n - 1 do
  local th = (i + 0.5) / n * 2 * math.pi + 0.2
  local s, c = math.sin(th), math.cos(th)
  if not (s > 0.75) then
    local x, b = FX + 150*c, FY + 17*s + 1
    local sc = 1.35 + 0.12*s
    wagons[#wagons + 1] = {x=x, b=b, rx=(5 + 6*math.abs(s))*sc, h=6.5*sc, front=s > 0, side=c}
  end
end
table.sort(wagons, function(a, b) return a.b < b.b end)
local bon, beds, wheels = {}, {}, {}
for _, w in ipairs(wagons) do
  local r, t = w.rx, w.b - 8.5
  bon[#bon + 1] = poly({{w.x - r, t}, {w.x - r*0.95, t - w.h*0.7}, {w.x - r*0.6, t - w.h}, {w.x + r*0.6, t - w.h}, {w.x + r*0.95, t - w.h*0.7}, {w.x + r, t}}, true)
  beds[#beds + 1] = rect(w.x - r - 1, t, 2*r + 2, 4.2)
  wheels[#wheels + 1] = ellipse(w.x - r*0.6, w.b - 3.2, 3.3, 3.3) + ellipse(w.x + r*0.6, w.b - 3.2, 3.5, 3.5)
end
local function bonnetcol(x, y)
  for i = #wagons, 1, -1 do
    local w = wagons[i]
    if math.abs(x - w.x) <= w.rx + 1 and y <= w.b - 7.5 and y >= w.b - 9.5 - w.h then
      local dusk = mix("#6f7284", "#8c8a98", smoothstep(w.b - 18, w.b - 8, y))
      if w.front then
        -- turned away from the fire: dusk-dark, a thin warm rim on top
        return mix(dusk, "#b88a68", 0.35*(1 - smoothstep(w.b - 8.5 - w.h, w.b - 8.5 - w.h + 3, y)))
      end
      -- facing the fire across the ring: canvas glowing warm
      local f = FIREGLOW(x, w.b, 140, 40)
      return mix(dusk, "#e2a466", clamp(0.35 + 0.8*f, 0, 0.9))
    end
  end
  return "#7a7a88"
end
work(union(beds) + union(wheels), {hand="detail", fill=true, tool="round 1.6", color="#2e2828", coverage=3, medium=0.1, clip=true, pal=landpal})
work(union(bon), {hand="detail", fill=true, tool="round 2", color=bonnetcol, angle=0, coverage=3.5, medium=0.12, clip=true, pal=landpal})
wait(24*60)
-- the fire: a small bright heart, two seated figures dark against it, a thread of smoke
local fire = ellipse(FX, FY - 2.5, 2.6, 3.4) + poly({{FX - 2, FY - 4}, {FX + 0.3, FY - 10}, {FX + 2, FY - 4}})
local glowm = ellipse(FX, FY - 2, 16, 6):blur(4)
work(glowm, {hand="scumble", tool="filbert 3", color="#c87a40", hug=false, coverage=1.0, load=0.4, medium=0.4, pal=landpal})
work(fire, {hand="detail", fill=true, tool="round 1.2", color=function(x, y)
  return mix("#fbe3a0", "#e07a34", (1 - smoothstep(FY - 9, FY - 3, y)) + 0.4*smoothstep(1, 3, math.abs(x - FX)))
end, coverage=3.5, medium=0.1, clip=true, pal=landpal})
local figs = ellipse(FX - 9, FY - 3.5, 1.6, 3.4) + ellipse(FX - 9, FY - 7.8, 1.1, 1.2)
  + ellipse(FX + 10, FY - 3, 1.8, 3) + ellipse(FX + 10, FY - 6.9, 1.1, 1.2)
work(figs, {hand="detail", fill=true, tool="round 1", color="#2c2424", coverage=3, medium=0.1, clip=true, pal=landpal})
local smoke = {}
for k = 0, 7 do smoke[#smoke + 1] = ellipse(FX - k*1.5 - (k^1.7)*0.6, FY - 13 - k*4.5, 0.8 + k*0.4, 1.0 + k*0.35) end
local smokem = union(smoke):roughen(1.5, 4, 163, 1):blur(1.2)
work(smokem, {hand="scumble", tool="filbert 2", color=function(x, y)
  return mix("#9a8076", "#6e6c7c", (1 - smoothstep(FY - 60, FY - 20, y)))
end, hug=false, coverage=0.6, load=0.3, medium=0.6, pal=landpal})
wait(24*60)
