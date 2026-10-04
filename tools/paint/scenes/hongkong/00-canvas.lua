-- Hong Kong harbor, 1852: steep green peaks, junks with batten sails, a hazy humid morning.
canvas{style="friedrich", aspect=2.4, size=900, seed=53}
skypal = pal:only{"lead white","pale smalt","cobalt blue","yellow ochre","raw umber","red earth","chrome yellow"}
landpal = pal:only{"lead white","yellow ochre","raw umber","red earth","chrome yellow","pale smalt","cobalt blue","bone black"}
HZ = 296          -- the shore under the peaks
SUNX = 330
function U(ms) local r = nil for _, m in ipairs(ms) do r = r and (r + m) or m end return r end
-- a junk: hull with a high stern at the right, two or three lug sails with battens.
-- returns hull, sails, battens, reflection masks
function junk(x, y, L, sh, flip)
  local s = flip and -1 or 1
  local function P(dx, dy) return {x + s*dx, y + dy} end
  local hb = L * 0.09
  local hull = poly({P(-L/2, -hb*1.5), P(-L*0.32, -hb), P(L*0.3, -hb), P(L/2, -hb*2.6), P(L/2 - 3, -hb*1.2), P(L*0.35, 0), P(-L*0.4, 0)}, true)
  local sails, bats = {}, {}
  local defs = {{-0.05, 1.0, 0.36}, {0.3, 0.72, 0.26}, {-0.36, 0.55, 0.2}}
  for i, d in ipairs(defs) do
    if i < 3 or L > 50 then
      local mx, h, w = d[1]*L, d[2]*sh, d[3]*L
      local b0, t0 = -hb - 3, -hb - 3 - h
      sails[#sails + 1] = poly({P(mx - 0.25*w, b0), P(mx - 0.35*w, t0 + 0.12*h), P(mx + 0.15*w, t0), P(mx + 0.8*w, t0 + 0.2*h), P(mx + 0.7*w, b0)}, false)
      local n = math.max(3, math.floor(h / 6))
      for k = 1, n - 1 do
        local f = k / n
        local yy = b0 - h*f
        bats[#bats + 1] = ribbon({P(mx - 0.32*w, yy), P(mx + 0.78*w, yy + 0.05*h + 0.1*h*f)}, 0.45)
      end
    end
  end
  local refl = poly({P(-L*0.4, 0), P(L*0.35, 0), P(L*0.3, hb*2.2), P(-L*0.35, hb*2.0)})
  return hull, U(sails), U(bats), refl
end
