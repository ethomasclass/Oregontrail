-- rear wheel, larger (center 250,80; radius 66)
local function wheel(cx, cy, r)
  local rim = ellipse(cx, cy, r, r) - ellipse(cx, cy, r - 8, r - 8)
  work(rim, {hand="detail", pile=pile{{"raw umber",2},{"bone black",1.2}}, coverage=4, clip=true})
  local sp = brush{kind="round", width=3.6, point=0.3}
  for i = 0, 11 do
    local a = i * math.pi / 6 + 0.1
    sp:reload(pile{{"raw umber",2},{"red earth",0.6},{"bone black",0.6}}, 0.7)
    sp:stroke({{cx + 9*math.cos(a), cy + 9*math.sin(a)}, {cx + (r-6)*math.cos(a), cy + (r-6)*math.sin(a)}}, {pressure={0.9, 0.9}})
  end
  work(ellipse(cx, cy, 12, 12), {hand="detail", pile=pile{{"raw umber",2},{"bone black",1.5}}, coverage=4, clip=true})
end
wheel(250, 80, 66)
