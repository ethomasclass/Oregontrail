-- Evening camp on the trail: wagons drawn into a loose ring around a fire, dusk going to night.
canvas{style="friedrich", aspect=2.4, size=900, seed=67}
skypal = pal:only{"lead white","pale smalt","cobalt blue","yellow ochre","raw umber","red earth","chrome yellow"}
landpal = pal:only{"lead white","yellow ochre","raw umber","red earth","chrome yellow","pale smalt","cobalt blue","bone black"}
HZ = 290
SUNX = 820          -- the sun has gone down here
FX, FY = 610, 318   -- the campfire
function union(list)
  local m = nil
  for _, k in ipairs(list) do m = m and (m + k) or k end
  return m
end
