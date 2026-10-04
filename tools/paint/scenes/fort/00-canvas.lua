-- A trading fort on the plains in golden late-afternoon light, a snowy peak far off.
canvas{style="friedrich", aspect=2.4, size=900, seed=53}
skypal = pal:only{"lead white","pale smalt","cobalt blue","yellow ochre","raw umber","red earth","chrome yellow"}
landpal = pal:only{"lead white","yellow ochre","raw umber","red earth","chrome yellow","pale smalt","cobalt blue","bone black"}
HZ = 290
SUNX = 210
function union(list)
  local m = nil
  for _, k in ipairs(list) do m = m and (m + k) or k end
  return m
end
