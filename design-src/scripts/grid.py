import sys,numpy as np
from PIL import Image,ImageDraw
src,x0,y0,x1,y1,sc,out=sys.argv[1],*map(int,sys.argv[2:7]),sys.argv[7]
im=Image.open(src).convert('RGBA').crop((x0,y0,x1,y1))
bg=Image.new('RGBA',im.size,(0,200,60,255)); bg.alpha_composite(im)
b=bg.convert('RGB').resize(((x1-x0)*sc,(y1-y0)*sc),Image.NEAREST)
d=ImageDraw.Draw(b)
for x in range((x0//25+1)*25,x1,25):
    X=(x-x0)*sc; d.line([(X,0),(X,6 if x%50 else 14)],fill=(0,0,255),width=2)
    if x%50==0: d.text((X+2,14),str(x),fill=(0,0,255))
for y in range((y0//25+1)*25,y1,25):
    Y=(y-y0)*sc; d.line([(0,Y),(6 if y%50 else 14,Y)],fill=(0,0,255),width=2)
    if y%50==0: d.text((16,Y+2),str(y),fill=(0,0,255))
b.save(out)
