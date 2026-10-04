-- the plains: dark and cold in the west, golden in the east; a river; far mountains in the west
local mn = noise{seed=5, octaves=4, period=120}
local mtn = function(x) return HZ - 8 - 50*math.exp(-((x-120)/110)^2) - 34*math.exp(-((x-300)/90)^2) - 10*mn:at01(x, 0) end
work(below(mtn), {hand="body", fill=true, color=function(x, y) return mix("#3c4250", "#6b6a6a", smoothstep(0, 600, x)) end,
  angle=0, length={20, 60}, coverage=4, medium=0.15, clip=true, pal=landpal})
local crest = function(x) return HZ + 4 + 6*mn(x, 9) end
local gn = noise{seed=8, octaves=3, period=80, stretch={0, 4}}
work(below(crest), {hand="body", fill=true, color=function(x, y)
  local east = smoothstep(200, 950, x)
  local c = mix("#3d3a2e", "#c9a95e", east)
  c = mix(c, mix("#24221c", "#6f6440", east), smoothstep(HZ, H, y) * 0.6)
  return shift(c, 0.03*gn(x, y), 0, 0.01*gn(x, y))
end, angle=0, angle_jitter=0.05, length={18, 70}, coverage=4.2, medium=0.12, clip=true, pal=landpal})
-- low sun raking across the eastern grass
local lit = mask(function(x, y) return smoothstep(450, 950, x) * smoothstep(-0.1, 0.6, gn(x*0.5, y*3)) * (1 - smoothstep(HZ + 10, H - 40, y)) end):blur(4) * below(crest)
work(lit, {hand="body", fill=true, color="#c9ab62", angle=0, length={40, 110}, coverage=1.0, medium=0.2, pal=landpal})
blend(below(crest) * rect(400, 0, 600, H), {angle=0, coverage=0.8})
-- a cool rim of light along the western horizon, so the herd reads against it
work(below(crest) - below(function(x) return crest(x) + 22 end), {hand="body", fill=true, color=function(x, y) return mix("#6d6a60", "#9a8c6c", smoothstep(0, 500, x)) end,
  angle=0, length={30, 80}, coverage=1.6, medium=0.15, pal=landpal})
wait(24*60)
