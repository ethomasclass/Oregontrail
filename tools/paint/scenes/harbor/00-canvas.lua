-- San Francisco harbor, 1850: a forest of masts, abandoned ships, sand hills and fog.
canvas{style="friedrich", aspect=2.4, size=900, seed=41}
skypal = pal:only{"lead white","pale smalt","cobalt blue","yellow ochre","raw umber","red earth","chrome yellow"}
landpal = pal:only{"lead white","yellow ochre","raw umber","red earth","chrome yellow","pale smalt","cobalt blue","bone black"}
HZ = 278          -- the shore line at the foot of the hills
SUNX = 820
function U(ms) local r = nil for _, m in ipairs(ms) do r = r and (r + m) or m end return r end
local hn = noise{seed=3, octaves=4, period=90}
-- the sand hills behind the town (Telegraph Hill at left)
HILL = function(x)
  return curve({{0,206},{110,180},{230,150},{330,178},{460,214},{560,206},{690,172},{820,188},{940,214},{1000,222}})(x) + 6*hn(x, 0)
end
