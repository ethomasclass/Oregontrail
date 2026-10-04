-- A gold-rush camp on a Sierra foothill river, 1850: gray light, churned mud, cut hills.
canvas{style="friedrich", aspect=2.4, size=900, seed=23}
skypal = pal:only{"lead white","pale smalt","cobalt blue","yellow ochre","raw umber","red earth","chrome yellow"}
landpal = pal:only{"lead white","yellow ochre","raw umber","red earth","chrome yellow","pale smalt","cobalt blue","bone black"}
HZ = 250
SUNX = 760
SUNY = 118
-- union of a list of masks
function U(ms) local r = nil for _, m in ipairs(ms) do r = r and (r + m) or m end return r end
