-- two oxen walking west (left): a far one, darker and higher, and a near one
local function leg(pts, w)
  return ribbon(pts, {w, w*0.8, w*0.62, w*0.55})
end
local function ox(cx, cy, k, base, lite, seed)
  -- masses: hindquarters, barrel, shoulder hump, neck, head (lowered, forward)
  local m = ellipse(cx + 52*k, cy, 34*k, 30*k) + ellipse(cx, cy + 4*k, 62*k, 32*k) + ellipse(cx - 46*k, cy - 4*k, 30*k, 32*k)
    + ellipse(cx - 40*k, cy - 26*k, 18*k, 12*k)
    + poly({{cx - 62*k, cy - 22*k}, {cx - 92*k, cy - 8*k}, {cx - 98*k, cy + 10*k}, {cx - 70*k, cy + 18*k}}, true)
    + ellipse(cx - 104*k, cy + 10*k, 15*k, 12*k) + ellipse(cx - 116*k, cy + 18*k, 9*k, 8*k)
    + leg({{cx - 52*k, cy + 22*k}, {cx - 54*k, cy + 46*k}, {cx - 52*k, cy + 66*k}, {cx - 50*k, cy + 86*k}}, 13*k)
    + leg({{cx - 30*k, cy + 24*k}, {cx - 24*k, cy + 48*k}, {cx - 22*k, cy + 68*k}, {cx - 20*k, cy + 86*k}}, 12*k)
    + leg({{cx + 50*k, cy + 22*k}, {cx + 58*k, cy + 46*k}, {cx + 52*k, cy + 66*k}, {cx + 54*k, cy + 86*k}}, 14*k)
    + leg({{cx + 72*k, cy + 18*k}, {cx + 76*k, cy + 46*k}, {cx + 80*k, cy + 66*k}, {cx + 82*k, cy + 86*k}}, 12*k)
  m = m:soften(1.5)
  work(m, {hand="body", color=function(x, y)
    local c = mix(lite, base, smoothstep(cy - 30*k, cy + 30*k, y))
    return mix(c, "#2a1c12", smoothstep(cy + 40*k, cy + 90*k, y) * 0.6)
  end, angle=function(x, y) return (y > cy + 30*k) and 1.5 or 0.1 end, length={6, 18}, coverage=4.5, clip=true, fill=true, pal=pal8})
  -- hooves and muzzle
  for _, hx in ipairs{-50, -20, 54, 82} do
    work(ellipse(cx + hx*k, cy + 86*k, 7*k, 4*k), {hand="detail", pile=pile{{"bone black",1},{"raw umber",1}}, coverage=3})
  end
  work(ellipse(cx - 120*k, cy + 20*k, 6*k, 6*k), {hand="detail", pile=pile{{"raw umber",1},{"bone black",1}}, coverage=3})
  -- horns curving up and out
  local h = brush{kind="round", width=3.4*k, point=1}
  h:reload(pile{{"lead white",4},{"yellow ochre",1},{"raw umber",0.3}}, 0.8)
  h:stroke({{cx - 100*k, cy - 2*k}, {cx - 112*k, cy - 14*k}, {cx - 106*k, cy - 26*k}}, {pressure={1, 0.15}})
  h:stroke({{cx - 92*k, cy - 4*k}, {cx - 84*k, cy - 18*k}, {cx - 90*k, cy - 28*k}}, {pressure={1, 0.15}})
  -- tail
  local t = brush{kind="round", width=2.4*k, point=1}
  t:reload(pile{{"raw umber",2},{"bone black",0.5}}, 0.7)
  t:stroke({{cx + 84*k, cy - 8*k}, {cx + 92*k, cy + 20*k}, {cx + 90*k, cy + 54*k}}, {pressure={0.8, 0.3}})
end
ox(330, 262, 0.92, "#4f3322", "#7a5638", 3)   -- far ox
wait(6*60)
ox(185, 272, 1.02, "#6b4329", "#a5744a", 5)   -- near ox
-- the yoke across both necks and the chain back to the wagon
local y = brush{kind="round", width=6, point=0.3}
y:reload(pile{{"raw umber",2},{"bone black",1}}, 0.8)
y:stroke({{120,246},{150,244}}, {pressure={0.9, 0.9}})
y:stroke({{265,238},{292,236}}, {pressure={0.9, 0.9}})
local c = brush{kind="round", width=2.4, point=0.5}
c:reload(pile{{"raw umber",2},{"bone black",1}}, 0.8)
c:stroke({{135,262},{300,262},{478,282}}, {pressure={0.7, 0.7}})
wait(24*60)
