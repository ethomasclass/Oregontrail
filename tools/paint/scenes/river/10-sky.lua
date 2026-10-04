-- rain clouds breaking: a slate overcast that parts over the far bank, light pouring through.
-- The clouds are part of the sky's own color field, laid in one sitting, so they sit in the air.
local gn = noise{seed=71, octaves=3, period=220}
function GAP(x, y)
  return math.exp(-((x - SUNX)/(200 + 50*gn(x, 0)))^2 - ((y - SUNY)/58)^2)
end
local cn = noise{seed=73, octaves=5, period=200, stretch={0, 3.2}}
local cn2 = noise{seed=74, octaves=3, period=70, stretch={0, 2.5}}
function CLOUDV(x, y)
  local thick = 0.55 - 1.25*smoothstep(150, 262, y) + 0.2*(1 - y/150)
  local v = cn(x, y) + 0.3*cn2(x, y) + thick - 1.5*GAP(x, y)
  return smoothstep(-0.2, 0.3, v)
end
local function clearsky(x, y)
  local t = clamp(y / HZ, 0, 1)
  local c = gradient({{0,"#7a8ba2"},{0.45,"#aab3b8"},{0.75,"#dcd4b8"},{1,"#e8debf"}}, t)
  return mix(c, "#fcefc6", 0.9*GAP(x, y) + 0.35*math.exp(-((x - SUNX)/300)^2)*smoothstep(200, HZ, y))
end
function CLOUDCOL(x, y)
  local v = CLOUDV(x, y)
  local edge = 1 - smoothstep(0.3, 0.95, v)
  local near = math.exp(-((x - SUNX)/240)^2 - ((y - SUNY)/100)^2)
  local c = mix("#5a5e6c", "#7b7b86", smoothstep(30, 240, y))
  c = mix(c, "#5a5c68", 0.3*smoothstep(0.1, 0.6, cn2(x*1.5, y)))
  return mix(c, "#f1dcae", clamp(edge*near*1.6, 0, 0.92))
end
local sn = noise{seed=72, octaves=3, period=180, stretch={0, 7}}
function SKYCOL(x, y)
  local c = mix(clearsky(x, y), CLOUDCOL(x, y), CLOUDV(x, y))
  -- a veil of rain trailing from the cloud far to the left
  local u = x - 0.22*(y - 150)
  local rain = math.exp(-((u - 150)/70)^2) * smoothstep(150, 210, y) * (1 - smoothstep(262, 300, y))
  c = mix(c, "#7f828e", 0.55*rain)
  local v = sn(x, y)
  return shift(c, 0.018*v, 0.003*v, 0.007*v)
end
local skym = above(function(x) return HZ + 30 end)
work(skym, {hand="broad", color=SKYCOL, angle=0, angle_jitter=0.03, length={100, 280}, coverage=4.8, medium=0.32, load=0.8, fill=true, pal=skypal})
blend(skym, {angle=0, coverage=1.3, length={120, 340}})
wait(24*60)
