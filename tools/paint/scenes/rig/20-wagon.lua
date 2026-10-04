-- the wagon: a wooden bed and a white canvas bonnet on hickory bows
local bed = poly({{470,250},{940,240},{930,292},{482,298}})
work(bed, {hand="body", color=function(x, y) return mix("#6e4a2c", "#4a301d", smoothstep(250, 298, y)) end,
  angle=0, length={10, 40}, coverage=4, clip=true, fill=true, pal=pal8})
local plank = brush{kind="round", width=1.6, point=0.5}
plank:reload(pile{{"raw umber",2},{"bone black",0.6}}, 0.6)
plank:stroke({{476,268},{936,260}}, {pressure={0.6, 0.6}})
plank:stroke({{480,283},{932,276}}, {pressure={0.6, 0.6}})
-- the bonnet: an arched canvas, its ends flaring out past the bed, lit from the right (the east)
local bm = poly({{486,252},{470,200},{462,150},{474,118},{510,100},{600,88},{700,84},{800,88},{890,98},{934,116},{948,150},{944,200},{928,248}}, true)
work(bm, {hand="body", color=function(x, y)
  local c = mix("#e3d7bd", "#f8f1df", smoothstep(470, 940, x))
  return mix(c, "#a69c88", smoothstep(180, 252, y) * 0.55)
end, angle=1.45, length={14, 44}, coverage=4.4, clip=true, fill=true, pal=pal8})
blend(bm, {angle=1.45, coverage=0.8})
-- the bows showing through the canvas as soft ribs
local rib = brush{kind="round", width=3, point=0.4}
for i, x in ipairs{560, 650, 740, 830} do
  rib:reload(pile{{"lead white",3},{"raw umber",0.6},{"yellow ochre",0.4}}, 0.5)
  rib:stroke({{x-6, 248},{x-3, 160},{x, 96}}, {pressure={0.5, 0.4}, clip=bm})
end
-- the puckered opening at the front
work(ellipse(488, 172, 14, 50), {hand="detail", pile=pile{{"raw umber",2},{"bone black",1}}, coverage=3, clip=bm})
wait(24*60)
