-- small things on the land, painted as touches, not drawn
local white = pile{{"lead white",6},{"yellow ochre",0.4}}
local dark = pile{{"raw umber",2},{"bone black",1}}
local ox = pile{{"raw umber",2},{"red earth",1}}
-- covered wagons with ox teams, rolling west along the trail
for i, w in ipairs{{520,440,0.8},{620,452,0.9},{730,466,1.0},{850,482,1.15}} do
  local x, y, k = w[1], w[2], w[3]
  work(poly({{x-12*k,y},{x-11*k,y-11*k},{x-6*k,y-15*k},{x+6*k,y-15*k},{x+11*k,y-11*k},{x+12*k,y}}, true),
    {hand="detail", pile=white, coverage=3})
  work(rect(x-13*k, y, 26*k, 3*k), {hand="detail", pile=dark, coverage=3})
  work(ellipse(x-26*k, y-2*k, 7*k, 4*k) + ellipse(x-40*k, y-2*k, 7*k, 4*k), {hand="detail", pile=ox, coverage=3})
end
-- a train and its smoke, far east
work(rect(888, 404, 70, 6), {hand="detail", pile=dark, coverage=3})
work(ellipse(925, 392, 46, 9):roughen(6, 30, 2), {hand="scumble", pile=pile{{"lead white",4},{"raw umber",0.5}}, coverage=0.8, angle=0})
-- telegraph poles marching west
local rigger = brush{kind="round", width=1.8, point=1}
for i = 0, 6 do
  local x = 970 - i * 75
  rigger:reload(dark, 0.6)
  rigger:stroke({{x, HZ + 22 - i}, {x, HZ - 34 - i}}, {pressure={0.7, 0.5}})
end
-- in the shadowed west: a bison herd and riders moving away, small and dark
for i = 1, 22 do
  local x, y = 30 + i * 11 + rand(-5, 5), 396 + rand(-6, 8)
  work(ellipse(x, y, 7, 4.5) + ellipse(x - 6, y - 2, 4, 4), {hand="detail", pile=dark, coverage=2.5})
end
for i, r in ipairs{{290,400},{320,404},{350,398}} do
  work(ellipse(r[1], r[2], 9, 4), {hand="detail", pile=dark, coverage=3})
  work(ellipse(r[1]+1, r[2]-9, 2.5, 6), {hand="detail", pile=dark, coverage=3})
end
wait(12*60)
