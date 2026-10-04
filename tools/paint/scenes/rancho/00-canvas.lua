-- A Californio rancho in the dry summer hills, 1852: warm hazy light, and the squatters' fence.
canvas{style="friedrich", aspect=2.4, size=900, seed=37}
skypal = pal:only{"lead white","pale smalt","cobalt blue","yellow ochre","raw umber","red earth","chrome yellow"}
landpal = pal:only{"lead white","yellow ochre","raw umber","red earth","chrome yellow","pale smalt","cobalt blue","bone black"}
HZ = 272
SUNX = 230
function U(ms) local r = nil for _, m in ipairs(ms) do r = r and (r + m) or m end return r end
-- a live oak: a low, wide, lumpy dark crown on a short trunk, standing on the ground at (x, y)
function oak(x, y, s, seed)
  local n = noise{seed=seed, octaves=3, period=9*s}
  local cy = y - 7*s
  local crown = mask(function(px, py)
    local dx, dy = (px - x)/(13*s), (py - cy)/(6.5*s)
    local r = math.sqrt(dx*dx + dy*dy)
    return 1 - smoothstep(0.85, 1.0, r - 0.22*n(px, py))
  end)
  local trunk = rect(x - 0.9*s, cy, 1.8*s, y - cy)
  return crown, trunk
end
