-- The open Pacific: long swells under a vast sky of towering cloud, the sun low ahead.
canvas{style="friedrich", aspect=2.4, size=900, seed=67}
skypal = pal:only{"lead white","pale smalt","cobalt blue","yellow ochre","raw umber","red earth","chrome yellow"}
landpal = pal:only{"lead white","yellow ochre","raw umber","red earth","chrome yellow","pale smalt","cobalt blue","bone black"}
HZ = 286
SUNX = 640
SUNY = 238
-- a band of swells: dark troughs and lighter backs, the bands closer toward the horizon
function swellcol(x, y, y0, period, dark, light, warpn)
  local w = warpn(x, y)
  local ph = (y - y0) / period + 0.35*w + 0.05*math.sin(x / 90)
  local v = 0.5 + 0.5*math.sin(2*math.pi*ph)
  return mix(dark, light, v^2)
end
-- the sun's path on the water: a column that widens toward you
function sunpath(x, y)
  local w = 26 + 1.2*(y - HZ)
  return math.exp(-((x - SUNX)/w)^2)
end
