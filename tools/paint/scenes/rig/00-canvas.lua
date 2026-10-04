-- The wagon and its ox team, as cut-out parts. 1000 x 400 units.
-- A pale blue-gray backdrop, unlike any part's color and left to dry hard, so each
-- part cuts out cleanly. Wheels are painted in the top-left corner, apart from
-- everything, so they can spin in the game (see data/art.js, rig).
canvas{style="friedrich", size=500, aspect=2.5, seed=49}
pal8 = pal:only{"lead white","yellow ochre","raw umber","red earth","chrome yellow","pale smalt","cobalt blue","bone black"}
work(everywhere(), {hand="broad", pile=pile{{"lead white",4},{"pale smalt",2}}, coverage=4, fill=true, angle=0})
blend(everywhere(), {angle=0})
wait(30*24*60)
