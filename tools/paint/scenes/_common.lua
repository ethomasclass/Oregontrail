-- Westward shared helpers. Every scene runs this first.
-- A curve from control points: returns function(x) -> y, smooth (cosine) between points.
function curve(pts)
  return function(x)
    if x <= pts[1][1] then return pts[1][2] end
    for i = 1, #pts - 1 do
      local a, b = pts[i], pts[i + 1]
      if x <= b[1] then
        local t = (x - a[1]) / (b[1] - a[1])
        t = (1 - math.cos(t * math.pi)) / 2
        return a[2] + (b[2] - a[2]) * t
      end
    end
    return pts[#pts][2]
  end
end
-- A ridge: a base curve with noise on top.
function ridge(pts, amp, period, seed)
  local base = curve(pts)
  local n = noise{seed = seed or 1, octaves = 4, period = period or 160}
  return function(x) return base(x) + amp * n(x, 0) end
end
