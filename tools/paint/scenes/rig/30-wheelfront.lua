-- front wheel, painted apart in the corner (center 90,80; radius 50)
local function wheel(cx, cy, r, seed)
  local rim = ellipse(cx, cy, r, r) - ellipse(cx, cy, r - 7, r - 7)
  work(rim, {hand="detail", pile=pile{{"raw umber",2},{"bone black",1.2}}, coverage=4, clip=true})
  local sp = brush{kind="round", width=3.2, point=0.3}
  for i = 0, 11 do
    local a = i * math.pi / 6
    sp:reload(pile{{"raw umber",2},{"red earth",0.6},{"bone black",0.6}}, 0.7)
    sp:stroke({{cx + 8*math.cos(a), cy + 8*math.sin(a)}, {cx + (r-5)*math.cos(a), cy + (r-5)*math.sin(a)}}, {pressure={0.9, 0.9}})
  end
  work(ellipse(cx, cy, 10, 10), {hand="detail", pile=pile{{"raw umber",2},{"bone black",1.5}}, coverage=4, clip=true})
end
wheel(90, 80, 50, 1)
