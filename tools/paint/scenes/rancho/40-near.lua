-- the near ground: dry summer grass, and a raw new post-and-rail fence cutting across from the right
local nn = noise{seed=9, octaves=4, period=90}
local crest = function(x) return 354 + 5*nn(x, 0) - 6*math.exp(-((x - 820)/140)^2) end
local m = below(crest)
-- the fence runs from far right-back (small) to the near right corner (large)
local posts, rails = {}, {}
local prev = nil
for i = 0, 7 do
  local t = i / 7
  local x = lerp(600, 990, t^1.2)
  local base = lerp(crest(600) + 6, 412, t)
  local h = lerp(10, 34, t)
  local w = lerp(1.4, 3.6, t)
  posts[#posts + 1] = rect(x - w/2, base - h, w, h)
  if prev then
    for _, f in ipairs({0.25, 0.6}) do
      rails[#rails + 1] = ribbon({{prev[1], prev[2] - prev[3]*(1 - f)}, {x, base - h*(1 - f)}}, lerp(0.7, 1.6, t))
    end
  end
  prev = {x, base, h}
end
local P, R = U(posts), U(rails)
work(m - (P + R):grow(0.5), {hand="body", fill=true, color=function(x, y)
  local lit = math.exp(-((x - SUNX)/420)^2)
  return mix(mix("#8e7444", "#a5864a", 0.5*lit), "#57472b", smoothstep(354, H, y))
end, angle=0, length={20, 60}, coverage=3.4, medium=0.15, clip=true, pal=landpal})
work(R, {hand="detail", color="#a08a68", angle=0.1, coverage=3, medium=0.1, pal=landpal})
work(P, {hand="detail", color=function(x, y) return mix("#6e5c45", "#4a3c2e", smoothstep(340, 410, y)) end, angle=1.57, coverage=3.5, medium=0.1, pal=landpal})
-- dry seed heads catching the low sun
local grass = pile{{"yellow ochre",3},{"lead white",0.6},{"raw umber",0.3}}
work(below(function(x) return crest(x) + 12 end) - P:grow(1), {hand="hatch", pile=grass, coverage=0.2, angle=-1.45, angle_jitter=0.3})
