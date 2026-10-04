-- the floating allegorical figure, luminous, drifting west with the wire
local robe = pile{{"lead white",8},{"yellow ochre",0.25}}
local light = pile{{"lead white",9},{"chrome yellow",0.15}}
local shade = pile{{"lead white",4},{"pale smalt",1.6},{"raw umber",0.35},{"yellow ochre",0.3}}
-- body and robes: head high and west, drapery streaming east behind her
local fig = body_of{spine={{520,92},{535,130},{565,190},{615,250},{700,300},{820,330}},
  widths={14, 30, 46, 52, 34, 10},
  limbs={{{530,128},{470,150},{430,160}, widths={9, 7, 5}},
         {{540,140},{585,170},{600,185}, widths={9, 8, 7}},
         {{600,240},{700,250},{800,240},{870,226}, widths={20, 14, 9, 3}}},
  blend=0.8, char="soft"}
local fm = fig:mask()
work(fm, {hand="body", fill=true, pile=robe, angle=function(x, y) return 0.45 end, length={12, 40}, coverage=4, clip=true})
blend(fm, {angle=0.45, coverage=1.0})
wait(6*60)
-- folds in shadow on the underside, light along the top edge
-- shadowed underside and fold lines: cool gray-blue
local under = fm * mask(function(x, y) return smoothstep(0.1, 0.8, (y - 125 - 0.48*(x - 520)) / 45) end)
work(under, {hand="body", fill=true, pile=shade, coverage=2.2, angle=0.5, length={10, 30}, clip=fm})
local fold = brush{kind="round", width=2.2, point=0.8}
for i, f in ipairs{{{560,170},{610,215},{660,250}},{{575,200},{640,250},{720,290}},{{600,232},{690,282},{790,316}},{{620,205},{700,240},{780,262}}} do
  fold:reload(shade, 0.6)
  fold:stroke(f, {pressure={0.3, 0.8, 0.15}, clip=fm})
end
work(fm * fig:mask():shrink(4) * mask(function(x, y) return 1 - smoothstep(0, 30, y - 100 - 0.45*(x - 520)) end),
  {hand="body", fill=true, pile=light, coverage=1.5, angle=0.45, clip=fm})
-- head, hair, and the star on her brow
work(ellipse(516, 82, 13, 16), {hand="detail", pile=pile{{"lead white",4},{"red earth",0.35},{"yellow ochre",0.5}}, coverage=3})
work(ellipse(526, 76, 12, 14) - ellipse(511, 86, 10, 13), {hand="detail", pile=pile{{"yellow ochre",2},{"raw umber",1}}, coverage=2.5})
work(ellipse(510, 68, 4, 4), {hand="detail", pile=pile{{"chrome yellow",2},{"lead white",2}}, coverage=3})
-- schoolbook held at her side
work(rect(586, 172, 22, 14), {hand="detail", pile=pile{{"red earth",2},{"raw umber",1}}, coverage=3})
-- the telegraph wire, from her hand back east to the poles
local wire = brush{kind="rigger", width=1.0, point=1}
wire:reload(pile{{"raw umber",2},{"bone black",1}}, 0.6)
wire:stroke({{430,160},{560,260},{760,340},{970,348}}, {pressure={0.45, 0.45}})
