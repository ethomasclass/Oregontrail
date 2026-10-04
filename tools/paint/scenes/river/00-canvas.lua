-- A wide river running high and brown in spring, rain clouds breaking over the far bank.
canvas{style="friedrich", aspect=2.4, size=900, seed=37}
skypal = pal:only{"lead white","pale smalt","cobalt blue","yellow ochre","raw umber","red earth","chrome yellow"}
landpal = pal:only{"lead white","yellow ochre","raw umber","red earth","chrome yellow","pale smalt","cobalt blue","bone black"}
HZ = 292
SUNX = 640
SUNY = 196
BANK = 302          -- the far bank's waterline
function union(list)
  local m = nil
  for _, k in ipairs(list) do m = m and (m + k) or k end
  return m
end
